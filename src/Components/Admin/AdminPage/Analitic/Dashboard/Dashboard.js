// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { fetchClients, fetchTotalStudents, fetchTotalBySource } from "../../api/API";
// import { months, years, checkFieldOptions } from "../../Constants/constants";
// import './Dashboard.scss';

// const getCurrentMonthAndYear = () => {
//   const date = new Date();
//   return { month: months[date.getMonth()] || months[0], year: years[0] };
// };

// const Dashboard = () => {
//   const [filters, setFilters] = useState(getCurrentMonthAndYear());
//   const [clients, setClients] = useState([]);
//   const [students, setStudents] = useState(0);
//   const [sourceData, setSourceData] = useState([]);
//   const [genderData, setGenderData] = useState([]);
//   const [typeClientData, setTypeClientData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Загрузка данных с учетом фильтров
//   const loadData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [clientsData, studentsCount, sourceCounts] = await Promise.all([
//         fetchClients().catch(() => []),
//         fetchTotalStudents({ month: filters.month, year: filters.year }).catch(() => 0),
//         Promise.all(
//           checkFieldOptions.map(async (source) => ({
//             source,
//             count: await fetchTotalBySource({ check_field: source, month: filters.month, year: filters.year }).catch(() => 0),
//           }))
//         ),
//       ]);
//       setClients(Array.isArray(clientsData) ? clientsData : []);
//       setStudents(Number(studentsCount) || 0);
//       setSourceData(sourceCounts);
//       setError(null);
//     } catch (err) {
//       setError("Ошибка загрузки данных.");
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => {
//     const timer = setTimeout(() => loadData(), 300);
//     return () => clearTimeout(timer);
//   }, [loadData]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const resetFilters = () => {
//     setFilters(getCurrentMonthAndYear());
//   };

//   // Подсчет новых клиентов
//   const newClients = useMemo(() => {
//     const currentClients = clients.filter((c) => {
//       const clientDate = new Date(c.dataCassa);
//       return (
//         months[clientDate.getMonth()] === filters.month &&
//         clientDate.getFullYear().toString() === filters.year
//       );
//     });
//     const currentClientSet = new Set(
//       currentClients.map((c) => `${c.name.toLowerCase()}|${c.sport_category}`)
//     );
//     return currentClients.filter((client) => {
//       const clientKey = `${client.name.toLowerCase()}|${client.sport_category}`;
//       const hasPreviousRecords = clients.some((c) => {
//         const cDate = new Date(c.dataCassa);
//         return (
//           c.name.toLowerCase() === client.name.toLowerCase() &&
//           c.sport_category === client.sport_category &&
//           (cDate.getFullYear() < parseInt(filters.year) ||
//             (cDate.getFullYear().toString() === filters.year &&
//               months.indexOf(months[cDate.getMonth()]) < months.indexOf(filters.month)))
//         );
//       });
//       return !hasPreviousRecords && currentClientSet.has(clientKey);
//     });
//   }, [clients, filters.month, filters.year]);

//   const newClientsCount = useMemo(() => newClients.length, [newClients]);

//   // Подсчет источников
//   const totalCount = useMemo(() => sourceData.reduce((sum, item) => sum + (Number(item?.count) || 0), 0), [sourceData]);

//   // Подсчет по полу
//   const genderDataMemo = useMemo(() => {
//     const genders = ["Мужской", "Женский"];
//     return genders.map((gender) => ({
//       gender,
//       count: clients.filter((client) => {
//         const clientDate = new Date(client.dataCassa);
//         return (
//           clientDate.getFullYear().toString() === filters.year &&
//           months[clientDate.getMonth()] === filters.month &&
//           client?.stage === gender
//         );
//       }).length,
//     }));
//   }, [clients, filters.month, filters.year]);

//   // Подсчет по типам клиентов
//   const typeClientDataMemo = useMemo(() => {
//     const types = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
//     return types.map((type) => ({
//       type,
//       count: clients.filter((client) => {
//         const clientDate = new Date(client.dataCassa);
//         return (
//           clientDate.getFullYear().toString() === filters.year &&
//           months[clientDate.getMonth()] === filters.month &&
//           client?.typeClient === type
//         );
//       }).length,
//     }));
//   }, [clients, filters.month, filters.year]);

//   useEffect(() => {
//     setGenderData(genderDataMemo);
//     setTypeClientData(typeClientDataMemo);
//   }, [genderDataMemo, typeClientDataMemo]);

//   const maxStudents = Math.max(students, 1);
//   const maxSource = Math.max(...sourceData.map((item) => item.count), 1);
//   const maxGender = Math.max(...genderData.map((item) => item.count), 1);
//   const maxTypeClient = Math.max(...typeClientData.map((item) => item.count), 1);

//   if (error) return <p className="dashboard__error">Ошибка: {error}</p>;

//   return (
//     <div className="dashboard">
//       <div className="dashboard__header">
//         <h1 className="dashboard__title"></h1>
//         <div className="dashboard__filters">
//           <div className="dashboard__filter-group">
//             <span className="dashboard__filter-icon">📅</span>
//             <select
//               name="month"
//               value={filters.month}
//               onChange={handleFilterChange}
//               className="dashboard__select"
//               aria-label="Выберите месяц"
//             >
//               <option value="" disabled>Месяц</option>
//               {months.map((m) => (
//               <option key={m} value={m}>{m}</option>))}
//             </select>
//             <select
//               name="year"
//               value={filters.year}
//               onChange={handleFilterChange}
//               className="dashboard__select"
//               aria-label="Выберите год"
//             >
//               <option value="" disabled>Год</option>
//               {years.map((y) => (
//               <option key={y} value={y}>{y}</option>))}
//             </select>
//           </div>
//           <button className="dashboard__reset-btn" onClick={resetFilters}>
//             <span className="dashboard__reset-icon">🔄</span> Сброс
//           </button>
//         </div>
//       </div>
//       {loading ? (
//         <div className="dashboard__loading">
//           <span className="dashboard__loading-spinner"></span> Загрузка...
//         </div>
//       ) : (
//         <div className="dashboard__content">
//           <div className="dashboard__card dashboard__card--revenue">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">💸</span>
//               <h2 className="dashboard__card-title">Доход</h2>
//             </div>
//             <div className="dashboard__revenue">
//               <span className="dashboard__revenue-count">{newClientsCount} новых клиентов</span>
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--students">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">👥</span>
//               <h2 className="dashboard__card-title">Ученики</h2>
//             </div>
//             <div className="dashboard__students">
//               <div className="dashboard__students-item">
//                 <span className="dashboard__students-label">{filters.month} {filters.year}</span>
//                 <div className="dashboard__bar" style={{ width: `${(students / maxStudents) * 100}%` }}>
//                   <span className="dashboard__bar-value">{students}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--sources">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">🌐</span>
//               <h2 className="dashboard__card-title">Источники</h2>
//             </div>
//             <div className="dashboard__sources">
//               <span className="dashboard__sources-total">Всего: {totalCount}</span>
//               {sourceData.map((item, index) => (
//                 <div key={index} className="dashboard__sources-item">
//                   <span className="dashboard__sources-label">{item.source}</span>
//                   <div className="dashboard__bar" style={{ width: `${(item.count / maxSource) * 100}%` }}>
//                     <span className="dashboard__bar-value">{item.count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--gender">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">⚥</span>
//               <h2 className="dashboard__card-title">Пол</h2>
//             </div>
//             <div className="dashboard__gender">
//               {genderData.map((item, index) => (
//                 <div key={index} className="dashboard__gender-item">
//                   <span className="dashboard__gender-label">{item.gender}</span>
//                   <div className="dashboard__bar" style={{ width: `${(item.count / maxGender) * 100}%` }}>
//                     <span className="dashboard__bar-value">{item.count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--type-client">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">👤</span>
//               <h2 className="dashboard__card-title">Типы клиентов</h2>
//             </div>
//             <div className="dashboard__type-client">
//               {typeClientData.map((item, index) => (
//                 <div key={index} className="dashboard__type-client-item">
//                   <span className="dashboard__type-client-label">{item.type}</span>
//                   <div className="dashboard__bar" style={{ width: `${(item.count / maxTypeClient) * 100}%` }}>
//                     <span className="dashboard__bar-value">{item.count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;


// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { fetchClients, fetchTotalStudents, fetchTotalBySource } from "../../api/API";
// import { months, years, checkFieldOptions } from "../../Constants/constants";
// import './Dashboard.scss';

// const getCurrentMonthAndYear = () => {
//   const date = new Date();
//   return { month: months[date.getMonth()] || months[0], year: years[0] };
// };

// const Dashboard = () => {
//   const [filters, setFilters] = useState(getCurrentMonthAndYear());
//   const [clients, setClients] = useState([]);
//   const [students, setStudents] = useState(0);
//   const [sourceData, setSourceData] = useState([]);
//   const [genderData, setGenderData] = useState([]);
//   const [typeClientData, setTypeClientData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Загрузка данных с учетом фильтров
//   const loadData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [clientsData, studentsCount, sourceCounts] = await Promise.all([
//         fetchClients().catch(() => []),
//         fetchTotalStudents({ month: filters.month, year: filters.year }).catch(() => 0),
//         Promise.all(
//           checkFieldOptions.map(async (source) => ({
//             source,
//             count: await fetchTotalBySource({ check_field: source, month: filters.month, year: filters.year }).catch(() => 0),
//           }))
//         ),
//       ]);
//       setClients(Array.isArray(clientsData) ? clientsData.filter(client => 
//         client && 
//         typeof client.dataCassa === "string" && 
//         !isNaN(new Date(client.dataCassa)) && 
//         client.name && 
//         client.sport_category
//       ) : []);
//       setStudents(Number(studentsCount) || 0);
//       setSourceData(sourceCounts);
//       setError(null);
//     } catch (err) {
//       setError("Ошибка загрузки данных.");
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => {
//     const timer = setTimeout(() => loadData(), 300);
//     return () => clearTimeout(timer);
//   }, [loadData]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const resetFilters = () => {
//     setFilters(getCurrentMonthAndYear());
//   };

//   // Подсчет новых клиентов и их суммы по dataCassa
//   const newClientsData = useMemo(() => {
//     const currentClients = clients.filter((c) => {
//       const clientDate = new Date(c.dataCassa);
//       return (
//         months[clientDate.getMonth()] === filters.month &&
//         clientDate.getFullYear().toString() === filters.year &&
//         (typeof c.price === "string" || typeof c.price === "number")
//       );
//     });

//     const currentClientSet = new Set(
//       currentClients.map((c) => `${c.name.toLowerCase()}|${c.sport_category}`)
//     );

//     const newClients = currentClients.filter((client) => {
//       const clientKey = `${client.name.toLowerCase()}|${client.sport_category}`;
//       const hasPreviousRecords = clients.some((c) => {
//         const cDate = new Date(c.dataCassa);
//         return (
//           c.name.toLowerCase() === client.name.toLowerCase() &&
//           c.sport_category === client.sport_category &&
//           (cDate.getFullYear() < parseInt(filters.year) ||
//             (cDate.getFullYear().toString() === filters.year &&
//               months.indexOf(months[cDate.getMonth()]) < months.indexOf(filters.month)))
//         );
//       });
//       return !hasPreviousRecords && currentClientSet.has(clientKey);
//     });

//     const totalNewClientsAmount = newClients.reduce((sum, client) => {
//       const { dataCassa, price } = client;
//       const startDate = new Date(dataCassa);
//       if (startDate.toString() === "Invalid Date") return sum;

//       const cleanedPrice = parseFloat(price.toString().replace(/[^0-9.]/g, "") || 0);
//       if (isNaN(cleanedPrice) || cleanedPrice <= 0) return sum;

//       const subscriptionDays = 30;
//       const endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + subscriptionDays - 1);

//       const startMonth = startDate.getMonth();
//       const startYear = startDate.getFullYear();
//       const endMonth = endDate.getMonth();
//       const endYear = endDate.getFullYear();

//       const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
//       const remainingDaysInStartMonth = daysInStartMonth - startDate.getDate() + 1;
//       let currentMonthPrice = cleanedPrice;

//       if (startMonth !== endMonth || startYear !== endYear) {
//         currentMonthPrice = (cleanedPrice * remainingDaysInStartMonth) / subscriptionDays;
//       }

//       if (months[startMonth] === filters.month && startYear.toString() === filters.year) {
//         return sum + currentMonthPrice;
//       }
//       return sum;
//     }, 0);

//     return { count: newClients.length, amount: totalNewClientsAmount };
//   }, [clients, filters.month, filters.year]);

//   // Подсчет источников
//   const totalCount = useMemo(() => sourceData.reduce((sum, item) => sum + (Number(item?.count) || 0), 0), [sourceData]);

//   // Подсчет по полу по dataCassa
//   const genderDataMemo = useMemo(() => {
//     const genders = ["Мужской", "Женский"];
//     return genders.map((gender) => ({
//       gender,
//       count: clients.filter((client) => {
//         const clientDate = new Date(client.dataCassa);
//         return (
//           clientDate.getFullYear().toString() === filters.year &&
//           months[clientDate.getMonth()] === filters.month &&
//           client?.stage === gender
//         );
//       }).length,
//     }));
//   }, [clients, filters.month, filters.year]);

//   // Подсчет по типам клиентов по dataCassa
//   const typeClientDataMemo = useMemo(() => {
//     const types = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
//     return types.map((type) => ({
//       type,
//       count: clients.filter((client) => {
//         const clientDate = new Date(client.dataCassa);
//         return (
//           clientDate.getFullYear().toString() === filters.year &&
//           months[clientDate.getMonth()] === filters.month &&
//           client?.typeClient === type
//         );
//       }).length,
//     }));
//   }, [clients, filters.month, filters.year]);

//   useEffect(() => {
//     setGenderData(genderDataMemo);
//     setTypeClientData(typeClientDataMemo);
//   }, [genderDataMemo, typeClientDataMemo]);

//   const maxStudents = Math.max(students, 1);
//   const maxSource = Math.max(...sourceData.map((item) => item.count), 1);
//   const maxGender = Math.max(...genderData.map((item) => item.count), 1);
//   const maxTypeClient = Math.max(...typeClientData.map((item) => item.count), 1);

//   if (error) return <p className="dashboard__error">Ошибка: {error}</p>;

//   return (
//     <div className="dashboard">
//       <div className="dashboard__header">
//         <h1 className="dashboard__title"></h1>
//         <div className="dashboard__filters">
//           <div className="dashboard__filter-group">
//             <span className="dashboard__filter-icon">📅</span>
//             <select
//               name="month"
//               value={filters.month}
//               onChange={handleFilterChange}
//               className="dashboard__select"
//               aria-label="Выберите месяц"
//             >
//               <option value="" disabled>Месяц</option>
//               {months.map((m) => (
//                 <option key={m} value={m}>{m}</option>
//               ))}
//             </select>
//             <select
//               name="year"
//               value={filters.year}
//               onChange={handleFilterChange}
//               className="dashboard__select"
//               aria-label="Выберите год"
//             >
//               <option value="" disabled>Год</option>
//               {years.map((y) => (
//                 <option key={y} value={y}>{y}</option>
//               ))}
//             </select>
//           </div>
//           <button className="dashboard__reset-btn" onClick={resetFilters}>
//             <span className="dashboard__reset-icon">🔄</span> Сброс
//           </button>
//         </div>
//       </div>
//       {loading ? (
//         <div className="dashboard__loading">
//           <span className="dashboard__loading-spinner"></span> Загрузка...
//         </div>
//       ) : (
//         <div className="dashboard__content">
//           <div className="dashboard__card dashboard__card--revenue">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">💸</span>
//               <h2 className="dashboard__card-title">Доход</h2>
//             </div>
//             <div className="dashboard__revenue">
//               <span className="dashboard__revenue-count">{newClientsData.count} новых клиентов</span>
//               <span className="dashboard__revenue-amount">{newClientsData.amount.toFixed(2)} сом</span>
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--students">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">👥</span>
//               <h2 className="dashboard__card-title">Ученики</h2>
//             </div>
//             <div className="dashboard__students">
//               <div className="dashboard__students-item">
//                 <span className="dashboard__students-label">{filters.month} {filters.year}</span>
//                 <div className="dashboard__bar" style={{ width: `${(students / maxStudents) * 100}%` }}>
//                   <span className="dashboard__bar-value">{students}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--sources">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">🌐</span>
//               <h2 className="dashboard__card-title">Источники</h2>
//             </div>
//             <div className="dashboard__sources">
//               <span className="dashboard__sources-total">Всего: {totalCount}</span>
//               {sourceData.map((item, index) => (
//                 <div key={index} className="dashboard__sources-item">
//                   <span className="dashboard__sources-label">{item.source}</span>
//                   <div className="dashboard__bar" style={{ width: `${(item.count / maxSource) * 100}%` }}>
//                     <span className="dashboard__bar-value">{item.count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--gender">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">⚥</span>
//               <h2 className="dashboard__card-title">Пол</h2>
//             </div>
//             <div className="dashboard__gender">
//               {genderData.map((item, index) => (
//                 <div key={index} className="dashboard__gender-item">
//                   <span className="dashboard__gender-label">{item.gender}</span>
//                   <div className="dashboard__bar" style={{ width: `${(item.count / maxGender) * 100}%` }}>
//                     <span className="dashboard__bar-value">{item.count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="dashboard__card dashboard__card--type-client">
//             <div className="dashboard__card-header">
//               <span className="dashboard__card-icon">👤</span>
//               <h2 className="dashboard__card-title">Типы клиентов</h2>
//             </div>
//             <div className="dashboard__type-client">
//               {typeClientData.map((item, index) => (
//                 <div key={index} className="dashboard__type-client-item">
//                   <span className="dashboard__type-client-label">{item.type}</span>
//                   <div className="dashboard__bar" style={{ width: `${(item.count / maxTypeClient) * 100}%` }}>
//                     <span className="dashboard__bar-value">{item.count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients, fetchTotalStudents, fetchTotalBySource } from "../../api/API";
import { months, years, checkFieldOptions } from "../../Constants/constants";
import './Dashboard.scss';

const getCurrentMonthAndYear = () => {
  const date = new Date();
  return { month: months[date.getMonth()] || months[0], year: years[0] };
};

const Dashboard = () => {
  const [filters, setFilters] = useState(getCurrentMonthAndYear());
  const [clients, setClients] = useState([]);
  const [students, setStudents] = useState(0);
  const [sourceData, setSourceData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [typeClientData, setTypeClientData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsData, studentsCount, sourceCounts] = await Promise.all([
        fetchClients(),
        fetchTotalStudents({ month: filters.month, year: filters.year }),
        Promise.all(
          checkFieldOptions.map(async (source) => ({
            source,
            count: await fetchTotalBySource({ check_field: source, month: filters.month, year: filters.year }),
          }))
        ),
      ]);
      setClients(Array.isArray(clientsData) ? clientsData.filter(client => 
        client && 
        client.month && 
        client.year && 
        client.name && 
        client.sport_category
      ) : []);
      setStudents(Number(studentsCount) || 0);
      setSourceData(sourceCounts);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(getCurrentMonthAndYear());
  };

  const totalCount = useMemo(() => sourceData.reduce((sum, item) => sum + (Number(item?.count) || 0), 0), [sourceData]);

  const genderDataMemo = useMemo(() => {
    const genders = ["Мужской", "Женский"];
    return genders.map((gender) => ({
      gender,
      count: clients.filter((client) => 
        client.month === filters.month && 
        client.year === filters.year && 
        client.stage === gender
      ).length,
    }));
  }, [clients, filters.month, filters.year]);

  const typeClientDataMemo = useMemo(() => {
    const types = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
    return types.map((type) => ({
      type,
      count: clients.filter((client) => 
        client.month === filters.month && 
        client.year === filters.year && 
        client.typeClient === type
      ).length,
    }));
  }, [clients, filters.month, filters.year]);

  useEffect(() => {
    setGenderData(genderDataMemo);
    setTypeClientData(typeClientDataMemo);
  }, [genderDataMemo, typeClientDataMemo]);

  const maxStudents = Math.max(students, 1);
  const maxSource = Math.max(...sourceData.map((item) => item.count), 1);
  const maxGender = Math.max(...genderData.map((item) => item.count), 1);
  const maxTypeClient = Math.max(...typeClientData.map((item) => item.count), 1);

  if (error) return <p className="dashboard__error">Ошибка: {error}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title"></h1>
        <div className="dashboard__filters">
          <div className="dashboard__filter-group">
            <span className="dashboard__filter-icon">📅</span>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="dashboard__select"
              aria-label="Выберите месяц"
            >
              <option value="" disabled>Месяц</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="dashboard__select"
              aria-label="Выберите год"
            >
              <option value="" disabled>Год</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button className="dashboard__reset-btn" onClick={resetFilters}>
            <span className="dashboard__reset-icon">🔄</span> Сброс
          </button>
        </div>
      </div>
      {loading ? (
        <div className="dashboard__loading">
          <span className="dashboard__loading-spinner"></span> Загрузка...
        </div>
      ) : (
        <div className="dashboard__content">
          <div className="dashboard__card dashboard__card--students">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon">👥</span>
              <h2 className="dashboard__card-title">Ученики</h2>
            </div>
            <div className="dashboard__students">
              <div className="dashboard__students-item">
                <span className="dashboard__students-label">{filters.month} {filters.year}</span>
                <div className="dashboard__bar" style={{ width: `${(students / maxStudents) * 100}%` }}>
                  <span className="dashboard__bar-value">{students}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard__card dashboard__card--sources">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon">🌐</span>
              <h2 className="dashboard__card-title">Источники</h2>
            </div>
            <div className="dashboard__sources">
              <span className="dashboard__sources-total">Всего: {totalCount}</span>
              {sourceData.map((item, index) => (
                <div key={index} className="dashboard__sources-item">
                  <span className="dashboard__sources-label">{item.source}</span>
                  <div className="dashboard__bar" style={{ width: `${(item.count / maxSource) * 100}%` }}>
                    <span className="dashboard__bar-value">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard__card dashboard__card--gender">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon">⚥</span>
              <h2 className="dashboard__card-title">Пол</h2>
            </div>
            <div className="dashboard__gender">
              {genderData.map((item, index) => (
                <div key={index} className="dashboard__gender-item">
                  <span className="dashboard__gender-label">{item.gender}</span>
                  <div className="dashboard__bar" style={{ width: `${(item.count / maxGender) * 100}%` }}>
                    <span className="dashboard__bar-value">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard__card dashboard__card--type-client">
            <div className="dashboard__card-header">
              <span className="dashboard__card-icon">👤</span>
              <h2 className="dashboard__card-title">Типы клиентов</h2>
            </div>
            <div className="dashboard__type-client">
              {typeClientData.map((item, index) => (
                <div key={index} className="dashboard__type-client-item">
                  <span className="dashboard__type-client-label">{item.type}</span>
                  <div className="dashboard__bar" style={{ width: `${(item.count / maxTypeClient) * 100}%` }}>
                    <span className="dashboard__bar-value">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;