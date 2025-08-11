import React, { useState, useEffect } from 'react';
import { fetchClients } from '../../api/API';
import { months } from '../../Constants/constants';
import './ClientValidator.scss';

const ClientValidator = () => {
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Словарь для перевода названий полей на русский
  const fieldNames = {
    id: 'ИД',
    name: 'Имя',
    day: 'День',
    month: 'Месяц',
    year: 'Год',
    price: 'Цена',
    trainer: 'Тренер',
    sport_category: 'Категория спорта',
  };

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientsData = await fetchClients();
        const errorsList = [];
        clientsData.forEach(client => {
          const missing = [];
          if (!client.id) missing.push(fieldNames.id);
          if (!client.name) missing.push(fieldNames.name);
          if (!client.day) missing.push(fieldNames.day);
          if (!client.month || !months.includes(client.month)) missing.push(`${fieldNames.month} (некорректный: ${client.month || 'пустой'})`);
          if (!client.year) missing.push(fieldNames.year);
          if (!client.price || isNaN(parseFloat(client.price))) missing.push(`${fieldNames.price} (некорректная: ${client.price || 'пустая'})`);
          if (!client.trainer) missing.push(fieldNames.trainer);
          if (!client.sport_category) missing.push(fieldNames.sport_category);
          if (missing.length > 0) {
            errorsList.push({ name: client.name || 'Неизвестный', missing });
          }
        });
        setClients(clientsData);
        setErrors(errorsList);
        setError(null);
      } catch (err) {
        setError('Ошибка загрузки данных.');
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  return (
    <div className="client-validator">
      <h2 className="client-validator__title">Проверка данных клиентов</h2>
      {loading ? (
        <div className="client-validator__spinner" />
      ) : error ? (
        <p className="client-validator__error">{error}</p>
      ) : errors.length > 0 ? (
        <table className="client-validator__table">
          <thead>
            <tr>
              <th>Клиент</th>
              <th>Ошибки</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((err, idx) => (
              <tr key={idx}>
                <td>{err.name}</td>
                <td>{err.missing.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="client-validator__no-errors">Ошибок нет, все клиенты валидны.</p>
      )}
    </div>
  );
};

export default ClientValidator;