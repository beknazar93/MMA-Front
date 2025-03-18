import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchClients, addClient } from '../../api/API';
import ClientFilter from './ClientFilter';

function ClientPayment() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingClientId, setRenewingClientId] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    trainer: '',
    sport_category: '',
    day: '',
    month: '',
    year: ''
  });

  const months = useMemo(() => [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ], []);

  const trainers = useMemo(() => [
    "Азизбек Уулу Баяман", "Анарбаев Акжол", "Асанбаев Эрлан",
    "Жумалы Уулу Ариет", "Калмамат Уулу Акай", "Лукас Крабб",
    "Маматжанов Марлен", "Машрапов Жумабай", "Машрапов Тилек",
    "Медербек Уулу Сафармурат", "Минбаев Сулайман", "Мойдунов Мирлан",
    "Пазылов Кутман", "Тажибаев Азамат", "Тургунов Ислам"
  ], []);

  const sports = useMemo(() => [
    "Бокс", "Борьба", "Греко-римская борьба", "Дзюдо", "Кикбокс",
    "Кроссфит", "Кулату", "Самбо", "Тхэквондо"
  ], []);

  const years = useMemo(() => ["2025"], []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error("Ошибка загрузки клиентов:", error);
      alert("Ошибка загрузки данных. Попробуйте позже.");
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
        (!filters.year || client.year === filters.year)
      ))
      .slice()
      .reverse();
  }, [clients, filters]);

  const handleRenewal = async (client) => {
    if (renewingClientId) return;
    setRenewingClientId(client.id);

    const nextMonthIndex = months.indexOf(client.month) + 1;
    const nextMonth = nextMonthIndex === 12 ? months[0] : months[nextMonthIndex];
    const updatedYear = nextMonth === "Январь" ? client.year + 1 : client.year;

    const updatedClient = {
      ...client,
      month: nextMonth,
      year: updatedYear,
    };

    const confirm = window.confirm(`Вы уверены, что хотите продлить оплату для ${client.name} на месяц ${nextMonth} ${updatedYear}?`);
    if (!confirm) {
      setRenewingClientId(null);
      return;
    }

    try {
      await addClient(updatedClient);
      setClients(prevClients =>
        prevClients.map(c => (c.id === client.id ? updatedClient : c))
      );
      alert(`Оплата продлена для ${client.name} на ${nextMonth} ${updatedYear}`);
    } catch (error) {
      console.error("Ошибка при продлении оплаты:", error);
      alert("Ошибка при продлении оплаты. Попробуйте снова.");
    } finally {
      setRenewingClientId(null);
    }
  };

  return (
    <div className='client-list'>
      <ClientFilter
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
          <p className="client-list__loading">Загрузка клиентов...</p>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="client-card">
              <p className="client-card__name">{client.name}</p>
              <p className="client-card__date">{client.day} {client.month} {client.year}</p>
              <button
                className="client-card__details-button"
                onClick={() => handleRenewal(client)}
                disabled={renewingClientId === client.id}
              >
                {renewingClientId === client.id ? "Продление..." : "Продлить оплату"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClientPayment;
