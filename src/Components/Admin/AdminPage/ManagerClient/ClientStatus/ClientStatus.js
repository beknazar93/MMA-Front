// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { fetchClients, updateClient } from "../../api/API";
// import { months, years, days, paymentOptions, errorMessages } from "../../Constants/constants";
// import './ClientStatus.scss';

// const ClientStatus = () => {
//   const [activeSection, setActiveSection] = useState("allLeads");
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filters, setFilters] = useState({ day: "", month: "", year: "", payment: "", view: "all" });

//   const statusOptions = [
//     "Обычный",
//     "Пришли на пробное",
//     "Ожидаются",
//     "Подумают",
//     "Индивидуальный",
//     "Абонемент",
//   ];

//   const loadClients = useCallback(async () => {
//     try {
//       setLoading(true);
//       const clientsData = await fetchClients();
//       setClients(clientsData);
//       setError(null);
//     } catch (error) {
//       setError(errorMessages.loadingError);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadClients();
//   }, [loadClients]);

//   const currentMonth = months[new Date().getMonth()];
//   const currentYear = new Date().getFullYear().toString();

//   const filteredClients = useMemo(() => {
//     return clients.filter(client => {
//       const isNewClient = filters.view === "new"
//         ? client.month === currentMonth &&
//           client.year === currentYear &&
//           !clients.some(c =>
//             c.name.toLowerCase() === client.name.toLowerCase() &&
//             (c.month !== currentMonth || c.year !== currentYear)
//           )
//         : true;

//       return (
//         (!filters.day || client.day === filters.day) &&
//         (!filters.month || client.month === filters.month) &&
//         (!filters.year || client.year === filters.year) &&
//         (!filters.payment || client.payment === filters.payment) &&
//         (activeSection === "allLeads" || client.typeClient === stats[activeSection]?.label) &&
//         isNewClient
//       );
//     });
//   }, [clients, filters, activeSection]);

//   const stats = useMemo(() => ({
//     allLeads: { label: "Всего лидов", count: filteredClients.length },
//     ordinary: { label: "Обычный", count: filteredClients.filter(c => c.typeClient === "Обычный").length },
//     trial: { label: "Пришли на пробное", count: filteredClients.filter(c => c.typeClient === "Пришли на пробное").length },
//     expected: { label: "Ожидаются", count: filteredClients.filter(c => c.typeClient === "Ожидаются").length },
//     thinking: { label: "Подумают", count: filteredClients.filter(c => c.typeClient === "Подумают").length },
//     individual: { label: "Индивидуальный", count: filteredClients.filter(c => c.typeClient === "Индивидуальный").length },
//     subscription: { label: "Абонемент", count: filteredClients.filter(c => c.typeClient === "Абонемент").length },
//   }), [filteredClients]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleStatusChange = async (clientId, newStatus) => {
//     try {
//       const client = clients.find(c => c.id === clientId);
//       const updatedData = { ...client, typeClient: newStatus };
//       await updateClient(clientId, updatedData);
//       setClients(prev => prev.map(c => c.id === clientId ? { ...c, typeClient: newStatus } : c));
//     } catch (error) {
//       alert(errorMessages.updateClientError);
//     }
//   };

//   return (
//     <div className="client-status">
//       <div className="client-status__filters">
//         <select
//           name="view"
//           value={filters.view}
//           onChange={handleFilterChange}
//           className="client-status__filter-select"
//         >
//           <option value="all">Общий</option>
//           <option value="new">Новый</option>
//         </select>
//         <select
//           name="day"
//           value={filters.day}
//           onChange={handleFilterChange}
//           className="client-status__filter-select"
//         >
//           <option value="">Все дни</option>
//           {days.map(day => (
//             <option key={day} value={day}>{day}</option>
//           ))}
//         </select>
//         <select
//           name="month"
//           value={filters.month}
//           onChange={handleFilterChange}
//           className="client-status__filter-select"
//         >
//           <option value="">Все месяцы</option>
//           {months.map(month => (
//             <option key={month} value={month}>{month}</option>
//           ))}
//         </select>
//         <select
//           name="year"
//           value={filters.year}
//           onChange={handleFilterChange}
//           className="client-status__filter-select"
//         >
//           <option value="">Все годы</option>
//           {years.map(year => (
//             <option key={year} value={year}>{year}</option>
//           ))}
//         </select>
//         <select
//           name="payment"
//           value={filters.payment}
//           onChange={handleFilterChange}
//           className="client-status__filter-select"
//         >
//           <option value="">Все статусы оплаты</option>
//           {paymentOptions.map(option => (
//             <option key={option.value} value={option.value}>{option.value}</option>
//           ))}
//         </select>
//       </div>
//       <div className="client-status__nav">
//         {Object.entries(stats).map(([key, { label, count }]) => (
//           <button
//             key={key}
//             className={`client-status__nav-item ${activeSection === key ? "active" : ""}`}
//             onClick={() => setActiveSection(key)}
//           >
//             {label}: {count}
//           </button>
//         ))}
//       </div>
//       <div className="client-status__content">
//         {loading ? (
//           <div className="client-status__spinner" />
//         ) : error ? (
//           <p className="client-status__error">{error}</p>
//         ) : (
//           <div className="client-status__table-container">
//             <table className="client-status__table">
//               <thead>
//                 <tr>
//                   <th>Имя</th>
//                   <th>Дата</th>
//                   <th>Спорт</th>
//                   <th>Статус</th>
//                   <th>Действия</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredClients.map(client => (
//                   <tr key={client.id}>
//                     <td>{client.name}</td>
//                     <td>{client.day} {client.month} {client.year}</td>
//                     <td>{client.sport_category}</td>
//                     <td>{client.typeClient}</td>
//                     <td>
//                       <select
//                         className="client-status__select"
//                         value={client.typeClient}
//                         onChange={(e) => handleStatusChange(client.id, e.target.value)}
//                       >
//                         <option value="" disabled>Сменить статус</option>
//                         {statusOptions.map(option => (
//                           <option key={option} value={option}>{option}</option>
//                         ))}
//                       </select>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClientStatus;


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients, updateClient } from "../../api/API";
import { months, years, days, paymentOptions, errorMessages } from "../../Constants/constants";
import './ClientStatus.scss';

