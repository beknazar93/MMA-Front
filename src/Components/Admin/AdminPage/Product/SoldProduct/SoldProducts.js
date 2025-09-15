import React, { useState, useEffect } from "react";
import { fetchProducts } from "../../api/Product";
import "./SoldProducts.scss";

const SoldProducts = () => {
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSoldProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        const sold = data.filter((product) => product.count > 0);
        setSoldProducts(sold);
      } catch (err) {
        setError(
          "Ошибка загрузки проданных продуктов: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    loadSoldProducts();
  }, []);

  return (
    <div className="sold-products">
      <h2 className="sold-products__title">Проданные продукты</h2>

      <div className="sold-products__content">
        {loading ? (
          <div className="sold-products__loader" />
        ) : error ? (
          <p className="sold-products__error">{error}</p>
        ) : soldProducts.length > 0 ? (
          <div className="sold-products__table-container">
            <table className="sold-products__table">
              <thead>
                <tr className="sold-products__table-header">
                  <th>Название</th>
                  <th>Цена закупки</th>
                  <th>Цена продажи</th>
                  <th>Количество проданных</th>
                  <th>Дата добавления</th>
                  <th>Дата продажи</th>
                </tr>
              </thead>
              <tbody>
                {soldProducts.map((product) => (
                  <tr className="sold-products__table-row" key={product.id}>
                    <td>{product.name || "-"}</td>
                    <td>{product.product_price || "-"}</td>
                    <td>{product.price_selling || "-"}</td>
                    <td>{product.count || "-"}</td>
                    <td>{product.product_date || "-"}</td>
                    <td>{product.date_selling || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sold-products__empty">Нет проданных продуктов</p>
        )}
      </div>
    </div>
  );
};

export default SoldProducts;
