import axios from "axios";

const BASE_URL = "https://testosh.pythonanywhere.com/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let clientsCache = {
  data: null,
  timestamp: 0,
};

export const fetchClients = async () => {
  const now = Date.now();
  
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

export const addClient = async (clientData) => {
  try {
    const response = await axiosInstance.post("/clients/", clientData);
    clientsCache.data = null;
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении клиента:", error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await axiosInstance.delete(`/clients/${id}/`);
    clientsCache.data = null; 
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении клиента:", error);
    throw error;
  }
};

export const updateClient = async (id, updatedData) => {
  try {
    const response = await axiosInstance.put(`/clients/${id}/`, updatedData);
    clientsCache.data = null;
    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении клиента:", error);
    throw error;
  }
};

const filterClients = (clients, filters) => {
  return clients.filter(client =>
    Object.keys(filters).every(key => !filters[key] || client[key] === filters[key])
  );
};

export const fetchTotalTrainer = async (filters) => {
  try {
    const clients = await fetchClients();
    const filteredClients = filterClients(clients, filters);

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

export const fetchTotalIncome = async (filters) => {
  try {
    const clients = await fetchClients();
    const filteredClients = filterClients(clients, filters);

    const totalIncome = filteredClients.reduce((sum, client) => {
      const cleanedPrice = parseFloat(client.price?.replace(/[^0-9.]/g, "") || 0);
      return sum + (isNaN(cleanedPrice) ? 0 : cleanedPrice);
    }, 0);

    const uniqueStudents = new Set(filteredClients.map(client => client.id)).size;

    return { income: totalIncome, students: uniqueStudents };
  } catch (error) {
    throw new Error("Ошибка загрузки данных.");
  }
};

export const fetchTotalStudents = async (filters) => {
  try {
    const clients = await fetchClients();
    const filteredClients = filterClients(clients, filters);

    return new Set(filteredClients.map(client => client.id)).size;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    throw new Error("Ошибка загрузки данных.");
  }
};

export const fetchDailyClients = async () => {
  try {
    const clients = await fetchClients();
    return clients.filter(client => client.is_daily === true);
  } catch (error) {
    console.error("Ошибка загрузки клиентов на день:", error);
    throw new Error("Ошибка загрузки данных клиентов.");
  }
};

export const addDailyPayment = async (name, amount) => {
  try {
    const clients = await fetchDailyClients();
    const existingClient = clients.find(client => client.name === name);

    if (existingClient) {
      const updatedData = { ...existingClient, price: existingClient.price + amount };
      await updateClient(existingClient.id, updatedData);
    } else {
      const newClient = { name, price: amount, is_daily: true };
      await addClient(newClient);
    }

    return true;
  } catch (error) {
    console.error("Ошибка при добавлении оплаты:", error);
    throw error;
  }
};

export const fetchTotalBySource = async (filters) => {
  try {
    const clients = await fetchClients();
    const filteredClients = filterClients(clients, filters);
    
    return new Set(filteredClients.map(client => client.id)).size;
  } catch (error) {
    console.error("Ошибка загрузки данных по источнику:", error);
    throw new Error("Ошибка загрузки данных.");
  }
};