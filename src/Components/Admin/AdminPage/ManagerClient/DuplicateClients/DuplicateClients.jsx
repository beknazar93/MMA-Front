import React, { useState, useEffect, useMemo } from 'react';
import { fetchClients } from '../../api/API';
import { months, years } from '../../Constants/constants';
import './DuplicateClients.scss';

// Функция для вычисления расстояния Левенштейна
const levenshteinDistance = (a, b) => {
  const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
};

const DuplicateClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] = useState(null);
  const [selectedSimilarGroup, setSelectedSimilarGroup] = useState(null);

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

  const duplicates = useMemo(() => {
    if (!selectedMonth || !selectedYear) return { exact: [], similar: [] };

    const filteredClients = clients.filter(client => 
      client.month === selectedMonth && client.year === selectedYear
    );

    // Точные дубликаты
    const exactMap = new Map();
    filteredClients.forEach(client => {
      const key = `${client.name.toLowerCase()}|${client.sport_category.toLowerCase()}`;
      if (!exactMap.has(key)) {
        exactMap.set(key, []);
      }
      exactMap.get(key).push(client);
    });

    const exactDuplicates = Array.from(exactMap.values())
      .filter(group => group.length > 1)
      .map(group => ({
        name: group[0].name,
        sport_category: group[0].sport_category,
        clients: group
      }));

    // Похожие имена
    const similarGroups = [];
    const processedNames = new Set();
    for (let i = 0; i < filteredClients.length; i++) {
      const clientA = filteredClients[i];
      const keyA = `${clientA.name.toLowerCase()}|${clientA.sport_category.toLowerCase()}`;
      if (processedNames.has(keyA)) continue;

      const similar = [clientA];
      for (let j = i + 1; j < filteredClients.length; j++) {
        const clientB = filteredClients[j];
        const keyB = `${clientB.name.toLowerCase()}|${clientB.sport_category.toLowerCase()}`;
        if (processedNames.has(keyB)) continue;

        if (
          clientA.sport_category.toLowerCase() === clientB.sport_category.toLowerCase() &&
          levenshteinDistance(clientA.name.toLowerCase(), clientB.name.toLowerCase()) === 1 &&
          clientA.name.toLowerCase() !== clientB.name.toLowerCase()
        ) {
          similar.push(clientB);
          processedNames.add(keyB);
        }
      }

      if (similar.length > 1) {
        similarGroups.push({
          names: similar.map(c => c.name).join(', '),
          sport_category: clientA.sport_category,
          clients: similar
        });
        processedNames.add(keyA);
      }
    }

    return { exact: exactDuplicates, similar: similarGroups };
  }, [clients, selectedMonth, selectedYear]);

  const handleDuplicateClick = (groupKey) => {
    setSelectedDuplicateGroup(selectedDuplicateGroup === groupKey ? null : groupKey);
    setSelectedSimilarGroup(null);
  };

  const handleSimilarClick = (groupKey) => {
    setSelectedSimilarGroup(selectedSimilarGroup === groupKey ? null : groupKey);
    setSelectedDuplicateGroup(null);
  };

  return (
    <div className="duplicate-clients">
      <h2 className="duplicate-clients__title">Дубликаты клиентов</h2>
      <div className="duplicate-clients__filters">
        <div className="duplicate-clients__filter">
          <label className="duplicate-clients__label">Месяц:</label>
          <select 
            className="duplicate-clients__select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="" disabled>Выберите месяц</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select 
            className="duplicate-clients__select"
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
        <div className="duplicate-clients__spinner" />
      ) : error ? (
        <p className="duplicate-clients__error">{error}</p>
      ) : (
        <div className="duplicate-clients__results">
          <div className="duplicate-clients__section">
            <h3 className="duplicate-clients__subtitle">
              Точные дубликаты ({duplicates.exact.length})
            </h3>
            <ul className="duplicate-clients__list">
              {duplicates.exact.map((group, index) => {
                const groupKey = `exact-${group.name}-${group.sport_category}-${index}`;
                return (
                  <li key={groupKey} className="duplicate-clients__item">
                    <button 
                      className="duplicate-clients__action"
                      onClick={() => handleDuplicateClick(groupKey)}
                    >
                      {group.name} ({group.sport_category}): {group.clients.length} записей
                    </button>
                    {selectedDuplicateGroup === groupKey && (
                      <ul className="duplicate-clients__sublist">
                        {group.clients.map(client => (
                          <li key={client.id} className="duplicate-clients__subitem">
                            {client.name} (Тренер: {client.trainer}, Тип: {client.typeClient}, Источник: {client.check_field || 'Не указан'})
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="duplicate-clients__section">
            <h3 className="duplicate-clients__subtitle">
              Похожие имена ({duplicates.similar.length})
            </h3>
            <ul className="duplicate-clients__list">
              {duplicates.similar.map((group, index) => {
                const groupKey = `similar-${group.names}-${group.sport_category}-${index}`;
                return (
                  <li key={groupKey} className="duplicate-clients__item">
                    <button 
                      className="duplicate-clients__action"
                      onClick={() => handleSimilarClick(groupKey)}
                    >
                      {group.names} ({group.sport_category}): {group.clients.length} записей
                    </button>
                    {selectedSimilarGroup === groupKey && (
                      <ul className="duplicate-clients__sublist">
                        {group.clients.map(client => (
                          <li key={client.id} className="duplicate-clients__subitem">
                            {client.name} (Тренер: {client.trainer}, Тип: {client.typeClient}, Источник: {client.check_field || 'Не указан'})
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicateClients;