import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://testosh.pythonanywhere.com/login/",
        { username, password }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      const profileResponse = await axios.get(
        "https://testosh.pythonanywhere.com/profile/",
        { headers: { Authorization: `Bearer ${response.data.access}` } }
      );

      const userRole = profileResponse.data.role;
      const managerName = profileResponse.data.username;

      localStorage.setItem("manager_name", managerName);

      switch (userRole) {
        case "admin":
          navigate("/admin/AdminPanel");
          break;
        case "client_manager":
          navigate("/admin/AdminManager");
          break;
        case "product_manager":
          navigate("/admin/AdminProduct");
          break;
        default:
          setError("Неизвестная роль пользователя");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Неверное имя пользователя или пароль.");
      } else {
        setError("Ошибка подключения к серверу. Попробуйте позже.");
      }
      console.error("Ошибка входа:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const form = document.querySelector(".login-form");
    form.classList.add("login-form--animate");
  }, []);

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2 className="login-form__title">Вход в CRM MMA</h2>
      {error && <p className="login-form__error">{error}</p>}

      <div className="login-form__input-container">
        <FaUser className="login-form__icon" />
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="login-form__input"
        />
      </div>

      <div className="login-form__input-container">
        <div className="login-form__password-container">
          <FaLock className="login-form__icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-form__input"
          />
          <button
            type="button"
            className="login-form__password-toggle"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
          >
            {showPassword ? "Скрыть" : "Показать"}
          </button>
        </div>
      </div>

      <button type="submit" className="login-form__submit" disabled={loading}>
        {loading ? (
          <span className="login-form__loading">Вход...</span>
        ) : (
          "Войти"
        )}
      </button>
    </form>
  );
};

export default Login;
