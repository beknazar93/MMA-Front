import React, { useEffect, useMemo, useState } from "react";
import AdminManager from "./ManagerClient/AdminManager";
import ProductTabs from "./Product/ProductTabs/ProductTabs";
import Analitic from "./Analitic/Analitic";
import Register from "../Auth/Register";
import Notes from "./Notes/Notes";
import Users from "./Users/Users";
import {
  FaUsers,
  FaBoxOpen,
  FaStickyNote,
  FaChartLine,
  FaUserCog,
  FaUserPlus,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import Logo from "../../logo.png";
import "./AdminPanel.scss";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("ClientManager");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const userRole = localStorage.getItem("role") || "client_manager";

  const toggleSidebar = () => setIsSidebarCollapsed((v) => !v);

  const allTabs = useMemo(
    () => [
      { name: "ClientManager", icon: <FaUsers />, label: "Клиенты", roles: ["admin", "client_manager"] },
      { name: "Products",      icon: <FaBoxOpen />, label: "Продукты", roles: ["admin", "product_manager", "client_manager"] },
      { name: "Notes",         icon: <FaStickyNote />, label: "Заметки", roles: ["admin", "client_manager", "product_manager"] },
      { name: "Analitic",      icon: <FaChartLine />, label: "Аналитика", roles: ["admin"] },
      { name: "Users",         icon: <FaUserCog />, label: "Сотрудники", roles: ["admin"] },
      { name: "Register",      icon: <FaUserPlus />, label: "Регистрация", roles: ["admin"] },
    ],
    []
  );

  const tabs = useMemo(
    () => allTabs.filter((t) => t.roles.includes(userRole)),
    [allTabs, userRole]
  );

  useEffect(() => {
    if (!tabs.some((t) => t.name === activeTab)) {
      setActiveTab(tabs[0]?.name || "ClientManager");
    }
  }, [activeTab, tabs]);

  const renderContent = () => {
    if (!tabs.some((t) => t.name === activeTab)) {
      return <div className="admin-panel__access-denied">Доступ запрещен</div>;
    }
    switch (activeTab) {
      case "ClientManager": return <AdminManager />;
      case "Products":      return <ProductTabs />;
      case "Notes":         return <Notes />;
      case "Analitic":      return <Analitic />;
      case "Users":         return <Users />;
      case "Register":      return <Register />;
      default:              return null;
    }
  };

  return (
    <div className="admin-panel">
      <aside
        className={`admin-panel__sidebar ${
          isSidebarCollapsed ? "admin-panel__sidebar--collapsed" : ""
        }`}
      >
        <div className="admin-panel__sidebar-logo">
          <div className="admin-panel__sidebar-logo-circle">
            <img
              src={Logo}
              alt="MMA Logo"
              className="admin-panel__sidebar-logo-image"
            />
          </div>
        </div>

        <button
          className="admin-panel__sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Переключить сайдбар"
        >
          {isSidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
        </button>

        <ul className="admin-panel__sidebar-list">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`admin-panel__sidebar-item ${
                activeTab === tab.name ? "admin-panel__sidebar-item--active" : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
              title={isSidebarCollapsed ? tab.label : ""}
            >
              <span className="admin-panel__sidebar-item-icon">{tab.icon}</span>
              {!isSidebarCollapsed && (
                <span className="admin-panel__sidebar-item-label">{tab.label}</span>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <main className="admin-panel__content">{renderContent()}</main>
    </div>
  );
};

export default AdminPanel;
