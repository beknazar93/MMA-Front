// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { fetchClients } from "../../api/API";
// import { months, years, errorMessages } from "../../Constants/constants";
// import './ClientStatus.scss';

// const Modal = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="client-status__modal">
//       <div className="client-status__modal-content">
//         <button className="client-status__modal-close" onClick={onClose} aria-label="Закрыть">×</button>
//         <h2 className="client-status__modal-title">{title}</h2>
//         {children}
//       </div>
//     </div>
//   );
// };

// const ClientStatus = () => {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [viewMode, setViewMode] = useState("new");
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState("Июнь");
//   const [selectedYear, setSelectedYear] = useState("2025");

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

//   const newClients = useMemo(() => {
//     const currentClients = clients.filter(
//       (c) => c.month === selectedMonth && c.year === selectedYear
//     );
//     const currentClientSet = new Set(
//       currentClients.map((c) => `${c.name.toLowerCase()}|${c.sport_category}`)
//     );
//     return currentClients.filter((client) => {
//       const clientKey = `${client.name.toLowerCase()}|${client.sport_category}`;
//       const hasPreviousRecords = clients.some(
//         (c) =>
//           c.name.toLowerCase() === client.name.toLowerCase() &&
//           c.sport_category === client.sport_category &&
//           (c.year < selectedYear ||
//             (c.year === selectedYear && months.indexOf(c.month) < months.indexOf(selectedMonth)))
//       );
//       return !hasPreviousRecords && currentClientSet.has(clientKey);
//     });
//   }, [clients, selectedMonth, selectedYear]);

//   const notAddedClients = useMemo(() => {
//     const previousMonthIndex = months.indexOf(selectedMonth) - 1;
//     const previousMonth = previousMonthIndex >= 0 ? months[previousMonthIndex] : months[months.length - 1];
//     const previousYear = previousMonthIndex >= 0 ? selectedYear : (parseInt(selectedYear) - 1).toString();
//     const previousClients = clients.filter(
//       (c) => c.month === previousMonth && c.year === previousYear
//     );
//     const previousClientSet = new Set(
//       previousClients.map((c) => `${c.name.toLowerCase()}|${c.sport_category}`)
//     );
//     return previousClients.filter((client) => {
//       const clientKey = `${client.name.toLowerCase()}|${client.sport_category}`;
//       const hasCurrentRecord = clients.some(
//         (c) =>
//           c.name.toLowerCase() === client.name.toLowerCase() &&
//           c.sport_category === client.sport_category &&
//           c.month === selectedMonth &&
//           c.year === selectedYear
//       );
//       return !hasCurrentRecord && previousClientSet.has(clientKey);
//     });
//   }, [clients, selectedMonth, selectedYear]);

//   const getClientActivePeriods = useMemo(() => {
//     if (!selectedClient) return { count: 0, periods: [] };
//     const clientRecords = clients.filter(
//       (c) =>
//         c.name.toLowerCase() === selectedClient.name.toLowerCase() &&
//         c.sport_category === selectedClient.sport_category
//     );
//     const uniquePeriods = [...new Set(
//       clientRecords
//         .filter((client) => client.month && client.year)
//         .map((client) => `${client.month} ${client.year}`)
//     )];
//     return {
//       count: uniquePeriods.length,
//       periods: uniquePeriods,
//     };
//   }, [selectedClient, clients]);

//   const displayedClients = viewMode === "new" ? newClients : notAddedClients;

