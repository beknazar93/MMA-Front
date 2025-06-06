import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients } from "../../api/API";
import FilterComponent from "./ClientFilter";

function ClientsTable() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    trainer: "",
    sport_category: "",
    day: "",
    month: "",
    year: "",
    payment: "",
  });

  const [selectedClient, setSelectedClient] = useState(null);

  const trainers = [
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
  ];

  const sports = [
    "Бокс",
    "Борьба",
    "Греко-римская борьба",
    "Дзюдо",
    "Кикбокс",
    "Кроссфит",
    "Кулату",
    "Самбо",
    "Тхэквондо",
  ];

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const years = useMemo(() => Array.from({ length: 1 }, (_, i) => 2025 - i), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await fetchClients();
      setClients(clientsData);
      setError(null);
    } catch (error) {
      setError("Ошибка загрузки данных клиентов.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    return clients
      .filter((client) => {
        return (
          (!filters.name || client.name.toLowerCase().includes(filters.name.toLowerCase())) &&
          (!filters.trainer || client.trainer === filters.trainer) &&
          (!filters.sport_category || client.sport_category === filters.sport_category) &&
          (!filters.day || client.day === filters.day) &&
          (!filters.month || client.month === filters.month) &&
          (!filters.year || client.year === filters.year) &&
          (!filters.payment || client.payment === filters.payment)
        );
      })
      .reverse();
  }, [clients, filters]);

  const getClientActivePeriods = useMemo(() => {
    if (!selectedClient) return { count: 0, periods: [] };
    
    const clientRecords = clients.filter(client => 
      client.name.toLowerCase() === selectedClient.name.toLowerCase()
    );
    const uniquePeriods = new Set(
      clientRecords
        .filter(client => client.month && client.year)
        .map(client => `${client.month} ${client.year}`)
    );
    
    return {
      count: uniquePeriods.size,
      periods: Array.from(uniquePeriods)
    };
  }, [selectedClient, clients]);

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

      {loading ? (
        <p className="client-list__loading-message">Загрузка клиентов...</p>
      ) : error ? (
        <p className="client-list__error-message">{error}</p>
      ) : (
        <div className="client-list__cards">
          {filteredClients.map((client) => (
            <div className="client-list__card" key={client.id}>
              <p
                className="client-list__card-name"
                onClick={() => setSelectedClient(client)}
              >
                {client.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedClient && (
        <div className="client-list__modal">
          <div className="client-list__modal-content">
            <button
              className="client-list__modal-close"
              onClick={() => setSelectedClient(null)}
            >
              ×
            </button>
            <h2 className="client-list__modal-title">Детали клиента</h2>
            <p className="client-list__modal-item">
              <strong>Имя:</strong> {selectedClient.name || "Не указано"}
            </p>
            <p className="client-list__modal-item">
              <strong>Телефон:</strong> {selectedClient.phone || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Спорт:</strong> {selectedClient.sport_category || "Не указано"}
            </p>
            <p className="client-list__modal-item">
              <strong>Тренер:</strong> {selectedClient.trainer || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Начинается:</strong> {selectedClient.email || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Источник:</strong> {selectedClient.check_field || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Пол:</strong> {selectedClient.stage || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Год:</strong> {selectedClient.year || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Месяц:</strong> {selectedClient.month || "Не указано"}
            </p>
            <p className="client-list__modal-item">
              <strong>День:</strong> {selectedClient.day || "Не указан"}
            </p>
            <p className="client-list__modal-item">
              <strong>Цена:</strong> {selectedClient.price ? `${selectedClient.price} сом` : "Не указана"}
            </p>
            <p className="client-list__modal-item">
              <strong>Скидка:</strong> {selectedClient.sale || "Не указана"}
            </p>
            <p className={`client-list__modal-item client-list__modal-payment-status client-list__modal-payment-status--${selectedClient.payment}`}>
              <strong>Статус оплаты:</strong> {selectedClient.payment || "Не указан"}
            </p>
            <p className="client-list__modal-item client-list__modal-item--active-periods">
              <strong>Активные месяцы:</strong>{" "}
              {getClientActivePeriods.count > 0 ? (
                <>
                  {getClientActivePeriods.count} мес.{" "}
                  <select defaultValue="">
                    <option value="" disabled>
                      Выберите период
                    </option>
                    {getClientActivePeriods.periods.map((period, index) => (
                      <option key={index} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                "Нет данных"
              )}
            </p>
            <p className="client-list__modal-item">
              <strong>Комментарий:</strong> {selectedClient.comment || "Нет комментария"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsTable;