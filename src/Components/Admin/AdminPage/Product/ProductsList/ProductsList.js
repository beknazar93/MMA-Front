// import { useState, useEffect } from "react";
// import { fetchProducts, deleteProduct } from "../../api/Product";
// import './ProductsList.scss';

// const ProductsList = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         const data = await fetchProducts();
//         setProducts(data);
//       } catch (error) {
//         alert("Ошибка загрузки списка продуктов.");
//       }
//     };
//     loadProducts();
//   }, []);

//   const handleDelete = async (id) => {
//     setLoading(true);
//     try {
//       await deleteProduct(id);
//       setProducts(products.filter((product) => product.id !== id));
//     } catch (error) {
//       alert("Ошибка при удалении продукта.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="product-list">
//       <h2 className="product-list__title">Список продуктов</h2>
//       <div className="product-list__table-container">
//         <table className="product-list__table">
//           <thead>
//             <tr className="product-list__table-header">
//               <th>Название</th>
//               <th>Цена</th>
//               <th>Дата добавления</th>
//               <th>Количество</th>
//               <th>Статус</th>
//               <th>Действия</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((product) => (
//               <tr className="product-list__table-row" key={product.id}>
//                 <td>{product.name || "-"}</td>
//                 <td>{product.product_price || "-"}</td>
//                 <td>{product.product_date || "-"}</td>
//                 <td>{product.product_quantity || "-"}</td>
//                 <td className={`product-list__status product-list__status--${product.status ? "active" : "inactive"}`}>
//                   {product.status ? "Активен" : "Неактивен"}
//                 </td>
//                 <td>
//                   <button
//                     onClick={() => handleDelete(product.id)}
//                     disabled={loading}
//                     className="product-list__delete-btn"
//                   >
//                     {loading ? "Удаление..." : "Удалить"}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ProductsList;


import { useState, useEffect } from "react";
import { fetchProducts, deleteProduct, updateProduct } from "../../api/Product";
import './ProductsList.scss';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ type: "", product: null });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setError("Ошибка загрузки списка продуктов: " + (error.response?.data?.message || error.message));
      }
    };
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product.id !== id));
      setModal({ type: "", product: null });
    } catch (error) {
      setError("Ошибка при удалении продукта: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e, product) => {
    e.preventDefault();
    const { name, product_price, product_quantity, product_date } = product;
    if (!name.trim()) {
      setError("Название не может быть пустым.");
      return;
    }
    if (Number(product_price) <= 0) {
      setError("Цена должна быть больше 0.");
      return;
    }
    if (!product_date) {
      setError("Дата обязательна.");
      return;
    }
    if (Number(product_quantity) < 0) {
      setError("Количество не может быть отрицательным.");
      return;
    }

    try {
      const updatedProduct = await updateProduct(product.id, {
        name,
        product_price: Number(product_price),
        product_quantity: Number(product_quantity),
        product_date,
      });
      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      setModal({ type: "", product: null });
    } catch (error) {
      setError("Ошибка при обновлении продукта: " + (error.response?.data?.message || error.message));
    }
  };

  const openModal = (type, product) => {
    setModal({ type, product: { ...product } });
    setError("");
  };

  const closeModal = () => {
    setModal({ type: "", product: null });
    setError("");
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModal((prev) => ({
      ...prev,
      product: { ...prev.product, [name]: value },
    }));
  };

  return (
    <div className="product-list">
      <h2 className="product-list__title">Список продуктов</h2>
      {error && <p className="product-list__error">{error}</p>}
      <div className="product-list__table-container">
        <table className="product-list__table">
          <thead>
            <tr className="product-list__table-header">
              <th>Название</th>
              <th>Цена</th>
              <th>Количество</th>
              <th>Дата добавления</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="product-list__table-row" key={product.id}>
                <td>{product.name || "-"}</td>
                <td>{product.product_price || "-"}</td>
                <td>{product.product_quantity || "-"}</td>
                <td>{product.product_date || "-"}</td>
                <td className={`product-list__status product-list__status--${product.status ? "active" : "inactive"}`}>
                  {product.status ? "Продан" : "Не продан"}
                </td>
                <td>
                  <button
                    onClick={() => openModal("edit", product)}
                    className="product-list__edit-btn"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => openModal("delete", product)}
                    disabled={loading}
                    className="product-list__delete-btn"
                  >
                    {loading ? "Удаление..." : "Удалить"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.type === "edit" && modal.product && (
        <div className="product-list__modal">
          <div className="product-list__modal-content">
            <h3>Редактировать продукт</h3>
            <form onSubmit={(e) => handleEdit(e, modal.product)}>
              <input
                type="text"
                name="name"
                value={modal.product.name}
                onChange={handleModalChange}
                placeholder="Название"
                required
                className="product-list__modal-input"
              />
              <input
                type="number"
                name="product_price"
                value={modal.product.product_price}
                onChange={handleModalChange}
                placeholder="Цена"
                min="0.01"
                step="0.01"
                required
                className="product-list__modal-input"
              />
              <input
                type="number"
                name="product_quantity"
                value={modal.product.product_quantity}
                onChange={handleModalChange}
                placeholder="Количество"
                min="0"
                required
                className="product-list__modal-input"
              />
              <input
                type="date"
                name="product_date"
                value={modal.product.product_date}
                onChange={handleModalChange}
                required
                className="product-list__modal-input"
              />
              <div className="product-list__modal-buttons">
                <button type="submit" className="product-list__modal-btn">
                  Сохранить
                </button>
                <button type="button" onClick={closeModal} className="product-list__modal-btn">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.type === "delete" && modal.product && (
        <div className="product-list__modal">
          <div className="product-list__modal-content">
            <h3>Удалить продукт</h3>
            <p>Вы уверены, что хотите удалить "{modal.product.name}"?</p>
            <div className="product-list__modal-buttons">
              <button
                onClick={() => handleDelete(modal.product.id)}
                disabled={loading}
                className="product-list__modal-btn product-list__modal-btn--delete"
              >
                {loading ? "Удаление..." : "Удалить"}
              </button>
              <button type="button" onClick={closeModal} className="product-list__modal-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;