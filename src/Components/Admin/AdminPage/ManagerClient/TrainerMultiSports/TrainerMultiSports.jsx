import React, { useState, useEffect, useMemo } from 'react';
import { fetchClients } from '../../api/API';
import { trainers as trainersConst } from '../../Constants/constants';
import { FaUserTie, FaChevronDown, FaChevronUp, FaDumbbell } from 'react-icons/fa';
import './TrainerMultiSports.scss';

const norm = (v) => (v ?? '').toString().trim().toLowerCase();

const TrainerMultiSports = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opened, setOpened] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchClients();
        if (!Array.isArray(data)) throw new Error('bad data');
        setClients(
          data.filter(c => c && c.trainer && c.sport_category) // только валидные
        );
        setError(null);
      } catch {
        setError('Ошибка загрузки данных.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const items = useMemo(() => {
    // тренер -> уникальные виды спорта (регистронезависимо)
    return trainersConst
      .map((t) => {
        const nT = norm(t);
        const uniq = new Map();
        clients.forEach((c) => {
          if (norm(c.trainer) === nT) {
            const key = norm(c.sport_category);
            if (key && !uniq.has(key)) uniq.set(key, c.sport_category);
          }
        });
        return { trainer: t, count: uniq.size, sports: [...uniq.values()] };
      })
      .filter((x) => x.count >= 2) // 2+ вида спорта
      .sort((a, b) => b.count - a.count || a.trainer.localeCompare(b.trainer));
  }, [clients]);

  const toggle = (t) => setOpened(prev => (prev === t ? null : t));

  return (
    <div className="trainer-multi-sports">
      <h2 className="trainer-multi-sports__title">Тренеры с 2+ видами спорта</h2>

      {loading ? (
        <div className="trainer-multi-sports__spinner" />
      ) : error ? (
        <p className="trainer-multi-sports__error">{error}</p>
      ) : items.length ? (
        <ul className="trainer-multi-sports__list">
          {items.map(({ trainer, count, sports }) => {
            const isOpen = opened === trainer;
            return (
              <li key={trainer} className="trainer-multi-sports__item">
                <button
                  type="button"
                  className={`trainer-multi-sports__row ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggle(trainer)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${trainer}`}
                >
                  <span className="trainer-multi-sports__row-left">
                    <FaUserTie className="trainer-multi-sports__icon" />
                    <span className="trainer-multi-sports__trainer">{trainer}</span>
                  </span>
                  <span className="trainer-multi-sports__row-right">
                    <span className="trainer-multi-sports__badge" title="Количество видов спорта">
                      {count}
                    </span>
                    {isOpen ? (
                      <FaChevronUp className="trainer-multi-sports__chev" />
                    ) : (
                      <FaChevronDown className="trainer-multi-sports__chev" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`panel-${trainer}`}
                    className="trainer-multi-sports__panel"
                    role="region"
                    aria-label={`Виды спорта тренера ${trainer}`}
                  >
                    <div className="trainer-multi-sports__tags">
                      {sports.map((s) => (
                        <span key={s} className="trainer-multi-sports__tag">
                          <FaDumbbell aria-hidden />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="trainer-multi-sports__no-data">Нет тренеров с несколькими видами спорта.</p>
      )}
    </div>
  );
};

export default TrainerMultiSports;
