// import { useState } from "react";
// import { addProduct } from "../../api/Product";
// import "./AddProduct.scss";

// const AddProduct = () => {
//   const [productData, setProductData] = useState({
//     name: "",
//     product_price: "",
//     product_date: "",
//     product_quantity: "",
//     status: false,
//   });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProductData((prev) => ({ ...prev, [name]: value }));
//     setError("");
//   };

//   const validateInputs = () => {
//     if (!productData.name.trim()) return "Название не может быть пустым.";
//     if (!productData.product_price || Number(productData.product_price) <= 0)
//       return "Цена должна быть больше 0.";
//     if (!productData.product_date) return "Дата обязательна.";
//     if (!productData.product_quantity || Number(productData.product_quantity) <= 0)
//       return "Количество должно быть больше 0.";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationError = validateInputs();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     try {
//       await addProduct({
//         ...productData,
//         product_price: Number(productData.product_price),
//         product_quantity: Number(productData.product_quantity),
//         status: false,
//       });
//       alert("Продукт успешно добавлен!");
//       setProductData({
//         name: "",
//         product_price: "",
//         product_date: "",
//         product_quantity: "",
//         status: false,
//       });
//     } catch (err) {
//       setError(
//         "Ошибка при добавлении продукта: " +
//           (err.response?.data?.message || err.message)
//       );
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="product-form">
//       <h2 className="sold-products__title">Добавление продукта</h2>

//       {error && <p className="product-form__error">{error}</p>}

//       <input
//         type="text"
//         name="name"
//         autoComplete="off"
//         placeholder="Название"
//         value={productData.name}
//         onChange={handleChange}
//         required
//         className="product-form__input"
//         aria-label="Название"
//       />

//       <input
//         type="number"
//         name="product_price"
//         autoComplete="off"
//         placeholder="Цена товара"
//         value={productData.product_price}
//         onChange={handleChange}
//         min="0.01"
//         step="0.01"
//         required
//         className="product-form__input"
//         aria-label="Цена товара"
//       />

//       <input
//         type="date"
//         name="product_date"
//         value={productData.product_date}
//         onChange={handleChange}
//         required
//         className="product-form__input"
//         aria-label="Дата"
//       />

//       <input
//         type="number"
//         name="product_quantity"
//         autoComplete="off"
//         placeholder="Количество товара"
//         value={productData.product_quantity}
//         onChange={handleChange}
//         min="1"
//         required
//         className="product-form__input"
//         aria-label="Количество товара"
//       />

//       <button type="submit" className="product-form__btn">
//         Добавить
//       </button>
//     </form>
//   );
// };

// export default AddProduct;


// src/components/AddProduct/AddProduct.jsx
import { useState, useEffect } from "react";
import { addProduct, fetchProducts } from "../../api/Product";
import "./AddProduct.scss";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    name: "",
    product_price: "",
    product_date: "",
    product_quantity: "",
    status: false,
  });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Ошибка загрузки продуктов.");
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccess("");
    setProductData((prev) => ({
      ...prev,
      [name]:
        name === "product_price"
          ? value.replace(/[^0-9.]/g, "")
          : name === "product_quantity"
          ? value.replace(/\D/g, "")
          : value,
    }));
  };

  const validateInputs = () => {
    if (!productData.name.trim()) return "Название не может быть пустым.";
    const price = parseFloat(productData.product_price);
    if (!price || price <= 0) return "Цена должна быть больше 0.";
    if (!productData.product_date) return "Дата обязательна.";
    const qty = parseInt(productData.product_quantity, 10);
    if (!qty || qty <= 0) return "Количество должно быть больше 0.";
    return "";
  };

  const isDuplicate = () => {
    const n = productData.name.trim().toLowerCase();
    const d = productData.product_date;
    return products.some(
      (p) =>
        String(p.name || "").trim().toLowerCase() === n &&
        String(p.product_date || "") === d
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (isDuplicate()) {
      setError("Дубликат: продукт с таким названием и датой уже существует.");
      return;
    }

    setSubmitting(true);
    try {
      await addProduct({
        name: productData.name.trim(),
        product_price: Number(productData.product_price),
        product_date: productData.product_date,
        product_quantity: Number(productData.product_quantity),
        status: false,
      });

      // очистка формы и мягкий success
      setProductData({
        name: "",
        product_price: "",
        product_date: "",
        product_quantity: "",
        status: false,
      });
      setSuccess("Продукт добавлен.");

      // обновим локальный список для дальнейшей проверки дубликатов
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Ошибка при добавлении продукта.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form" noValidate>
      <h2 className="product-form__title">Добавление продукта</h2>

      {error && <p className="product-form__error" role="alert">{error}</p>}
      {success && <p className="product-form__success" role="status">{success}</p>}

      <input
        type="text"
        name="name"
        autoComplete="off"
        placeholder="Название"
        value={productData.name}
        onChange={handleChange}
        required
        className="product-form__input"
        aria-label="Название"
      />

      <input
        type="number"
        name="product_price"
        autoComplete="off"
        placeholder="Цена товара"
        value={productData.product_price}
        onChange={handleChange}
        min="0.01"
        step="0.01"
        required
        className="product-form__input"
        aria-label="Цена товара"
      />

      <input
        type="date"
        name="product_date"
        value={productData.product_date}
        onChange={handleChange}
        required
        className="product-form__input"
        aria-label="Дата"
      />

      <input
        type="number"
        name="product_quantity"
        autoComplete="off"
        placeholder="Количество товара"
        value={productData.product_quantity}
        onChange={handleChange}
        min="1"
        step="1"
        required
        className="product-form__input"
        aria-label="Количество товара"
      />

      <button type="submit" className="product-form__btn" disabled={submitting} aria-label="Добавить продукт">
        {submitting ? <span className="product-form__spinner" /> : "Добавить"}
      </button>
    </form>
  );
};

export default AddProduct;
