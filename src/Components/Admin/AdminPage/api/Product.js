import axios from "axios";

const BASE_URL = "https://testosh.pythonanywhere.com/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return { Authorization: `Bearer ${token}` };
};


export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error("Ошибка загрузки данных продуктов.");
  }
};


export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${BASE_URL}/products/`, productData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении продукта:", error);
    throw error;
  }
};


export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/products/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении продукта:", error);
    throw error;
  }
};

export const sellProduct = async (id, priceSelling, dateSelling, countSelling, sale = 0) => {
  try {
    const currentProduct = await axios.get(`${BASE_URL}/products/${id}/`, {
      headers: getAuthHeaders(),
    });
    const updatedQuantity = currentProduct.data.product_quantity - countSelling;
    const updatedCount = parseFloat(currentProduct.data.count) + parseFloat(countSelling);

    const response = await axios.patch(
      `${BASE_URL}/products/${id}/`,
      {
        status: true,
        price_selling: priceSelling,
        date_selling: dateSelling,
        product_quantity: updatedQuantity,
        count: updatedCount,
        sale: sale,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при продаже товара:", error);
    throw error;
  }
};
