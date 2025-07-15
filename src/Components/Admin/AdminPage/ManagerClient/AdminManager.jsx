import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddClient from "./AddClient/AddClient";
import ClientsTable from "./ClientTable/ClientsTable";
import DailyClients from "./DailyClients/DailyClients";
import ClientStatus from "./ClientStatus/ClientStatus";
import { FaSignOutAlt } from "react-icons/fa";
import './AdminManager.scss';

const AdminManager = () => {
  const [activeSection, setActiveSection] = useState("clients");
  const navigate = useNavigate();
  const managerName = localStorage.getItem("manager_name") || "Unknown Manager";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  const sections = {
    clients: <ClientsTable />,
    other: <AddClient />,
    dayclients: <DailyClients />,
    status: <ClientStatus />,
  };

  return (
    <div className="admin-manager">
      <div className="admin-manager__header">
        <span className="admin-manager__manager-name">{managerName}</span>
        <button className="admin-manager__logout-btn" onClick={handleLogout} aria-label="Выйти">
          <FaSignOutAlt />
        </button>
      </div>
      <div className="admin-manager__nav">
        <button
          className={`admin-manager__nav-item ${activeSection === "clients" ? "active" : ""}`}
          onClick={() => setActiveSection("clients")}
        >
          Список
        </button>
        <button
          className={`admin-manager__nav-item ${activeSection === "other" ? "active" : ""}`}
          onClick={() => setActiveSection("other")}
        >
          Добавление
        </button>
        <button
          className={`admin-manager__nav-item ${activeSection === "dayclients" ? "active" : ""}`}
          onClick={() => setActiveSection("dayclients")}
        >
          Разовый
        </button>
        {/* <button
          className={`admin-manager__nav-item ${activeSection === "status" ? "active" : ""}`}
          onClick={() => setActiveSection("status")}
        >
          Статус
        </button> */}
      </div>
            {sections[activeSection]}
    </div>
  );
};

export default AdminManager;