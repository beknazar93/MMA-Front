// import React, { useState, useEffect } from "react";
// import { fetchClients } from "../../api/API";
// import { trainers, sports, checkFieldOptions, months, years } from "../../Constants/constants";
// import { FaCalendarAlt, FaTimes, FaUser } from "react-icons/fa";
// import './Trainers.scss';

// const TrainerCard = ({ trainer, clients, onClick, selectedMonth, selectedYear }) => {
//   return (
//     <div className="trainers__card" onClick={() => onClick(trainer)}>
//       <div className="trainers__avatar">
//         <FaUser className="trainers__avatar-icon" />
//       </div>
//       <h3 className="trainers__name">{trainer}</h3>
//       <button className="trainers__button" aria-label={`Подробнее о ${trainer}`}>
//         Подробнее
//       </button>
//     </div>
//   );
// };

// const TrainerModal = ({ trainer, clients, onClose, selectedMonth, selectedYear }) => {
//   const [activeSection, setActiveSection] = useState("sports");

//   const trainerClients = clients.filter(
//     (client) =>
//       client?.trainer === trainer &&
//       (!selectedMonth || client?.month === selectedMonth) &&
//       (!selectedYear || client?.year === selectedYear)
//   );
//   const sportsTaught = [...new Set(trainerClients.map((client) => client?.sport_category))].filter((sport) =>
//     sports.includes(sport)
//   );
//   const totalStudents = new Set(trainerClients.map((client) => client?.id)).size;
//   const clientTypes = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
//   const typeCounts = clientTypes.reduce(
//     (acc, type) => {
//       acc[type] = trainerClients.filter((client) => client?.typeClient === type).length;
//       return acc;
//     },
//     {}
//   );
//   const genders = ["Мужской", "Женский"];
//   const genderCounts = genders.reduce(
//     (acc, gender) => {
//       acc[gender] = trainerClients.filter((client) => client?.stage === gender).length;
//       return acc;
//     },
//     {}
//   );
//   const sources = checkFieldOptions;
//   const sourceCounts = sources.reduce(
//     (acc, source) => {
//       acc[source] = trainerClients.filter((client) => client?.check_field === source).length;
//       return acc;
//     },
//     {}
//   );

//   const sections = [
//     {
//       id: "sports",
//       title: "Виды спорта",
//       content: (
//         <ul className="trainers__modal-list">
//           {sportsTaught.length > 0 ? (
//             sportsTaught.map((sport) => (
//               <li key={sport} className="trainers__modal-item"><FaUser size={14} /> {sport}</li>
//             ))
//           ) : (
//             <li className="trainers__modal-item">Нет данных</li>
//           )}
//         </ul>
//       ),
//     },
//     {
//       id: "students",
//       title: `Ученики: ${totalStudents}`,
//       content: (
//         <ul className="trainers__modal-list">
//           {trainerClients.length > 0 ? (
//             trainerClients.map((client) => (
//               <li key={client.id} className="trainers__modal-item">
//                 <FaUser size={14} /> {client.name || "Клиент"} ({client.sport_category})
//               </li>
//             ))
//           ) : (
//             <li className="trainers__modal-item">Нет учеников</li>
//           )}
//         </ul>
//       ),
//     },
//     {
//       id: "types",
//       title: "Типы клиентов",
//       content: (
//         <ul className="trainers__modal-list">
//           {clientTypes.map((type) => (
//             <li key={type} className="trainers__modal-item"><FaUser size={14} /> {type}: {typeCounts[type]}</li>
//           ))}
//         </ul>
//       ),
//     },
//     {
//       id: "genders",
//       title: "Пол",
//       content: (
//         <ul className="trainers__modal-list">
//           {genders.map((gender) => (
//             <li key={gender} className="trainers__modal-item"><FaUser size={14} /> {gender}: {genderCounts[gender]}</li>
//           ))}
//         </ul>
//       ),
//     },
//     {
//       id: "sources",
//       title: "Источники",
//       content: (
//         <ul className="trainers__modal-list">
//           {sources.map((source) => (
//             <li key={source} className="trainers__modal-item"><FaUser size={14} /> {source}: {sourceCounts[source]}</li>
//           ))}
//         </ul>
//       ),
//     },
//   ];

