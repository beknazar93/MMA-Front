import { useState } from "react";
import { addProduct } from "../../api/Product";
import "./AddProduct.scss";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    name: "",
    product_price: "",
    product_date: "",
    product_quantity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addProduct(productData);
      alert("Продукт успешно добавлен!");
      setProductData({
        name: "",
        product_price: "",
        product_date: "",
        product_quantity: "",
      });
    } catch (error) {
      alert("Ошибка при добавлении продукта.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2 className="sold-products__title">Добавление продукта</h2>
      <input
        type="text"
        name="name"
        autoComplete="off"
        placeholder="Название"
        value={productData.name}
        onChange={handleChange}
        required
        className="product-form__input"
      />
      <input
        type="number"
        name="product_price"
        autoComplete="off"
        placeholder="Цена товара"
        value={productData.product_price}
        onChange={handleChange}
        required
        className="product-form__input"
      />
      <input
        type="date"
        name="product_date"
        value={productData.product_date}
        onChange={handleChange}
        required
        className="product-form__input"
      />
      <input
        type="number"
        name="product_quantity"
        autoComplete="off"
        placeholder="Количество товара"
        value={productData.product_quantity}
        onChange={handleChange}
        required
        className="product-form__input"
      />
      <button type="submit" className="product-form__btn">
        Добавить
      </button>
    </form>
  );
};

export default AddProduct;
