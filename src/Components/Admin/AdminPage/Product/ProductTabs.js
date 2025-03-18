import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddProduct from "./AddProduct";
import ProductList from "./ProductsList";
import ProductSell from "./ProductSell";
import SoldProducts from "./SoldProducts";

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState("add");
  const navigate = useNavigate();

  const getManagerName = () =>
    localStorage.getItem("manager_name") || "Unknown Manager";
  const managerName = getManagerName();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  return (
    <div className="product-tabs">
      <div className="product-tabs__header">
        <span className="manager-name">{`Пользователь: ${managerName}`}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
      <div className="product-tabs__nav">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          Список продуктов
        </button>
        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Добавить продукт
        </button>
        <button
          className={activeTab === "sell" ? "active" : ""}
          onClick={() => setActiveTab("sell")}
        >
          Продать продукт
        </button>
        <button
          className={activeTab === "sold" ? "active" : ""}
          onClick={() => setActiveTab("sold")}
        >
          Проданные продукты
        </button>
      </div>
      <div className="product-tabs__content">
        {activeTab === "add" && <AddProduct />}
        {activeTab === "list" && <ProductList />}
        {activeTab === "sell" && <ProductSell />}
        {activeTab === "sold" && <SoldProducts />}
      </div>
    </div>
  );
};

export default ProductTabs;