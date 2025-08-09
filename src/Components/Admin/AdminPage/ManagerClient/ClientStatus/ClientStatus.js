import React, { useState, useEffect, useMemo } from 'react';
import { fetchClients } from '../../api/API';
import { months, years, trainers, sports, typeClients } from '../../Constants/constants';
import './ClientStatus.scss';

const ClientStatus = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [comparisonMonth, setComparisonMonth] = useState('');
  const [comparisonYear, setComparisonYear] = useState('2025');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientsData = await fetchClients();
        setClients(clientsData);
        setError(null);
      } catch (error) {
        setError('Ошибка загрузки данных.');
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const pastClients = useMemo(() => {
    if (!selectedMonth || !selectedYear) return [];
    return clients.filter(client => 
      client.month === selectedMonth && client.year === selectedYear
    );
  }, [clients, selectedMonth, selectedYear]);

  const currentClients = useMemo(() => {
    if (!comparisonMonth || !comparisonYear) return [];
    return clients.filter(client => 
      client.month === comparisonMonth && client.year === comparisonYear
    );
  }, [clients, comparisonMonth, comparisonYear]);

  const nonRenewedClients = useMemo(() => {
    return pastClients.filter(pastClient => 
      !currentClients.some(currentClient => 
        currentClient.name.toLowerCase() === pastClient.name.toLowerCase()
      )
    );
  }, [pastClients, currentClients]);

  const trainerStats = useMemo(() => {
    return trainers.map(trainer => {
      const trainerPastClients = pastClients.filter(client => client.trainer === trainer);
      const trainerNonRenewed = nonRenewedClients.filter(client => client.trainer === trainer);
      return { trainer, count: trainerNonRenewed.length, clients: trainerNonRenewed };
    }).sort((a, b) => b.count - a.count);
  }, [pastClients, nonRenewedClients]);

  const sportStats = useMemo(() => {
    return sports.map(sport => {
      const sportPastClients = pastClients.filter(client => client.sport_category === sport);
      const sportNonRenewed = nonRenewedClients.filter(client => client.sport_category === sport);
      return { sport, count: sportNonRenewed.length, clients: sportNonRenewed };
    }).sort((a, b) => b.count - a.count);
  }, [pastClients, nonRenewedClients]);

  const typeClientStats = useMemo(() => {
    return typeClients.map(type => {
      const typePastClients = pastClients.filter(client => client.typeClient === type);
      const typeNonRenewed = nonRenewedClients.filter(client => client.typeClient === type);
      return { type, count: typeNonRenewed.length, clients: typeNonRenewed };
    }).sort((a, b) => b.count - a.count);
  }, [pastClients, nonRenewedClients]);

  const handleTrainerClick = (trainer) => {
    setSelectedTrainer(selectedTrainer === trainer ? null : trainer);
    setSelectedSport(null);
    setSelectedType(null);
  };

  const handleSportClick = (sport) => {
    setSelectedSport(selectedSport === sport ? null : sport);
    setSelectedTrainer(null);
    setSelectedType(null);
  };

  const handleTypeClick = (type) => {
    setSelectedType(selectedType === type ? null : type);
    setSelectedTrainer(null);
    setSelectedSport(null);
  };

  return (
    <div className="client-status">
      <h2 className="client-status__title">Сравнение клиентов по месяцам</h2>
      <div className="client-status__filters">
        <div className="client-status__filter">
          <label className="client-status__label">Прошлый месяц:</label>
          <select 
            className="client-status__select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="" disabled>Выберите месяц</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select 
            className="client-status__select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="client-status__filter">
          <label className="client-status__label">Текущий месяц:</label>
          <select 
            className="client-status__select"
            value={comparisonMonth}
            onChange={(e) => setComparisonMonth(e.target.value)}
          >
            <option value="" disabled>Выберите месяц</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select 
            className="client-status__select"
            value={comparisonYear}
            onChange={(e) => setComparisonYear(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="client-status__spinner" />
      ) : error ? (
        <p className="client-status__error">{error}</p>
      ) : (
        <div className="client-status__results">
          <div className="client-status__section">
            <h3 className="client-status__subtitle">
              Клиенты в {selectedMonth} {selectedYear} ({pastClients.length})
            </h3>
            <ul className="client-status__list">
              {pastClients.map(client => (
                <li key={client.id} className="client-status__item">
                  {client.name} ({client.sport_category})
                </li>
              ))}
            </ul>
          </div>
          <div className="client-status__section">
            <h3 className="client-status__subtitle">
              Не продлили в {comparisonMonth} {comparisonYear} ({nonRenewedClients.length})
            </h3>
            <ul className="client-status__list">
              {nonRenewedClients.map(client => (
                <li key={client.id} className="client-status__item">
                  {client.name} ({client.sport_category})
                </li>
              ))}
            </ul>
          </div>
          <div className="client-status__section">
            <h3 className="client-status__subtitle">Статистика по тренерам</h3>
            <ul className="client-status__list">
              {trainerStats.map(({ trainer, count, clients }) => (
                <li key={trainer} className="client-status__item">
                  <button 
                    className="client-status__action"
                    onClick={() => handleTrainerClick(trainer)}
                  >
                    {trainer}: {count}
                  </button>
                  {selectedTrainer === trainer && (
                    <ul className="client-status__sublist">
                      {clients.map(client => (
                        <li key={client.id} className="client-status__subitem">
                          {client.name} ({client.sport_category})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="client-status__section">
            <h3 className="client-status__subtitle">Статистика по видам спорта</h3>
            <ul className="client-status__list">
              {sportStats.map(({ sport, count, clients }) => (
                <li key={sport} className="client-status__item">
                  <button 
                    className="client-status__action"
                    onClick={() => handleSportClick(sport)}
                  >
                    {sport}: {count}
                  </button>
                  {selectedSport === sport && (
                    <ul className="client-status__sublist">
                      {clients.map(client => (
                        <li key={client.id} className="client-status__subitem">
                          {client.name} ({client.trainer})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="client-status__section">
            <h3 className="client-status__subtitle">Статистика по типам клиентов</h3>
            <ul className="client-status__list">
              {typeClientStats.map(({ type, count, clients }) => (
                <li key={type} className="client-status__item">
                  <button 
                    className="client-status__action"
                    onClick={() => handleTypeClick(type)}
                  >
                    {type}: {count}
                  </button>
                  {selectedType === type && (
                    <ul className="client-status__sublist">
                      {clients.map(client => (
                        <li key={client.id} className="client-status__subitem">
                          {client.name} ({client.sport_category})
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

export default ClientStatus;