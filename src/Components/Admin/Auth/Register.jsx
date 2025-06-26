import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag } from "react-icons/fa";
import './Register.scss';

const errorMessages = {
  "A user with that username already exists.": "Пользователь с таким именем уже существует.",
  "This email is already registered.": "Этот email уже зарегистрирован.",
  "Password must be at least 8 characters long.": "Пароль должен быть длиной не менее 8 символов.",
  "Ensure this field has at least 8 characters.": "Убедитесь, что это поле содержит не менее 8 символов.",
};

const translateError = (error) => errorMessages[error] || error;

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
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      await axios.post("https://testosh.pythonanywhere.com/register/", formData);
      alert("Регистрация прошла успешно!");
      navigate("/admin");
    } catch (error) {
      if (error.response && error.response.data) {
        const serverErrors = Object.entries(error.response.data).map(
          ([, messages]) => messages.map(translateError).join(", ")
        );
        setErrors(serverErrors);
      } else {
        setErrors(["Произошла неизвестная ошибка. Попробуйте позже."]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const form = document.querySelector(".register-form");
    form.classList.add("register-form--animate");
  }, []);

  return (
    <form onSubmit={handleRegister} className="register-form">
      {errors.length > 0 && (
        <div className="register-form__errors">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
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