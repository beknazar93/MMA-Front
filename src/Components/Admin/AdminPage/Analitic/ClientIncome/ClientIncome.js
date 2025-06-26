import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchTotalIncome } from "../../api/API";
import './ClientIncome.scss';

const ClientIncome = () => {
  const [filters, setFilters] = useState({
    trainer: "",
    sport_category: "",
    day: "",
    month: "",
    year: "",
    payment: "",
    typeClient: "",
  });
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trainers = useMemo(
    () => [
      "Абдыкадыров Султан", "Азизбек Уулу Баяман", "Асанбаев Эрлан", "Жумалы Уулу Ариет",
      "Калмамат Уулу Акай", "Лукас Крабб", "Машрапов Жумабай", "Машрапов Тилек",
      "Медербек Уулу Сафармурат", "Минбаев Сулайман", "Мойдунов Мирлан", "Пазылов Кутман",
      "Тажибаев Азамат", "Тургунов Ислам",
    ],
    []
  );

  const sports = useMemo(
    () => [
      "Бокс", "Борьба", "Греко-римская борьба", "Дзюдо", "Кикбокс", "Кроссфит",
      "Кулату", "Самбо", "Тхэквондо",
    ],
    []
  );

  const months = useMemo(
    () => [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август",
      "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
    ],
    []
  );

  const years = useMemo(() => [2025], []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);
  const paymentStatuses = useMemo(() => ["Оплачено", "Не оплачено"], []);
  const typeClients = useMemo(() => ["Обычный", "Пробный", "Индивидуальный", "Абонемент"], []);

  const loadIncome = useCallback(async () => {
    if (Object.values(filters).every((value) => value === "")) {
      setTotalIncome(0);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchTotalIncome(filters);
      setTotalIncome(result.income || 0);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadIncome(), 300);
    return () => clearTimeout(timer);
  }, [loadIncome]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      trainer: "", sport_category: "", day: "", month: "", year: "", payment: "", typeClient: "",
    });
  };

  const calculatedIncome60 = useMemo(() => (totalIncome * 0.6).toFixed(2), [totalIncome]);
  const calculatedIncome40 = useMemo(() => (totalIncome * 0.4).toFixed(2), [totalIncome]);

  if (error) return <p className="client-income__error">Ошибка: {error}</p>;

  return (
    <div className="client-income">
      <div className="client-income__header">
        <span className="client-income__icon">💸</span>
        <h1 className="client-income__title">Общий доход</h1>
      </div>
      <div className="client-income__filters">
        <div className="client-income__filter-group">
          <select
            name="trainer"
            value={filters.trainer}
            onChange={handleFilterChange}
            className="client-income__select"
            aria-label="Тренер"
          >
            <option value="">Тренер</option>
            {trainers.map((trainer) => (
              <option key={trainer} value={trainer}>{trainer}</option>
            ))}
          </select>
          <select
            name="sport_category"
            value={filters.sport_category}
            onChange={handleFilterChange}
            className="client-income__select"
            aria-label="Спорт"
          >
            <option value="">Спорт</option>
            {sports.map((sport) => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
          <select
            name="typeClient"
            value={filters.typeClient}
            onChange={handleFilterChange}
            className="client-income__select"
            aria-label="Тип клиента"
          >
            <option value="">Тип клиента</option>
            {typeClients.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="client-income__filter-group">
          <select
            name="day"
            value={filters.day}
            onChange={handleFilterChange}
            className="client-income__select"
            aria-label="День"
          >
            <option value="">День</option>
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="client-income__select"
            aria-label="Месяц"
          >
            <option value="">Месяц</option>
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="client-income__select"
            aria-label="Год"
          >
            <option value="">Год</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="client-income__filter-group">
          <select
            name="payment"
            value={filters.payment}
            onChange={handleFilterChange}
            className="client-income__select"
            aria-label="Оплата"
          >
            <option value="">Оплата</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            className="client-income__reset-btn"
            onClick={resetFilters}
            aria-label="Очистить фильтры"
          >
            <span className="client-income__reset-icon">🔄</span> Очистить
          </button>
        </div>
      </div>
      <div className={`client-income__result ${loading ? "client-income__result--loading" : ""}`}>
        {loading ? (
          <div className="client-income__loading">
            <span className="client-income__loading-spinner"></span> Загрузка...
          </div>
        ) : (
          <>
            <div className="client-income__total">
              <span className="client-income__total-amount">{totalIncome.toLocaleString()}</span>
              <span className="client-income__total-unit">сом</span>
            </div>
            <div className="client-income__percentages">
              <div className="client-income__percentage">
                <span className="client-income__percentage-label">60%</span>
                <span className="client-income__percentage-value">{calculatedIncome60} сом</span>
              </div>
              <div className="client-income__percentage">
                <span className="client-income__percentage-label">40%</span>
                <span className="client-income__percentage-value">{calculatedIncome40} сом</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientIncome;