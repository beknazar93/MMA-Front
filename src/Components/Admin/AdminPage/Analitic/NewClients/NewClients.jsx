import React, { useState, useEffect, useMemo } from 'react';
import { fetchClients } from '../../api/API';
import { months, years, trainers, sports, typeClients, checkFieldOptions } from '../../Constants/constants';
import './NewClients.scss';

const NewClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

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

  const newClients = useMemo(() => {
    if (!selectedMonth || !selectedYear) return [];
    const selectedMonthIndex = months.indexOf(selectedMonth);
    const selectedYearNum = parseInt(selectedYear);

    const currentClients = clients.filter(client => 
      client.month === selectedMonth && client.year === selectedYear
    );

    const previousClients = clients.filter(client => {
      const clientYearNum = parseInt(client.year);
      const clientMonthIndex = months.indexOf(client.month);
      return (
        clientYearNum < selectedYearNum ||
        (clientYearNum === selectedYearNum && clientMonthIndex < selectedMonthIndex)
      );
    });

    return currentClients.filter(currentClient => 
      !previousClients.some(prevClient => 
        prevClient.name.toLowerCase() === currentClient.name.toLowerCase()
      )
    );
  }, [clients, selectedMonth, selectedYear]);

  const trainerStats = useMemo(() => {
    return trainers.map(trainer => {
      const trainerNewClients = newClients.filter(client => client.trainer === trainer);
      return { trainer, count: trainerNewClients.length, clients: trainerNewClients };
    }).sort((a, b) => b.count - a.count);
  }, [newClients]);

  const sportStats = useMemo(() => {
    return sports.map(sport => {
      const sportNewClients = newClients.filter(client => client.sport_category === sport);
      return { sport, count: sportNewClients.length, clients: sportNewClients };
    }).sort((a, b) => b.count - a.count);
  }, [newClients]);

  const typeClientStats = useMemo(() => {
    return typeClients.map(type => {
      const typeNewClients = newClients.filter(client => client.typeClient === type);
      return { type, count: typeNewClients.length, clients: typeNewClients };
    }).sort((a, b) => b.count - a.count);
  }, [newClients]);

  const sourceStats = useMemo(() => {
    return checkFieldOptions.map(source => {
      const sourceNewClients = newClients.filter(client => client.check_field === source);
      return { source, count: sourceNewClients.length, clients: sourceNewClients };
    }).sort((a, b) => b.count - a.count);
  }, [newClients]);

  const handleTrainerClick = (trainer) => {
    setSelectedTrainer(selectedTrainer === trainer ? null : trainer);
    setSelectedSport(null);
    setSelectedType(null);
    setSelectedSource(null);
  };

  const handleSportClick = (sport) => {
    setSelectedSport(selectedSport === sport ? null : sport);
    setSelectedTrainer(null);
    setSelectedType(null);
    setSelectedSource(null);
  };

  const handleTypeClick = (type) => {
    setSelectedType(selectedType === type ? null : type);
    setSelectedTrainer(null);
    setSelectedSport(null);
    setSelectedSource(null);
  };

  const handleSourceClick = (source) => {
    setSelectedSource(selectedSource === source ? null : source);
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
          >
            <option value="" disabled>Выберите месяц</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select 
            className="new-clients__select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
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
              {newClients.map(client => (
                <li key={client.id} className="new-clients__item">
                  {client.name} ({client.sport_category})
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
                    className="new-clients__action"
                    onClick={() => handleTrainerClick(trainer)}
                  >
                    {trainer}: {count} клиентов
                  </button>
                  {selectedTrainer === trainer && (
                    <ul className="new-clients__sublist">
                      {clients.map(client => (
                        <li key={client.id} className="new-clients__subitem">
                          {client.name} ({client.sport_category})
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
                    className="new-clients__action"
                    onClick={() => handleSportClick(sport)}
                  >
                    {sport}: {count} клиентов
                  </button>
                  {selectedSport === sport && (
                    <ul className="new-clients__sublist">
                      {clients.map(client => (
                        <li key={client.id} className="new-clients__subitem">
                          {client.name} ({client.trainer})
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
                    className="new-clients__action"
                    onClick={() => handleTypeClick(type)}
                  >
                    {type}: {count} клиентов
                  </button>
                  {selectedType === type && (
                    <ul className="new-clients__sublist">
                      {clients.map(client => (
                        <li key={client.id} className="new-clients__subitem">
                          {client.name} ({client.sport_category})
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
                    className="new-clients__action"
                    onClick={() => handleSourceClick(source)}
                  >
                    {source}: {count} клиентов
                  </button>
                  {selectedSource === source && (
                    <ul className="new-clients__sublist">
                      {clients.map(client => (
                        <li key={client.id} className="new-clients__subitem">
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

export default NewClients;