
// import React, { useState, useEffect } from "react";
// import { fetchClients } from "../../api/API";
// import { months, years, days, trainers, sports, paymentOptions } from "../../Constants/constants";
// import './Dosh.scss';

// const SelectField = ({ name, value, onChange, options, placeholder, className }) => (
//   <select
//     name={name}
//     value={value || ""}
//     onChange={onChange}
//     className={`dosh__select ${className || ""}`}
//     aria-label={placeholder}
//   >
//     <option value="" disabled>{placeholder}</option>
//     {options.map((option) => (
//       <option key={option} value={option}>{option}</option>
//     ))}
//   </select>
// );

// const Dosh = () => {
//   const [filters, setFilters] = useState({
//     year: "2025",
//     month: "",
//     day: "",
//     trainer: "",
//     sport_category: "",
//     typeClient: "",
//     payment: "",
//   });
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadClients = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const clientsData = await fetchClients();
//         if (!Array.isArray(clientsData)) {
//           throw new Error("Данные клиентов должны быть массивом");
//         }
//         setClients(clientsData.filter(client => 
//           client && 
//           typeof client.dataCassa === "string" && 
//           !isNaN(new Date(client.dataCassa)) && 
//           (typeof client.price === "string" || typeof client.price === "number") && 
//           !isNaN(parseFloat(client.price.replace(/[^0-9.]/g, "")))
//         ));
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

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleResetFilters = () => {
//     setFilters({
//       year: "2025",
//       month: "",
//       day: "",
//       trainer: "",
//       sport_category: "",
//       typeClient: "",
//       payment: "",
//     });
//   };

//   const distributeIncomeByDate = () => {
//     const hasFilters = Object.values(filters).some(value => value !== "" && value !== "2025");
//     if (!hasFilters) return {};

//     const incomeByDate = {};
//     clients.forEach(client => {
//       const { dataCassa, price, trainer, sport_category, typeClient, payment } = client;
//       const paymentDate = new Date(dataCassa);
//       if (paymentDate.toString() === "Invalid Date") return;

//       const cleanedPrice = parseFloat(price.replace(/[^0-9.]/g, "") || 0);
//       if (isNaN(cleanedPrice) || cleanedPrice <= 0) return;

//       const paymentMonth = months[paymentDate.getMonth()];
//       const paymentYear = paymentDate.getFullYear().toString();
//       const daysInMonth = new Date(paymentYear, paymentDate.getMonth() + 1, 0).getDate();
//       const remainingDaysInMonth = daysInMonth - paymentDate.getDate() + 1;

//       if ((filters.year && filters.year !== paymentYear) ||
//           (filters.month && filters.month !== paymentMonth) ||
//           (filters.day && filters.day !== paymentDate.getDate().toString()) ||
//           (filters.trainer && filters.trainer !== trainer) ||
//           (filters.sport_category && filters.sport_category !== sport_category) ||
//           (filters.typeClient && filters.typeClient !== typeClient) ||
//           (filters.payment && filters.payment !== payment)) {
//         return;
//       }

//       const daysInNextMonth = 30 - remainingDaysInMonth;
//       const pricePerDay = cleanedPrice / 30;
//       const currentMonthPrice = pricePerDay * remainingDaysInMonth;
//       const nextMonthPrice = pricePerDay * daysInNextMonth;

//       const currentMonthKey = `${paymentMonth} ${paymentYear}`;
//       const nextMonthKey = `${months[(paymentDate.getMonth() + 1) % 12]} ${paymentYear}`;

//       incomeByDate[currentMonthKey] = (incomeByDate[currentMonthKey] || 0) + currentMonthPrice;
//       if (daysInNextMonth > 0) {
//         incomeByDate[nextMonthKey] = (incomeByDate[nextMonthKey] || 0) + nextMonthPrice;
//       }
//     });

//     return incomeByDate;
//   };

//   const incomeByDate = distributeIncomeByDate();
//   const sortedIncomeByDate = Object.entries(incomeByDate).sort(([dateA], [dateB]) => {
//     const [monthA, yearA] = dateA.split(" ");
//     const [monthB, yearB] = dateB.split(" ");
//     const monthIndexA = months.indexOf(monthA);
//     const monthIndexB = months.indexOf(monthB);
//     return yearA !== yearB ? yearA.localeCompare(yearB) : monthIndexA - monthIndexB;
//   });

//   return (
//     <div className="dosh">
//       <div className="dosh__header">
//         <h1 className="dosh__title">Доход</h1>
//         <div className="dosh__filters-container">
//           <div className="dosh__filters">
//             <SelectField
//               name="year"
//               value={filters.year}
//               onChange={handleFilterChange}
//               options={years}
//               placeholder="Год"
//             />
//             <SelectField
//               name="month"
//               value={filters.month}
//               onChange={handleFilterChange}
//               options={months}
//               placeholder="Месяц"
//             />
//             <SelectField
//               name="day"
//               value={filters.day}
//               onChange={handleFilterChange}
//               options={days}
//               placeholder="День"
//             />
//             <SelectField
//               name="trainer"
//               value={filters.trainer}
//               onChange={handleFilterChange}
//               options={trainers}
//               placeholder="Тренер"
//             />
//             <SelectField
//               name="sport_category"
//               value={filters.sport_category}
//               onChange={handleFilterChange}
//               options={sports}
//               placeholder="Спорт"
//             />
//             <SelectField
//               name="typeClient"
//               value={filters.typeClient}
//               onChange={handleFilterChange}
//               options={["Обычный", "Пробный", "Индивидуальный", "Абонемент"]}
//               placeholder="Тип клиента"
//             />
//             <SelectField
//               name="payment"
//               value={filters.payment}
//               onChange={handleFilterChange}
//               options={paymentOptions.map(opt => opt.value)}
//               placeholder="Оплата"
//             />
//           </div>
//           <button
//             className="dosh__reset-btn"
//             onClick={handleResetFilters}
//             aria-label="Сбросить фильтры"
//           >
//             Сбросить
//           </button>
//         </div>
//       </div>
//       <div className={`dosh__content ${loading ? "dosh__content--loading" : ""}`}>
//         {loading ? (
//           <div className="dosh__loading">
//             <span className="dosh__loading-spinner"></span>
//             Загрузка...
//           </div>
//         ) : error ? (
//           <div className="dosh__error">{error}</div>
//         ) : (
//           <div className="dosh__results">
//             <h3 className="dosh__distribution-title">Распределение дохода</h3>
//             {sortedIncomeByDate.length > 0 ? (
//               <div className="dosh__cards">
//                 {sortedIncomeByDate.map(([date, amount]) => (
//                   <div key={date} className="dosh__card">
//                     <div className="dosh__card-header">{date}</div>
//                     <div className="dosh__card-content">
//                       <span className="dosh__card-amount">{amount.toFixed(2)} сом</span>
//                       <div
//                         className="dosh__bar"
//                         style={{ width: `${Math.min((amount / 10000) * 100, 100)}%` }}
//                         data-tooltip={`${amount.toFixed(2)} сом`}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="dosh__no-data">Выберите фильтры для отображения дохода</div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dosh;



// import React, { useState, useEffect } from "react";
// import { fetchClients } from "../../api/API";
// import { months, years, days, trainers, sports, paymentOptions } from "../../Constants/constants";
// import './Dosh.scss';

// const SelectField = ({ name, value, onChange, options, placeholder, className }) => (
//   <select
//     name={name}
//     value={value || ""}
//     onChange={onChange}
//     className={`dosh__select ${className || ""}`}
//     aria-label={placeholder}
//   >
//     <option value="" disabled>{placeholder}</option>
//     {options.map((option) => (
//       <option key={option} value={option}>{option}</option>
//     ))}
//   </select>
// );

// const Dosh = () => {
//   const [filters, setFilters] = useState({
//     year: "2025",
//     month: "",
//     day: "",
//     trainer: "",
//     sport_category: "",
//     typeClient: "",
//     payment: "",
//   });
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadClients = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const clientsData = await fetchClients();
//         if (!Array.isArray(clientsData)) {
//           throw new Error("Данные клиентов должны быть массивом");
//         }
//         setClients(clientsData.filter(client => 
//           client && 
//           typeof client.dataCassa === "string" && 
//           !isNaN(new Date(client.dataCassa)) && 
//           (typeof client.price === "string" || typeof client.price === "number") && 
//           !isNaN(parseFloat(client.price.replace(/[^0-9.]/g, "")))
//         ));
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

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleResetFilters = () => {
//     setFilters({
//       year: "2025",
//       month: "",
//       day: "",
//       trainer: "",
//       sport_category: "",
//       typeClient: "",
//       payment: "",
//     });
//   };

//   const distributeIncomeByDate = () => {
//     const hasFilters = Object.values(filters).some(value => value !== "" && value !== "2025");
//     if (!hasFilters) return {};

//     const incomeByDate = {};
//     clients.forEach(client => {
//       const { dataCassa, price, trainer, sport_category, typeClient, payment } = client;
//       const startDate = new Date(dataCassa);
//       if (startDate.toString() === "Invalid Date") return;

//       const cleanedPrice = parseFloat(price.replace(/[^0-9.]/g, "") || 0);
//       if (isNaN(cleanedPrice) || cleanedPrice <= 0) return;

//       const paymentMonth = months[startDate.getMonth()];
//       const paymentYear = startDate.getFullYear().toString();
//       const paymentDay = startDate.getDate().toString();

//       if ((filters.year && filters.year !== paymentYear) ||
//           (filters.day && filters.day !== paymentDay) ||
//           (filters.trainer && filters.trainer !== trainer) ||
//           (filters.sport_category && filters.sport_category !== sport_category) ||
//           (filters.typeClient && filters.typeClient !== typeClient) ||
//           (filters.payment && filters.payment !== payment)) {
//         return;
//       }

//       // Абонемент длится 30 дней
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
//       let secondMonthPrice = 0;

//       if (startMonth !== endMonth) {
//         // Абонемент переходит на следующий месяц
//         const daysInSecondMonth = endDate.getDate();
//         currentMonthPrice = (cleanedPrice * remainingDaysInStartMonth) / subscriptionDays;
//         secondMonthPrice = (cleanedPrice * daysInSecondMonth) / subscriptionDays;
//       }

//       const currentMonthKey = `${months[startMonth]} ${startYear}`;
//       const secondMonthKey = `${months[endMonth]} ${endYear}`;

//       if (!filters.month || filters.month === months[startMonth]) {
//         incomeByDate[currentMonthKey] = (incomeByDate[currentMonthKey] || 0) + currentMonthPrice;
//       }
//       if (secondMonthPrice > 0 && (!filters.month || filters.month === months[endMonth])) {
//         incomeByDate[secondMonthKey] = (incomeByDate[secondMonthKey] || 0) + secondMonthPrice;
//       }
//     });

//     return incomeByDate;
//   };

//   const incomeByDate = distributeIncomeByDate();
//   const sortedIncomeByDate = Object.entries(incomeByDate).sort(([dateA], [dateB]) => {
//     const [monthA, yearA] = dateA.split(" ");
//     const [monthB, yearB] = dateB.split(" ");
//     const monthIndexA = months.indexOf(monthA);
//     const monthIndexB = months.indexOf(monthB);
//     return yearA !== yearB ? yearA.localeCompare(yearB) : monthIndexA - monthIndexB;
//   });

//   const totalIncome = Object.values(incomeByDate).reduce((acc, amount) => acc + amount, 0);

//   return (
//     <div className="dosh">
//       <div className="dosh__header">
//         <h1 className="dosh__title">Доход</h1>
//         <div className="dosh__filters-container">
//           <div className="dosh__filters">
//             <SelectField
//               name="year"
//               value={filters.year}
//               onChange={handleFilterChange}
//               options={years}
//               placeholder="Год"
//             />
//             <SelectField
//               name="month"
//               value={filters.month}
//               onChange={handleFilterChange}
//               options={months}
//               placeholder="Месяц"
//             />
//             <SelectField
//               name="day"
//               value={filters.day}
//               onChange={handleFilterChange}
//               options={days}
//               placeholder="День"
//             />
//             <SelectField
//               name="trainer"
//               value={filters.trainer}
//               onChange={handleFilterChange}
//               options={trainers}
//               placeholder="Тренер"
//             />
//             <SelectField
//               name="sport_category"
//               value={filters.sport_category}
//               onChange={handleFilterChange}
//               options={sports}
//               placeholder="Спорт"
//             />
//             <SelectField
//               name="typeClient"
//               value={filters.typeClient}
//               onChange={handleFilterChange}
//               options={["Обычный", "Пробный", "Индивидуальный", "Абонемент"]}
//               placeholder="Тип клиента"
//             />
//             <SelectField
//               name="payment"
//               value={filters.payment}
//               onChange={handleFilterChange}
//               options={paymentOptions.map(opt => opt.value)}
//               placeholder="Оплата"
//             />
//           </div>
//           <button
//             className="dosh__reset-btn"
//             onClick={handleResetFilters}
//             aria-label="Сбросить фильтры"
//           >
//             Сбросить
//           </button>
//         </div>
//       </div>
//       <div className={`dosh__content ${loading ? "dosh__content--loading" : ""}`}>
//         {loading ? (
//           <div className="dosh__loading">
//             <span className="dosh__loading-spinner"></span>
//             Загрузка...
//           </div>
//         ) : error ? (
//           <div className="dosh__error">{error}</div>
//         ) : sortedIncomeByDate.length > 0 ? (
//           <div className="dosh__results">
//             <div className="dosh__total">Итого: {totalIncome.toFixed(2)} сом</div>
//             <h3 className="dosh__distribution-title">Распределение дохода</h3>
//             <div className="dosh__cards">
//               {sortedIncomeByDate.map(([date, amount]) => (
//                 <div key={date} className="dosh__card">
//                   <div className="dosh__card-header">{date}</div>
//                   <div className="dosh__card-content">
//                     <span className="dosh__card-amount">{amount.toFixed(2)} сом</span>
//                     <div
//                       className="dosh__bar"
//                       style={{ width: `${Math.min((amount / (totalIncome || 1)) * 100, 100)}%` }}
//                       data-tooltip={`${amount.toFixed(2)} сом`}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="dosh__no-data">Выберите фильтры для отображения дохода</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dosh;



import React, { useState, useEffect } from "react";
import { fetchClients } from "../../api/API";
import { months, years, days, trainers, sports, paymentOptions } from "../../Constants/constants";
import { FaCalendarAlt, FaTimes, FaMoneyBillWave, FaFilter, FaUser } from "react-icons/fa";
import './Dosh.scss';

const SelectField = ({ name, value, onChange, options, placeholder, className, icon }) => (
  <div className="dosh__select-group">
    {icon}
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`dosh__select ${className || ""}`}
      aria-label={placeholder}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const Dosh = () => {
  const [filters, setFilters] = useState({
    year: "2025",
    month: "",
    day: "",
    trainer: "",
    sport_category: "",
    typeClient: "",
    payment: "",
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

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
          typeof client.dataCassa === "string" && 
          !isNaN(new Date(client.dataCassa)) && 
          (typeof client.price === "string" || typeof client.price === "number") && 
          !isNaN(parseFloat(client.price.toString().replace(/[^0-9.]/g, "")))
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
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      year: "2025",
      month: "",
      day: "",
      trainer: "",
      sport_category: "",
      typeClient: "",
      payment: "",
    });
  };

  const toggleFilters = () => {
    setIsFiltersVisible(prev => !prev);
  };

  const distributeIncomeByDate = () => {
    const hasFilters = Object.values(filters).some(value => value !== "" && value !== "2025");
    if (!hasFilters) return {};

    const incomeByDate = {};
    clients.forEach(client => {
      const { dataCassa, price, trainer, sport_category, typeClient, payment } = client;
      const startDate = new Date(dataCassa);
      if (startDate.toString() === "Invalid Date") return;

      const cleanedPrice = parseFloat(price.toString().replace(/[^0-9.]/g, "") || 0);
      if (isNaN(cleanedPrice) || cleanedPrice <= 0) return;

      const paymentMonth = months[startDate.getMonth()];
      const paymentYear = startDate.getFullYear().toString();
      const paymentDay = startDate.getDate().toString();

      if ((filters.year && filters.year !== paymentYear) ||
          (filters.month && filters.month !== paymentMonth) ||
          (filters.day && filters.day !== paymentDay) ||
          (filters.trainer && filters.trainer !== trainer) ||
          (filters.sport_category && filters.sport_category !== sport_category) ||
          (filters.typeClient && filters.typeClient !== typeClient) ||
          (filters.payment && filters.payment !== payment)) {
        return;
      }

      const subscriptionDays = 30;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + subscriptionDays - 1);

      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endYear = endDate.getFullYear();

      const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
      const remainingDaysInStartMonth = daysInStartMonth - startDate.getDate() + 1;
      let currentMonthPrice = cleanedPrice;
      let secondMonthPrice = 0;

      if (startMonth !== endMonth || startYear !== endYear) {
        const daysInSecondMonth = endDate.getDate();
        currentMonthPrice = (cleanedPrice * remainingDaysInStartMonth) / subscriptionDays;
        secondMonthPrice = (cleanedPrice * daysInSecondMonth) / subscriptionDays;
      }

      const currentMonthKey = `${months[startMonth]} ${startYear}`;
      const secondMonthKey = `${months[endMonth % 12]} ${endYear}`;

      if (!filters.month || filters.month === months[startMonth]) {
        incomeByDate[currentMonthKey] = (incomeByDate[currentMonthKey] || 0) + currentMonthPrice;
      }
      if (secondMonthPrice > 0 && (!filters.month || filters.month === months[endMonth % 12])) {
        incomeByDate[secondMonthKey] = (incomeByDate[secondMonthKey] || 0) + secondMonthPrice;
      }
    });

    return incomeByDate;
  };

  const incomeByDate = distributeIncomeByDate();
  const sortedIncomeByDate = Object.entries(incomeByDate).sort(([dateA], [dateB]) => {
    const [monthA, yearA] = dateA.split(" ");
    const [monthB, yearB] = dateB.split(" ");
    const monthIndexA = months.indexOf(monthA);
    const monthIndexB = months.indexOf(monthB);
    return yearA !== yearB ? yearA.localeCompare(yearB) : monthIndexA - monthIndexB;
  });

  const totalIncome = Object.values(incomeByDate).reduce((acc, amount) => acc + amount, 0);

  return (
    <div className="dosh">
      <div className="dosh__header">
        <h1 className="dosh__title">Доход</h1>
        <div className="dosh__filters-container">
          <button
            className="dosh__toggle-filters"
            onClick={toggleFilters}
            aria-label={isFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
          >
            <FaFilter size={14} />
          </button>
          <div className={`dosh__filters ${isFiltersVisible ? '' : 'dosh__filters--hidden'}`}>
            <SelectField
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              options={years}
              placeholder="Год"
              icon={<FaCalendarAlt size={14} />}
            />
            <SelectField
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              options={months}
              placeholder="Месяц"
              icon={<FaCalendarAlt size={14} />}
            />
            <SelectField
              name="day"
              value={filters.day}
              onChange={handleFilterChange}
              options={days}
              placeholder="День"
              icon={<FaCalendarAlt size={14} />}
            />
            <SelectField
              name="trainer"
              value={filters.trainer}
              onChange={handleFilterChange}
              options={trainers}
              placeholder="Тренер"
              icon={<FaUser size={14} />}
            />
            <SelectField
              name="sport_category"
              value={filters.sport_category}
              onChange={handleFilterChange}
              options={sports}
              placeholder="Спорт"
              icon={<FaUser size={14} />}
            />
            <SelectField
              name="typeClient"
              value={filters.typeClient}
              onChange={handleFilterChange}
              options={["Обычный", "Пробный", "Индивидуальный", "Абонемент"]}
              placeholder="Тип клиента"
              icon={<FaUser size={14} />}
            />
            <SelectField
              name="payment"
              value={filters.payment}
              onChange={handleFilterChange}
              options={paymentOptions.map(opt => opt.value)}
              placeholder="Оплата"
              icon={<FaMoneyBillWave size={14} />}
            />
            <button
              className="dosh__reset-btn"
              onClick={handleResetFilters}
              aria-label="Сбросить фильтры"
            >
              <FaTimes size={14} /> Сбросить
            </button>
          </div>
        </div>
      </div>
      <div className={`dosh__content ${loading ? "dosh__content--loading" : ""}`}>
        {loading ? (
          <div className="dosh__loading">
            <span className="dosh__loading-spinner"></span>
            Загрузка...
          </div>
        ) : error ? (
          <div className="dosh__error">{error}</div>
        ) : sortedIncomeByDate.length > 0 ? (
          <div className="dosh__results">
            <div className="dosh__total">
              <FaMoneyBillWave size={16} /> Итого: {totalIncome.toFixed(2)} сом
            </div>
            <h3 className="dosh__distribution-title">Распределение дохода</h3>
            <div className="dosh__cards">
              {sortedIncomeByDate.map(([date, amount], index) => (
                <div
                  key={date}
                  className="dosh__card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="dosh__card-header">{date}</div>
                  <div className="dosh__card-content">
                    <span className="dosh__card-amount">
                      <FaMoneyBillWave size={14} /> {amount.toFixed(2)} сом
                    </span>
                    <div
                      className="dosh__bar"
                      style={{ width: `${Math.min((amount / (totalIncome || 1)) * 100, 100)}%` }}
                      data-tooltip={`${amount.toFixed(2)} сом`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dosh__no-data">Выберите фильтры для отображения дохода</div>
        )}
      </div>
    </div>
  );
};

export default Dosh;