//   return (
//     <div className="client-status">
//       <div className="client-status__filters">
//         <select
//           className="client-status__select"
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           aria-label="Выберите месяц"
//         >
//           <option value="">Месяц</option>
//           {months.map((month, index) => (
//             <option key={index} value={month}>{month}</option>
//           ))}
//         </select>
//         <select
//           className="client-status__select"
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//           aria-label="Выберите год"
//         >
//           <option value="">Год</option>
//           {years.map((year, index) => (
//             <option key={index} value={year}>{year}</option>
//           ))}
//         </select>
//       </div>
//       <div className="client-status__buttons">
//         <button
//           className={`client-status__button ${viewMode === "new" ? "client-status__button--active" : ""}`}
//           onClick={() => setViewMode("new")}
//         >
//           Новые {newClients.length > 0 && <span className="client-status__counter">{newClients.length}</span>}
//         </button>
//         <button
//           className={`client-status__button ${viewMode === "not_added" ? "client-status__button--active" : ""}`}
//           onClick={() => setViewMode("not_added")}
//         >
//           Не добавленные
//         </button>
//       </div>
//       {loading ? (
//         <div className="client-status__spinner" />
//       ) : error ? (
//         <p className="client-status__error">{error}</p>
//       ) : displayedClients.length === 0 ? (
//         <p className="client-status__no-data">{viewMode === "new" ? "Нет новых клиентов" : "Нет не добавленных клиентов"}</p>
//       ) : (
//         <div className="client-status__table-container">
//           <table className="client-status__table">
//             <thead>
//               <tr>
//                 <th>Имя</th>
//                 <th>Спорт</th>
//                 <th>Месяц</th>
//                 <th>День</th>
//                 <th>Оплата</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayedClients.map((client) => (
//                 <tr
//                   key={`${client.id}-${client.sport_category}`}
//                   className={client.payment === "Не оплачено" ? "client-status__row--unpaid" : ""}
//                 >
//                   <td>{client.name || "-"}</td>
//                   <td>{client.sport_category || "-"}</td>
//                   <td>{client.month || "-"}</td>
//                   <td>{client.day || "-"}</td>
//                   <td className={`client-status__payment client-status__payment--${client.payment}`}>
//                     {client.payment || "-"}
//                   </td>
//                   <td>
//                     <button
//                       className="client-status__details"
//                       onClick={() => setSelectedClient(client)}
//                       aria-label="Подробнее"
//                     >
//                       Подробнее
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//       <Modal
//         isOpen={selectedClient}
//         onClose={() => setSelectedClient(null)}
//         title="Детали клиента"
//       >
//         {selectedClient && (
//           <div className="client-status__modal-form">
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Имя:</span>
//               <span>{selectedClient.name || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Телефон:</span>
//               <span>{selectedClient.phone || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Спорт:</span>
//               <span>{selectedClient.sport_category || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Тренер:</span>
//               <span>{selectedClient.trainer || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Email:</span>
//               <span>{selectedClient.email || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Источник:</span>
//               <span>{selectedClient.check_field || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Пол:</span>
//               <span>{selectedClient.stage || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Дата:</span>
//               <span>{selectedClient.day || "-"} {selectedClient.month || "-"} {selectedClient.year || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Дата оплаты:</span>
//               <span>{selectedClient.dataCassa || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Тип клиента:</span>
//               <span>{selectedClient.typeClient || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Цена:</span>
//               <span>{selectedClient.price ? `${selectedClient.price} сом` : "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Скидка:</span>
//               <span>{selectedClient.sale || "-"}</span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Оплата:</span>
//               <span className={`client-status__modal-payment client-status__modal-payment--${selectedClient.payment}`}>
//                 {selectedClient.payment || "-"}
//               </span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Активные месяцы:</span>
//               <span>
//                 {getClientActivePeriods.count > 0 ? (
//                   <>
//                     {getClientActivePeriods.count} мес.{" "}
//                     <select className="client-status__modal-select" defaultValue="">
//                       <option value="" disabled>Период</option>
//                       {getClientActivePeriods.periods.map((period, index) => (
//                         <option key={index} value={period}>{period}</option>
//                       ))}
//                     </select>
//                   </>
//                 ) : "-"}
//               </span>
//             </div>
//             <div className="client-status__modal-row">
//               <span className="client-status__modal-label">Комментарий:</span>
//               <span>{selectedClient.comment || "-"}</span>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default ClientStatus;

import React, { useState } from "react";
import './ClientStatus.scss';

const ClientStatus = () => {
  const [activeSection, setActiveSection] = useState("allLeads");

  const stats = {
    allLeads: { label: "Всего лидов", count: 9 },
    trial: { label: "Пришли на пробное", count: 5 },
    expected: { label: "Ожидаются", count: 3 },
    paid: { label: "Оплатили", count: 3 },
    attending: { label: "Будут ходить", count: 3 },
    thinking: { label: "Подумают", count: 0 },
    individual: { label: "Индивидуальные", count: 0 },
  };

  const statusOptions = [
    "Пришли на пробное",
    "Ожидаются",
    "Оплатили",
    "Будут ходить",
    "Подумают",
    "Индивидуальные",
  ];

  // Демо-данные для таблицы
  const demoClients = [
    { id: 1, name: "Иван Иванов", phone: "+996123456789", sport: "Фитнес", status: "Пришли на пробное" },
    { id: 2, name: "Анна Петрова", phone: "+996987654321", sport: "Йога", status: "Ожидаются" },
    { id: 3, name: "Сергей Сидоров", phone: "+996555123456", sport: "Бокс", status: "Оплатили" },
    // Добавьте больше демо-данных по необходимости
  ];

  return (
    <div className="client-status">
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
        <div className="client-status__table-container">
          <table className="client-status__table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Спорт</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {demoClients
                .filter(client => activeSection === "allLeads" || client.status === stats[activeSection].label)
                .map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.phone}</td>
                    <td>{client.sport}</td>
                    <td>{client.status}</td>
                    <td>
                      <select className="client-status__select" defaultValue={client.status}>
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
      </div>
    </div>
  );
};

export default ClientStatus;