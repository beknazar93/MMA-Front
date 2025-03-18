import axios from "axios";

const BASE_URL = "https://testosh.pythonanywhere.com/api";

// Создаем экземпляр axios с предустановленными параметрами
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Добавляем интерсептор для автоматического добавления токена
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Кеш для хранения данных клиентов (актуален 1 минуту)
let clientsCache = {
  data: null,
  timestamp: 0,
};

// Функция для получения списка клиентов (с кешем)
export const fetchClients = async () => {
  const now = Date.now();
  
  // Проверяем кеш (актуальность 1 минута)
  if (clientsCache.data && now - clientsCache.timestamp < 60000) {
    return clientsCache.data;
  }

  try {
    const response = await axiosInstance.get("/clients/");
    clientsCache = {
      data: response.data,
      timestamp: now,
    };
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки клиентов:", error);
    throw new Error("Ошибка загрузки данных клиентов.");
  }
};

// Функция для добавления клиента
export const addClient = async (clientData) => {
  try {
    const response = await axiosInstance.post("/clients/", clientData);
    clientsCache.data = null; // Сбрасываем кеш
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении клиента:", error);
    throw error;
  }
};

// Функция для удаления клиента по ID
export const deleteClient = async (id) => {
  try {
    const response = await axiosInstance.delete(`/clients/${id}/`);
    clientsCache.data = null; // Сбрасываем кеш
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении клиента:", error);
    throw error;
  }
};

// Функция для обновления клиента
export const updateClient = async (id, updatedData) => {
  try {
    const response = await axiosInstance.put(`/clients/${id}/`, updatedData);
    clientsCache.data = null; // Сбрасываем кеш
    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении клиента:", error);
    throw error;
  }
};

// Универсальная функция для фильтрации клиентов
const filterClients = (clients, filters) => {
  return clients.filter(client =>
    Object.keys(filters).every(key => !filters[key] || client[key] === filters[key])
  );
};

// Функция для подсчета дохода тренера
export const fetchTotalTrainer = async (filters) => {
  try {
    const clients = await fetchClients();
    const filteredClients = filterClients(clients, filters);

    // Рассчитываем общий доход
    const totalIncome = filteredClients.reduce((sum, client) => {
      const cleanedPrice = parseFloat(client.price?.replace(/[^0-9.]/g, "") || 0);
      return sum + (isNaN(cleanedPrice) ? 0 : cleanedPrice);
    }, 0);

    return totalIncome;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    throw new Error("Ошибка загрузки данных.");
  }
};

// Функция для подсчета общего дохода и числа учеников
export const fetchTotalIncome = async (filters) => {
  try {
    const clients = await fetchClients();
    const filteredClients = filterClients(clients, filters);

    // Подсчет общего дохода
    const totalIncome = filteredClients.reduce((sum, client) => {
      const cleanedPrice = parseFloat(client.price?.replace(/[^0-9.]/g, "") || 0);
      return sum + (isNaN(cleanedPrice) ? 0 : cleanedPrice);
    }, 0);

    // Подсчет числа уникальных учеников
    const uniqueStudents = new Set(filteredClients.map(client => client.id)).size;

    return { income: totalIncome, students: uniqueStudents };
  } catch (error) {
    throw new Error("Ошибка загрузки данных.");
  }
};

// Функция для подсчета количества уникальных учеников
export const fetchTotalStudents = async (filters) => {
  try {
    const clients = await fetchClients();
    const filteredClients = filterClients(clients, filters);

    // Подсчет числа уникальных учеников
    return new Set(filteredClients.map(client => client.id)).size;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    throw new Error("Ошибка загрузки данных.");
  }
};

// Получаем клиентов, которые оплатили за день
export const fetchDailyClients = async () => {
  try {
    const clients = await fetchClients();
    return clients.filter(client => client.is_daily === true);
  } catch (error) {
    console.error("Ошибка загрузки клиентов на день:", error);
    throw new Error("Ошибка загрузки данных клиентов.");
  }
};

// Добавляем оплату клиенту (или создаем нового, если он впервые)
export const addDailyPayment = async (name, amount) => {
  try {
    const clients = await fetchDailyClients();
    const existingClient = clients.find(client => client.name === name);

    if (existingClient) {
      // Если клиент уже есть, увеличиваем его сумму
      const updatedData = { ...existingClient, price: existingClient.price + amount };
      await updateClient(existingClient.id, updatedData);
    } else {
      // Если клиента нет, создаем нового с оплатой
      const newClient = { name, price: amount, is_daily: true };
      await addClient(newClient);
    }

    return true;
  } catch (error) {
    console.error("Ошибка при добавлении оплаты:", error);
    throw error;
  }
};
