import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchTotalTrainer } from "../../api/API";
import { months, years } from "../../Constants/constants";
import './Sport.scss';

const getCurrentMonthAndYear = () => {
  const date = new Date();
  return {
    month: months[date.getMonth()] || months[0],
    year: years[0],
  };
};

const sports = [
  "Кулату", "Бокс", "Борьба", "Тхэквондо", "Самбо",
  "Греко-римская борьба", "Кроссфит", "Дзюдо", "Кикбокс",
];

const Sport = () => {
  const [filters, setFilters] = useState(getCurrentMonthAndYear());
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadIncome = useCallback(async () => {
    setLoading(true);
    try {
      const incomes = await Promise.all(
        sports.map(async (sport) => {
          const income = await fetchTotalTrainer({
            sport_category: sport,
            month: filters.month,
            year: filters.year,
          });
          return { sport, income: Number(income) || 0 };
        })
      );
      setIncomeData(incomes);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки.");
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
    setFilters(getCurrentMonthAndYear());
  };

  const maxIncome = useMemo(() => Math.max(...incomeData.map(item => item.income), 1), [incomeData]);

  if (error) return <p className="sport-income__error">{error}</p>;

  return (
    <div className="sport-income">
      <div className="sport-income__header">
        <h1 className="sport-income__title">Доход по спорту</h1>
        <div className="sport-income__filters">
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="sport-income__select"
            aria-label="Месяц"
          >
            <option value="">Месяц</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="sport-income__select"
            aria-label="Год"
          >
            <option value="">Год</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            className="sport-income__reset-btn"
            onClick={resetFilters}
            aria-label="Сбросить"
          >
            🔄
          </button>
        </div>
      </div>
      <div className={`sport-income__content ${loading ? "sport-income__content--loading" : ""}`}>
        {loading ? (
          <div className="sport-income__loading">
            <span className="sport-income__loading-spinner"></span>
          </div>
        ) : (
          <div className="sport-income__bars">
            {incomeData.map((item, index) => (
              <div key={index} className="sport-income__bar-item">
                <span className="sport-income__bar-label">{item.sport}</span>
                <div
                  className="sport-income__bar"
                  style={{ width: `${Math.max((item.income / maxIncome) * 100, 10)}%` }}
                  data-tooltip={`${item.income.toLocaleString()} сом`}
                >
                  <span className="sport-income__bar-value">{item.income.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sport;