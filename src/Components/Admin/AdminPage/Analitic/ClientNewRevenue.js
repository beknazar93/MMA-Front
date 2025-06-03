import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients } from "../api/API";

function ClientNewRevenue() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("Май");
  const [selectedYear, setSelectedYear] = useState("2025");

  const months = useMemo(
    () => [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ],
    []
  );

  const years = useMemo(() => ["2024", "2025", "2026"], []);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await fetchClients();
      setClients(clientsData);
      setError(null);
    } catch (error) {
      setError("Ошибка загрузки данных клиентов.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const newClients = useMemo(() => {
    const currentClients = clients.filter(
      (client) => client.month === selectedMonth && client.year === selectedYear
    );

    const currentClientSet = new Set(
      currentClients.map((client) => `${client.name}|${client.sport_category}`)
    );

    return currentClients.filter((client) => {
      const clientKey = `${client.name}|${client.sport_category}`;
      const hasPreviousRecords = clients.some(
        (c) =>
          c.name === client.name &&
          c.sport_category === client.sport_category &&
          (c.year < selectedYear || (c.year === selectedYear && months.indexOf(c.month) < months.indexOf(selectedMonth)))
      );
      return !hasPreviousRecords && currentClientSet.has(clientKey);
    });
  }, [clients, selectedMonth, selectedYear, months]);

  const totalRevenue = useMemo(() => {
    return newClients.reduce((sum, client) => {
      const price = parseFloat(client.price) || 0;
      return sum + price;
    }, 0);
  }, [newClients]);

  const newClientsCount = useMemo(() => newClients.length, [newClients]);

  return (
    <div className="revenue-dashboard">
      <div className="revenue-dashboard__filters">
        <select
          className="revenue-dashboard__select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Выберите месяц</option>
          {months.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>
        <select
          className="revenue-dashboard__select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Выберите год</option>
          {years.map((year, index) => (
            <option key={index} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="revenue-dashboard__loading">Загрузка данных...</p>
      ) : error ? (
        <p className="revenue-dashboard__error">{error}</p>
      ) : (
        <div className="revenue-dashboard__circle">
          <span className="revenue-dashboard__amount">{totalRevenue.toLocaleString()} сом</span>
          <span className="revenue-dashboard__clients">Новых клиентов: {newClientsCount}</span>
          <span className="revenue-dashboard__label">Доход от новых клиентов</span>
        </div>
      )}
    </div>
  );
}

export default ClientNewRevenue;