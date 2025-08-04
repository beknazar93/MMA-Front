import React, { useState } from 'react';
import './LeadTabs.scss';

const TABS = [
  'В работе',
  'Записан на пробное',
  'Пришел на пробное',
  'Думает',
  'Стал клиентом',
  'Отказ'
];

const LeadTabs = () => {
  const [activeTab, setActiveTab] = useState('В работе');
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    platform: 'WhatsApp',
    name: '',
    started: false,
    trialDate: '',
    attended: false,
    thinkingStatus: 'Думает',
    rejectedStage: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const updateStatus = (id, status, rejectedStage = '') => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id
          ? {
              ...client,
              status,
              rejectedStage: status === 'Отказ' ? rejectedStage : client.rejectedStage
            }
          : client
      )
    );
  };

  const addClient = () => {
    if (activeTab === 'В работе') {
      if (formData.started && formData.name.trim() !== '') {
        const newClient = {
          id: Date.now(),
          name: formData.name,
          platform: formData.platform,
          status: 'Записан на пробное',
          rejectedStage: ''
        };
        setClients([...clients, newClient]);
        setFormData({ ...formData, name: '', started: false });
        setActiveTab('Записан на пробное');
      }
    } else if (activeTab === 'Записан на пробное') {
      const clientToUpdate = clients.find((c) => c.status === 'Записан на пробное');
      if (clientToUpdate && formData.trialDate !== '') {
        updateStatus(clientToUpdate.id, 'Пришел на пробное');
        setFormData({ ...formData, trialDate: '' });
        setActiveTab('Пришел на пробное');
      }
    } else if (activeTab === 'Пришел на пробное') {
      const clientToUpdate = clients.find((c) => c.status === 'Пришел на пробное');
      if (clientToUpdate && formData.attended) {
        updateStatus(clientToUpdate.id, 'Думает');
        setFormData({ ...formData, attended: false });
        setActiveTab('Думает');
      }
    } else if (activeTab === 'Думает') {
      const clientToUpdate = clients.find((c) => c.status === 'Думает');
      if (clientToUpdate) {
        if (formData.thinkingStatus === 'Сразу') {
          updateStatus(clientToUpdate.id, 'Стал клиентом');
          setActiveTab('Стал клиентом');
        } else if (formData.thinkingStatus === 'Отказ') {
          updateStatus(clientToUpdate.id, 'Отказ', 'Думает');
          setActiveTab('Отказ');
        }
      }
    }
  };

  const rejectClient = (id, stage) => {
    updateStatus(id, 'Отказ', stage);
    setActiveTab('Отказ');
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'В работе':
        return (
          <>
            <div className="lead-tab__field">
              <label>Платформа:</label>
              <select name="platform" value={formData.platform} onChange={handleChange}>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
              </select>
            </div>
            <div className="lead-tab__field">
              <label>
                <input type="checkbox" name="started" checked={formData.started} onChange={handleChange} /> Менеджер начал
              </label>
            </div>
            <div className="lead-tab__field">
              <label>Имя клиента:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
          </>
        );
      case 'Записан на пробное':
        return (
          <div className="lead-tab__field">
            <label>Дата пробного занятия:</label>
            <input type="date" name="trialDate" value={formData.trialDate} onChange={handleChange} />
          </div>
        );
      case 'Пришел на пробное':
        return (
          <div className="lead-tab__field">
            <label>
              <input type="checkbox" name="attended" checked={formData.attended} onChange={handleChange} /> Пришел на пробное
            </label>
          </div>
        );
      case 'Думает':
        return (
          <div className="lead-tab__field">
            <label>Статус:</label>
            <select name="thinkingStatus" value={formData.thinkingStatus} onChange={handleChange}>
              <option value="Думает">Думает</option>
              <option value="Отказ">Отказ</option>
              <option value="Сразу">Сразу</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const renderClients = () => {
    return clients
      .filter((client) => client.status === activeTab)
      .map((client) => (
        <div key={client.id} className="lead-tab__field">
          <strong>{client.name}</strong> ({client.platform}) — <em>{client.status}</em>
          {client.rejectedStage && <span> (Отказался на этапе: {client.rejectedStage})</span>}
          {activeTab !== 'Отказ' && (
            <button className="lead-tab__btn" onClick={() => rejectClient(client.id, activeTab)}>Отказ</button>
          )}
        </div>
      ));
  };

  return (
    <div className="lead-tabs">
      <div className="lead-tabs__nav">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`lead-tabs__tab ${activeTab === tab ? 'lead-tabs__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="lead-tabs__content">
        <div className="lead-tab">
          {renderForm()}
          <button className="lead-tab__btn" onClick={addClient}>Добавить</button>
          <hr />
          {renderClients()}
        </div>
      </div>
    </div>
  );
};

export default LeadTabs;
