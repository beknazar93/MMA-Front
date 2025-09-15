import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients, fetchTotalStudents, fetchTotalBySource } from "../../api/API";
import { months, years, checkFieldOptions, formFieldConfig } from "../../Constants/constants";
import "./Dashboard.scss";

const getCurrentMonthAndYear = () => {
  const d = new Date();
  return { month: months[d.getMonth()] || months[0], year: years[0] };
};

const Dashboard = () => {
  const [filters, setFilters] = useState(getCurrentMonthAndYear());
  const [clients, setClients] = useState([]);
  const [students, setStudents] = useState(0);
  const [sourceData, setSourceData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [typeClientData, setTypeClientData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const genders =
    formFieldConfig.find((f) => f.name === "stage")?.options ||
    ["Мужской", "Женский"];

  const clientTypes =
    formFieldConfig.find((f) => f.name === "typeClient")?.options ||
    ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsData, studentsCount, sourceCounts] = await Promise.all([
        fetchClients(),
        fetchTotalStudents({ month: filters.month, year: filters.year }),
        Promise.all(
          checkFieldOptions.map(async (source) => ({
            source,
            count: await fetchTotalBySource({
              check_field: source,
              month: filters.month,
              year: filters.year,
            }),
          }))
        ),
      ]);

      setClients(
        Array.isArray(clientsData)
          ? clientsData.filter(
              (c) =>
                c &&
                c.month &&
                c.year &&
                c.name &&
                c.sport_category &&
                c.stage &&
                c.typeClient
            )
          : []
      );

      setStudents(Number(studentsCount) || 0);
      setSourceData(sourceCounts);
      setError(null);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
      setError("Не удалось загрузить данные");
      setClients([]);
      setStudents(0);
      setSourceData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
    return () => setClients([]);
  }, [loadData]);

  const handleRetry = () => {
    setError(null);
    loadData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(getCurrentMonthAndYear());
  };

  const totalCount = useMemo(
    () => sourceData.reduce((sum, item) => sum + (Number(item?.count) || 0), 0),
    [sourceData]
  );

  const genderDataMemo = useMemo(
    () =>
      genders.map((gender) => ({
        gender,
        count: clients.filter(
          (c) =>
            c.month?.trim().toLowerCase() ===
              filters.month.trim().toLowerCase() &&
            c.year?.trim() === filters.year.trim() &&
            c.stage?.trim().toLowerCase() === gender.trim().toLowerCase()
        ).length,
      })),
    [clients, filters.month, filters.year, genders]
  );

  const typeClientDataMemo = useMemo(
    () =>
      clientTypes.map((type) => ({
        type,
        count: clients.filter(
          (c) =>
            c.month?.trim().toLowerCase() ===
              filters.month.trim().toLowerCase() &&
            c.year?.trim() === filters.year.trim() &&
            c.typeClient?.trim().toLowerCase() === type.trim().toLowerCase()
        ).length,
      })),
    [clients, filters.month, filters.year, clientTypes]
  );

  useEffect(() => {
    setGenderData(genderDataMemo);
    setTypeClientData(typeClientDataMemo);
  }, [genderDataMemo, typeClientDataMemo]);

  const maxStudents = Math.max(students, 1);
  const maxSource =
    sourceData.length > 0
      ? Math.max(...sourceData.map((i) => i.count), 1)
      : 1;
  const maxGender =
    genderData.length > 0
      ? Math.max(...genderData.map((i) => i.count), 1)
      : 1;
  const maxTypeClient =
    typeClientData.length > 0
      ? Math.max(...typeClientData.map((i) => i.count), 1)
      : 1;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Панель управления</h1>

        <div className="dashboard__filters">
          <div className="dashboard__filter-group">
            <span className="dashboard__filter-icon" aria-hidden="true">📅</span>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="dashboard__select"
              aria-label="Выберите месяц"
            >
              <option value="" disabled>Месяц</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="dashboard__select"
              aria-label="Выберите год"
            >
              <option value="" disabled>Год</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            className="dashboard__reset-btn"
            onClick={resetFilters}
            aria-label="Сбросить фильтры"
            type="button"
          >
            <span className="dashboard__reset-icon" aria-hidden="true">🔄</span>
            Сброс
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard__loading" role="status" aria-live="polite">
          <span className="dashboard__loading-spinner" />
          Загрузка...
        </div>
      ) : error ? (
        <div className="dashboard__error" role="alert">
          {error}
          <button
            className="dashboard__retry-btn"
            onClick={handleRetry}
            aria-label="Повторить загрузку"
            type="button"
          >
            Повторить
          </button>
        </div>
      ) : (
        <div className="dashboard__content">
          <div className="dashboard__card dashboard__card--students">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon" aria-hidden="true">👥</span>
              <h2 className="dashboard__card-title">Ученики</h2>
            </div>

            <div className="dashboard__students">
              <div className="dashboard__students-item">
                <span className="dashboard__students-label">
                  {filters.month} {filters.year}
                </span>
                <div
                  className="dashboard__bar"
                  style={{ width: `${(students / maxStudents) * 100}%` }}
                  aria-label={`Количество учеников: ${students}`}
                >
                  <span className="dashboard__bar-value">{students}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard__card dashboard__card--sources">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon" aria-hidden="true">🌐</span>
              <h2 className="dashboard__card-title">Источники</h2>
            </div>

            <div className="dashboard__sources">
              <span className="dashboard__sources-total">Всего: {totalCount}</span>
              {sourceData.map((item, i) => (
                <div key={i} className="dashboard__sources-item">
                  <span className="dashboard__sources-label">{item.source}</span>
                  <div
                    className="dashboard__bar"
                    style={{ width: `${(item.count / maxSource) * 100}%` }}
                    aria-label={`Источник ${item.source}: ${item.count} клиентов`}
                  >
                    <span className="dashboard__bar-value">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard__card dashboard__card--gender">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon" aria-hidden="true">⚥</span>
              <h2 className="dashboard__card-title">Пол</h2>
            </div>

            <div className="dashboard__gender">
              {genderData.map((g, i) => (
                <div key={i} className="dashboard__gender-item">
                  <span className="dashboard__gender-label">{g.gender}</span>
                  <div
                    className="dashboard__bar"
                    style={{ width: `${(g.count / maxGender) * 100}%` }}
                    aria-label={`Пол ${g.gender}: ${g.count} клиентов`}
                  >
                    <span className="dashboard__bar-value">{g.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard__card dashboard__card--type-client">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon" aria-hidden="true">👤</span>
              <h2 className="dashboard__card-title">Типы клиентов</h2>
            </div>

            <div className="dashboard__type-client">
              {typeClientData.map((t, i) => (
                <div key={i} className="dashboard__type-client-item">
                  <span className="dashboard__type-client-label">{t.type}</span>
                  <div
                    className="dashboard__bar"
                    style={{ width: `${(t.count / maxTypeClient) * 100}%` }}
                    aria-label={`Тип клиента ${t.type}: ${t.count} клиентов`}
                  >
                    <span className="dashboard__bar-value">{t.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
