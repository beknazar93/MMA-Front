import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ClientsTable from "./ClientTable/ClientsTable";
import AddClient from "./AddClient/AddClient";
import DailyClients from "./DailyClients/DailyClients";
import DuplicateClients from "./DuplicateClients/DuplicateClients";
import ClientStatus from "./ClientStatus/ClientStatus";
import ClientValidator from "./ClientValidator/ClientValidator";
import TrainerMultiSports from "./TrainerMultiSports/TrainerMultiSports";

import { FaSignOutAlt } from "react-icons/fa";
import "./AdminManager.scss";

const AdminManager = () => {
  const [activeSection, setActiveSection] = useState("clients");
  const navigate = useNavigate();

  const managerName = localStorage.getItem("manager_name") || "Unknown Manager";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  const sections = useMemo(
    () => ({
      clients: <ClientsTable />,
      other: <AddClient />,
      dayclients: <DailyClients />,
      status: <ClientStatus />,
      duplicate: <DuplicateClients />,
      validator: <ClientValidator />,
      trainer: <TrainerMultiSports />,
    }),
    []
  );

  const navItems = useMemo(
    () => [
      { key: "clients", label: "Список" },
      { key: "other", label: "Добавление" },
      { key: "dayclients", label: "Разовый" },
      { key: "status", label: "Потерянные" },
      { key: "duplicate", label: "Дубликаты" },
      { key: "validator", label: "Валидация" },
      { key: "trainer", label: "Тренеры" },
    ],
    []
  );

  return (
    <div className="admin-manager">
      <div className="admin-manager__header">
        <span className="admin-manager__manager-name">{managerName}</span>
        <button
          className="admin-manager__logout-btn"
          onClick={handleLogout}
          aria-label="Выйти"
        >
          <FaSignOutAlt />
        </button>
      </div>

      <div className="admin-manager__nav">
        {navItems.map(({ key, label }) => (
          <button
            key={key}
            className={`admin-manager__nav-item ${
              activeSection === key ? "active" : ""
            }`}
            onClick={() => setActiveSection(key)}
            aria-pressed={activeSection === key}
          >
            {label}
          </button>
        ))}
      </div>

      {sections[activeSection]}
    </div>
  );
};

export default AdminManager;
