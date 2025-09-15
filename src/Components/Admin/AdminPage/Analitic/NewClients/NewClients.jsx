import React, { useState, useEffect, useMemo } from "react";
import { fetchClients } from "../../api/API";
import {
  months,
  years,
  trainers,
  sports,
  typeClients,
  checkFieldOptions,
} from "../../Constants/constants";
import "./NewClients.scss";

const NewClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await fetchClients();
        setClients(data);
        setError(null);
      } catch {
        setError("Ошибка загрузки данных.");
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const newClients = useMemo(() => {
    if (!selectedMonth || !selectedYear) return [];
    const selectedMonthIndex = months.indexOf(selectedMonth);
    const selectedYearNum = parseInt(selectedYear, 10);

    const currentClients = clients.filter(
      (c) => c.month === selectedMonth && c.year === selectedYear
    );

    const previousClients = clients.filter((c) => {
      const year = parseInt(c.year, 10);
      const monthIndex = months.indexOf(c.month);
      return year < selectedYearNum || (year === selectedYearNum && monthIndex < selectedMonthIndex);
    });

    return currentClients.filter(
      (curr) =>
        !previousClients.some(
          (prev) => (prev.name || "").toLowerCase() === (curr.name || "").toLowerCase()
        )
    );
  }, [clients, selectedMonth, selectedYear]);

  const trainerStats = useMemo(
    () =>
      trainers
        .map((t) => {
          const list = newClients.filter((c) => c.trainer === t);
          return { trainer: t, count: list.length, clients: list };
        })
        .sort((a, b) => b.count - a.count),
    [newClients]
  );

  const sportStats = useMemo(
    () =>
      sports
        .map((s) => {
          const list = newClients.filter((c) => c.sport_category === s);
          return { sport: s, count: list.length, clients: list };
        })
        .sort((a, b) => b.count - a.count),
    [newClients]
  );

  const typeClientStats = useMemo(
    () =>
      typeClients
        .map((t) => {
          const list = newClients.filter((c) => c.typeClient === t);
          return { type: t, count: list.length, clients: list };
        })
        .sort((a, b) => b.count - a.count),
    [newClients]
  );

  const sourceStats = useMemo(
    () =>
      checkFieldOptions
        .map((s) => {
          const list = newClients.filter((c) => c.check_field === s);
          return { source: s, count: list.length, clients: list };
        })
        .sort((a, b) => b.count - a.count),
    [newClients]
  );

  const handleTrainerClick = (t) => {
    setSelectedTrainer(selectedTrainer === t ? null : t);
    setSelectedSport(null);
    setSelectedType(null);
    setSelectedSource(null);
  };

  const handleSportClick = (s) => {
    setSelectedSport(selectedSport === s ? null : s);
    setSelectedTrainer(null);
    setSelectedType(null);
    setSelectedSource(null);
  };

  const handleTypeClick = (t) => {
    setSelectedType(selectedType === t ? null : t);
    setSelectedTrainer(null);
    setSelectedSport(null);
    setSelectedSource(null);
  };

  const handleSourceClick = (s) => {
    setSelectedSource(selectedSource === s ? null : s);
    setSelectedTrainer(null);
    setSelectedSport(null);
    setSelectedType(null);
  };

  return (
    <div className="new-clients">
      <h2 className="new-clients__title">Новые клиенты</h2>

      <div className="new-clients__filters">
        <div className="new-clients__filter">
          <label className="new-clients__label">Месяц:</label>
          <select
            className="new-clients__select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Выберите месяц"
          >
            <option value="" disabled>
              Выберите месяц
            </option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="new-clients__select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Выберите год"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="new-clients__spinner" />
      ) : error ? (
        <p className="new-clients__error">{error}</p>
      ) : (
        <div className="new-clients__results">
          <div className="new-clients__section">
            <h3 className="new-clients__subtitle">
              Новые клиенты в {selectedMonth} {selectedYear} ({newClients.length})
            </h3>
            <ul className="new-clients__list">
              {newClients.map((c) => (
                <li key={c.id} className="new-clients__item">
                  {c.name} ({c.sport_category})
                </li>
              ))}
            </ul>
          </div>

          <div className="new-clients__section">
            <h3 className="new-clients__subtitle">Тренеры</h3>
            <ul className="new-clients__list">
              {trainerStats.map(({ trainer, count, clients }) => (
                <li key={trainer} className="new-clients__item">
                  <button
                    type="button"
                    className="new-clients__action"
                    onClick={() => handleTrainerClick(trainer)}
                    aria-expanded={selectedTrainer === trainer}
                  >
                    {trainer}: {count} клиентов
                  </button>
                  {selectedTrainer === trainer && (
                    <ul className="new-clients__sublist">
                      {clients.map((c) => (
                        <li key={c.id} className="new-clients__subitem">
                          {c.name} ({c.sport_category})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="new-clients__section">
            <h3 className="new-clients__subtitle">Виды спорта</h3>
            <ul className="new-clients__list">
              {sportStats.map(({ sport, count, clients }) => (
                <li key={sport} className="new-clients__item">
                  <button
                    type="button"
                    className="new-clients__action"
                    onClick={() => handleSportClick(sport)}
                    aria-expanded={selectedSport === sport}
                  >
                    {sport}: {count} клиентов
                  </button>
                  {selectedSport === sport && (
                    <ul className="new-clients__sublist">
                      {clients.map((c) => (
                        <li key={c.id} className="new-clients__subitem">
                          {c.name} ({c.trainer})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="new-clients__section">
            <h3 className="new-clients__subtitle">Типы клиентов</h3>
            <ul className="new-clients__list">
              {typeClientStats.map(({ type, count, clients }) => (
                <li key={type} className="new-clients__item">
                  <button
                    type="button"
                    className="new-clients__action"
                    onClick={() => handleTypeClick(type)}
                    aria-expanded={selectedType === type}
                  >
                    {type}: {count} клиентов
                  </button>
                  {selectedType === type && (
                    <ul className="new-clients__sublist">
                      {clients.map((c) => (
                        <li key={c.id} className="new-clients__subitem">
                          {c.name} ({c.sport_category})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="new-clients__section">
            <h3 className="new-clients__subtitle">Источники</h3>
            <ul className="new-clients__list">
              {sourceStats.map(({ source, count, clients }) => (
                <li key={source} className="new-clients__item">
                  <button
                    type="button"
                    className="new-clients__action"
                    onClick={() => handleSourceClick(source)}
                    aria-expanded={selectedSource === source}
                  >
                    {source}: {count} клиентов
                  </button>
                  {selectedSource === source && (
                    <ul className="new-clients__sublist">
                      {clients.map((c) => (
                        <li key={c.id} className="new-clients__subitem">
                          {c.name} ({c.sport_category})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewClients;