//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleEsc);
//     return () => window.removeEventListener("keydown", handleEsc);
//   }, [onClose]);

//   return (
//     <div className="trainers__modal-overlay" onClick={onClose}>
//       <div className="trainers__modal" onClick={(e) => e.stopPropagation()}>
//         <h2 className="trainers__modal-title">{trainer}</h2>
//         <button className="trainers__modal-close" onClick={onClose} aria-label="Закрыть">
//           <FaTimes />
//         </button>
//         <div className="trainers__modal-tabs">
//           {sections.map((section) => (
//             <button
//               key={section.id}
//               className={`trainers__modal-tab ${activeSection === section.id ? "trainers__modal-tab--active" : ""}`}
//               onClick={() => setActiveSection(section.id)}
//             >
//               {section.title}
//             </button>
//           ))}
//         </div>
//         <div className="trainers__modal-content">{sections.find((section) => section.id === activeSection)?.content}</div>
//       </div>
//     </div>
//   );
// };

// const Trainers = () => {
//   const [clients, setClients] = useState([]);
//   const [selectedTrainer, setSelectedTrainer] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(null);
//   const [selectedYear, setSelectedYear] = useState("2025");

//   useEffect(() => {
//     const loadClients = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const clientsData = await fetchClients();
//         if (!Array.isArray(clientsData)) {
//           throw new Error("Данные клиентов должны быть массивом");
//         }
//         setClients(clientsData.filter(client => client && client.id));
//       } catch (error) {
//         console.error("Ошибка загрузки клиентов:", error);
//         setError("Не удалось загрузить данные клиентов");
//         setClients([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadClients();
//   }, []);

//   const openModal = (trainer) => setSelectedTrainer(trainer);
//   const closeModal = () => setSelectedTrainer(null);

//   const resetFilters = () => {
//     setSelectedMonth(null);
//     setSelectedYear("2025");
//   };

//   return (
//     <div className="trainers">
//       <div className="trainers__header">
//         <h1 className="trainers__title">Тренеры</h1>
//       </div>
//       <div className="trainers__filters">
//         <div className="trainers__filter-group">
//           <FaCalendarAlt className="trainers__filter-icon" />
//           <select
//             className="trainers__filter"
//             value={selectedMonth || ""}
//             onChange={(e) => setSelectedMonth(e.target.value || null)}
//           >
//             <option value="">Все месяцы</option>
//             {months.map((month) => (
//               <option key={month} value={month}>
//                 {month}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="trainers__filter-group">
//           <FaCalendarAlt className="trainers__filter-icon" />
//           <select
//             className="trainers__filter"
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(e.target.value)}
//           >
//             {years.map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//         </div>
//         <button className="trainers__filter-reset" onClick={resetFilters}>
//           <FaTimes size={14} /> Сбросить
//         </button>
//       </div>
//       {loading ? (
//         <div className="trainers__loading">
//           <span className="trainers__loading-spinner"></span>
//           Загрузка...
//         </div>
//       ) : error ? (
//         <div className="trainers__error">{error}</div>
//       ) : (
//         <div className="trainers__grid">
//           {trainers.map((trainer, index) => (
//             <div
//               key={trainer}
//               className="trainers__card-wrapper"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <TrainerCard
//                 trainer={trainer}
//                 clients={clients}
//                 onClick={openModal}
//                 selectedMonth={selectedMonth}
//                 selectedYear={selectedYear}
//               />
//             </div>
//           ))}
//         </div>
//       )}
//       {selectedTrainer && (
//         <TrainerModal
//           trainer={selectedTrainer}
//           clients={clients}
//           onClose={closeModal}
//           selectedMonth={selectedMonth}
//           selectedYear={selectedYear}
//         />
//       )}
//     </div>
//   );
// };

// export default Trainers;


import React, { useState, useEffect } from "react";
import { fetchClients } from "../../api/API";
import { trainers, sports, checkFieldOptions, months, years, formFieldConfig } from "../../Constants/constants";
import { FaCalendarAlt, FaTimes, FaUser } from "react-icons/fa";
import './Trainers.scss';

