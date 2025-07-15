// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AddProduct from "../AddProduct/AddProduct";
// import ProductList from "../ProductsList/ProductsList";
// import ProductSell from "../ProductSell/ProductSell";
// import SoldProducts from "../SoldProduct/SoldProducts";
// import { FaSignOutAlt } from "react-icons/fa";
// import './ProductTabs.scss';

// const ProductTabs = () => {
//   const [activeTab, setActiveTab] = useState("add");
//   const navigate = useNavigate();

//   const getManagerName = () => localStorage.getItem("manager_name") || "Неизвестный менеджер";
//   const managerName = getManagerName();

//   const handleLogout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");
//     navigate("/admin");
//   };

//   return (
//     <div className="product-tabs">
//       <div className="product-tabs__header">
//         <span className="product-tabs__manager-name">{managerName}</span>
//         <button className="product-tabs__logout-btn" onClick={handleLogout} aria-label="Выйти">
//           <FaSignOutAlt />
//         </button>
//       </div>
//       <div className="product-tabs__nav">
//         <button
//           className={`product-tabs__nav-item ${activeTab === "list" ? "product-tabs__nav-item--active" : ""}`}
//           onClick={() => setActiveTab("list")}
//         >
//           Список продуктов
//         </button>
//         <button
//           className={`product-tabs__nav-item ${activeTab === "add" ? "product-tabs__nav-item--active" : ""}`}
//           onClick={() => setActiveTab("add")}
//         >
//           Добавить продукт
//         </button>
//         <button
//           className={`product-tabs__nav-item ${activeTab === "sell" ? "product-tabs__nav-item--active" : ""}`}
//           onClick={() => setActiveTab("sell")}
//         >
//           Продать продукт
//         </button>
//         <button
//           className={`product-tabs__nav-item ${activeTab === "sold" ? "product-tabs__nav-item--active" : ""}`}
//           onClick={() => setActiveTab("sold")}
//         >
//           Проданные продукты
//         </button>
//       </div>
//       <div className="product-tabs__content">
//         {activeTab === "list" && <ProductList />}
//         {activeTab === "add" && <AddProduct />}
//         {activeTab === "sell" && <ProductSell />}
//         {activeTab === "sold" && <SoldProducts />}
//       </div>
//     </div>
//   );
// };

// export default ProductTabs;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddProduct from "../AddProduct/AddProduct";
import ProductList from "../ProductsList/ProductsList";
import ProductSell from "../ProductSell/ProductSell";
import SoldProducts from "../SoldProduct/SoldProducts";
import { FaSignOutAlt } from "react-icons/fa";
import './ProductTabs.scss';

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState("add");
  const navigate = useNavigate();

  const getManagerName = () => localStorage.getItem("manager_name") || "Неизвестный менеджер";
  const managerName = getManagerName();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  return (
    <div className="product-tabs">
      <div className="product-tabs__header">
        <span className="product-tabs__manager-name">{managerName}</span>
        <button className="product-tabs__logout-btn" onClick={handleLogout} aria-label="Выйти">
          <FaSignOutAlt />
        </button>
      </div>
      <div className="product-tabs__nav">
        <button
          className={`product-tabs__nav-item ${activeTab === "list" ? "product-tabs__nav-item--active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Список продуктов
        </button>
        <button
          className={`product-tabs__nav-item ${activeTab === "add" ? "product-tabs__nav-item--active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          Добавить продукт
        </button>
        <button
          className={`product-tabs__nav-item ${activeTab === "sell" ? "product-tabs__nav-item--active" : ""}`}
          onClick={() => setActiveTab("sell")}
        >
          Продать продукт
        </button>
        <button
          className={`product-tabs__nav-item ${activeTab === "sold" ? "product-tabs__nav-item--active" : ""}`}
          onClick={() => setActiveTab("sold")}
        >
          Проданные продукты
        </button>
      </div>
      <div className="product-tabs__content">
        {activeTab === "list" && <ProductList />}
        {activeTab === "add" && <AddProduct />}
        {activeTab === "sell" && <ProductSell />}
        {activeTab === "sold" && <SoldProducts />}
      </div>
    </div>
  );
};

export default ProductTabs;