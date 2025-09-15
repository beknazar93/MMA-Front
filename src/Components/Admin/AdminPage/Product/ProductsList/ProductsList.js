// import { useState, useEffect } from "react";
// import { fetchProducts, deleteProduct, updateProduct } from "../../api/Product";
// import { CORRECT_PIN } from "../../Constants/constants";
// import "./ProductsList.scss";

// const ProductsList = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [modal, setModal] = useState({ type: "", product: null });
//   const [pin, setPin] = useState("");
//   const [pinError, setPinError] = useState("");

//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         const data = await fetchProducts();
//         setProducts(data);
//       } catch (err) {
//         setError(
//           "Ошибка загрузки списка продуктов: " +
//             (err.response?.data?.message || err.message)
//         );
//       }
//     };
//     loadProducts();
//   }, []);

//   const handleDelete = async (id) => {
//     setLoading(true);
//     try {
//       await deleteProduct(id);
//       setProducts((prev) => prev.filter((p) => p.id !== id));
//       setModal({ type: "", product: null });
//       setPin("");
//     } catch (err) {
//       setError(
//         "Ошибка при удалении продукта: " +
//           (err.response?.data?.message || err.message)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = async (e, product) => {
//     e.preventDefault();
//     const { name, product_price, product_quantity, product_date } = product;

//     if (!name.trim()) {
//       setError("Название не может быть пустым.");
//       return;
//     }
//     if (Number(product_price) <= 0) {
//       setError("Цена должна быть больше 0.");
//       return;
//     }
//     if (!product_date) {
//       setError("Дата обязательна.");
//       return;
//     }
//     if (Number(product_quantity) < 0) {
//       setError("Количество не может быть отрицательным.");
//       return;
//     }

//     try {
//       const payload = {
//         name,
//         product_price: Number(product_price),
//         product_quantity: Number(product_quantity),
//         product_date,
//       };
//       const updated = await updateProduct(product.id, payload);
//       setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
//       setModal({ type: "", product: null });
//       setPin("");
//     } catch (err) {
//       setError(
//         "Ошибка при обновлении продукта: " +
//           (err.response?.data?.message || err.message)
//       );
//     }
//   };

//   const openModal = (type, product) => {
//     setModal({ type: `pin-${type}`, product });
//     setError("");
//     setPinError("");
//     setPin("");
//   };

//   const closeModal = () => {
//     setModal({ type: "", product: null });
//     setPin("");
//     setPinError("");
//     setError("");
//   };

//   const handleModalChange = (e) => {
//     const { name, value } = e.target;
//     setModal((prev) => ({ ...prev, product: { ...prev.product, [name]: value } }));
//   };

//   const handlePinChange = (e) => {
//     setPin(e.target.value);
//     setPinError("");
//   };

//   const handlePinSubmit = (e, type) => {
//     e.preventDefault();
//     if (pin !== CORRECT_PIN) {
//       setPinError("Неверный PIN-код");
//       return;
//     }
//     setModal((prev) => ({ ...prev, type }));
//   };

//   return (
//     <div className="product-list">
//       <h2 className="product-list__title">Список продуктов</h2>

//       {error && <p className="product-list__error">{error}</p>}

