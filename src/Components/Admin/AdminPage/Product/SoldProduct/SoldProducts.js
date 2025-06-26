import { useState, useEffect } from "react";
import { fetchProducts } from "../../api/Product";
import './SoldProducts.scss';

const SoldProducts = () => {
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSoldProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        const sold = data.filter((product) => product.status === true);
        setSoldProducts(sold);
      } catch (error) {
        alert("Ошибка загрузки проданных продуктов.");
      } finally {
        setLoading(false);
      }
    };
    loadSoldProducts();
  }, []);

  const calculateDiscountedPrice = (priceSelling, sale) => {
    if (!priceSelling || !sale) return priceSelling || "-";
    const discount = parseFloat(priceSelling) * (parseFloat(sale) / 100);
    return (parseFloat(priceSelling) - discount).toFixed(2);
  };

  return (
    <div className="sold-products">
      <h2 className="sold-products__title">Проданные продукты</h2>
      <div className="sold-products__content">
        {loading ? (
          <div className="sold-products__loader" />
        ) : soldProducts.length > 0 ? (
          <div className="sold-products__table-container">
            <table className="sold-products__table">
              <thead>
                <tr className="sold-products__table-header">
                  <th>Название</th>
                  <th>Цена закупки</th>
                  <th>Цена продажи</th>
                  <th>Цена со скидкой</th>
                  <th>Дата добавления</th>
                  <th>Количество проданных</th>
                  <th>Дата продажи</th>
                </tr>
              </thead>
              <tbody>
                {soldProducts.map((product) => (
                  <tr className="sold-products__table-row" key={product.id}>
                    <td>{product.name || "-"}</td>
                    <td>{product.product_price || "-"}</td>
                    <td>{product.price_selling || "-"}</td>
                    <td className="sold-products__discounted-price">
                      {calculateDiscountedPrice(product.price_selling, product.sale)}
                    </td>
                    <td>{product.product_date || "-"}</td>
                    <td>{product.count || "-"}</td>
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