import React, { useState, useEffect } from "react";
import { fetchClients } from "../../api/API";
import { months, years, days, trainers, sports, paymentOptions } from "../../Constants/constants";
import { FaCalendarAlt, FaTimes, FaMoneyBillWave, FaFilter, FaUser } from "react-icons/fa";
import './ClientIncomeByDays.scss';

const SelectField = ({ name, value, onChange, options, placeholder, className, icon }) => (
  <div className="dosh__select-group">
    {icon}
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`dosh__select ${className || ""}`}
      aria-label={placeholder}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const Dosh = () => {
  const [filters, setFilters] = useState({
    year: "2025",
    month: "",
    day: "",
    trainer: "",
    sport_category: "",
    typeClient: "",
    payment: "",
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const clientsData = await fetchClients();
        if (!Array.isArray(clientsData)) {
          throw new Error("Данные клиентов должны быть массивом");
        }
        const validClients = clientsData.filter(client => {
          if (!client || !client.id || !client.day || !client.month || !client.year || !client.price) return false;
          const date = new Date(`${client.year}-${months.indexOf(client.month) + 1}-${client.day}`);
          const price = parseFloat(client.price.toString().replace(/[^0-9.]/g, ""));
          return !isNaN(date) && !isNaN(price) && price > 0;
        });
        setClients(validClients);
        // Логирование для отладки клиентов Тургунова Ислама за июнь
        validClients.forEach(client => {
          if (client.trainer === "Тургунов Ислам" && client.month === "Июнь" && client.year === "2025") {
            console.log(`Клиент: ${client.name}, Сумма: ${client.price}, Дата: ${client.day} ${client.month} ${client.year}`);
          }
        });
      } catch (error) {
        console.error("Ошибка загрузки клиентов:", error);
        setError("Не удалось загрузить данные клиентов");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      year: "2025",
      month: "",
      day: "",
      trainer: "",
      sport_category: "",
      typeClient: "",
      payment: "",
    });
  };

  const toggleFilters = () => {
    setIsFiltersVisible(prev => !prev);
  };

  const distributeIncomeByDate = () => {
    if (!Object.values(filters).some(value => value !== "" && value !== "2025")) {
      return {};
    }

    const incomeByDate = {};
    clients.forEach(client => {
      const { id, day, month, year, price, trainer, sport_category, typeClient, payment } = client;
      const startDate = new Date(`${year}-${months.indexOf(month) + 1}-${day}`);
      if (startDate.toString() === "Invalid Date") return;

      const cleanedPrice = parseFloat(price.toString().replace(/[^0-9.]/g, "") || 0);
      if (isNaN(cleanedPrice) || cleanedPrice <= 0) return;

      const paymentMonth = months[startDate.getMonth()];
      const paymentYear = startDate.getFullYear().toString();
      const paymentDay = startDate.getDate().toString();

      if ((filters.year && filters.year !== paymentYear) ||
          (filters.month && filters.month !== paymentMonth) ||
          (filters.day && filters.day !== paymentDay) ||
          (filters.trainer && filters.trainer !== trainer) ||
          (filters.sport_category && filters.sport_category !== sport_category) ||
          (filters.typeClient && filters.typeClient !== typeClient) ||
          (filters.payment && filters.payment !== payment)) {
        return;
      }

      const subscriptionDays = 30;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + subscriptionDays - 1);

      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endYear = endDate.getFullYear();

      const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
      const remainingDaysInStartMonth = daysInStartMonth - startDate.getDate() + 1;
      let currentMonthPrice = cleanedPrice;
      let secondMonthPrice = 0;

      if (startMonth !== endMonth || startYear !== endYear) {
        const daysInSecondMonth = endDate.getDate();
        currentMonthPrice = (cleanedPrice * remainingDaysInStartMonth) / subscriptionDays;
        secondMonthPrice = (cleanedPrice * daysInSecondMonth) / subscriptionDays;
      }

      const currentMonthKey = `${months[startMonth]} ${startYear}`;
      const secondMonthKey = `${months[endMonth % 12]} ${endYear}`;

      if (!filters.month || filters.month === months[startMonth]) {
        incomeByDate[currentMonthKey] = (incomeByDate[currentMonthKey] || 0) + currentMonthPrice;
        if (trainer === "Тургунов Ислам" && paymentMonth === "Июнь") {
          console.log(`Клиент ID: ${id}, Сумма: ${currentMonthPrice.toFixed(2)}, Дата: ${day} ${month} ${year}`);
        }
      }
      if (secondMonthPrice > 0 && (!filters.month || filters.month === months[endMonth % 12])) {
        incomeByDate[secondMonthKey] = (incomeByDate[secondMonthKey] || 0) + secondMonthPrice;
      }
    });

    return incomeByDate;
  };

  const incomeByDate = distributeIncomeByDate();
  const sortedIncomeByDate = Object.entries(incomeByDate).sort(([dateA], [dateB]) => {
    const [monthA, yearA] = dateA.split(" ");
    const [monthB, yearB] = dateB.split(" ");
    const monthIndexA = months.indexOf(monthA);
    const monthIndexB = months.indexOf(monthB);
    return yearA !== yearB ? yearA.localeCompare(yearB) : monthIndexA - monthIndexB;
  });

  const totalIncome = Object.values(incomeByDate).reduce((acc, amount) => acc + amount, 0);

  return (
    <div className="dosh">
      <div className="dosh__header">
        <h1 className="dosh__title">Доход</h1>
        <div className="dosh__filters-container">
          <button
            className="dosh__toggle-filters"
            onClick={toggleFilters}
            aria-label={isFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
          >
            <FaFilter size={14} />
          </button>
          <div className={`dosh__filters ${isFiltersVisible ? '' : 'dosh__filters--hidden'}`}>
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
              options={["Обычный", "Пробный", "Индивидуальный", "Абонемент"]}
              placeholder="Тип клиента"
              icon={<FaUser size={14} />}
            />
            <SelectField
              name="payment"
              value={filters.payment}
              onChange={handleFilterChange}
              options={paymentOptions.map(opt => opt.value)}
              placeholder="Оплата"
              icon={<FaMoneyBillWave size={14} />}
            />
            <button
              className="dosh__reset-btn"
              onClick={handleResetFilters}
              aria-label="Сбросить фильтры"
            >
              <FaTimes size={14} /> Сбросить
            </button>
          </div>
        </div>
      </div>
      <div className={`dosh__content ${loading ? "dosh__content--loading" : ""}`}>
        {loading ? (
          <div className="dosh__loading">
            <span className="dosh__loading-spinner"></span>
            Загрузка...
          </div>
        ) : error ? (
          <div className="dosh__error">{error}</div>
        ) : sortedIncomeByDate.length > 0 ? (
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
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="dosh__card-header">{date}</div>
                  <div className="dosh__card-content">
                    <span className="dosh__card-amount">
                      <FaMoneyBillWave size={14} /> {amount.toFixed(2)} сом
                    </span>
                    <div
                      className="dosh__bar"
                      style={{ width: `${Math.min((amount / (totalIncome || 1)) * 100, 100)}%` }}
                      data-tooltip={`${amount.toFixed(2)} сом`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dosh__no-data">Выберите фильтры для отображения дохода</div>
        )}
      </div>
    </div>
  );
};

export default Dosh;