//       <div className="product-list__table-container">
//         <table className="product-list__table">
//           <thead>
//             <tr className="product-list__table-header">
//               <th>Название</th>
//               <th>Цена</th>
//               <th>Количество</th>
//               <th>Дата добавления</th>
//               <th>Статус</th>
//               <th>Действия</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((product) => (
//               <tr className="product-list__table-row" key={product.id}>
//                 <td>{product.name || "-"}</td>
//                 <td>{product.product_price || "-"}</td>
//                 <td>{product.product_quantity || "-"}</td>
//                 <td>{product.product_date || "-"}</td>
//                 <td
//                   className={`product-list__status product-list__status--${
//                     product.status ? "active" : "inactive"
//                   }`}
//                 >
//                   {product.status ? "Продан" : "Не продан"}
//                 </td>
//                 <td>
//                   <button
//                     className="product-list__edit-btn"
//                     onClick={() => openModal("edit", product)}
//                   >
//                     Изменить
//                   </button>
//                   <button
//                     className="product-list__delete-btn"
//                     onClick={() => openModal("delete", product)}
//                     disabled={loading}
//                   >
//                     {loading ? "Удаление..." : "Удалить"}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {modal.type === "pin-edit" && modal.product && (
//         <div className="product-list__modal">
//           <div className="product-list__modal-content">
//             <h3>Введите PIN-код</h3>
//             <form onSubmit={(e) => handlePinSubmit(e, "edit")}>
//               <input
//                 type="password"
//                 value={pin}
//                 onChange={handlePinChange}
//                 placeholder="PIN-код"
//                 className="product-list__modal-input"
//                 autoFocus
//               />
//               {pinError && <p className="product-list__pin-error">{pinError}</p>}
//               <div className="product-list__modal-buttons">
//                 <button type="submit" className="product-list__modal-btn">
//                   Подтвердить
//                 </button>
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="product-list__modal-btn"
//                 >
//                   Отмена
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {modal.type === "pin-delete" && modal.product && (
//         <div className="product-list__modal">
//           <div className="product-list__modal-content">
//             <h3>Введите PIN-код</h3>
//             <form onSubmit={(e) => handlePinSubmit(e, "delete")}>
//               <input
//                 type="password"
//                 value={pin}
//                 onChange={handlePinChange}
//                 placeholder="PIN-код"
//                 className="product-list__modal-input"
//                 autoFocus
//               />
//               {pinError && <p className="product-list__pin-error">{pinError}</p>}
//               <div className="product-list__modal-buttons">
//                 <button type="submit" className="product-list__modal-btn">
//                   Подтвердить
//                 </button>
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="product-list__modal-btn"
//                 >
//                   Отмена
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {modal.type === "edit" && modal.product && (
//         <div className="product-list__modal">
//           <div className="product-list__modal-content">
//             <h3>Редактировать продукт</h3>
//             <form onSubmit={(e) => handleEdit(e, modal.product)}>
//               <input
//                 type="text"
//                 name="name"
//                 value={modal.product.name}
//                 onChange={handleModalChange}
//                 placeholder="Название"
//                 required
//                 className="product-list__modal-input"
//               />
//               <input
//                 type="number"
//                 name="product_price"
//                 value={modal.product.product_price}
//                 onChange={handleModalChange}
//                 placeholder="Цена"
//                 min="0.01"
//                 step="0.01"
//                 required
//                 className="product-list__modal-input"
//               />
//               <input
//                 type="number"
//                 name="product_quantity"
//                 value={modal.product.product_quantity}
//                 onChange={handleModalChange}
//                 placeholder="Количество"
//                 min="0"
//                 required
//                 className="product-list__modal-input"
//               />
//               <input
//                 type="date"
//                 name="product_date"
//                 value={modal.product.product_date}
//                 onChange={handleModalChange}
//                 required
//                 className="product-list__modal-input"
//               />
//               <div className="product-list__modal-buttons">
//                 <button type="submit" className="product-list__modal-btn">
//                   Сохранить
//                 </button>
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="product-list__modal-btn"
//                 >
//                   Отмена
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {modal.type === "delete" && modal.product && (
//         <div className="product-list__modal">
//           <div className="product-list__modal-content">
//             <h3>Удалить продукт</h3>
//             <p>Вы уверены, что хотите удалить "{modal.product.name}"?</p>
//             <div className="product-list__modal-buttons">
//               <button
//                 className="product-list__modal-btn product-list__modal-btn--delete"
//                 onClick={() => handleDelete(modal.product.id)}
//                 disabled={loading}
//               >
//                 {loading ? "Удаление..." : "Удалить"}
//               </button>
//               <button
//                 type="button"
//                 onClick={closeModal}
//                 className="product-list__modal-btn"
//               >
//                 Отмена
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductsList;



// src/components/ProductsList/ProductsList.jsx
import { useState, useEffect, useMemo } from "react";
import { fetchProducts, deleteProduct, updateProduct } from "../../api/Product";
import { CORRECT_PIN } from "../../Constants/constants";
import "./ProductsList.scss";

const PAGE_SIZE = 15;

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ type: "", product: null });
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  // поиск
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки списка продуктов.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // ===== filter + pagination =====
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const date = String(p.product_date || "").toLowerCase();
      return name.includes(q) || date.includes(q);
    });
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  useEffect(() => {
    // сбрасываем на первую страницу при смене строки поиска
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const paginationNumbers = useMemo(() => {
    const maxButtons = 7;
    const nums = [];
    let start = Math.max(1, page - 3);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  // ===== helpers =====
  const openModal = (type, product) => {
    setModal({ type: `pin-${type}`, product });
    setError("");
    setPinError("");
    setPin("");
  };

  const closeModal = () => {
    setModal({ type: "", product: null });
    setPin("");
    setPinError("");
    setError("");
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModal((prev) => ({ ...prev, product: { ...prev.product, [name]: value } }));
  };

  const handlePinChange = (e) => {
    setPin(e.target.value);
    setPinError("");
  };

  const handlePinSubmit = (e, type) => {
    e.preventDefault();
    if (pin !== CORRECT_PIN) {
      setPinError("Неверный PIN-код");
      return;
    }
    setModal((prev) => ({ ...prev, type }));
  };

  // ===== CRUD =====
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Ошибка при удалении продукта.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async (e, product) => {
    e.preventDefault();
    const { name, product_price, product_quantity, product_date } = product;

    if (!String(name || "").trim()) { setError("Название не может быть пустым."); return; }
    if (!(Number(product_price) > 0)) { setError("Цена должна быть больше 0."); return; }
    if (!product_date) { setError("Дата обязательна."); return; }
    if (Number(product_quantity) < 0) { setError("Количество не может быть отрицательным."); return; }

    const duplicate = products.some(
      (p) =>
        p.id !== product.id &&
        String(p.name || "").trim().toLowerCase() === String(name).trim().toLowerCase() &&
        String(p.product_date || "") === String(product_date || "")
    );
    if (duplicate) { setError("Дубликат: продукт с таким названием и датой уже существует."); return; }

    try {
      const payload = {
        name: String(name).trim(),
        product_price: Number(product_price),
        product_quantity: Number(product_quantity),
        product_date,
      };
      const updated = await updateProduct(product.id, payload);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Ошибка при обновлении продукта.");
    }
  };

  return (
    <div className="product-list">
      <h2 className="product-list__title">Список продуктов</h2>

      {/* Поиск */}
      <div className="product-list__toolbar">
        <input
          type="text"
          className="product-list__search"
          placeholder="Поиск по названию или дате (ГГГГ-ММ-ДД)"
          aria-label="Поиск по названию или дате"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && (
          <button
            type="button"
            className="product-list__clear"
            onClick={() => setSearch("")}
            aria-label="Очистить поиск"
            title="Очистить"
          >
            ×
          </button>
        )}
      </div>

      {error && <p className="product-list__error">{error}</p>}

      {loading ? (
        <div className="product-list__spinner" />
      ) : (
        <>
          <div className="product-list__table-container">
            <table className="product-list__table">
              <thead>
                <tr className="product-list__table-header">
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center" }}>Нет данных</td></tr>
                ) : (
                  pageItems.map((product) => (
                    <tr className="product-list__table-row" key={product.id}>
                      <td>{product.name || "-"}</td>
                      <td>{product.product_price ?? "-"}</td>
                      <td>{product.product_quantity ?? "-"}</td>
                      <td>{product.product_date || "-"}</td>
                      <td
                        className={`product-list__status product-list__status--${
                          product.status ? "active" : "inactive"
                        }`}
                      >
                        {product.status ? "Продан" : "Не продан"}
                      </td>
                      <td>
                        <button
                          className="product-list__edit-btn"
                          onClick={() => openModal("edit", product)}
                        >
                          Изменить
                        </button>
                        <button
                          className="product-list__delete-btn"
                          onClick={() => openModal("delete", product)}
                          disabled={deletingId !== null}
                        >
                          {deletingId === product.id ? "Удаление..." : "Удалить"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="product-list__pagination" role="navigation" aria-label="Пагинация">
              <button
                className="product-list__page-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
                aria-label="Первая страница"
              >«</button>
              <button
                className="product-list__page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Предыдущая"
              >‹</button>
              {paginationNumbers.map((n) => (
                <button
                  key={n}
                  className={`product-list__page-btn ${n === page ? "is-active" : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                className="product-list__page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Следующая"
              >›</button>
              <button
                className="product-list__page-btn"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                aria-label="Последняя страница"
              >»</button>
              <span className="product-list__page-info">
                {page} / {totalPages} • всего {filteredProducts.length}
              </span>
            </div>
          )}
        </>
      )}

      {/* PIN → Edit */}
      {modal.type === "pin-edit" && modal.product && (
        <div className="product-list__modal">
          <div className="product-list__modal-content">
            <h3>Введите PIN-код</h3>
            <form onSubmit={(e) => handlePinSubmit(e, "edit")}>
              <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                placeholder="PIN-код"
                className="product-list__modal-input"
                autoFocus
              />
              {pinError && <p className="product-list__pin-error">{pinError}</p>}
              <div className="product-list__modal-buttons">
                <button type="submit" className="product-list__modal-btn">Подтвердить</button>
                <button type="button" onClick={closeModal} className="product-list__modal-btn">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN → Delete */}
      {modal.type === "pin-delete" && modal.product && (
        <div className="product-list__modal">
          <div className="product-list__modal-content">
            <h3>Введите PIN-код</h3>
            <form onSubmit={(e) => handlePinSubmit(e, "delete")}>
              <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                placeholder="PIN-код"
                className="product-list__modal-input"
                autoFocus
              />
              {pinError && <p className="product-list__pin-error">{pinError}</p>}
              <div className="product-list__modal-buttons">
                <button type="submit" className="product-list__modal-btn">Подтвердить</button>
                <button type="button" onClick={closeModal} className="product-list__modal-btn">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit */}
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
                <button type="submit" className="product-list__modal-btn">Сохранить</button>
                <button type="button" onClick={closeModal} className="product-list__modal-btn">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {modal.type === "delete" && modal.product && (
        <div className="product-list__modal">
          <div className="product-list__modal-content">
            <h3>Удалить продукт</h3>
            <p>Вы уверены, что хотите удалить «{modal.product.name}»?</p>
            <div className="product-list__modal-buttons">
              <button
                className="product-list__modal-btn product-list__modal-btn--delete"
                onClick={() => handleDelete(modal.product.id)}
                disabled={deletingId !== null}
              >
                {deletingId === modal.product.id ? "Удаление..." : "Удалить"}
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
