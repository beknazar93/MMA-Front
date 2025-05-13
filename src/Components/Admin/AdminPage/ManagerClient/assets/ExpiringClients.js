import React, { useState, useEffect } from "react";
import { fetchClients } from "../../api/API";

function ExpiringClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  const getClientDates = (client) => {
    const today = new Date();
    const clientDay = parseInt(client.day, 10) || 1;
    const clientMonthIndex = months.indexOf(client.month);
    const clientYear = parseInt(client.year, 10) || today.getFullYear();
    const startDate = new Date(clientYear, clientMonthIndex === -1 ? today.getMonth() : clientMonthIndex, clientDay);
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    return { startDate, expiryDate };
  };


  const getExpiringClients = (clients) => {
    const today = new Date();
    return clients.filter((client) => {
      const { expiryDate } = getClientDates(client);
      const timeDiff = expiryDate - today;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysDiff > 0 && daysDiff <= 5;
    });
  };


  const loadClients = async () => {
    try {
      const data = await fetchClients();
      const expiring = getExpiringClients(data);
      setClients(expiring);
      setLoading(false);
    } catch (err) {
      setError("Не удалось загрузить данные клиентов.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients(); 
    const interval = setInterval(loadClients, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Загрузка данных...</div>;
  if (error) return <div>{error}</div>;
  if (clients.length === 0) return <div>Нет клиентов с истекающим сроком в ближайшие 5 дней.</div>;

  return (
    <div className="expiring-clients">
      <h2>Клиенты с истекающим сроком (осталось 5 дней или меньше)</h2>
      <table className="expiring-clients__table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Тренер</th>
            <th>Вид спорта</th>
            <th>Дата начала</th>
            <th>Дата окончания</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const { expiryDate } = getClientDates(client);
            return (
              <tr key={client.id}>
                <td data-label="Имя">{client.name}</td>
                <td data-label="Телефон">{client.phone}</td>
                <td data-label="Тренер">{client.trainer}</td>
                <td data-label="Вид спорта">{client.sport_category}</td>
                <td data-label="Дата начала">{`${client.day || "1"}.${client.month || "Не указан"}.${client.year || "Не указан"}`}</td>
                <td data-label="Дата окончания">{`${expiryDate.getDate()}.${months[expiryDate.getMonth()]}.${expiryDate.getFullYear()}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ExpiringClients;
