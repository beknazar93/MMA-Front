import React, { useState, useEffect } from "react";
import { fetchClients } from "../../api/API";
import { months, years, days, trainers, sports, paymentOptions } from "../../Constants/constants";
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
          if (!client || !client.id || !client.dataCassa || !client.price) return false;
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

  const calculateIncomeByDate = () => {
    if (!filters.day || !filters.month || !filters.year) {
      return { total: 0, clients: [] };
    }

    const targetDate = new Date(`${filters.year}-${months.indexOf(filters.month) + 1}-${filters.day}`);
    if (targetDate.toString() === "Invalid Date") {
      return { total: 0, clients: [] };
    }

    const filteredClients = clients.filter(client => {
      const clientDate = new Date(client.dataCassa);
      return (
        clientDate.getFullYear().toString() === filters.year &&
        months[clientDate.getMonth()] === filters.month &&
        clientDate.getDate().toString() === filters.day &&
        (!filters.trainer || client.trainer === filters.trainer) &&
        (!filters.sport_category || client.sport_category === filters.sport_category) &&
        (!filters.typeClient || client.typeClient === filters.typeClient) &&
        (!filters.payment || client.payment === filters.payment)
      );
    });

    const total = filteredClients.reduce((sum, client) => {
      const price = parseFloat(client.price.toString().replace(/[^0-9.]/g, "") || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return { total, clients: filteredClients };
  };

  const { total, clients: filteredClients } = calculateIncomeByDate();

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
          <div className="income__error">{error}</div>
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
                    <div key={client.id} className="income__client" style={{ animationDelay: `${index * 0.1}s` }}>
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