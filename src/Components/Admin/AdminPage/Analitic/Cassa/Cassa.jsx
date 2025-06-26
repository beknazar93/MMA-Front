import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients } from "../../api/API";
import { months, years } from "../../Constants/constants";
import './Cassa.scss';

const Cassa = () => {
  const [filters, setFilters] = useState({
    day: "",
    month: "",
    year: "",
    typeClient: "",
    trainer: "",
    sport: "",
    payment: "",
  });
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')), []);
  const typeClients = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
  const paymentStatuses = ["Оплачено", "Не оплачено"];
  
  const [trainers, setTrainers] = useState([]);
  const [sports, setSports] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const clients = await fetchClients();
      const uniqueTrainers = [...new Set(clients.map(c => c.trainer).filter(Boolean))];
      const uniqueSports = [...new Set(clients.map(c => c.sport_category).filter(Boolean))];
      setTrainers(uniqueTrainers);
      setSports(uniqueSports);

      const filteredClients = clients.filter(client => {
        if (!client.dataCassa) return false;
        const [clientYear, clientMonth, clientDay] = client.dataCassa.split('-').map(Number);
        const filterYear = filters.year ? Number(filters.year) : null;
        const filterMonth = filters.month ? months.indexOf(filters.month) + 1 : null;
        const filterDay = filters.day ? Number(filters.day) : null;
        return (
          (!filterYear || clientYear === filterYear) &&
          (!filterMonth || clientMonth === filterMonth) &&
          (!filterDay || clientDay === filterDay) &&
          (!filters.typeClient || client.typeClient === filters.typeClient) &&
          (!filters.trainer || client.trainer === filters.trainer) &&
          (!filters.sport || client.sport_category === filters.sport) &&
          (!filters.payment || client.payment === filters.payment)
        );
      });

      const income = filteredClients.reduce((sum, client) => {
        const cleanedPrice = parseFloat(client.price?.replace(/[^0-9.]/g, "") || 0);
        return sum + (isNaN(cleanedPrice) ? 0 : cleanedPrice);
      }, 0);
      setTotalIncome(income);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      day: "",
      month: "",
      year: "",
      typeClient: "",
      trainer: "",
      sport: "",
      payment: "",
    });
  };

  const calculatedIncome60 = useMemo(() => (totalIncome * 0.6).toFixed(2), [totalIncome]);
  const calculatedIncome40 = useMemo(() => (totalIncome * 0.4).toFixed(2), [totalIncome]);

  return (
    <div className="cassa">
      <div className="cassa__container">
        <header className="cassa__header">
          <h1 className="cassa__title">Касса</h1>
          <p className="cassa__subtitle">Анализ доходов по дате оплаты</p>
        </header>

        <div className="cassa__filters">
          <div className="cassa__filter-row">
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="cassa__select"
              aria-label="Год"
            >
              <option value="">Год</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="cassa__select"
              aria-label="Месяц"
            >
              <option value="">Месяц</option>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              name="day"
              value={filters.day}
              onChange={handleFilterChange}
              className="cassa__select"
              aria-label="День"
            >
              <option value="">День</option>
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              name="typeClient"
              value={filters.typeClient}
              onChange={handleFilterChange}
              className="cassa__select"
              aria-label="Тип клиента"
            >
              <option value="">Тип клиента</option>
              {typeClients.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              name="trainer"
              value={filters.trainer}
              onChange={handleFilterChange}
              className="cassa__select"
              aria-label="Тренер"
            >
              <option value="">Тренер</option>
              {trainers.map((trainer) => (
                <option key={trainer} value={trainer}>{trainer}</option>
              ))}
            </select>
            <select
              name="sport"
              value={filters.sport}
              onChange={handleFilterChange}
              className="cassa__select"
              aria-label="Спорт"
            >
              <option value="">Спорт</option>
              {sports.map((sport) => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            <select
              name="payment"
              value={filters.payment}
              onChange={handleFilterChange}
              className="cassa__select"
              aria-label="Статус оплаты"
            >
              <option value="">Статус оплаты</option>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button
              className="cassa__reset-btn"
              onClick={resetFilters}
              aria-label="Очистить фильтры"
            >
              Сброс
            </button>
          </div>
        </div>

        {error ? (
          <p className="cassa__error">{error}</p>
        ) : loading ? (
          <div className="cassa__loading">
            <div className="cassa__spinner"></div>
            Загрузка...
          </div>
        ) : (
          <div className="cassa__content">
            <div className="cassa__card">
              <div className="cassa__card-header">
                <span className="cassa__card-icon">💰</span>
                <h2 className="cassa__card-title">Общий доход</h2>
              </div>
              <div className="cassa__income">
                <span className="cassa__income-amount">{totalIncome.toLocaleString()}</span>
                <span className="cassa__income-unit">сом</span>
              </div>
              <div className="cassa__split">
                <div className="cassa__split-item">
                  <span className="cassa__split-label">60%</span>
                  <span className="cassa__split-value">{calculatedIncome60} сом</span>
                </div>
                <div className="cassa__split-item">
                  <span className="cassa__split-label">40%</span>
                  <span className="cassa__split-value">{calculatedIncome40} сом</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cassa;