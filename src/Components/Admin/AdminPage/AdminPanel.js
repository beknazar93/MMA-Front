import React, { useState, useEffect } from 'react';
import AdminManager from './ManagerClient/AdminManager';
import ProductTabs from './Product/ProductTabs';
import Analitic from './Analitic/Analitic';
import Register from '../Auth/Register';
import WhatsAppChat from '../AdminPage/Chat/WhatsAppQR';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('ClientManager');
  const tabs = ['ClientManager', 'Analitic', 'Products', 'Register', 'WhatsApp'];

  const renderContent = () => {
    switch (activeTab) {
      case 'ClientManager':
        return <AdminManager />;
      case 'Analitic':
        return <Analitic />;
      case 'Products':
        return <ProductTabs />;
        case 'Register':
          return <Register />;
          case 'WhatsApp':
            return <WhatsAppChat />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel">
      <div className="custom-sidebar">
        <ul className="custom-sidebar__list">
          {tabs.map((tab) => (
            <li
              key={tab}
              className={`custom-sidebar__item ${activeTab === tab ? 'custom-sidebar__item--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-panel__content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;