const ClientStatus = () => {
  const [activeSection, setActiveSection] = useState("allLeads");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ day: "", month: "", year: "", payment: "", view: "all" });

  const statusOptions = [
    "Обычный",
    "Пришли на пробное",
    "Ожидаются",
    "Подумают",
    "Индивидуальный",
    "Абонемент",
  ];

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await fetchClients();
      setClients(clientsData);
      setError(null);
    } catch (error) {
      setError(errorMessages.loadingError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const currentMonth = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();

  // Базовая фильтрация клиентов без учета activeSection
  const baseFilteredClients = useMemo(() => {
    return clients.filter(client => {
      const isNewClient = filters.view === "new"
        ? client.month === currentMonth &&
          client.year === currentYear &&
          !clients.some(c =>
            c.name.toLowerCase() === client.name.toLowerCase() &&
            (c.month !== currentMonth || c.year !== currentYear)
          )
        : true;

      return (
        (!filters.day || client.day === filters.day) &&
        (!filters.month || client.month === filters.month) &&
        (!filters.year || client.year === filters.year) &&
        (!filters.payment || client.payment === filters.payment) &&
        isNewClient
      );
    });
  }, [clients, filters]);

  // Вычисление статистики на основе baseFilteredClients
  const stats = useMemo(() => ({
    allLeads: { label: "Всего лидов", count: baseFilteredClients.length },
    ordinary: { label: "Обычный", count: baseFilteredClients.filter(c => c.typeClient === "Обычный").length },
    trial: { label: "Пришли на пробное", count: baseFilteredClients.filter(c => c.typeClient === "Пришли на пробное").length },
    expected: { label: "Ожидаются", count: baseFilteredClients.filter(c => c.typeClient === "Ожидаются").length },
    thinking: { label: "Подумают", count: baseFilteredClients.filter(c => c.typeClient === "Подумают").length },
    individual: { label: "Индивидуальный", count: baseFilteredClients.filter(c => c.typeClient === "Индивидуальный").length },
    subscription: { label: "Абонемент", count: baseFilteredClients.filter(c => c.typeClient === "Абонемент").length },
  }), [baseFilteredClients]);

  // Фильтрация для отображения в таблице с учетом activeSection
  const displayedClients = useMemo(() => {
    const sectionLabel = {
      allLeads: "Всего лидов",
      ordinary: "Обычный",
      trial: "Пришли на пробное",
      expected: "Ожидаются",
      thinking: "Подумают",
      individual: "Индивидуальный",
      subscription: "Абонемент",
    }[activeSection];

    return baseFilteredClients.filter(client =>
      activeSection === "allLeads" || client.typeClient === sectionLabel
    );
  }, [baseFilteredClients, activeSection]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      const client = clients.find(c => c.id === clientId);
      const updatedData = { ...client, typeClient: newStatus };
      await updateClient(clientId, updatedData);
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, typeClient: newStatus } : c));
    } catch (error) {
      alert(errorMessages.updateClientError);
    }
  };

  return (
    <div className="client-status">
      <div className="client-status__filters">
        <select
          name="view"
          value={filters.view}
          onChange={handleFilterChange}
          className="client-status__filter-select"
        >
          <option value="all">Общий</option>
          <option value="new">Новый</option>
        </select>
        <select
          name="day"
          value={filters.day}
          onChange={handleFilterChange}
          className="client-status__filter-select"
        >
          <option value="">Все дни</option>
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <select
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
          className="client-status__filter-select"
        >
          <option value="">Все месяцы</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <select
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
          className="client-status__filter-select"
        >
          <option value="">Все годы</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          name="payment"
          value={filters.payment}
          onChange={handleFilterChange}
          className="client-status__filter-select"
        >
          <option value="">Все статусы оплаты</option>
          {paymentOptions.map(option => (
            <option key={option.value} value={option.value}>{option.value}</option>
          ))}
        </select>
      </div>
      <div className="client-status__nav">
        {Object.entries(stats).map(([key, { label, count }]) => (
          <button
            key={key}
            className={`client-status__nav-item ${activeSection === key ? "active" : ""}`}
            onClick={() => setActiveSection(key)}
          >
            {label}: {count}
          </button>
        ))}
      </div>
      <div className="client-status__content">
        {loading ? (
          <div className="client-status__spinner">Загрузка...</div>
        ) : error ? (
          <p className="client-status__error">{error}</p>
        ) : (
          <div className="client-status__table-container">
            <table className="client-status__table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Дата</th>
                  <th>Спорт</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {displayedClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.day} {client.month} {client.year}</td>
                    <td>{client.sport_category}</td>
                    <td>{client.typeClient}</td>
                    <td>
                      <select
                        className="client-status__select"
                        value={client.typeClient}
                        onChange={(e) => handleStatusChange(client.id, e.target.value)}
                      >
                        <option value="" disabled>Сменить статус</option>
                        {statusOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientStatus;