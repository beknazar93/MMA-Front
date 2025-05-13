import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchTotalTrainer } from "../../api/API";

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

const getPreviousMonthAndYear = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
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

const trainers = [
  "Азизбек Уулу Баяман",
  "Анарбаев Акжол",
  "Асанбаев Эрлан",
  "Жумалы Уулу Ариет",
  "Калмамат Уулу Акай",
  "Лукас Крабб",
  "Маматжанов Марлен",
  "Машрапов Жумабай",
  "Машрапов Тилек",
  "Медербек Уулу Сафармурат",
  "Минбаев Сулайман",
  "Мойдунов Мирлан",
  "Пазылов Кутман",
  "Тажибаев Азамат",
  "Тургунов Ислам",
];

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#ff0000",
  "#00C49F",
  "#0088FE",
  "#FFBB28",
  "#FF8042",
  "#D81B60",
  "#5E35B1",
  "#3949AB",
  "#26A69A",
  "#8D6E63",
  "#78909C",
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

  const years = useMemo(
    () => Array.from({ length: 1 }, (_, i) => (2025 - i).toString()),
    []
  );
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

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const [incomes1, incomes2] = await Promise.all([
        Promise.all(
          trainers.map(async (trainer) => {
            const income = await fetchTotalTrainer({
              trainer,
              month: filters.month1,
              year: filters.year1,
            });
            return { name: trainer, value: income || 0 };
          })
        ),
        Promise.all(
          trainers.map(async (trainer) => {
            const income = await fetchTotalTrainer({
              trainer,
              month: filters.month2,
              year: filters.year2,
            });
            return { name: trainer, value: income || 0 };
          })
        ),
      ]);
      setIncomes1((prev) =>
        JSON.stringify(prev) !==
        JSON.stringify(incomes1.filter((entry) => entry.value > 0))
          ? incomes1.filter((entry) => entry.value > 0)
          : prev
      );
      setIncomes2((prev) =>
        JSON.stringify(prev) !==
        JSON.stringify(incomes2.filter((entry) => entry.value > 0))
          ? incomes2.filter((entry) => entry.value > 0)
          : prev
      );
    } catch (err) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadIncomes();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, loadIncomes]);

  const totalIncome1 = useMemo(
    () => incomes1.reduce((acc, curr) => acc + curr.value, 0),
    [incomes1]
  );
  const totalIncome2 = useMemo(
    () => incomes2.reduce((acc, curr) => acc + curr.value, 0),
    [incomes2]
  );

  const dataWithPercentages1 = useMemo(
    () =>
      incomes1.map((entry) => ({
        ...entry,
        percentage:
          totalIncome1 > 0
            ? ((entry.value / totalIncome1) * 100).toFixed(2)
            : 0,
      })),
    [incomes1, totalIncome1]
  );
  const dataWithPercentages2 = useMemo(
    () =>
      incomes2.map((entry) => ({
        ...entry,
        percentage:
          totalIncome2 > 0
            ? ((entry.value / totalIncome2) * 100).toFixed(2)
            : 0,
      })),
    [incomes2, totalIncome2]
  );

  const resetFilters = () => {
    setFilters({
      month1: getCurrentMonthAndYear().month,
      year1: getCurrentMonthAndYear().year,
      month2: getPreviousMonthAndYear().month,
      year2: getPreviousMonthAndYear().year,
    });
  };

  if (error) return <p className="trainer-analytics__error">{error}</p>;

  return (
    <div className="trainer-analytics">
      <h1 className="trainer-analytics__title">Доход тренеров</h1>
      <div className="trainer-analytics__filters">
        <div className="trainer-analytics__filter-row">
          <label className="trainer-analytics__label">Первый месяц:</label>
          <select
            name="month1"
            value={filters.month1}
            onChange={(e) => setFilters({ ...filters, month1: e.target.value })}
            className="trainer-analytics__select"
          >
            <option value="">Месяц</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            name="year1"
            value={filters.year1}
            onChange={(e) => setFilters({ ...filters, year1: e.target.value })}
            className="trainer-analytics__select"
          >
            <option value="">Год</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="trainer-analytics__filter-row">
          <label className="trainer-analytics__label">Второй месяц:</label>
          <select
            name="month2"
            value={filters.month2}
            onChange={(e) => setFilters({ ...filters, month2: e.target.value })}
            className="trainer-analytics__select"
          >
            <option value="">Месяц</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            name="year2"
            value={filters.year2}
            onChange={(e) => setFilters({ ...filters, year2: e.target.value })}
            className="trainer-analytics__select"
          >
            <option value="">Год</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button className="trainer-analytics__reset-btn" onClick={resetFilters}>
          Сбросить
        </button>
      </div>
      <div className="trainer-analytics__charts">
        {loading ? (
          <div className="trainer-analytics__loader">Загрузка...</div>
        ) : (
          <>
            <div className="trainer-analytics__chart">
              <h2 className="trainer-analytics__chart-title">
                {filters.month1} {filters.year1}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataWithPercentages1}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataWithPercentages1.map((entry, index) => (
                      <Cell
                        key={`cell-1-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f5f5f5",
                      color: "#f5f5f5",
                      fontSize: "12px",
                    }}
                    formatter={(value, name, props) => [
                      `${name}`,
                      `${value} сом`,
                      `${props.payload.percentage}%`,
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "12px", color: "#f5f5f5" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="trainer-analytics__chart">
              <h2 className="trainer-analytics__chart-title">
                {filters.month2} {filters.year2}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataWithPercentages2}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataWithPercentages2.map((entry, index) => (
                      <Cell
                        key={`cell-2-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f5f5f5",
                      color: "#f5f5f5",
                      fontSize: "12px",
                    }}
                    formatter={(value, name, props) => [
                      `${name}`,
                      `${value} сом`,
                      `${props.payload.percentage}%`,
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "12px", color: "#f5f5f5" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainerAnalytics;
