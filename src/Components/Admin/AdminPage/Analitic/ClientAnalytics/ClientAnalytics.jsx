import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients, fetchTotalIncome, fetchTotalStudents } from "../../api/API";
import { months, years, days, paymentOptions, errorMessages } from "../../Constants/constants";
import './ClientAnalytics.scss';

const ClientAnalytics = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ day: "", month: "", year: "", payment: "", view: "all" });
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  const statusOptions = [
    "Обычный",
    "Пришли на пробное",
    "Ожидаются",
    "Подумают",
    "Индивидуальный",
    "Абонемент",
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsData, incomeData, studentsData] = await Promise.all([
        fetchClients(),
        fetchTotalIncome(filters),
        fetchTotalStudents(filters),
      ]);
      setClients(clientsData);
      setTotalIncome(incomeData.income);
      setTotalStudents(incomeData.students);
      setError(null);
    } catch (error) {
      setError(errorMessages.loadingError);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const isNewClient = filters.view === "new"
        ? client.month === filters.month &&
          client.year === filters.year &&
          !clients.some(c =>
            c.name.toLowerCase() === client.name.toLowerCase() &&
            (c.year < filters.year || 
             (c.year === filters.year && months.indexOf(c.month) < months.indexOf(filters.month)))
          )
        : true;

      return (
        (!filters.day || client.day === filters.day) &&
        (!filters.month || client.month === filters.month) &&
        (!filters.year || client.year === filters.year) &&
        (!filters.payment || client.payment === filters.payment) &&
        isNewClient
      );
    });
  }, [clients, filters]);

  const stats = useMemo(() => {
    const total = filteredClients.length;
    return {
      allLeads: { label: "Всего лидов", count: total, percentage: total > 0 ? 100 : 0 },
      ordinary: { label: "Обычный", count: filteredClients.filter(c => c.typeClient === "Обычный").length, percentage: total > 0 ? (filteredClients.filter(c => c.typeClient === "Обычный").length / total * 100).toFixed(2) : 0 },
      trial: { label: "Пришли на пробное", count: filteredClients.filter(c => c.typeClient === "Пришли на пробное").length, percentage: total > 0 ? (filteredClients.filter(c => c.typeClient === "Пришли на пробное").length / total * 100).toFixed(2) : 0 },
      expected: { label: "Ожидаются", count: filteredClients.filter(c => c.typeClient === "Ожидаются").length, percentage: total > 0 ? (filteredClients.filter(c => c.typeClient === "Ожидаются").length / total * 100).toFixed(2) : 0 },
      thinking: { label: "Подумают", count: filteredClients.filter(c => c.typeClient === "Подумают").length, percentage: total > 0 ? (filteredClients.filter(c => c.typeClient === "Подумают").length / total * 100).toFixed(2) : 0 },
      individual: { label: "Индивидуальный", count: filteredClients.filter(c => c.typeClient === "Индивидуальный").length, percentage: total > 0 ? (filteredClients.filter(c => c.typeClient === "Индивидуальный").length / total * 100).toFixed(2) : 0 },
      subscription: { label: "Абонемент", count: filteredClients.filter(c => c.typeClient === "Абонемент").length, percentage: total > 0 ? (filteredClients.filter(c => c.typeClient === "Абонемент").length / total * 100).toFixed(2) : 0 },
    };
  }, [filteredClients]);

  const paymentStats = useMemo(() => ({
    paid: filteredClients.filter(c => c.payment === "Оплачено").length,
    unpaid: filteredClients.filter(c => c.payment === "Не оплачено").length,
  }), [filteredClients]);

  const conversionRate = useMemo(() => {
    const trialClients = stats.trial.count;
    const convertedClients = stats.ordinary.count + stats.subscription.count;
    return trialClients > 0 ? ((convertedClients / trialClients) * 100).toFixed(2) : 0;
  }, [stats]);

  const monthlyData = useMemo(() => {
    const maxCount = Math.max(...months.map(month => clients.filter(c => c.month === month && c.year === filters.year).length));
    return months.map(month => ({
      month,
      count: clients.filter(c => c.month === month && c.year === filters.year).length,
      percentage: maxCount > 0 ? (clients.filter(c => c.month === month && c.year === filters.year).length / maxCount * 100).toFixed(2) : 0,
    }));
  }, [clients, filters.year]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="client-analytics">
      <h2 className="client-analytics__title">Аналитика клиентов</h2>
      <div className="client-analytics__filters">
        <select
          name="view"
          value={filters.view}
          onChange={handleFilterChange}
          className="client-analytics__filter-select"
        >
          <option value="all">Общий</option>
          <option value="new">Новый</option>
        </select>
        <select
          name="day"
          value={filters.day}
          onChange={handleFilterChange}
          className="client-analytics__filter-select"
        >
          <option value="">Все дни</option>
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <select
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
          className="client-analytics__filter-select"
        >
          <option value="">Все месяцы</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <select
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
          className="client-analytics__filter-select"
        >
          <option value="">Все годы</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          name="payment"
          value={filters.payment}
          onChange={handleFilterChange}
          className="client-analytics__filter-select"
        >
          <option value="">Все статусы оплаты</option>
          {paymentOptions.map(option => (
            <option key={option.value} value={option.value}>{option.value}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="client-analytics__spinner" />
      ) : error ? (
        <p className="client-analytics__error">{error}</p>
      ) : (
        <div className="client-analytics__content">
          <div className="client-analytics__stats">
            <h3>Общая статистика</h3>
            <div className="client-analytics__stats-grid">
              {Object.entries(stats).map(([key, { label, count }]) => (
                <div key={key} className="client-analytics__stat-item">
                  <span>{label}:</span> <strong>{count}</strong>
                </div>
              ))}
              <div className="client-analytics__stat-item">
                <span>Общий доход:</span> <strong>{totalIncome} сом</strong>
              </div>
              <div className="client-analytics__stat-item">
                <span>Уникальных клиентов:</span> <strong>{totalStudents}</strong>
              </div>
              <div className="client-analytics__stat-item">
                <span>Конверсия (из пробных):</span> <strong>{conversionRate}%</strong>
              </div>
              <div className="client-analytics__stat-item">
                <span>Оплачено:</span> <strong>{paymentStats.paid}</strong>
              </div>
              <div className="client-analytics__stat-item">
                <span>Не оплачено:</span> <strong>{paymentStats.unpaid}</strong>
              </div>
            </div>
          </div>
          <div className="client-analytics__visualization">
            <h3>Распределение клиентов по типам</h3>
            <div className="client-analytics__bar-chart">
              {Object.entries(stats).map(([key, { label, percentage }]) => (
                <div key={key} className="client-analytics__bar-container">
                  <span className="client-analytics__bar-label">{label}</span>
                  <div className="client-analytics__bar">
                    <div
                      className="client-analytics__bar-fill"
                      style={{ width: `${percentage}%`, backgroundColor: key === 'allLeads' ? '#C9CBCF' : `#${Math.floor(Math.random() * 16777215).toString(16)}` }}
                    ></div>
                  </div>
                  <span className="client-analytics__bar-value">{percentage}%</span>
                </div>
              ))}
            </div>
            <h3>Клиенты по месяцам ({filters.year || years[0]})</h3>
            <div className="client-analytics__bar-chart">
              {monthlyData.map(({ month, percentage }) => (
                <div key={month} className="client-analytics__bar-container">
                  <span className="client-analytics__bar-label">{month}</span>
                  <div className="client-analytics__bar">
                    <div
                      className="client-analytics__bar-fill"
                      style={{ width: `${percentage}%`, backgroundColor: '#36A2EB' }}
                    ></div>
                  </div>
                  <span className="client-analytics__bar-value">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAnalytics;