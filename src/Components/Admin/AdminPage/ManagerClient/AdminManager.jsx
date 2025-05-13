import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddClient from "./assets/AddClient";
import ClientsTable from "./assets/ClientsTable";
import ClientDelete from "./assets/ClientDelete";
import ClientUpdate from "./assets/ClientUpdate";
import ClientPayment from "./assets/ClientPayment";
import ExpiringClients from "./assets/ExpiringClients";
import DailyClients from "./assets/DailyClients";

const AdminManager = () => {
  const [activeSection, setActiveSection] = useState("clients");
  const navigate = useNavigate();

  const getManagerName = () =>
    localStorage.getItem("manager_name") || "Unknown Manager";
  const managerName = getManagerName();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  const sections = {
    clients: <ClientsTable />,
    other: <AddClient />,
    update: <ClientUpdate />,
    payment: <ClientPayment />,
    dayclients: <DailyClients />,
    delete: <ClientDelete />,
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <span className="manager-name">{`Пользователь: ${managerName}`}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
      <div className="top-nav">
        <div
          className={`nav-item ${activeSection === "clients" ? "active" : ""}`}
          onClick={() => setActiveSection("clients")}
        >
          Список
        </div>
        <div
          className={`nav-item ${activeSection === "other" ? "active" : ""}`}
          onClick={() => setActiveSection("other")}
        >
          Добавление
        </div>
        <div
          className={`nav-item ${activeSection === "update" ? "active" : ""}`}
          onClick={() => setActiveSection("update")}
        >
          Изменение
        </div>
        <div
          className={`nav-item ${activeSection === "payment" ? "active" : ""}`}
          onClick={() => setActiveSection("payment")}
        >
          Переход
        </div>
        <div
          className={`nav-item ${
            activeSection === "dayclients" ? "active" : ""
          }`}
          onClick={() => setActiveSection("dayclients")}
        >
          Продление
        </div>
        <div
          className={`nav-item ${activeSection === "delete" ? "active" : ""}`}
          onClick={() => setActiveSection("delete")}
        >
          Удаление
        </div>
      </div>
      <div className="main-content">{sections[activeSection]}</div>
    </div>
  );
};

export default AdminManager;
