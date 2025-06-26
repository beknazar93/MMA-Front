import { useState, useEffect } from "react";
import { fetchProducts, deleteProduct } from "../../api/Product";
import './ProductsList.scss';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        alert("Ошибка загрузки списка продуктов.");
      }
    };
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      alert("Ошибка при удалении продукта.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-list">
      <h2 className="product-list__title">Список продуктов</h2>
      <div className="product-list__table-container">
        <table className="product-list__table">
          <thead>
            <tr className="product-list__table-header">
              <th>Название</th>
              <th>Цена</th>
              <th>Дата добавления</th>
              <th>Количество</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="product-list__table-row" key={product.id}>
                <td>{product.name || "-"}</td>
                <td>{product.product_price || "-"}</td>
                <td>{product.product_date || "-"}</td>
                <td>{product.product_quantity || "-"}</td>
                <td className={`product-list__status product-list__status--${product.status ? "active" : "inactive"}`}>
                  {product.status ? "Активен" : "Неактивен"}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(product.id)}
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
    </div>
  );
};

export default ProductsList;