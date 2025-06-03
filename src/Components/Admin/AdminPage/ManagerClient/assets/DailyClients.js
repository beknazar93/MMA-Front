import React, { useState, useEffect, useCallback } from 'react';
import { fetchClients, updateClient } from '../../api/API';

const DailyClients = () => {
  const [clients, setClients] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(200);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!searchName.trim()) {
      setFilteredClients([]);
      return;
    }

    const matches = clients.filter(client =>
      client.name.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredClients(matches);
  }, [searchName, clients]);

  const handleExtendPayment = async (client) => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Введите корректную сумму!");
      return;
    }

    try {
      const updatedPrice = parseFloat(client.price || 0) + parseFloat(paymentAmount);
      const updatedData = { ...client, price: updatedPrice };
      await updateClient(client.id, updatedData);
      alert(`Оплата клиента ${client.name} увеличена на ${paymentAmount} сом!`);
      loadClients();
    } catch (error) {
      alert("Ошибка при продлении оплаты.");
    }
  };

  return (
    <div className="daily-clients">
      <h1 className="daily-clients__title">Продление оплаты клиента</h1>

      <input
        type="text"
        placeholder="Введите имя клиента"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        className="daily-clients__input"
      />

      <input
        type="number"
        placeholder="Сумма (сом)"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        className="daily-clients__input"
      />

      {filteredClients.length > 0 ? (
        <div className="daily-clients__container">
          {filteredClients.map(client => (
            <div key={client.id} className="daily-clients__card">
              <p className="daily-clients__card-name">{client.name}</p>
              <p className="daily-clients__card-date">{client.day} {client.month} {client.year}</p>
              <p className="daily-clients__card-payment">Текущая сумма: <span>{client.price || 0} сом</span></p>
              <button
                onClick={() => handleExtendPayment(client)}
                className="daily-clients__card-button"
              >
                + {paymentAmount} сом
              </button>
            </div>
          ))}
        </div>
      ) : (
        searchName && <p className="daily-clients__not-found">Клиент не найден</p>
      )}

      {loading && <p className="daily-clients__loading-message">Загрузка...</p>}
      {error && <p className="daily-clients__error-message">{error}</p>}
    </div>
  );
};

export default DailyClients;