const TrainerCard = ({ trainer, clients, onClick, selectedMonth, selectedYear }) => {
  return (
    <div className="trainers__card" onClick={() => onClick(trainer)}>
      <div className="trainers__avatar">
        <FaUser className="trainers__avatar-icon" />
      </div>
      <h3 className="trainers__name">{trainer}</h3>
      <button className="trainers__button" aria-label={`Подробнее о ${trainer}`}>
        Подробнее
      </button>
    </div>
  );
};

const TrainerModal = ({ trainer, clients, onClose, selectedMonth, selectedYear }) => {
  const [activeSection, setActiveSection] = useState("sports");

  // Безопасное извлечение clientTypes и genders с запасными значениями
  const clientTypesField = formFieldConfig.find(f => f.name === "typeClient");
  const gendersField = formFieldConfig.find(f => f.name === "stage");
  const clientTypes = clientTypesField?.options || ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
  const genders = gendersField?.options || ["Мужской", "Женский"];

  const trainerClients = clients.filter(
    (client) =>
      client?.trainer?.trim() === trainer.trim() &&
      (!selectedMonth || client?.month === selectedMonth) &&
      (!selectedYear || client?.year === selectedYear) &&
      client?.sport_category &&
      client?.typeClient &&
      client?.stage &&
      client?.check_field
  );

  const sportsTaught = [...new Set(trainerClients.map((client) => client.sport_category))].filter((sport) =>
    sports.includes(sport)
  );
  const totalStudents = new Set(trainerClients.map((client) => client.id)).size;

  const typeCounts = clientTypes.reduce(
    (acc, type) => {
      acc[type] = trainerClients.filter((client) => client.typeClient === type).length;
      return acc;
    },
    {}
  );
  const genderCounts = genders.reduce(
    (acc, gender) => {
      acc[gender] = trainerClients.filter((client) => client.stage === gender).length;
      return acc;
    },
    {}
  );
  const sourceCounts = checkFieldOptions.reduce(
    (acc, source) => {
      acc[source] = trainerClients.filter((client) => client.check_field === source).length;
      return acc;
    },
    {}
  );

  const sections = [
    {
      id: "sports",
      title: "Виды спорта",
      content: (
        <ul className="trainers__modal-list">
          {sportsTaught.length > 0 ? (
            sportsTaught.map((sport) => (
              <li key={sport} className="trainers__modal-item" aria-label={`Спорт: ${sport}`}>
                <FaUser size={14} /> {sport}
              </li>
            ))
          ) : (
            <li className="trainers__modal-item" aria-label="Нет данных о видах спорта">Нет данных</li>
          )}
        </ul>
      ),
    },
    {
      id: "students",
      title: `Ученики: ${totalStudents}`,
      content: (
        <ul className="trainers__modal-list">
          {trainerClients.length > 0 ? (
            trainerClients.map((client) => (
              <li
                key={client.id}
                className="trainers__modal-item"
                aria-label={`Клиент: ${client.name}, Спорт: ${client.sport_category}`}
              >
                <FaUser size={14} /> {client.name || "Клиент"} ({client.sport_category})
              </li>
            ))
          ) : (
            <li className="trainers__modal-item" aria-label="Нет учеников">Нет учеников</li>
          )}
        </ul>
      ),
    },
    {
      id: "types",
      title: "Типы клиентов",
      content: (
        <ul className="trainers__modal-list">
          {clientTypes.map((type) => (
            <li key={type} className="trainers__modal-item" aria-label={`Тип клиента: ${type}, Количество: ${typeCounts[type]}`}>
              <FaUser size={14} /> {type}: {typeCounts[type]}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "genders",
      title: "Пол",
      content: (
        <ul className="trainers__modal-list">
          {genders.map((gender) => (
            <li key={gender} className="trainers__modal-item" aria-label={`Пол: ${gender}, Количество: ${genderCounts[gender]}`}>
              <FaUser size={14} /> {gender}: {genderCounts[gender]}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "sources",
      title: "Источники",
      content: (
        <ul className="trainers__modal-list">
          {checkFieldOptions.map((source) => (
            <li key={source} className="trainers__modal-item" aria-label={`Источник: ${source}, Количество: ${sourceCounts[source]}`}>
              <FaUser size={14} /> {source}: {sourceCounts[source]}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="trainers__modal-overlay" onClick={onClose}>
      <div className="trainers__modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="trainers__modal-title">{trainer}</h2>
        <button className="trainers__modal-close" onClick={onClose} aria-label="Закрыть">
          <FaTimes />
        </button>
        <div className="trainers__modal-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`trainers__modal-tab ${activeSection === section.id ? "trainers__modal-tab--active" : ""}`}
              onClick={() => setActiveSection(section.id)}
              aria-label={`Перейти к ${section.title}`}
            >
              {section.title}
            </button>
          ))}
        </div>
        <div className="trainers__modal-content">{sections.find((section) => section.id === activeSection)?.content}</div>
      </div>
    </div>
  );
};

const Trainers = () => {
  const [clients, setClients] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2025");

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const clientsData = await fetchClients();
        if (!Array.isArray(clientsData)) {
          throw new Error("Данные клиентов должны быть массивом");
        }
        setClients(clientsData.filter(client => 
          client && 
          client.id && 
          client.trainer && 
          client.month && 
          client.year && 
          client.sport_category && 
          client.typeClient && 
          client.stage && 
          client.check_field
        ));
      } catch (error) {
        console.error("Ошибка загрузки клиентов:", error);
        setError("Не удалось загрузить данные клиентов");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
    return () => setClients([]); // Очистка при размонтировании
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchClients()
      .then(clientsData => {
        if (!Array.isArray(clientsData)) {
          throw new Error("Данные клиентов должны быть массивом");
        }
        setClients(clientsData.filter(client => 
          client && 
          client.id && 
          client.trainer && 
          client.month && 
          client.year && 
          client.sport_category && 
          client.typeClient && 
          client.stage && 
          client.check_field
        ));
      })
      .catch(error => {
        console.error("Ошибка повторной загрузки клиентов:", error);
        setError("Не удалось загрузить данные клиентов");
      })
      .finally(() => setLoading(false));
  };

  const openModal = (trainer) => setSelectedTrainer(trainer);
  const closeModal = () => setSelectedTrainer(null);

  const resetFilters = () => {
    setSelectedMonth(null);
    setSelectedYear("2025");
  };

  return (
    <div className="trainers">
      <div className="trainers__header">
        <h1 className="trainers__title">Тренеры</h1>
      </div>
      <div className="trainers__filters">
        <div className="trainers__filter-group">
          <FaCalendarAlt className="trainers__filter-icon" />
          <select
            className="trainers__filter"
            value={selectedMonth || ""}
            onChange={(e) => setSelectedMonth(e.target.value || null)}
            aria-label="Выберите месяц"
          >
            <option value="">Все месяцы</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="trainers__filter-group">
          <FaCalendarAlt className="trainers__filter-icon" />
          <select
            className="trainers__filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Выберите год"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button className="trainers__filter-reset" onClick={resetFilters} aria-label="Сбросить фильтры">
          <FaTimes size={14} /> Сбросить
        </button>
      </div>
      {loading ? (
        <div className="trainers__loading">
          <span className="trainers__loading-spinner"></span>
          Загрузка...
        </div>
      ) : error ? (
        <div className="trainers__error">
          {error}
          <button
            className="trainers__retry-btn"
            onClick={handleRetry}
            aria-label="Повторить загрузку"
          >
            Повторить
          </button>
        </div>
      ) : (
        <div className="trainers__grid">
          {trainers.map((trainer, index) => (
            <div
              key={trainer}
              className="trainers__card-wrapper"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TrainerCard
                trainer={trainer}
                clients={clients}
                onClick={openModal}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          ))}
        </div>
      )}
      {selectedTrainer && (
        <TrainerModal
          trainer={selectedTrainer}
          clients={clients}
          onClose={closeModal}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      )}
    </div>
  );
};

export default Trainers;