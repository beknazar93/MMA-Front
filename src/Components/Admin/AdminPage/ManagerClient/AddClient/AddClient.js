// import React, { useState, useEffect } from "react";
// import { addClient, fetchClients } from "../../api/API";
// import { formFieldConfig, errorMessages } from "../../Constants/constants";
// import './AddClient.scss';

// const InputField = ({ name, value, onChange, type = "text", placeholder, className, readOnly }) => (
//   <input
//     type={type}
//     name={name}
//     value={value || ""}
//     onChange={onChange}
//     placeholder={placeholder}
//     className={`client-form__input ${className || ""}`}
//     readOnly={readOnly}
//     autoComplete="off"
//     aria-label={placeholder}
//   />
// );

// const SelectField = ({ name, value, onChange, options, placeholder, className }) => (
//   <select
//     name={name}
//     value={value || ""}
//     onChange={onChange}
//     className={`client-form__select ${className || ""}`}
//     aria-label={placeholder}
//   >
//     <option value="" disabled>{placeholder}</option>
//     {options.map((option) => (
//       <option key={option} value={option}>{option}</option>
//     ))}
//   </select>
// );

// const AddClient = () => {
//   const managerName = localStorage.getItem("manager_name") || "Unknown Manager";

//   const [formData, setFormData] = useState({
//     name: "", email: "", phone: "", stage: "", trainer: "", sport_category: "",
//     year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "", check_field: "",
//     dataCassa: "", typeClient: ""
//   });
//   const [invalidFields, setInvalidFields] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState([]);

//   useEffect(() => {
//     const loadClients = async () => {
//       try {
//         const clientsData = await fetchClients();
//         setClients(clientsData);
//       } catch (error) {
//         console.error("Ошибка загрузки клиентов:", error);
//       }
//     };
//     loadClients();
//     return () => setClients([]); // Очистка при размонтировании
//   }, []);

//   const validateForm = () => {
//     const invalid = formFieldConfig
//       .filter(field => field.required && (!formData[field.name] || formData[field.name].trim() === ""))
//       .map(field => field.name);
//     if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
//       invalid.push("price");
//     }
//     if (!formData.dataCassa) {
//       invalid.push("dataCassa");
//     }
//     if (!formData.typeClient) {
//       invalid.push("typeClient");
//     }
//     setInvalidFields([...new Set(invalid)]);
//     return invalid.length === 0;
//   };

//   const checkForDuplicate = () => {
//     const { name, month, year, sport_category } = formData;
//     return clients.some(client =>
//       client.name.trim().toLowerCase() === name.trim().toLowerCase() &&
//       client.month.trim().toLowerCase() === month.trim().toLowerCase() &&
//       client.year === year &&
//       client.sport_category.trim().toLowerCase() === sport_category.trim().toLowerCase()
//     );
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "year") return;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === "phone" ? value.replace(/\D/g, "") : name === "price" ? value.replace(/[^0-9.]/g, "") : value
//     }));
//     setInvalidFields(prev => prev.filter(field => field !== name));
//   };

//   const calculateDiscountedPrice = () => {
//     const price = parseFloat(formData.price);
//     if (isNaN(price) || price <= 0) return "";
//     if (formData.sale === "15%") return (price * 0.85).toFixed(2);
//     if (formData.sale === "20%") return (price * 0.80).toFixed(2);
//     return price.toString();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       alert("Заполните корректно все обязательные поля.");
//       return;
//     }
//     if (checkForDuplicate()) {
//       alert(errorMessages.duplicateClient);
//       return;
//     }
//     setLoading(true);
//     try {
//       const updatedComment = formData.comment
//         ? `${formData.comment.trim()}\n(Добавил: ${managerName})`
//         : `(Добавил: ${managerName})`;
//       const updatedFormData = {
//         ...formData,
//         comment: updatedComment,
//         price: calculateDiscountedPrice()
//       };
//       await addClient(updatedFormData);
//       alert("Клиент успешно добавлен!");
//       setFormData({
//         name: "", email: "", phone: "", stage: "", trainer: "", sport_category: "",
//         year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "", check_field: "",
//         dataCassa: "", typeClient: ""
//       });
//       setInvalidFields([]);
//       const clientsData = await fetchClients();
//       setClients(clientsData);
//     } catch (error) {
//       console.error("Ошибка добавления клиента:", error);
//       alert(errorMessages.addClientError);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fieldPairs = [
//     [
//       formFieldConfig.find(f => f.name === "name"),
//       formFieldConfig.find(f => f.name === "phone")
//     ],
//     [
//       formFieldConfig.find(f => f.name === "sport_category"),
//       formFieldConfig.find(f => f.name === "trainer")
//     ],
//     [
//       formFieldConfig.find(f => f.name === "email"),
//       formFieldConfig.find(f => f.name === "year")
//     ],
//     [
//       formFieldConfig.find(f => f.name === "month"),
//       formFieldConfig.find(f => f.name === "day")
//     ],
//     [
//       { name: "dataCassa", type: "date", placeholder: "Дата оплаты", required: true },
//       formFieldConfig.find(f => f.name === "sale"),
//     ],
//     [
//       formFieldConfig.find(f => f.name === "price"),
//       formFieldConfig.find(f => f.name === "payment"),
//     ],
//     [
//       formFieldConfig.find(f => f.name === "check_field"),
//       { name: "typeClient", type: "select", placeholder: "Тип клиента", options: ["Обычный", "Пробный", "Индивидуальный", "Абонемент"], required: true }
//     ],
//     [
//       formFieldConfig.find(f => f.name === "comment"),
//       formFieldConfig.find(f => f.name === "stage"),
//     ],
//   ].filter(pair => pair[0] && pair[1]);

//   return (
//     <form className="client-form" onSubmit={handleSubmit}>
//       <div className="client-form__grid">
//         {fieldPairs.map((pair, index) => (
//           <div key={index} className="client-form__pair">
//             {pair.map(field => (
//               <div key={field.name} className="client-form__field">
//                 {field.type === "select" ? (
//                   <SelectField
//                     name={field.name}
//                     value={formData[field.name]}
//                     onChange={handleInputChange}
//                     options={field.options}
//                     placeholder={field.placeholder}
//                     className={invalidFields.includes(field.name) ? "client-form__input--error" : ""}
//                   />
//                 ) : field.type === "textarea" ? (
//                   <textarea
//                     name={field.name}
//                     value={formData[field.name]}
//                     onChange={handleInputChange}
//                     placeholder={field.placeholder}
//                     className={`client-form__textarea ${invalidFields.includes(field.name) ? "client-form__input--error" : ""}`}
//                     aria-label={field.placeholder}
//                   />
//                 ) : (
//                   <InputField
//                     name={field.name}
//                     value={formData[field.name]}
//                     onChange={handleInputChange}
//                     type={field.type}
//                     placeholder={field.placeholder}
//                     readOnly={field.readOnly}
//                     className={invalidFields.includes(field.name) ? "client-form__input--error" : ""}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         ))}
//         <div className="client-form__pair client-form__price-display">
//           <div className="client-form__field">
//             <span className="client-form__price-value">
//               {formData.price ? `${calculateDiscountedPrice()} сом` : "Итог: не указана"}
//             </span>
//           </div>
//         </div>
//       </div>
//       <button
//         className={`client-form__button ${loading ? "client-form__button--loading" : ""}`}
//         type="submit"
//         disabled={loading}
//         aria-label="Добавить клиента"
//       >
//         {loading ? <span className="client-form__spinner"></span> : "Добавить"}
//       </button>
//     </form>
//   );
// };

// export default AddClient;



// src/components/AddClient/AddClient.jsx
import React, { useState, useEffect, useMemo } from "react";
import { addClient, fetchClients } from "../../api/API";
import {
  formFieldConfig,
  errorMessages,
  trainers,
  sports, // берём ровно как в constants.js
} from "../../Constants/constants";
import "./AddClient.scss";

/* ===== жёсткая связка тренер ↔ спорт (строки из constants.js) ===== */
const TRAINER_TO_SPORT = {
  "Машрапов Тилек": "Кулату",
  "Мойдунов Мирлан": "Кулату",
  "Асанбаев Эрлан": "Кулату",
  "Пазылов Кутман": "Борьба",
  "Жумалы Уулу Ариет": "Борьба",
  "Машрапов Жумабай": "Борьба",
  "Калмамат Уулу Акай": "Дзюдо",
  "Тажибаев Азамат": "Кроссфит",
  "Усабаев Эрбол": "Бокс",
  "Тургунов Ислам": "Бокс",
  "Азизбек Уулу Баяман": "Бокс",
  "Медербек Уулу Сафармурат": "Тхэквондо",
  "Сыдыков Алайбек": "Кикбокс",
  "Минбаев Сулайман": "Греко-римская борьба",
};

// строим «спорт → [тренеры]» из массивов и мапы
const SPORT_TO_TRAINERS = sports.reduce((acc, s) => (acc[s] = [], acc), {});
Object.entries(TRAINER_TO_SPORT).forEach(([t, s]) => {
  if (SPORT_TO_TRAINERS[s]) SPORT_TO_TRAINERS[s].push(t);
});

const InputField = ({ name, value, onChange, type = "text", placeholder, className, readOnly }) => (
  <input
    type={type}
    name={name}
    value={value || ""}
    onChange={onChange}
    placeholder={placeholder}
    className={`client-form__input ${className || ""}`}
    readOnly={readOnly}
    autoComplete="off"
    aria-label={placeholder}
  />
);

