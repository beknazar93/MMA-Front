import { useState } from 'react';
import './LeadStages.scss';

function LeadStages() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const initialLeadState = {
    id: Date.now(),
    source: '',
    name: '',
    managerContacted: false,
    trialScheduled: '',
    trialAttended: false,
    thinking: false,
    client: false,
    refused: false,
    currentStep: 1
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedLead(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === selectedLead.id
          ? { ...selectedLead, currentStep: selectedLead.currentStep + 1 }
          : lead
      )
    );
    setSelectedLead(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  };

  const isStepValid = () => {
    if (!selectedLead) return false;
    switch (selectedLead.currentStep) {
      case 1: return selectedLead.source !== '' && selectedLead.name !== '' && selectedLead.managerContacted;
      case 2: return selectedLead.trialScheduled !== '';
      case 3: return selectedLead.trialAttended;
      case 4: return selectedLead.thinking || selectedLead.client || selectedLead.refused;
      default: return true;
    }
  };

  const addNewLead = () => {
    const newLead = { ...initialLeadState, id: Date.now() };
    setLeads(prev => [...prev, newLead]);
    setSelectedLead(newLead);
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
  };

  const renderStep = () => {
    if (!selectedLead) return <p className="lead-stages__message">Выберите лид или создайте новый</p>;

    switch (selectedLead.currentStep) {
      case 1:
        return (
          <>
            <select
              name="source"
              className="lead-stages__select"
              value={selectedLead.source}
              onChange={handleInputChange}
            >
              <option value="">Выберите источник</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <input
              type="text"
              name="name"
              className="lead-stages__input"
              placeholder="Имя клиента"
              value={selectedLead.name}
              onChange={handleInputChange}
            />
            <label className="lead-stages__label">
              <input
                type="checkbox"
                name="managerContacted"
                className="lead-stages__checkbox"
                checked={selectedLead.managerContacted}
                onChange={handleInputChange}
              />
              Менеджер начал общение
            </label>
          </>
        );
      case 2:
        return (
          <input
            type="date"
            name="trialScheduled"
            className="lead-stages__input"
            value={selectedLead.trialScheduled}
            onChange={handleInputChange}
          />
        );
      case 3:
        return (
          <label className="lead-stages__label">
            <input
              type="checkbox"
              name="trialAttended"
              className="lead-stages__checkbox"
              checked={selectedLead.trialAttended}
              onChange={handleInputChange}
            />
            Пришел на пробное
          </label>
        );
      case 4:
        return (
          <>
            <label className="lead-stages__label">
              <input
                type="checkbox"
                name="thinking"
                className="lead-stages__checkbox"
                checked={selectedLead.thinking}
                onChange={handleInputChange}
              />
              Думает
            </label>
            <label className="lead-stages__label">
              <input
                type="checkbox"
                name="client"
                className="lead-stages__checkbox"
                checked={selectedLead.client}
                onChange={handleInputChange}
              />
              Стал клиентом
            </label>
            <label className="lead-stages__label">
              <input
                type="checkbox"
                name="refused"
                className="lead-stages__checkbox"
                checked={selectedLead.refused}
                onChange={handleInputChange}
              />
              Отказался
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lead-stages">
      <div className="lead-stages__cards">
        <button className="lead-stages__button lead-stages__button--add" onClick={addNewLead}>
          Добавить новый лид
        </button>
        <div className="lead-stages__cards-list">
          {leads.map(lead => (
            <div
              key={lead.id}
              className={`lead-stages__card ${selectedLead?.id === lead.id ? 'lead-stages__card--active' : ''}`}
              onClick={() => selectLead(lead)}
            >
              <div className="lead-stages__card-title">{lead.name || 'Без имени'}</div>
              <div className="lead-stages__card-status">
                Статус: {
                  lead.refused ? 'Отказ' :
                  lead.client ? 'Клиент' :
                  lead.thinking ? 'Думает' :
                  lead.trialAttended ? 'После пробного' :
                  lead.trialScheduled ? 'Записан на пробное' :
                  lead.managerContacted ? 'В работе' :
                  lead.source ? 'Новый лид' : 'Не начато'
                }
              </div>
              <div className="lead-stages__card-source">Источник: {lead.source || 'Не указан'}</div>
            </div>
          ))}
        </div>
      </div>
      {selectedLead && (
        <form className="lead-stages__form" onSubmit={handleNextStep}>
          {renderStep()}
          <button
            type="submit"
            className={`lead-stages__button ${!isStepValid() ? 'lead-stages__button--disabled' : ''}`}
            disabled={!isStepValid()}
          >
            {selectedLead.currentStep === 4 ? 'Завершить' : 'Следующий этап'}
          </button>
        </form>
      )}
      <div className="lead-stages__status">
        <h3 className="lead-stages__status-title">Статус клиента</h3>
        {selectedLead ? (
          <>
            <div className="lead-stages__status-item">Этап: {selectedLead.currentStep}/4</div>
            <div className="lead-stages__status-item">Источник: {selectedLead.source || 'Не указан'}</div>
            <div className="lead-stages__status-item">Имя: {selectedLead.name || 'Не указано'}</div>
            <div className="lead-stages__status-item">Менеджер начал общение: {selectedLead.managerContacted ? 'Да' : 'Нет'}</div>
            <div className="lead-stages__status-item">Дата пробного: {selectedLead.trialScheduled || 'Не назначена'}</div>
            <div className="lead-stages__status-item">Пришел на пробное: {selectedLead.trialAttended ? 'Да' : 'Нет'}</div>
            <div className="lead-stages__status-item">Статус: {
              selectedLead.refused ? 'Отказ' :
              selectedLead.client ? 'Клиент' :
              selectedLead.thinking ? 'Думает' :
              selectedLead.trialAttended ? 'После пробного' :
              selectedLead.trialScheduled ? 'Записан на пробное' :
              selectedLead.managerContacted ? 'В работе' :
              selectedLead.source ? 'Новый лид' : 'Не начато'
            }</div>
          </>
        ) : (
          <p className="lead-stages__message">Выберите лид для просмотра статуса</p>
        )}
      </div>
    </div>
  );
}

export default LeadStages;