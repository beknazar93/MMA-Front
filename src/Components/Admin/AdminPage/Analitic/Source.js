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
import { fetchTotalBySource } from "../api/API";

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

const sources = ["Из соцсетей", "От знакомых"];

const Source = () => {
  const [filters, setFilters] = useState(getCurrentMonthAndYear());
  const [sourceData, setSourceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const years = useMemo(
    () => Array.from({ length: 1 }, (_, i) => (2025 - i).toString()),
    []
  );

  const loadSources = useCallback(async () => {
    setLoading(true);
    try {
      const counts = await Promise.all(
        sources.map(async (source) => {
          const count = await fetchTotalBySource({
            check_field: source,
            month: filters.month,
            year: filters.year,
          });
          return { source, count };
        })
      );
      setSourceData((prev) =>
        JSON.stringify(prev) !== JSON.stringify(counts) ? counts : prev
      );
    } catch (err) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSources();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, loadSources]);

  const resetFilters = () => {
    setFilters(getCurrentMonthAndYear());
  };

  const totalCount = sourceData.reduce((sum, item) => sum + (item.count || 0), 0);

  if (error) return <p className="source-stats__error">{error}</p>;

  return (
    <div className="source-stats">
      <div className="source-stats__filters">
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
        <button className="source-stats__reset-btn" onClick={resetFilters}>
          Сбросить
        </button>
      </div>
      <div className="source-stats__total">
        Общее количество клиентов: {totalCount}
      </div>
      <div className="source-stats__chart">
        {loading ? (
          <div className="source-stats__loader">Загрузка...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={sourceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="source" tick={{ fontSize: 12, fill: "#f5f5f5" }} />
              <YAxis tick={{ fontSize: 12, fill: "#f5f5f5" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#2a2a3d", color: "#f5f5f5" }}
              />
              <Bar dataKey="count" fill="#8884d8" barSize={100}>
                <LabelList
                  dataKey="count"
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

export default Source;