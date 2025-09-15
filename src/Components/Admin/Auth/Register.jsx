import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag } from "react-icons/fa";
import "./Register.scss";

const API_URL = "https://testosh.pythonanywhere.com/register/";

const errorMessages = {
  "A user with that username already exists.": "Пользователь с таким именем уже существует.",
  "This email is already registered.": "Этот email уже зарегистрирован.",
  "Password must be at least 8 characters long.": "Пароль должен быть длиной не менее 8 символов.",
  "Ensure this field has at least 8 characters.": "Убедитесь, что это поле содержит не менее 8 символов.",
};

const translateError = (msg) => errorMessages[msg] || msg;

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "abytov247@gmail.com",
    password: "",
    role: "employee",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      await axios.post(API_URL, formData);
      alert("Регистрация прошла успешно!");
      navigate("/admin");
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        // соберём сообщения с учётом возможных массивов/строк
        const serverErrors = Object.values(data).flat().map(translateError);
        setErrors(serverErrors.length ? serverErrors : ["Ошибка регистрации."]);
      } else {
        setErrors(["Произошла неизвестная ошибка. Попробуйте позже."]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const form = document.querySelector(".register-form");
    if (form) form.classList.add("register-form--animate");
  }, []);

  return (
    <form onSubmit={handleRegister} className="register-form">
      {errors.length > 0 && (
        <div className="register-form__errors" role="alert">
          {errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      <div className="register-form__input-container">
        <FaUser className="register-form__icon" />
        <input
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={formData.username}
          onChange={handleInputChange}
          className="register-form__input"
          aria-label="Имя пользователя"
        />
      </div>

      <div className="register-form__input-container">
        <FaLock className="register-form__icon" />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleInputChange}
          className="register-form__input"
          aria-label="Пароль"
        />
      </div>

      <div className="register-form__input-container">
        <FaUserTag className="register-form__icon" />
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="register-form__select"
          aria-label="Роль"
        >
          <option value="">Выберите роль</option>
          <option value="admin">Администратор</option>
          <option value="client_manager">Менеджер</option>
          {/* <option value="product_manager">Менеджер продукта</option> */}
        </select>
      </div>

      <button
        type="submit"
        className="register-form__button"
        disabled={loading}
        aria-label="Зарегистрироваться"
      >
        {loading ? <span className="register-form__spinner" /> : "Зарегистрироваться"}
      </button>
    </form>
  );
};

export default Register;
