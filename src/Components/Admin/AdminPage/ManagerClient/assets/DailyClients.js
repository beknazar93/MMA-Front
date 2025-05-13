import React, { useState, useEffect, useCallback } from "react";
import { fetchClients, updateClient } from "../../api/API";

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
      const updatedPrice = (parseFloat(client.price) || 0) + parseFloat(paymentAmount);
      const updatedData = { ...client, price: updatedPrice };
      await updateClient(client.id, updatedData);
      alert(`Оплата клиента ${client.name} увеличена на ${paymentAmount} сом!`);
      loadClients(); 
    } catch (error) {
      alert("Ошибка при продлении оплаты.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Продление оплаты клиента</h1>


      <input
        type="text"
        placeholder="Введите имя клиента"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        style={styles.input}
      />


      <input
        type="number"
        placeholder="Сумма (сом)"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        style={styles.input}
      />


      {filteredClients.length > 0 ? (
        <div style={styles.clientGrid}>
          {filteredClients.map((client) => (
            <div key={client.id} style={styles.clientCard}>
              <p style={styles.clientName}><strong>{client.name}</strong></p>
              <p style={styles.clientDate}>
                Дата: <strong>{client.day} {client.month} {client.year}</strong>
              </p>
              <p style={styles.clientPayment}>
                Текущая сумма: <strong>{client.price || 0} сом</strong>
              </p>
              <button onClick={() => handleExtendPayment(client)} style={styles.extendButton}>
                + {paymentAmount} сом
              </button>
            </div>
          ))}
        </div>
      ) : (
        searchName && <p style={styles.notFound}>Клиент не найден</p>
      )}

      {loading && <p style={styles.loadingText}>Загрузка...</p>}
      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
};


const styles = {
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#1e1e2f",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#e0e0e0",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #4a90e2",
    backgroundColor: "#1e1e2f",
    color: "#e0e0e0",
    outline: "none",
    width: "90%",
    textAlign: "center",
    marginBottom: "10px",
  },
  clientGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    maxHeight: "400px",
    overflowY: "auto",
    padding: "10px",
  },
  clientCard: {
    backgroundColor: "#252525",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    color: "#e0e0e0",
    textAlign: "center",
  },
  clientName: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  clientDate: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "5px",
  },
  clientPayment: {
    fontSize: "16px",
    color: "#00C49F",
  },
  extendButton: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#ff7300",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s",
  },
  notFound: {
    fontSize: "16px",
    color: "#ff4500",
    marginTop: "10px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#888",
  },
  errorText: {
    fontSize: "16px",
    color: "red",
  },
};

export default DailyClients;