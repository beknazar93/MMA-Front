import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag } from "react-icons/fa";

const errorMessages = {
  "A user with that username already exists.":
    "Пользователь с таким именем уже существует.",
  "This email is already registered.": "Этот email уже зарегистрирован.",
  "Password must be at least 8 characters long.":
    "Пароль должен быть длиной не менее 8 символов.",
  "Ensure this field has at least 8 characters.":
    "Убедитесь, что это поле содержит не менее 8 символов.",
};

const translateError = (error) => {
  return errorMessages[error] || error;
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "abytov247@gmail.com", // Фиксированный email
    password: "",
    role: "employee",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      await axios.post(
        "https://testosh.pythonanywhere.com/register/",
        formData
      );
      alert("Регистрация прошла успешно!");
      navigate("/admin");
    } catch (error) {
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        const errorMessages = Object.entries(serverErrors).map(
          ([field, messages]) =>
            messages.map((msg) => translateError(msg)).join(", ")
        );
        setErrors(errorMessages);
      } else {
        setErrors(["Произошла неизвестная ошибка. Попробуйте позже."]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const form = document.querySelector(".registration-form");
    form.classList.add("registration-form--animate");
  }, []);

  return (
    <form onSubmit={handleRegister} className="registration-form">
      <h2 className="registration-form__title">Регистрация</h2>
      {errors.length > 0 && (
        <div className="registration-form__errors">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <div className="registration-form__input-container">
        <FaUser className="registration-form__icon" />
        <input
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={formData.username}
          onChange={handleInputChange}
          className="registration-form__input"
        />
      </div>
      <div className="registration-form__input-container">
        <FaLock className="registration-form__icon" />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleInputChange}
          className="registration-form__input"
        />
      </div>
      <div className="registration-form__input-container">
        <FaUserTag className="registration-form__icon" />
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="registration-form__select"
        >
          <option value="">Выберите Роль</option>
          <option value="admin">Администратор</option>
          <option value="client_manager">Менеджер по работе с клиентами</option>
          <option value="product_manager">Менеджер продукта</option>
        </select>
      </div>
      <button
        type="submit"
        className="registration-form__button"
        disabled={loading}
      >
        {loading ? (
          <span className="registration-form__loading">Регистрация...</span>
        ) : (
          "Регистрация"
        )}
      </button>
    </form>
  );
};

export default Register;