import React, { useState, useEffect } from "react";
import { fetchClients } from "../../api/API";
import {
  months,
  years,
  days,
  trainers,
  sports,
  paymentOptions,
  typeClients,
  checkFieldOptions,
} from "../../Constants/constants";
import {
  FaCalendarAlt,
  FaTimes,
  FaMoneyBillWave,
  FaFilter,
  FaUser,
} from "react-icons/fa";
import "./ClientIncomeByDays.scss";

const SelectField = ({
  name,
  value,
  onChange,
  options,
  placeholder,
  className,
  icon,
}) => (
  <div className="dosh__select-group">
    {icon}
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`dosh__select ${className || ""}`}
      aria-label={placeholder}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const SUBSCRIPTION_DAYS = 30;

const Dosh = () => {
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    day: "",
    trainer: "",
    sport_category: "",
    typeClient: "",
    payment: "",
    check_field: "",
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // ——— helpers ———
  const prepareClients = (clientsData) => {
    if (!Array.isArray(clientsData)) {
      throw new Error("Данные клиентов должны быть массивом");
    }

    const valid = clientsData.filter((client) => {
      if (
        !client ||
        !client.id ||
        !client.day ||
        !client.month ||
        !client.year ||
        !client.price ||
        !client.trainer ||
        !client.sport_category ||
        !client.typeClient ||
        !client.payment
      ) {
        console.warn("Отфильтрован клиент из-за отсутствия полей:", client);
        return false;
      }

      const price = parseFloat(
        client.price.toString().replace(/[^0-9.]/g, "")
      );

      const monthIndex = months.indexOf(client.month);
      if (monthIndex === -1) {
        console.warn(`Некорректный месяц у клиента: ${client.month}`, client);
        return false;
      }

      const date = new Date(`${client.year}-${monthIndex + 1}-${client.day}`);
      if (isNaN(date.getTime())) {
        console.warn(
          `Некорректная дата у клиента: ${client.day} ${client.month} ${client.year}`,
          client
        );
        return false;
      }

      return (
        !isNaN(price) &&
        price > 0 &&
        typeof client.trainer === "string" &&
        typeof client.sport_category === "string" &&
        typeof client.typeClient === "string" &&
        typeof client.payment === "string"
      );
    });

    // dedupe
    const seen = new Set();
    const unique = [];
    for (const c of valid) {
      const key = `${(c.name || "").toLowerCase()}|${c.month}|${c.year}|${(c.sport_category || "").toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      } else {
        console.warn("Обнаружен дубликат клиента:", c);
      }
    }
    return unique;
  };

  // ——— effects ———
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClients();
        setClients(prepareClients(data));
      } catch (e) {
        console.error("Ошибка загрузки клиентов:", e);
        setError("Не удалось загрузить данные клиентов");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
    return () => setClients([]);
  }, []);

  // ——— handlers ———
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      year: "",
      month: "",
      day: "",
      trainer: "",
      sport_category: "",
      typeClient: "",
      payment: "",
      check_field: "",
    });
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    setClients([]);
    try {
      const data = await fetchClients();
      setClients(prepareClients(data));
    } catch (e) {
      console.error("Ошибка повторной загрузки клиентов:", e);
      setError("Не удалось загрузить данные клиентов");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilters = () => setIsFiltersVisible((p) => !p);

  // ——— core compute ———
  const distributeIncomeByDate = () => {
    if (!Object.values(filters).some((v) => v !== "")) {
      return { income: {}, clientsByMonth: {} };
    }

    const incomeByDate = {};
    const clientsByMonth = {};

    clients.forEach((client) => {
      const {
        day,
        month,
        year,
        price,
        trainer,
        sport_category,
        typeClient,
        payment,
        check_field,
        name,
      } = client;

      const startMonthIndex = months.indexOf(month);
      if (startMonthIndex === -1) return;

      const startDate = new Date(`${year}-${startMonthIndex + 1}-${day}`);
      if (startDate.toString() === "Invalid Date") return;

      const cleanedPrice = parseFloat(
        price.toString().replace(/[^0-9.]/g, "") || 0
      );
      if (isNaN(cleanedPrice) || cleanedPrice <= 0) return;

      const paymentMonth = months[startDate.getMonth()];
      const paymentYear = startDate.getFullYear().toString();
      const paymentDay = startDate.getDate().toString();

      // применяем фильтры, но месяц обрабатываем отдельно
      if (
        (filters.year && filters.year !== paymentYear) ||
        (filters.day && filters.day !== paymentDay) ||
        (filters.trainer &&
          filters.trainer.trim().toLowerCase() !==
            trainer.trim().toLowerCase()) ||
        (filters.sport_category &&
          filters.sport_category.trim().toLowerCase() !==
            sport_category.trim().toLowerCase()) ||
        (filters.typeClient &&
          filters.typeClient.trim().toLowerCase() !==
            typeClient.trim().toLowerCase()) ||
        (filters.payment &&
          filters.payment.trim().toLowerCase() !==
            payment.trim().toLowerCase()) ||
        (filters.check_field &&
          filters.check_field.trim().toLowerCase() !==
            (check_field || "").trim().toLowerCase())
      ) {
        return;
      }

      // делим оплату на месяцы внутри 30-дневного срока
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + SUBSCRIPTION_DAYS - 1);

      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endYear = endDate.getFullYear();
      const endDay = endDate.getDate();

      const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
      const remainingDaysInStartMonth =
        daysInStartMonth - startDate.getDate() + 1;

      let currentMonthPrice = cleanedPrice;
      let secondMonthPrice = 0;

      if (startMonth !== endMonth || startYear !== endYear) {
        const daysInSecondMonth = endDate.getDate();
        currentMonthPrice =
          (cleanedPrice * remainingDaysInStartMonth) / SUBSCRIPTION_DAYS;
        secondMonthPrice =
          (cleanedPrice * daysInSecondMonth) / SUBSCRIPTION_DAYS;
      }

      const currentMonthKey = `${months[startMonth]} ${startYear}`;
      const secondMonthKey = `${months[endMonth % 12]} ${endYear}`;

      const isStartMonthRelevant =
        !filters.month || filters.month === months[startMonth];
      const isEndMonthRelevant =
        secondMonthPrice > 0 &&
        (!filters.month || filters.month === months[endMonth % 12]);

      if (isStartMonthRelevant) {
        incomeByDate[currentMonthKey] =
          (incomeByDate[currentMonthKey] || 0) + currentMonthPrice;

        if (!clientsByMonth[currentMonthKey])
          clientsByMonth[currentMonthKey] = [];

        clientsByMonth[currentMonthKey].push({
          name,
          price: currentMonthPrice,
          startDate: `${day} ${month} ${year}`,
          endDate: `${endDay} ${months[endMonth % 12]} ${endYear}`,
          split:
            secondMonthPrice > 0
              ? `${currentMonthPrice.toFixed(2)} сом (из ${cleanedPrice.toFixed(
                  2
                )})`
              : `${cleanedPrice.toFixed(2)} сом`,
        });
      }

      if (isEndMonthRelevant) {
        incomeByDate[secondMonthKey] =
          (incomeByDate[secondMonthKey] || 0) + secondMonthPrice;

        if (!clientsByMonth[secondMonthKey])
          clientsByMonth[secondMonthKey] = [];

        clientsByMonth[secondMonthKey].push({
          name,
          price: secondMonthPrice,
          startDate: `${day} ${month} ${year}`,
          endDate: `${endDay} ${months[endMonth % 12]} ${endYear}`,
          split: `${secondMonthPrice.toFixed(2)} сом (из ${cleanedPrice.toFixed(
            2
          )})`,
        });
      }
    });

    return { income: incomeByDate, clientsByMonth };
  };

  const { income: incomeByDate, clientsByMonth } = distributeIncomeByDate();

  const sortedIncomeByDate = Object.entries(incomeByDate).sort(
    ([dateA], [dateB]) => {
      const [monthA, yearA] = dateA.split(" ");
      const [monthB, yearB] = dateB.split(" ");
      const monthIndexA = months.indexOf(monthA);
      const monthIndexB = months.indexOf(monthB);
      return yearA !== yearB ? yearA.localeCompare(yearB) : monthIndexA - monthIndexB;
    }
  );

  const totalIncome = Object.values(incomeByDate).reduce(
    (acc, amount) => acc + amount,
    0
  );

  return (
    <div className="dosh">
      <div className="dosh__header">
        <h1 className="dosh__title">Доход</h1>

        <div className="dosh__filters-container">
          <button
            type="button"
            className="dosh__toggle-filters"
            onClick={toggleFilters}
            aria-label={isFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
            aria-expanded={isFiltersVisible}
          >
            <FaFilter size={14} />
          </button>

          <div
            className={`dosh__filters ${
              isFiltersVisible ? "" : "dosh__filters--hidden"
            }`}
          >
            <SelectField
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              options={years}
              placeholder="Год"
              icon={<FaCalendarAlt size={14} />}
            />
            <SelectField
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              options={months}
              placeholder="Месяц"
              icon={<FaCalendarAlt size={14} />}
            />
            <SelectField
              name="day"
              value={filters.day}
              onChange={handleFilterChange}
              options={days}
              placeholder="День"
              icon={<FaCalendarAlt size={14} />}
            />
            <SelectField
              name="trainer"
              value={filters.trainer}
              onChange={handleFilterChange}
              options={trainers}
              placeholder="Тренер"
              icon={<FaUser size={14} />}
            />
            <SelectField
              name="sport_category"
              value={filters.sport_category}
              onChange={handleFilterChange}
              options={sports}
              placeholder="Спорт"
              icon={<FaUser size={14} />}
            />
            <SelectField
              name="typeClient"
              value={filters.typeClient}
              onChange={handleFilterChange}
              options={typeClients}
              placeholder="Тип клиента"
              icon={<FaUser size={14} />}
            />
            <SelectField
              name="payment"
              value={filters.payment}
              onChange={handleFilterChange}
              options={paymentOptions.map((opt) => opt.value)}
              placeholder="Оплата"
              icon={<FaMoneyBillWave size={14} />}
            />
            <SelectField
              name="check_field"
              value={filters.check_field}
              onChange={handleFilterChange}
              options={checkFieldOptions}
              placeholder="Источник"
              icon={<FaUser size={14} />}
            />

            <button
              type="button"
              className="dosh__reset-btn"
              onClick={handleResetFilters}
              aria-label="Сбросить фильтры"
            >
              <FaTimes size={14} /> Сбросить
            </button>
          </div>
        </div>
      </div>

      <div
        className={`dosh__content ${loading ? "dosh__content--loading" : ""}`}
      >
        {loading ? (
          <div className="dosh__loading" role="status" aria-live="polite">
            <span className="dosh__loading-spinner" />
            Загрузка...
          </div>
        ) : error ? (
          <div className="dosh__error" role="alert">
            {error}
            <button
              type="button"
              className="dosh__retry-btn"
              onClick={handleRetry}
              aria-label="Повторить загрузку"
            >
              Повторить
            </button>
          </div>
        ) : sortedIncomeByDate.length > 0 && totalIncome > 0 ? (
          <div className="dosh__results">
            <div className="dosh__total">
              <FaMoneyBillWave size={16} /> Итого: {totalIncome.toFixed(2)} сом
            </div>

            <h3 className="dosh__distribution-title">Распределение дохода</h3>

            <div className="dosh__cards">
              {sortedIncomeByDate.map(([date, amount], index) => (
                <div
                  key={date}
                  className="dosh__card"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="dosh__card-header">{date}</div>

                  <div className="dosh__card-content">
                    <span className="dosh__card-amount">
                      <FaMoneyBillWave size={14} /> {amount.toFixed(2)} сом
                    </span>

                    <div
                      className="dosh__bar"
                      style={{
                        width: `${(amount / totalIncome) * 100}%`,
                      }}
                      aria-label={`Доход за ${date}: ${amount.toFixed(2)} сом`}
                    />

                    <div className="dosh__client-list">
                      {clientsByMonth[date]?.map((c, idx) => (
                        <div key={`${c.name}-${idx}`} className="dosh__client-item">
                          {c.name}: {c.split}, {c.startDate} – {c.endDate}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dosh__no-data">
            Нет данных для выбранных фильтров или выберите фильтры
          </div>
        )}
      </div>
    </div>
  );
};

export default Dosh;
