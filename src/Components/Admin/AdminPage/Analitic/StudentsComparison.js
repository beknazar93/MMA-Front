import React, { useState, useEffect, useCallback } from "react";
import { fetchTotalStudents } from "../api/API";

const getCurrentMonthAndYear = () => {
  const date = new Date();
  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  return { month: months[date.getMonth()], year: date.getFullYear().toString() };
};

const getPreviousMonthAndYear = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  return { month: months[date.getMonth()], year: date.getFullYear().toString() };
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
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  const years = Array.from({ length: 1 }, (_, i) => (2025 - i).toString());

  // Оптимизированная загрузка данных
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const [students1, students2] = await Promise.all([
        fetchTotalStudents({ month: filters.month1, year: filters.year1 }),
        fetchTotalStudents({ month: filters.month2, year: filters.year2 })
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

  // Дебаунс (ждем 300 мс перед вызовом API)
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

  if (error) return <p style={styles.errorText}>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Сравнение числа учеников</h1>

      {/* Первый месяц */}
      <div style={styles.filterRow}>
        <label style={styles.label}>Первый месяц:</label>
        <select name="month1" value={filters.month1} onChange={handleFilterChange} style={styles.select}>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select name="year1" value={filters.year1} onChange={handleFilterChange} style={styles.select}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Второй месяц */}
      <div style={styles.filterRow}>
        <label style={styles.label}>Второй месяц:</label>
        <select name="month2" value={filters.month2} onChange={handleFilterChange} style={styles.select}>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select name="year2" value={filters.year2} onChange={handleFilterChange} style={styles.select}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Результаты */}
      <div style={styles.resultBox}>
        {loading ? (
          <p style={styles.loadingText}>Загрузка...</p>
        ) : (
          <div>
            <p style={styles.resultText}>
              {filters.month1} {filters.year1}: <span style={styles.highlight}>{students.month1} учеников</span>
            </p>
            <p style={styles.resultText}>
              {filters.month2} {filters.year2}: <span style={styles.highlight}>{students.month2} учеников</span>
            </p>
            <p
              style={{
                ...styles.differenceText,
                color: students.month1 > students.month2 ? "#32cd32" : students.month1 < students.month2 ? "#ff4500" : "#a0a0a0"
              }}
            >
              Разница: {Math.abs(students.month1 - students.month2)} учеников (
              {students.month1 > students.month2 ? "больше" : students.month1 < students.month2 ? "меньше" : "равно"} в {filters.month1})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Все стили вынесены в один объект
const styles = {
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#1e1e1e",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#e0e0e0",
    marginBottom: "25px",
    textAlign: "center",
  },
  filterRow: {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  label: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#a0a0a0",
    minWidth: "100px",
  },
  select: {
    padding: "8px 12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#2a2a2a",
    color: "#e0e0e0",
    outline: "none",
    cursor: "pointer",
    flex: "1",
  },
  resultBox: {
    backgroundColor: "#252525",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  resultText: {
    fontSize: "18px",
    color: "#d0d0d0",
    marginBottom: "10px",
  },
  highlight: {
    fontWeight: "bold",
    color: "#1e90ff",
  },
  differenceText: {
    fontSize: "16px",
    fontWeight: "600",
    textAlign: "center",
  },
  loadingText: {
    fontSize: "16px",
    color: "#888",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
};

export default StudentsComparison;
