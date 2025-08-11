import React, { useState, useEffect } from 'react';
import { fetchClients } from '../../api/API';
import { months, years } from '../../Constants/constants';
import { FaCalendarAlt } from 'react-icons/fa';
import './ClientValidator.scss';

const SelectField = ({ name, value, onChange, options, placeholder, icon }) => (
  <div className="client-validator__select-group">
    {icon}
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="client-validator__select"
      aria-label={placeholder}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const ClientValidator = () => {
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ year: '', month: '' });

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
    payment: 'Оплата',
    typeClient: 'Тип клиента',
    check_field: 'Источник'
  };

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientsData = await fetchClients();
        const errorsList = [];
        clientsData.forEach(client => {
          // Фильтрация по году и месяцу
          if (filters.year && client.year !== filters.year) return;
          if (filters.month && client.month !== filters.month) return;

          const missing = [];
          if (!client.id) missing.push(fieldNames.id);
          if (!client.name) missing.push(fieldNames.name);
          if (!client.day) missing.push(fieldNames.day);
          if (!client.month || !months.includes(client.month)) missing.push(`${fieldNames.month} (некорректный: ${client.month || 'пустой'})`);
          if (!client.year) missing.push(fieldNames.year);
          if (!client.price || isNaN(parseFloat(client.price))) missing.push(`${fieldNames.price} (некорректная: ${client.price || 'пустая'})`);
          if (!client.trainer) missing.push(fieldNames.trainer);
          if (!client.sport_category) missing.push(fieldNames.sport_category);
          if (!client.payment) missing.push(fieldNames.payment);
          if (!client.typeClient) missing.push(fieldNames.typeClient);
          if (!client.check_field) missing.push(fieldNames.check_field);
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
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="client-validator">
      <h2 className="client-validator__title">Проверка данных клиентов</h2>
      <div className="client-validator__filters">
        <SelectField
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
          options={years}
          placeholder="Год"
          icon={<FaCalendarAlt size={14} />}
        />
        <SelectField
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
          options={months}
          placeholder="Месяц"
          icon={<FaCalendarAlt size={14} />}
        />
      </div>
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
        <p className="client-validator__no-errors">Ошибок нет, все клиенты заполнены.</p>
      )}
    </div>
  );
};

export default ClientValidator;