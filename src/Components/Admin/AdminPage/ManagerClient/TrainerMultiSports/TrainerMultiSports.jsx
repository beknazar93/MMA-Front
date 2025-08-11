import React, { useState, useEffect, useMemo } from 'react';
import { fetchClients } from '../../api/API';
import { trainers } from '../../Constants/constants';
import './TrainerMultiSports.scss';

const TrainerMultiSports = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientsData = await fetchClients();
        setClients(clientsData);
        setError(null);
      } catch (err) {
        setError("Ошибка загрузки данных.");
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const multiSportsTrainers = useMemo(() => {
    return trainers
      .map(trainer => {
        const sportsSet = new Set(clients.filter(client => client.trainer === trainer).map(client => client.sport_category));
        return { trainer, count: sportsSet.size, sports: Array.from(sportsSet) };
      })
      .filter(trainer => trainer.count >= 2);
  }, [clients]);

  const handleTrainerClick = (trainer) => {
    setSelectedTrainer(selectedTrainer === trainer ? null : trainer);
  };

  return (
    <div className="trainer-multi-sports">
      <h2 className="trainer-multi-sports__title">Тренеры с 2+ видами спорта</h2>
      {loading ? (
        <div className="trainer-multi-sports__spinner" />
      ) : error ? (
        <p className="trainer-multi-sports__error">{error}</p>
      ) : multiSportsTrainers.length > 0 ? (
        <ul className="trainer-multi-sports__list">
          {multiSportsTrainers.map(({ trainer, count, sports }) => (
            <li key={trainer} className="trainer-multi-sports__item">
              <button 
                className="trainer-multi-sports__action"
                onClick={() => handleTrainerClick(trainer)}
              >
                {trainer}: {count} видов спорта
              </button>
              {selectedTrainer === trainer && (
                <ul className="trainer-multi-sports__sublist">
                  {sports.map(sport => (
                    <li key={sport} className="trainer-multi-sports__subitem">
                      {sport}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="trainer-multi-sports__no-data">Нет тренеров с несколькими видами спорта.</p>
      )}
    </div>
  );
};

export default TrainerMultiSports;