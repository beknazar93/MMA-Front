import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchTotalTrainer } from "../../api/API";
import { months, years } from "../../Constants/constants";
import './TrainerAnalytics.scss';

const getCurrentMonthAndYear = () => {
  const date = new Date();
  return { month: months[date.getMonth()] || months[0], year: years[0] };
};

const getPreviousMonthAndYear = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return { month: months[date.getMonth()] || months[11], year: years[0] };
};

const trainers = [
  "Абдыкадыров Султан", "Азизбек Уулу Баяман", "Асанбаев Эрлан", "Жумалы Уулу Ариет",
  "Калмамат Уулу Акай", "Лукас Крабб", "Машрапов Жумабай", "Машрапов Тилек",
  "Медербек Уулу Сафармурат", "Минбаев Сулайман", "Мойдунов Мирлан", "Пазылов Кутман",
  "Тажибаев Азамат", "Тургунов Ислам",
];

const COLORS = [
  "#00cc99", "#33d4a6", "#ff6384", "#ffbb28", "#8884d8", "#82ca9d", "#ffc658",
  "#ff7300", "#00C49F", "#0088FE", "#D81B60", "#5E35B1", "#3949AB", "#26A69A",
];

const TrainerAnalytics = () => {
  const [filters, setFilters] = useState({
    month1: getCurrentMonthAndYear().month,
    year1: getCurrentMonthAndYear().year,
    month2: getPreviousMonthAndYear().month,
    year2: getPreviousMonthAndYear().year,
  });
  const [incomes1, setIncomes1] = useState([]);
  const [incomes2, setIncomes2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const [incomes1, incomes2] = await Promise.all([
        Promise.all(trainers.map(async (trainer) => {
          const income = await fetchTotalTrainer({ trainer, month: filters.month1, year: filters.year1 });
          return { name: trainer, value: Number(income) || 0 };
        })),
        Promise.all(trainers.map(async (trainer) => {
          const income = await fetchTotalTrainer({ trainer, month: filters.month2, year: filters.year2 });
          return { name: trainer, value: Number(income) || 0 };
        })),
      ]);
      setIncomes1(incomes1.filter((entry) => entry.value > 0));
      setIncomes2(incomes2.filter((entry) => entry.value > 0));
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadIncomes(), 300);
    return () => clearTimeout(timer);
  }, [loadIncomes]);

  const totalIncome1 = useMemo(() => incomes1.reduce((acc, curr) => acc + curr.value, 0), [incomes1]);
  const totalIncome2 = useMemo(() => incomes2.reduce((acc, curr) => acc + curr.value, 0), [incomes2]);

  const dataWithPercentages1 = useMemo(() =>
    incomes1.map((entry) => ({
      ...entry,
      percentage: totalIncome1 > 0 ? ((entry.value / totalIncome1) * 100).toFixed(2) : 0,
    })), [incomes1, totalIncome1]);
  const dataWithPercentages2 = useMemo(() =>
    incomes2.map((entry) => ({
      ...entry,
      percentage: totalIncome2 > 0 ? ((entry.value / totalIncome2) * 100).toFixed(2) : 0,
    })), [incomes2, totalIncome2]);

  const resetFilters = () => {
    setFilters({
      month1: getCurrentMonthAndYear().month,
      year1: getCurrentMonthAndYear().year,
      month2: getPreviousMonthAndYear().month,
      year2: getPreviousMonthAndYear().year,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const renderDonutChart = (data, period, title) => {
    if (!data.length) return <p className="trainer-analytics__no-data">Нет данных</p>;

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let startAngle = 0;

    return (
      <div className="trainer-analytics__chart">
        <h2 className="trainer-analytics__chart-title">{title}</h2>
        <div className="trainer-analytics__donut-wrapper">
          <svg viewBox="0 0 100 100" className="trainer-analytics__donut">
            {data.map((entry, index) => {
              const percentage = (entry.value / total) * 100;
              const angle = (percentage * 360) / 100;
              const endAngle = startAngle + angle;
              const largeArcFlag = angle > 180 ? 1 : 0;
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              const path = `M${x1},${y1} A40,40 0 ${largeArcFlag},1 ${x2},${y2}`;
              startAngle = endAngle;

              return (
                <path
                  key={index}
                  d={path}
                  fill="none"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth="10"
                  className="trainer-analytics__donut-segment"
                  data-tooltip={`${entry.name}: ${entry.value.toLocaleString()} сом (${entry.percentage}%)`}
                />
              );
            })}
            <circle cx="50" cy="50" r="30" fill="#1a1a2e" />
          </svg>
        </div>
        <div className="trainer-analytics__legend">
          {data.map((entry, index) => (
            <div key={index} className="trainer-analytics__legend-item">
              <span
                className="trainer-analytics__legend-color"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="trainer-analytics__legend-name">{entry.name}</span>
              <span className="trainer-analytics__legend-value">
                {entry.value.toLocaleString()} сом ({entry.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) return <p className="trainer-analytics__error">{error}</p>;

  return (
    <div className="trainer-analytics">
      <div className="trainer-analytics__header">
        <h1 className="trainer-analytics__title">Доход тренеров</h1>
        <div className="trainer-analytics__filters">
          <div className="trainer-analytics__filter-group">
            <select
              name="month1"
              value={filters.month1}
              onChange={handleFilterChange}
              className="trainer-analytics__select"
              aria-label="Первый месяц"
            >
              <option value="">Месяц</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              name="year1"
              value={filters.year1}
              onChange={handleFilterChange}
              className="trainer-analytics__select"
              aria-label="Первый год"
            >
              <option value="">Год</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="trainer-analytics__filter-group">
            <select
              name="month2"
              value={filters.month2}
              onChange={handleFilterChange}
              className="trainer-analytics__select"
              aria-label="Второй месяц"
            >
              <option value="">Месяц</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              name="year2"
              value={filters.year2}
              onChange={handleFilterChange}
              className="trainer-analytics__select"
              aria-label="Второй год"
            >
              <option value="">Год</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button
            className="trainer-analytics__reset-btn"
            onClick={resetFilters}
            aria-label="Сбросить фильтры"
          >
            🔄
          </button>
        </div>
      </div>
      <div className={`trainer-analytics__content ${loading ? "trainer-analytics__content--loading" : ""}`}>
        {loading ? (
          <div className="trainer-analytics__loading">
            <span className="trainer-analytics__loading-spinner"></span>
          </div>
        ) : (
          <div className="trainer-analytics__charts">
            {renderDonutChart(dataWithPercentages1, 1, `${filters.month1} ${filters.year1}`)}
            {renderDonutChart(dataWithPercentages2, 2, `${filters.month2} ${filters.year2}`)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerAnalytics;