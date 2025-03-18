import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { fetchTotalTrainer } from "../../api/API";

const getCurrentMonthAndYear = () => {
  const date = new Date();
  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  return { month: months[date.getMonth()], year: date.getFullYear().toString() };
};

const trainers = [
  "Азизбек Уулу Баяман", "Анарбаев Акжол", "Асанбаев Эрлан",
  "Жумалы Уулу Ариет", "Калмамат Уулу Акай", "Лукас Крабб",
  "Маматжанов Марлен", "Машрапов Жумабай", "Машрапов Тилек",
  "Медербек Уулу Сафармурат", "Минбаев Сулайман", "Мойдунов Мирлан",
  "Пазылов Кутман", "Тажибаев Азамат", "Тургунов Ислам"
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff0000", "#00C49F", "#0088FE"];

const MonthOne = () => {
  const [filters, setFilters] = useState(getCurrentMonthAndYear());
  const [totalIncomes, setTotalIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Оптимизированная загрузка данных
  const loadIncome = useCallback(async () => {
    setLoading(true);
    try {
      const incomes = await Promise.all(
        trainers.map(async (trainer) => {
          const income = await fetchTotalTrainer({
            trainer,
            month: filters.month,
            year: filters.year
          });
          return { name: trainer, value: income || 0 }; // Гарантируем, что income >= 0
        })
      );

      // Фильтруем только тренеров, у которых доход больше 0
      const filteredIncomes = incomes.filter((entry) => entry.value > 0);

      setTotalIncomes((prev) => 
        JSON.stringify(prev) !== JSON.stringify(filteredIncomes) ? filteredIncomes : prev
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
      loadIncome();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, loadIncome]);

  // Вычисляем общую сумму доходов (оптимизировано с `useMemo`)
  const totalIncome = useMemo(() => {
    return totalIncomes.reduce((acc, curr) => acc + curr.value, 0);
  }, [totalIncomes]);

  // Рассчитываем проценты для каждого тренера
  const dataWithPercentages = useMemo(() => {
    return totalIncomes.map((entry) => ({
      ...entry,
      percentage: totalIncome > 0 ? ((entry.value / totalIncome) * 100).toFixed(2) : 0
    }));
  }, [totalIncomes, totalIncome]);

  // Если ошибка, показываем сообщение
  if (error) return <p>{error}</p>;

  return (
    <div className="trainer-income">
      <h1 className="trainer-income__title" style={{ fontSize: "18px" }}>
        Доход тренеров за {filters.month} {filters.year}
      </h1>
      <select
        value={filters.month}
        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
        style={{ fontSize: "14px", padding: "4px" }}
      >
        {[
          "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
          "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <PieChart width={300} height={300}>
          <Pie
            data={dataWithPercentages}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithPercentages.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            content={({ payload }) => {
              if (payload && payload.length) {
                const { name, value, percentage } = payload[0].payload;
                return (
                  <div style={{ fontSize: "12px", color: 'black', fontWeight: 'bold' }}>
                    <strong>{name}</strong>
                    <p>Доход: {value}</p>
                    <p>Процент: {percentage}%</p>
                  </div>
                );
              }
              return null;
            }}
            contentStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      )}
    </div>
  );
};

export default MonthOne;
