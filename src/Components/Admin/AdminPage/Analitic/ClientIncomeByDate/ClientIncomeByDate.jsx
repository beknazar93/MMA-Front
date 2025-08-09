
import React, { useState, useEffect, useMemo } from "react";
import { fetchClients } from "../../api/API";
import { months, years, days, trainers, sports, paymentOptions, formFieldConfig } from "../../Constants/constants";
import { FaCalendarAlt, FaTimes, FaMoneyBillWave, FaFilter, FaUser } from "react-icons/fa";
import './ClientIncomeByDate.scss';

const SelectField = ({ name, value, onChange, options, placeholder, className, icon }) => (
  <div className="income__select-group">
    {icon}
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`income__select ${className || ""}`}
      aria-label={placeholder}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const ClientIncomeByDate = () => {
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

  const clientTypes = formFieldConfig.find(f => f.name === "typeClient")?.options || ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];

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
          if (!client || !client.id || !client.dataCassa || !client.price || !client.trainer || !client.sport_category || !client.typeClient || !client.payment || !client.name) {
            console.warn("Некорректные данные клиента:", client);
            return false;
          }
          const date = new Date(client.dataCassa);
          const price = parseFloat(client.price.toString().replace(/[^0-9.]/g, ""));
          return typeof client.dataCassa === "string" && !isNaN(date) && !isNaN(price) && price > 0;
        });
        setClients(validClients);
      } catch (error) {
        console.error("Ошибка загрузки клиентов:", error);
        setError("Не удалось загрузить данные клиентов");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
    return () => setClients([]); // Очистка при размонтировании
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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchClients()
      .then(clientsData => {
        if (!Array.isArray(clientsData)) {
          throw new Error("Данные клиентов должны быть массивом");
        }
        const validClients = clientsData.filter(client => {
          if (!client || !client.id || !client.dataCassa || !client.price || !client.trainer || !client.sport_category || !client.typeClient || !client.payment || !client.name) {
            console.warn("Некорректные данные клиента:", client);
            return false;
          }
          const date = new Date(client.dataCassa);
          const price = parseFloat(client.price.toString().replace(/[^0-9.]/g, ""));
          return typeof client.dataCassa === "string" && !isNaN(date) && !isNaN(price) && price > 0;
        });
        setClients(validClients);
      })
      .catch(error => {
        console.error("Ошибка повторной загрузки клиентов:", error);
        setError("Не удалось загрузить данные клиентов");
      })
      .finally(() => setLoading(false));
  };

  const toggleFilters = () => {
    setIsFiltersVisible(prev => !prev);
  };

  const calculateIncomeByDate = useMemo(() => {
    if (!filters.day || !filters.month || !filters.year) {
      return { total: 0, clients: [] };
    }

    const targetDate = new Date(`${filters.year}-${months.indexOf(filters.month) + 1}-${filters.day}`);
    if (targetDate.toString() === "Invalid Date") {
      return { total: 0, clients: [] };
    }

    const filteredClients = clients.filter(client => {
      const clientDate = new Date(client.dataCassa);
      if (clientDate.toString() === "Invalid Date") {
        console.warn("Некорректная дата в client.dataCassa:", client.dataCassa);
        return false;
      }
      return (
        clientDate.getFullYear().toString() === filters.year &&
        months[clientDate.getMonth()] === filters.month &&
        clientDate.getDate().toString() === filters.day &&
        (!filters.trainer || client.trainer?.trim().toLowerCase() === filters.trainer.trim().toLowerCase()) &&
        (!filters.sport_category || client.sport_category?.trim().toLowerCase() === filters.sport_category.trim().toLowerCase()) &&
        (!filters.typeClient || client.typeClient?.trim().toLowerCase() === filters.typeClient.trim().toLowerCase()) &&
        (!filters.payment || client.payment?.trim().toLowerCase() === filters.payment.trim().toLowerCase())
      );
    });

    const total = filteredClients.reduce((sum, client) => {
      const price = parseFloat(client.price.toString().replace(/[^0-9.]/g, "") || 0);
      if (isNaN(price)) {
        console.warn("Некорректная цена клиента:", client.price);
        return sum;
      }
      return sum + price;
    }, 0);

    return { total, clients: filteredClients };
  }, [filters, clients]);

  const { total, clients: filteredClients } = calculateIncomeByDate;

  return (
    <div className="income">
      <div className="income__header">
        <div className="income__filters-container">
          <button
            className="income__toggle-filters"
            onClick={toggleFilters}
            aria-label={isFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
          >
            <FaFilter size={14} />
          </button>
          <div className={`income__filters ${isFiltersVisible ? '' : 'income__filters--hidden'}`}>
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
              options={clientTypes}
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
              className="income__reset-btn"
              onClick={handleResetFilters}
              aria-label="Сбросить фильтры"
            >
              <FaTimes size={14} /> Сбросить
            </button>
          </div>
        </div>
      </div>
      <div className={`income__content ${loading ? "income__content--loading" : ""}`}>
        {loading ? (
          <div className="income__loading">
            <span className="income__loading-spinner"></span>
            Загрузка...
          </div>
        ) : error ? (
          <div className="income__error">
            {error}
            <button
              className="income__retry-btn"
              onClick={handleRetry}
              aria-label="Повторить загрузку"
            >
              Повторить
            </button>
          </div>
        ) : filters.day && filters.month && filters.year ? (
          <div className="income__results">
            <div className="income__total">
              <FaMoneyBillWave size={16} /> Итого: {total.toFixed(2)} сом
            </div>
            {filteredClients.length > 0 ? (
              <div className="income__clients">
                <h3 className="income__clients-title">Клиенты за {filters.day} {filters.month} {filters.year}</h3>
                <div className="income__client-list">
                  {filteredClients.map((client, index) => (
                    <div
                      key={client.id}
                      className="income__client"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      aria-label={`Клиент: ${client.name}, Сумма: ${parseFloat(client.price.toString().replace(/[^0-9.]/g, "")).toFixed(2)} сом`}
                    >
                      <span>{client.name}</span>
                      <span>{parseFloat(client.price.toString().replace(/[^0-9.]/g, "")).toFixed(2)} сом</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="income__no-data">Нет данных за выбранную дату</div>
            )}
          </div>
        ) : (
          <div className="income__no-data">Выберите дату для отображения дохода</div>
        )}
      </div>
    </div>
  );
};

export default ClientIncomeByDate;