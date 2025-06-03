import React, { useState } from "react";
import AdminManager from "./ManagerClient/AdminManager";
import ProductTabs from "./Product/ProductTabs";
import Analitic from "./Analitic/Analitic";
import Register from "../Auth/Register";
import WhatsAppChat from "../AdminPage/Chat/WhatsAppQR";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaChartBar,
  FaBox,
  FaUserPlus,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "../../mma.png";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("ClientManager");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const tabs = [
    { name: "ClientManager", icon: <FaUsers />, label: "Клиенты" },
    { name: "Analitic", icon: <FaChartBar />, label: "Аналитика" },
    { name: "Products", icon: <FaBox />, label: "Продукты" },
    { name: "Register", icon: <FaUserPlus />, label: "Регистрация" },
    { name: "WhatsApp", icon: <FaWhatsapp />, label: "WhatsApp" },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "ClientManager":
        return <AdminManager />;
      case "Analitic":
        return <Analitic />;
      case "Products":
        return <ProductTabs />;
      case "Register":
        return <Register />;
      case "WhatsApp":
        return <WhatsAppChat />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel">
      <div
        className={`admin-panel__sidebar ${
          isSidebarCollapsed ? "admin-panel__sidebar--collapsed" : ""
        }`}
      >
        <div className="admin-panel__sidebar-logo">
          <div className="admin-panel__sidebar-logo-circle">
            <img
              src={Logo}
              alt="Logo"
              className="admin-panel__sidebar-logo-image"
            />
          </div>
        </div>
        <button className="admin-panel__sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarCollapsed ? (
            <FaChevronRight className="admin-panel__sidebar-toggle-icon" />
          ) : (
            <FaChevronLeft className="admin-panel__sidebar-toggle-icon" />
          )}
        </button>
        <ul className="admin-panel__sidebar-list">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`admin-panel__sidebar-item ${
                activeTab === tab.name ? "admin-panel__sidebar-item--active" : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              <span className="admin-panel__sidebar-item-icon">{tab.icon}</span>
              {!isSidebarCollapsed && (
                <span className="admin-panel__sidebar-item-label">
                  {tab.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-panel__content">{renderContent()}</div>
    </div>
  );
};

export default AdminPanel;