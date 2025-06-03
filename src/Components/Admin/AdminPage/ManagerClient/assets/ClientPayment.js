import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchClients, addClient } from '../../api/API';
import ClientFilter from './ClientFilter';

function ClientPayment() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingClientId, setRenewingClientId] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    trainer: '',
    sport_category: '',
    day: '',
    month: '',
    year: '',
    payment: '',
  });

  const months = useMemo(() => [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ], []);

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

  const years = useMemo(() => ["2025"], []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);
  const renewalOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString()), []);

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
        (!filters.year || client.year === filters.year) &&
        (!filters.payment || client.payment === filters.payment)
      ))
      .slice()
      .reverse();
  }, [clients, filters]);

  const generateRenewalPeriods = (currentMonth, currentYear, monthsToAdd) => {
    const periods = [];
    const currentMonthIndex = months.indexOf(currentMonth);
    const currentYearNum = parseInt(currentYear);

    for (let i = 1; i <= monthsToAdd; i++) {
      const totalMonths = currentMonthIndex + i;
      const newMonthIndex = totalMonths % 12;
      const yearsToAdd = Math.floor(totalMonths / 12);
      const newMonth = months[newMonthIndex];
      const newYear = (currentYearNum + yearsToAdd).toString();
      periods.push({ month: newMonth, year: newYear });
    }

    return periods;
  };

  const handleRenewalClick = (client) => {
    setCurrentClient(client);
    setSelectedMonths(1);
    setShowModal(true);
  };

  const handleRenewal = async () => {
    if (renewingClientId || !currentClient) return;
    setRenewingClientId(currentClient.id);
    setShowModal(false);

    const periods = generateRenewalPeriods(
      currentClient.month,
      currentClient.year,
      parseInt(selectedMonths)
    );

    const lastPeriod = periods[periods.length - 1];
    const confirm = window.confirm(
      `Вы уверены, что хотите продлить оплату для ${currentClient.name} на ${selectedMonths} мес. (до ${lastPeriod.month} ${lastPeriod.year})?`
    );
    if (!confirm) {
      setRenewingClientId(null);
      return;
    }

    try {
      const newClients = [];
      for (const period of periods) {
        const updatedClient = {
          ...currentClient,
          month: period.month,
          year: period.year,
        };
        await addClient(updatedClient);
        newClients.push(updatedClient);
      }

      setClients(prevClients => [...prevClients, ...newClients]);
      alert(`Оплата продлена для ${currentClient.name} на ${selectedMonths} мес. (до ${lastPeriod.month} ${lastPeriod.year})`);
    } catch (error) {
      console.error("Ошибка при продлении оплаты:", error.response?.data || error.message);
      alert("Ошибка при продлении оплаты: " + (error.response?.data?.message || error.message));
    } finally {
      setRenewingClientId(null);
      setCurrentClient(null);
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
          <p className="client-list__loading-message">Загрузка...</p>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="client-list__card">
              <p
                className="client-list__card-name"
                onClick={() => handleRenewalClick(client)}
              >
                {client.name}
              </p>
              <p className="client-list__card-date">{client.day} {client.month} {client.year}</p>
            </div>
          ))
        )}
      </div>

      {showModal && currentClient && (
        <div className="client-list__modal">
          <div className="client-list__modal-content">
            <button
              className="client-list__modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="client-list__modal-title">Продление оплаты для {currentClient.name}</h2>
            <p className="client-list__modal-item">
              <strong>Имя:</strong> {currentClient.name}
            </p>
            <p className="client-list__modal-item">
              <strong>Начинается:</strong> {currentClient.email || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Источник:</strong> {currentClient.check_field || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Выберите количество месяцев:</strong>
              <select
                className="client-list__modal-select"
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(e.target.value)}
              >
                {renewalOptions.map((month) => (
                  <option key={month} value={month}>
                    {month} мес.
                  </option>
                ))}
              </select>
            </p>
            <button
              className="client-list__modal-button"
              onClick={handleRenewal}
              disabled={renewingClientId}
            >
              Подтвердить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPayment;