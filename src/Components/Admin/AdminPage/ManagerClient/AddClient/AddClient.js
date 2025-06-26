import React, { useState, useEffect } from "react";
import { addClient, fetchClients } from "../../api/API";
import { formFieldConfig, errorMessages } from "../../Constants/constants";
import './AddClient.scss';

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

const SelectField = ({ name, value, onChange, options, placeholder, className }) => (
  <select
    name={name}
    value={value || ""}
    onChange={onChange}
    className={`client-form__select ${className || ""}`}
    aria-label={placeholder}
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
    year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "", check_field: "",
    dataCassa: "", typeClient: ""
  });
  const [invalidFields, setInvalidFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Ошибка загрузки клиентов:", error);
      }
    };
    loadClients();
  }, []);

  const validateForm = () => {
    const invalid = formFieldConfig
      .filter(field => field.required && (!formData[field.name] || formData[field.name].trim() === ""))
      .map(field => field.name);
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
      invalid.push("price");
    }
    if (!formData.dataCassa) {
      invalid.push("dataCassa");
    }
    if (!formData.typeClient) {
      invalid.push("typeClient");
    }
    setInvalidFields([...new Set(invalid)]);
    return invalid.length === 0;
  };

  const checkForDuplicate = () => {
    const { name, month, year, sport_category } = formData;
    return clients.some(client =>
      client.name.toLowerCase() === name.toLowerCase() &&
      client.month.toLowerCase() === month.toLowerCase() &&
      client.year === year &&
      client.sport_category.toLowerCase() === sport_category.toLowerCase()
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "year") return;
    setFormData(prev => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/\D/g, "") : name === "price" ? value.replace(/[^0-9.]/g, "") : value
    }));
    setInvalidFields(prev => prev.filter(field => field !== name));
  };

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) return "";
    if (formData.sale === "15%") return (price * 0.85).toFixed(2);
    if (formData.sale === "20%") return (price * 0.80).toFixed(2);
    return price.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Заполните корректно все обязательные поля.");
      return;
    }
    if (checkForDuplicate()) {
      alert(errorMessages.duplicateClient);
      return;
    }
    setLoading(true);
    try {
      const updatedComment = formData.comment
        ? `${formData.comment}\n(Добавил: ${managerName})`
        : `(Добавил: ${managerName})`;
      const updatedFormData = {
        ...formData,
        comment: updatedComment,
        price: calculateDiscountedPrice()
      };
      await addClient(updatedFormData);
      alert("Клиент успешно добавлен!");
      setFormData({
        name: "", email: "", phone: "", stage: "", trainer: "", sport_category: "",
        year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "", check_field: "",
        dataCassa: "", typeClient: ""
      });
      setInvalidFields([]);
      const clientsData = await fetchClients();
      setClients(clientsData);
    } catch (error) {
      alert(errorMessages.addClientError);
    } finally {
      setLoading(false);
    }
  };

  const fieldPairs = [
    [
      formFieldConfig.find(f => f.name === "name"),
      formFieldConfig.find(f => f.name === "phone")
    ],
    [
      formFieldConfig.find(f => f.name === "sport_category"),
      formFieldConfig.find(f => f.name === "trainer")
    ],
    [
      formFieldConfig.find(f => f.name === "email"),
            formFieldConfig.find(f => f.name === "year")
      
    ],
    [
      formFieldConfig.find(f => f.name === "month"),
      formFieldConfig.find(f => f.name === "day")
    ],
    [
      { name: "dataCassa", type: "date", placeholder: "Дата оплаты", required: true },
      formFieldConfig.find(f => f.name === "sale"),
      
    ],
    [
      formFieldConfig.find(f => f.name === "price"),
      formFieldConfig.find(f => f.name === "payment"),
    ],
    [
      
      formFieldConfig.find(f => f.name === "check_field"),
      { name: "typeClient", type: "select", placeholder: "Тип клиента", options: ["Обычный", "Пробный", "Индивидуальный", "Абонемент"], required: true }
    ],
    [
      formFieldConfig.find(f => f.name === "comment"),
      formFieldConfig.find(f => f.name === "stage"),
    ],
    
  ].filter(pair => pair[0] && pair[1]);

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="client-form__grid">
        {fieldPairs.map((pair, index) => (
          <div key={index} className="client-form__pair">
            {pair.map(field => (
              <div key={field.name} className="client-form__field">
                {field.type === "select" ? (
                  <SelectField
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    options={field.options}
                    placeholder={field.placeholder}
                    className={invalidFields.includes(field.name) ? "client-form__input--error" : ""}
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={`client-form__textarea ${invalidFields.includes(field.name) ? "client-form__input--error" : ""}`}
                    aria-label={field.placeholder}
                  />
                ) : (
                  <InputField
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    type={field.type}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                    className={invalidFields.includes(field.name) ? "client-form__input--error" : ""}
                  />
                )}
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
        {loading ? <span className="client-form__spinner"></span> : "Добавить"}
      </button>
    </form>
  );
};

export default AddClient;