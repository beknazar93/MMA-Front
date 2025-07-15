// import axios from "axios";

// const BASE_URL = "https://testosh.pythonanywhere.com/api";

// const getAuthHeaders = () => {
//   const token = localStorage.getItem("access");
//   return { Authorization: `Bearer ${token}` };
// };


// export const fetchProducts = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL}/products/`, {
//       headers: getAuthHeaders(),
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error("Ошибка загрузки данных продуктов.");
//   }
// };


// export const addProduct = async (productData) => {
//   try {
//     const response = await axios.post(`${BASE_URL}/products/`, productData, {
//       headers: getAuthHeaders(),
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при добавлении продукта:", error);
//     throw error;
//   }
// };


// export const deleteProduct = async (id) => {
//   try {
//     const response = await axios.delete(`${BASE_URL}/products/${id}/`, {
//       headers: getAuthHeaders(),
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при удалении продукта:", error);
//     throw error;
//   }
// };

// export const sellProduct = async (id, priceSelling, dateSelling, countSelling, sale = 0) => {
//   try {
//     const currentProduct = await axios.get(`${BASE_URL}/products/${id}/`, {
//       headers: getAuthHeaders(),
//     });
//     const updatedQuantity = currentProduct.data.product_quantity - countSelling;
//     const updatedCount = parseFloat(currentProduct.data.count) + parseFloat(countSelling);

//     const response = await axios.patch(
//       `${BASE_URL}/products/${id}/`,
//       {
//         status: true,
//         price_selling: priceSelling,
//         date_selling: dateSelling,
//         product_quantity: updatedQuantity,
//         count: updatedCount,
//         sale: sale,
//       },
//       { headers: getAuthHeaders() }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при продаже товара:", error);
//     throw error;
//   }
// };



import axios from "axios";

const BASE_URL = "https://testosh.pythonanywhere.com/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  if (!token) throw new Error("Токен авторизации отсутствует.");
  return { Authorization: `Bearer ${token}` };
};

export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка загрузки данных продуктов: ${error.response?.data?.message || error.message}`);
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${BASE_URL}/products/`, productData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка при добавлении продукта: ${error.response?.data?.message || error.message}`);
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/products/${id}/`, productData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка при обновлении продукта: ${error.response?.data?.message || error.message}`);
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/products/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка при удалении продукта: ${error.response?.data?.message || error.message}`);
  }
};

export const sellProduct = async (id, priceSelling, dateSelling, count) => {
  try {
    const currentProduct = await axios.get(`${BASE_URL}/products/${id}/`, {
      headers: getAuthHeaders(),
    });

    if (currentProduct.data.product_quantity < count) {
      throw new Error("Недостаточно товара на складе.");
    }

    const updatedQuantity = currentProduct.data.product_quantity - count;
    const updatedCount = (parseFloat(currentProduct.data.count || 0) + parseFloat(count)).toFixed(2);

    const response = await axios.patch(
      `${BASE_URL}/products/${id}/`,
      {
        status: updatedQuantity === 0 ? true : currentProduct.data.status,
        price_selling: priceSelling,
        date_selling: dateSelling,
        product_quantity: updatedQuantity,
        count: updatedCount,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка при продаже товара: ${error.response?.data?.message || error.message}`);
  }
};