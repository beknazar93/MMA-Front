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
  });

  const [selectedClient, setSelectedClient] = useState(null);

  const trainers = [
    "Азизбек Уулу Баяман", "Анарбаев Акжол", "Асанбаев Эрлан",
    "Жумалы Уулу Ариет", "Калмамат Уулу Акай", "Лукас Крабб",
    "Маматжанов Марлен", "Машрапов Жумабай", "Машрапов Тилек",
    "Медербек Уулу Сафармурат", "Минбаев Сулайман", "Мойдунов Мирлан",
    "Пазылов Кутман", "Тажибаев Азамат", "Тургунов Ислам"
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
          (!filters.year || client.year === filters.year)
        );
      })
      .reverse();
  }, [clients, filters]);

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
        <p className="loading-message">Загрузка клиентов...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="client-list__cards">
          {filteredClients.map((client) => (
            <div className="client-card" key={client.id}>
              <p className="client-card__name">{client.name}</p>
              <button className="client-card__details-button" onClick={() => setSelectedClient(client)}>
                Подробнее
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedClient && (
        <div className="client-modal">
          <div className="client-modal__content">
            <button className="client-modal__close" onClick={() => setSelectedClient(null)}>
              &times;
            </button>
            <h2 className="client-modal__title">Детали клиента</h2>
            <p className="client-modal__item">
              <strong>Имя:</strong> {selectedClient.name}
            </p>
            <p className="client-modal__item">
              <strong>Email:</strong> {selectedClient.email || "Не указан"}
            </p>
            <p className="client-modal__item">
              <strong>Телефон:</strong> {selectedClient.phone || "Не указан"}
            </p>
            <p className="client-modal__item">
              <strong>Этап:</strong> {selectedClient.stage || "Не указан"}
            </p>
            <p className="client-modal__item">
              <strong>Тренер:</strong> {selectedClient.trainer || "Не указан"}
            </p>
            <p className="client-modal__item">
              <strong>Категория спорта:</strong> {selectedClient.sport_category || "Не указано"}
            </p>
            <p className="client-modal__item">
              <strong>Месяц:</strong> {selectedClient.month || "Не указан"}
            </p>
            <p className="client-modal__item">
              <strong>Год:</strong> {selectedClient.year || "Не указан"}
            </p>
            <p className="client-modal__item">
              <strong>День:</strong> {selectedClient.day || "Не указан"}
            </p>
            <p className="client-modal__item">
              <strong>Комментарий:</strong> {selectedClient.comment || "Нет комментария"}
            </p>
            <p className={`client-modal__item client-modal__payment-status ${selectedClient.payment}`}>
              <strong>Статус оплаты:</strong> {selectedClient.payment}
            </p>
            <p className="client-modal__item">
              <strong>Цена:</strong> {selectedClient.price ? `${selectedClient.price} сом` : "Не указана"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsTable;