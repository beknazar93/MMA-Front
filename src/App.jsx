import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { IntlProvider } from "react-intl";
import Home from "./pages/Home";
import Dashboard from "./Components/Dashboard/Dashboard";
import Register from "./Auth/Register/Register";
import Login from "./Auth/Login/Login";
import Profile from "./Components/Profile/Profile";
import Location from "./Components/Location/Location";
import CreateListing from "./Components/CreateListing/CreateListing";
import Listings from "./pages/Listings/Listings";
import Favorites from "./pages/Favorites/Favorites";
import Header from "./pages/Header/Header";
import ImageAdmin from "./Components/ImageAdmin/ImageAdmin";
import TextEditor from "./Components/TextEditor/TextEditor";
import BitRequest from "./Components/BitRequest/BitRequest";
import Single from "./Components/Single/Single";
import { messages } from "./translations";
import "./App.module.scss";
import EditListing from "./Components/EditListing/EditListing";
import ListingManager from "./Components/ListingManager/ListingManager";
import Employee from "./Components/Employee/Employee";
import MyListings from "./Components/MyListings/MyListings";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [error, setError] = useState(null);

  const verifyToken = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const response = await fetch("https://dar.kg/api/v1/users/me/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) throw new Error("No refresh token");
          const refreshResponse = await fetch(
            "https://dar.kg/api/v1/users/auth/token/refresh/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh: refreshToken }),
            }
          );
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem("access_token", data.access);
            setIsAuthenticated(true);
          } else {
            throw new Error("Refresh failed");
          }
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setIsAuthenticated(false);
          setError("Ошибка аутентификации. Пожалуйста, войдите снова.");
        }
      }
    } catch {
      setIsAuthenticated(false);
      setError("Ошибка сети. Попробуйте позже.");
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return { isAuthenticated, error, setIsAuthenticated };
};

const App = () => {
  const [searchParams, setSearchParams] = useState({});
  const [selectedCity, setSelectedCity] = useState("");
  const [language, setLanguage] = useState("ru");
  const { isAuthenticated, error, setIsAuthenticated } = useAuth();

  const handleSearch = (params) => {
    setSearchParams(params);
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    if (isAuthenticated === null) {
      return <div>Загрузка...</div>; // Индикатор загрузки
    }
    return isAuthenticated ? (
      children
    ) : (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  };

  const Layout = ({ children }) => (
    <>
      <Header
        onCityChange={handleCityChange}
        onLanguageChange={handleLanguageChange}
        language={language}
        city={selectedCity}
      />
      {error && <div className="error-message">{error}</div>} {/* Уведомление об ошибке */}
      {children}
    </>
  );

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <Router>
        {isAuthenticated === null ? (
          <div>Загрузка...</div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <Home
                    onSearch={handleSearch}
                    searchParams={searchParams}
                    selectedCity={selectedCity}
                    language={language}
                  />
                </Layout>
              }
            />
            <Route
              path="/listing/:id"
              element={
                <Layout>
                  <Home
                    onSearch={handleSearch}
                    searchParams={searchParams}
                    selectedCity={selectedCity}
                    language={language}
                  />
                </Layout>
              }
            />
            <Route
              path="/login"
              element={
                <Layout>
                  <Login onLogin={handleLogin} />
                </Layout>
              }
            />
            <Route
              path="/favorites"
              element={
                <Layout>
                  <Favorites />
                </Layout>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              <Route path="locations" element={<Location />} />
              <Route path="listing" element={<Listings searchParams={searchParams} />} />
              <Route path="create-listing" element={<CreateListing />} />
              <Route path="image-admin" element={<ImageAdmin />} />
              <Route path="texteditor" element={<TextEditor />} />
              <Route path="bit" element={<BitRequest />} />
              <Route path="single" element={<Single />} />
              <Route path="edit-listing" element={<EditListing />} />
              <Route path="listing-manager" element={<ListingManager />} />
              <Route path="employee" element={<Employee />} />
              <Route path="my-listings" element={<MyListings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Router>
    </IntlProvider>
  );
};

export default App;