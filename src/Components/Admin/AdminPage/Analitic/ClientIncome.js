import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchTotalIncome } from "../api/API";

const ClientIncome = () => {
  const [filters, setFilters] = useState({
    trainer: "",
    sport_category: "",
    day: "",
    month: "",
    year: "",
    payment: "",
  });
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trainers = useMemo(
    () => [
      "Абдыкадыров Султан",
      "Азизбек Уулу Баяман",
      "Асанбаев Эрлан",
      "Жумалы Уулу Ариет",
      "Калмамат Уулу Акай",
      "Лукас Крабб",
      "Машрапов Жумабай",
      "Машрапов Тилек",
      "Медербек Уулу Сафармурат",
      "Минбаев Сулайман",
      "Мойдунов Мирлан",
      "Пазылов Кутман",
      "Тажибаев Азамат",
      "Тургунов Ислам",
    ],
    []
  );

  const sports = useMemo(
    () => [
      "Бокс",
      "Борьба",
      "Греко-римская борьба",
      "Дзюдо",
      "Кикбокс",
      "Кроссфит",
      "Кулату",
      "Самбо",
      "Тхэквондо",
    ],
    []
  );

  const months = useMemo(
    () => [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    []
  );

  const years = useMemo(() => [2025], []);
  const days = useMemo(
    () => Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
    []
  );
  const paymentStatuses = useMemo(() => ["Оплачено", "Не оплачено"], []);

  const loadIncome = useCallback(async () => {
    if (Object.values(filters).every((value) => value === "")) {
      setTotalIncome(0);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchTotalIncome(filters);
      setTotalIncome((prev) => (prev !== result.income ? result.income : prev));
    } catch (err) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadIncome();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, loadIncome]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      trainer: "",
      sport_category: "",
      day: "",
      month: "",
      year: "",
      payment: "",
    });
  };

  const calculatedIncome60 = useMemo(
    () => (totalIncome * 0.6).toFixed(2),
    [totalIncome]
  );
  const calculatedIncome40 = useMemo(
    () => (totalIncome * 0.4).toFixed(2),
    [totalIncome]
  );

  if (error) return <p>{error}</p>;

  return (
    <div className="total-income">
      <h1>Общий доход</h1>
      <div className="total-income__filters">
        <select
          name="trainer"
          value={filters.trainer}
          onChange={handleFilterChange}
        >
          <option value="">Тренера</option>
          {trainers.map((trainer) => (
            <option key={trainer} value={trainer}>
              {trainer}
            </option>
          ))}
        </select>
        <select
          name="sport_category"
          value={filters.sport_category}
          onChange={handleFilterChange}
        >
          <option value="">Спорт</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
        <select name="day" value={filters.day} onChange={handleFilterChange}>
          <option value="">День</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <select
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
        >
          <option value="">Месяц</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <select name="year" value={filters.year} onChange={handleFilterChange}>
          <option value="">Год</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          name="payment"
          value={filters.payment}
          onChange={handleFilterChange}
        >
          <option value="">Оплата</option>
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button className="total-income__reset-btn" onClick={resetFilters}>
          Очистить фильтры
        </button>
      </div>
      <div
        className={`income-result ${loading ? "" : "income-result--animate"}`}
      >
        <h2>{loading ? "Загрузка..." : `${totalIncome} сом`}</h2>
        <div className="income-percentages">
          <h3>60%: {loading ? "Загрузка..." : `${calculatedIncome60} сом`}</h3>
          <h3>40%: {loading ? "Загрузка..." : `${calculatedIncome40} сом`}</h3>
        </div>
      </div>
    </div>
  );
};

export default ClientIncome;
