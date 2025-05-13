import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchTotalStudents } from "../api/API";

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

const StudentsComparison = () => {
  const [filters, setFilters] = useState({
    month1: getCurrentMonthAndYear().month,
    year1: getCurrentMonthAndYear().year,
    month2: getPreviousMonthAndYear().month,
    year2: getPreviousMonthAndYear().year,
  });
  const [students, setStudents] = useState({ month1: 0, month2: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const years = Array.from({ length: 1 }, (_, i) => (2025 - i).toString());

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const [students1, students2] = await Promise.all([
        fetchTotalStudents({ month: filters.month1, year: filters.year1 }),
        fetchTotalStudents({ month: filters.month2, year: filters.year2 }),
      ]);
      setStudents((prev) =>
        prev.month1 !== students1 || prev.month2 !== students2
          ? { month1: students1, month2: students2 }
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
      loadStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, loadStudents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      month1: getCurrentMonthAndYear().month,
      year1: getCurrentMonthAndYear().year,
      month2: getPreviousMonthAndYear().month,
      year2: getPreviousMonthAndYear().year,
    });
  };

  // Данные для графика
  const chartData = [
    { name: `${filters.month1} ${filters.year1}`, students: students.month1 },
    { name: `${filters.month2} ${filters.year2}`, students: students.month2 },
  ];

  if (error) return <p className="students-comparison__error">{error}</p>;

  return (
    <div className="students-comparison">
      <h1 className="students-comparison__title">Сравнение числа учеников</h1>
      <div className="students-comparison__filters">
        <div className="students-comparison__filter-row">
          <label className="students-comparison__label">Первый месяц:</label>
          <select
            name="month1"
            value={filters.month1}
            onChange={handleFilterChange}
            className="students-comparison__select"
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
            onChange={handleFilterChange}
            className="students-comparison__select"
          >
            <option value="">Год</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="students-comparison__filter-row">
          <label className="students-comparison__label">Второй месяц:</label>
          <select
            name="month2"
            value={filters.month2}
            onChange={handleFilterChange}
            className="students-comparison__select"
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
            onChange={handleFilterChange}
            className="students-comparison__select"
          >
            <option value="">Год</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          className="students-comparison__reset-btn"
          onClick={resetFilters}
        >
          Сбросить
        </button>
      </div>
      <div
        className={`students-comparison__result ${
          loading ? "" : "students-comparison__result--animate"
        }`}
      >
        {loading ? (
          <p className="students-comparison__loading">Загрузка...</p>
        ) : (
          <div>
            <p className="students-comparison__result-text">
              {filters.month1} {filters.year1}:{" "}
              <span className="students-comparison__highlight">
                {students.month1} учеников
              </span>
            </p>
            <p className="students-comparison__result-text">
              {filters.month2} {filters.year2}:{" "}
              <span className="students-comparison__highlight">
                {students.month2} учеников
              </span>
            </p>
            <p
              className="students-comparison__difference"
              style={{
                color:
                  students.month1 > students.month2
                    ? "#32cd32"
                    : students.month1 < students.month2
                    ? "#ff4500"
                    : "#a0a0a0",
              }}
            >
              Разница: {Math.abs(students.month1 - students.month2)} учеников (
              {students.month1 > students.month2
                ? "больше"
                : students.month1 < students.month2
                ? "меньше"
                : "равно"}{" "}
              в {filters.month1})
            </p>
            <div className="students-comparison__chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#f5f5f5" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#f5f5f5" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2a2a3d",
                      color: "#f5f5f5",
                    }}
                  />
                  <Bar dataKey="students" fill="#8884d8" barSize={100} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsComparison;
