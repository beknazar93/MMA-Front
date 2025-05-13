import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { fetchTotalTrainer } from "../api/API";

const getCurrentMonthAndYear = () => {
  const date = new Date();
  const months = [
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
  ];
  return {
    month: months[date.getMonth()],
    year: date.getFullYear().toString(),
  };
};

const sports = [
  "Кулату",
  "Бокс",
  "Борьба",
  "Тхэквондо",
  "Самбо",
  "Греко-римская борьба",
  "Кроссфит",
  "Дзюдо",
  "Кикбокс",
];

const Sport = () => {
  const [filters, setFilters] = useState(getCurrentMonthAndYear());
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const years = useMemo(
    () => Array.from({ length: 1 }, (_, i) => (2025 - i).toString()),
    []
  );

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
          return { sport, income };
        })
      );
      setIncomeData((prev) =>
        JSON.stringify(prev) !== JSON.stringify(incomes) ? incomes : prev
      );
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

  const resetFilters = () => {
    setFilters(getCurrentMonthAndYear());
  };

  if (error) return <p className="sport-income__error">{error}</p>;

  return (
    <div className="sport-income">
      <h1 className="sport-income__title">
        Доход по категориям спорта за {filters.month} {filters.year}
      </h1>
      <div className="sport-income__filters">
        <select
          value={filters.month}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, month: e.target.value }))
          }
        >
          <option value="">Месяц</option>
          {[
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
          ].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, year: e.target.value }))
          }
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button className="sport-income__reset-btn" onClick={resetFilters}>
          Сбросить
        </button>
      </div>
      <div className="sport-income__chart">
        {loading ? (
          <div className="sport-income__loader">Загрузка...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={incomeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="sport" tick={{ fontSize: 12, fill: "#f5f5f5" }} />
              <YAxis tick={{ fontSize: 12, fill: "#f5f5f5" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#2a2a3d", color: "#f5f5f5" }}
              />
              <Bar dataKey="income" fill="#8884d8" barSize={50}>
                <LabelList
                  dataKey="income"
                  position="top"
                  fill="#f5f5f5"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Sport;
