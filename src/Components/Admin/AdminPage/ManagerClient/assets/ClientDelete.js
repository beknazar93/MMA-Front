import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchClients, deleteClient } from '../../api/API';
import FilterComponent from './ClientFilter';

function ClientDelete() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    trainer: '',
    sport_category: '',
    day: '',
    month: '',
    year: '',
    payment: '',
  });

  const trainers = useMemo(() => [
      "Абдыкадыров Султан",
      "Азизбек Уулу Баяман",
      "Асанбаев Эрлан",
      "Жумалы Уулу Ариет",
      "Калмамат Уулу Акай",
      "Лукас Крабб",
      "Машрапов Жумабай",
      "Машрапов Тилек",
      "Медербек Уулу Сафармурат",
      "Минбаев Сулайман",
      "Мойдунов Мирлан",
      "Пазылов Кутман",
      "Тажибаев Азамат",
      "Тургунов Ислам",
  ], []);

  const sports = useMemo(() => [
    "Бокс", "Борьба", "Греко-римская борьба", "Дзюдо", "Кикбокс",
    "Кроссфит", "Кулату", "Самбо", "Тхэквондо"
  ], []);

  const months = useMemo(() => [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ], []);

  const years = useMemo(() => Array.from({ length: 1 }, (_, i) => 2025 - i), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const clientsData = await fetchClients();
      setClients(clientsData);
      setError(null);
    } catch (error) {
      console.error("Ошибка загрузки клиентов:", error);
      setError("Ошибка при загрузке данных клиентов.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    return clients
      .filter(client => (
        (!filters.name || client.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.trainer || client.trainer === filters.trainer) &&
        (!filters.sport_category || client.sport_category === filters.sport_category) &&
        (!filters.day || client.day === filters.day) &&
        (!filters.month || client.month === filters.month) &&
        (!filters.year || client.year === filters.year) &&
        (!filters.payment || client.payment === filters.payment)
      ))
      .slice()
      .reverse();
  }, [clients, filters]);

  const handleDelete = async (id) => {
    if (deletingClientId) return;
    setDeletingClientId(id);

    const confirmDelete = window.confirm("Вы уверены, что хотите удалить этого клиента?");
    if (!confirmDelete) {
      setDeletingClientId(null);
      return;
    }

    try {
      await deleteClient(id);
      setClients(prevClients => prevClients.filter(client => client.id !== id));
      alert("Клиент успешно удалён!");
    } catch (error) {
      console.error("Ошибка при удалении клиента:", error);
      alert("Ошибка при удалении клиента. Попробуйте снова.");
    } finally {
      setDeletingClientId(null);
    }
  };

  return (
    <div className="client-list">
      <FilterComponent
        filters={filters}
        setFilters={setFilters}
        trainers={trainers}
        sports={sports}
        months={months}
        years={years}
        days={days}
      />

      <div className="client-list__cards">
        {loading ? (
          <p className="client-list__loading-message">Загрузка...</p>
        ) : error ? (
          <p className="client-list__error-message">{error}</p>
        ) : !Array.isArray(clients) || clients.length === 0 ? (
          <p className="client-list__no-data-message">Нет клиентов для отображения.</p>
        ) : (
          filteredClients.map(client => (
            <div className="client-list__card" key={client.id}>
              <p className="client-list__card-name">{client.name}</p>
              <button
                className="client-list__card-button"
                onClick={() => handleDelete(client.id)}
                disabled={deletingClientId === client.id}
              >
                {deletingClientId === client.id ? "Удаление..." : "Удалить"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClientDelete;