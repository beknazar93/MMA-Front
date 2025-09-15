import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.scss";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "https://testosh.pythonanywhere.com/login/",
        { username, password }
      );

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      const profileResponse = await axios.get(
        "https://testosh.pythonanywhere.com/profile/",
        { headers: { Authorization: `Bearer ${data.access}` } }
      );

      const userRole = profileResponse.data.role;
      const managerName = profileResponse.data.username;

      localStorage.setItem("manager_name", managerName);
      localStorage.setItem("role", userRole);

      navigate("/admin/AdminPanel");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Неверное имя пользователя или пароль.");
      } else {
        setError("Ошибка подключения к серверу. Попробуйте позже.");
      }
      console.error("Ошибка входа:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formRef.current?.classList.add("login-form--animate");
  }, []);

  return (
    <form onSubmit={handleLogin} className="login-form" ref={formRef}>
      <h2 className="login-form__title">Вход в CRM MMA</h2>

      {error && (
        <p className="login-form__error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <div className="login-form__input-container">
        <FaUser className="login-form__icon" />
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="login-form__input"
          aria-label="Имя пользователя"
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
            autoComplete="current-password"
            className="login-form__input"
            aria-label="Пароль"
          />
          <button
            type="button"
            className="login-form__password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={showPassword}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="login-form__submit"
        disabled={loading || !username || !password}
      >
        {loading ? <span className="login-form__loading">Вход…</span> : "Войти"}
      </button>
    </form>
  );
};

export default Login;