const SelectField = ({ name, value, onChange, options, placeholder, className, disabled }) => (
  <select
    name={name}
    value={value || ""}
    onChange={onChange}
    className={`client-form__select ${className || ""}`}
    aria-label={placeholder}
    disabled={disabled}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

const AddClient = () => {
  const managerName = localStorage.getItem("manager_name") || "Unknown Manager";

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", stage: "", trainer: "", sport_category: "",
    year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "",
    check_field: "", dataCassa: "", typeClient: ""
  });
  const [invalidFields, setInvalidFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchClients();
        setClients(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Ошибка загрузки клиентов:", e);
      }
    };
    load();
    return () => setClients([]);
  }, []);

  /* ===== доступные варианты по выбору ===== */
  const availableTrainers = useMemo(() => {
    if (!formData.sport_category) return trainers;
    return SPORT_TO_TRAINERS[formData.sport_category] || [];
  }, [formData.sport_category]);

  const availableSports = useMemo(() => {
    if (!formData.trainer) return sports;
    const s = TRAINER_TO_SPORT[formData.trainer];
    return s ? [s] : sports;
  }, [formData.trainer]);

  /* ===== валидация (только подсветка полей) ===== */
  const validateForm = () => {
    const invalid = formFieldConfig
      .filter((f) => f.required && (!formData[f.name] || String(formData[f.name]).trim() === ""))
      .map((f) => f.name);

    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) invalid.push("price");
    if (!formData.dataCassa) invalid.push("dataCassa");
    if (!formData.typeClient) invalid.push("typeClient");

    setInvalidFields([...new Set(invalid)]);
    return invalid.length === 0;
  };

  const checkForDuplicate = () => {
    const { name, month, year, sport_category } = formData;
    const n = String(name || "").trim().toLowerCase();
    const m = String(month || "").trim().toLowerCase();
    const sc = String(sport_category || "").trim().toLowerCase();
    return clients.some((c) =>
      String(c.name || "").trim().toLowerCase() === n &&
      String(c.month || "").trim().toLowerCase() === m &&
      String(c.year || "") === String(year) &&
      String(c.sport_category || "").trim().toLowerCase() === sc
    );
  };

  /* ===== изменения полей ===== */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "year") return; // год не меняем вручную

    if (name === "sport_category") {
      setFormData((prev) => {
        const validTrainer = prev.trainer && TRAINER_TO_SPORT[prev.trainer] === value;
        return { ...prev, sport_category: value, trainer: validTrainer ? prev.trainer : "" };
      });
      setInvalidFields((prev) => prev.filter((f) => f !== name && f !== "trainer"));
      return;
    }

    if (name === "trainer") {
      const sport = TRAINER_TO_SPORT[value] || "";
      setFormData((prev) => ({
        ...prev,
        trainer: value,
        sport_category: sport || prev.sport_category,
      }));
      setInvalidFields((prev) => prev.filter((f) => f !== name && f !== "sport_category"));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "")
          : name === "price"
          ? value.replace(/[^0-9.]/g, "")
          : value,
    }));
    setInvalidFields((prev) => prev.filter((f) => f !== name));
  };

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) return "";
    if (formData.sale === "15%") return (price * 0.85).toFixed(2);
    if (formData.sale === "20%") return (price * 0.8).toFixed(2);
    return price.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (checkForDuplicate()) {
      // подсветим ключевые поля дубликата, без текста
      setInvalidFields((prev) => [...new Set([...prev, "name", "month", "year", "sport_category"])]);
      return;
    }

    setLoading(true);
    try {
      const updatedComment = formData.comment
        ? `${formData.comment.trim()}\n(Добавил: ${managerName})`
        : `(Добавил: ${managerName})`;

      const payload = {
        ...formData,
        comment: updatedComment,
        price: calculateDiscountedPrice(),
      };

      await addClient(payload);

      // без текстовых уведомлений — просто очищаем форму
      setFormData({
        name: "", email: "", phone: "", stage: "", trainer: "", sport_category: "",
        year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "",
        check_field: "", dataCassa: "", typeClient: ""
      });
      setInvalidFields([]);

      const data = await fetchClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Ошибка добавления клиента:", e);
      // без текстового баннера
    } finally {
      setLoading(false);
    }
  };

  const fieldPairs = [
    ["name", "phone"],
    ["sport_category", "trainer"],
    ["email", "year"],
    ["month", "day"],
    [{ name: "dataCassa", type: "date", placeholder: "Дата оплаты", required: true }, "sale"],
    ["price", "payment"],
    ["check_field", { name: "typeClient", type: "select", placeholder: "Тип клиента", options: ["Обычный", "Пробный", "Индивидуальный", "Абонемент"], required: true }],
    ["comment", "stage"],
  ].map((pair) =>
    pair.map((f) => (typeof f === "string" ? formFieldConfig.find((x) => x.name === f) : f))
  ).filter((pair) => pair[0] && pair[1]);

  const renderField = (field) => {
    const name = field.name;
    const isSelect = field.type === "select";
    const isTextarea = field.type === "textarea";

    let options = field.options;
    let disabled = false;

    if (name === "trainer") options = availableTrainers;
    if (name === "sport_category") {
      options = availableSports;
      disabled = availableSports.length === 1;
    }

    if (isSelect) {
      return (
        <SelectField
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          options={options}
          placeholder={field.placeholder}
          className={invalidFields.includes(name) ? "client-form__input--error" : ""}
          disabled={disabled}
        />
      );
    }
    if (isTextarea) {
      return (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          className={`client-form__textarea ${invalidFields.includes(name) ? "client-form__input--error" : ""}`}
          aria-label={field.placeholder}
        />
      );
    }
    return (
      <InputField
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        type={field.type}
        placeholder={field.placeholder}
        readOnly={field.readOnly}
        className={invalidFields.includes(name) ? "client-form__input--error" : ""}
      />
    );
  };

  return (
    <form className="client-form" onSubmit={handleSubmit} noValidate>
      {/* — НИКАКИХ текстовых подсказок/баннеров — */}
      <div className="client-form__grid">
        {fieldPairs.map((pair, idx) => (
          <div key={idx} className="client-form__pair">
            {pair.map((field) => (
              <div key={field.name} className="client-form__field">
                {renderField(field)}
              </div>
            ))}
          </div>
        ))}

        <div className="client-form__pair client-form__price-display">
          <div className="client-form__field">
            <span className="client-form__price-value">
              {formData.price ? `${calculateDiscountedPrice()} сом` : "Итог: не указана"}
            </span>
          </div>
        </div>
      </div>

      <button
        className={`client-form__button ${loading ? "client-form__button--loading" : ""}`}
        type="submit"
        disabled={loading}
        aria-label="Добавить клиента"
      >
        {loading ? <span className="client-form__spinner" /> : "Добавить"}
      </button>
    </form>
  );
};

export default AddClient;
