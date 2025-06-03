import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients } from "../../api/API";

function ClientStatus() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("new");
  const [selectedClient, setSelectedClient] = useState(null);

  const currentMonth = "Май";
  const currentYear = "2025";
  const previousMonth = "Апрель";

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await fetchClients();
      setClients(clientsData);
      setError(null);
    } catch (error) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const newClients = useMemo(() => {
    const currentClients = clients.filter(
      (c) => c.month === currentMonth && c.year === currentYear
    );

    const currentClientSet = new Set(
      currentClients.map((c) => `${c.name.toLowerCase()}|${c.sport_category}`)
    );

    return currentClients.filter((client) => {
      const clientKey = `${client.name.toLowerCase()}|${client.sport_category}`;
      const hasPreviousRecords = clients.some(
        (c) =>
          c.name.toLowerCase() === client.name.toLowerCase() &&
          c.sport_category === client.sport_category &&
          (c.year < currentYear || (c.year === currentYear && c.month !== currentMonth))
      );
      return !hasPreviousRecords && currentClientSet.has(clientKey);
    });
  }, [clients, currentMonth, currentYear]);

  const notAddedClients = useMemo(() => {
    const previousClients = clients.filter(
      (c) => c.month === previousMonth && c.year === currentYear
    );

    const previousClientSet = new Set(
      previousClients.map((c) => `${c.name.toLowerCase()}|${c.sport_category}`)
    );

    return previousClients.filter((client) => {
      const clientKey = `${client.name.toLowerCase()}|${client.sport_category}`;
      const hasCurrentRecord = clients.some(
        (c) =>
          c.name.toLowerCase() === client.name.toLowerCase() &&
          c.sport_category === client.sport_category &&
          c.month === currentMonth &&
          c.year === currentYear
      );
      return !hasCurrentRecord && previousClientSet.has(clientKey);
    });
  }, [clients, currentMonth, previousMonth, currentYear]);

  const getClientActivePeriods = useMemo(() => {
    if (!selectedClient) return { count: 0, periods: [] };

    const clientRecords = clients.filter(
      (c) =>
        c.name.toLowerCase() === selectedClient.name.toLowerCase() &&
        c.sport_category === selectedClient.sport_category
    );
    const uniquePeriods = new Set(
      clientRecords
        .filter((client) => client.month && client.year)
        .map((client) => `${client.month} ${client.year}`)
    );

    return {
      count: uniquePeriods.size,
      periods: Array.from(uniquePeriods),
    };
  }, [selectedClient, clients]);

  const displayedClients = viewMode === "new" ? newClients : notAddedClients;

  return (
    <div className="client-list">
      <div className="client-list__buttons">
        <button
          className={`client-list__button ${viewMode === "new" ? "active" : ""}`}
          onClick={() => setViewMode("new")}
        >
          Новые
          {viewMode === "new" && (
            <span className="client-list__counter">{newClients.length}</span>
          )}
        </button>
        <button
          className={`client-list__button ${viewMode === "not_added" ? "active" : ""}`}
          onClick={() => setViewMode("not_added")}
        >
          Не добавленные
        </button>
      </div>

      {loading ? (
        <p className="client-list__loading-message">Загрузка...</p>
      ) : error ? (
        <p className="client-list__error-message">{error}</p>
      ) : displayedClients.length === 0 ? (
        <p className="client-list__no-data-message">
          {viewMode === "new" ? "Нет новых клиентов" : "Нет не добавленных клиентов"}
        </p>
      ) : (
        <div className="client-list__cards">
          {displayedClients.map((client) => (
            <div className="client-list__card" key={`${client.id}-${client.sport_category}`}>
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

export default ClientStatus;