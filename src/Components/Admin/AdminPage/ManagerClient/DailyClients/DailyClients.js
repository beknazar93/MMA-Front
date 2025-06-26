import React, { useState, useEffect, useCallback } from 'react';
import { fetchClients, updateClient } from '../../api/API';
import { errorMessages } from '../../Constants/constants';
import './DailyClients.scss';

const DailyClients = () => {
  const [clients, setClients] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(errorMessages.loadingError);
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
      client.name?.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredClients(matches);
  }, [searchName, clients]);

  const handleExtendPayment = async (client) => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert(errorMessages.invalidAmount);
      return;
    }
    try {
      const updatedPrice = (parseFloat(client.price || 0) + parseFloat(paymentAmount)).toFixed(2);
      const updatedData = { ...client, price: updatedPrice };
      await updateClient(client.id, updatedData);
      alert(`Оплата клиента ${client.name} увеличена на ${paymentAmount} сом!`);
      setPaymentAmount("");
      loadClients();
    } catch (error) {
      alert(errorMessages.renewalError);
    }
  };

  return (
    <div className="daily-clients">
      <input
        type="text"
        placeholder="Имя клиента"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        className="daily-clients__input"
        aria-label="Поиск по имени клиента"
      />
      <input
        type="number"
        placeholder="Сумма (сом)"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        className="daily-clients__input"
        aria-label="Сумма оплаты"
      />
      {loading ? (
        <div className="daily-clients__spinner" />
      ) : error ? (
        <p className="daily-clients__error">{error}</p>
      ) : filteredClients.length === 0 && searchName ? (
        <p className="daily-clients__no-data">{errorMessages.clientNotFound}</p>
      ) : filteredClients.length > 0 ? (
        <div className="daily-clients__table-container">
          <table className="daily-clients__table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Дата</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr
                  key={client.id}
                  className={client.payment === "Неоплачено" ? "daily-clients__row--unpaid" : ""}
                >
                  <td>{client.name || "-"}</td>
                  <td>{`${client.day || "-"} ${client.month || "-"} ${client.year || "-"}`}</td>
                  <td>
                    <span className="daily-clients__price">{client.price || 0} сом</span>
                    <button
                      onClick={() => handleExtendPayment(client)}
                      className="daily-clients__button"
                      disabled={!paymentAmount || paymentAmount <= 0}
                    >
                      + {paymentAmount || 0} сом
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default DailyClients;