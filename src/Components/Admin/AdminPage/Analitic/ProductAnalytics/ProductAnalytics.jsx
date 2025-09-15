import { useState, useEffect } from "react";
import { fetchProducts } from "../../api/Product";
import "./ProductAnalytics.scss";

const ProductAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalSold: 0,
    totalRevenue: 0,
    topProducts: [],
    monthlySales: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const products = await fetchProducts();

        const soldProducts = products.filter(
          (p) => Number(p.count) > 0 && p.price_selling && p.date_selling
        );

        const totalSold = soldProducts.reduce(
          (sum, p) => sum + (Number(p.count) || 0),
          0
        );

        const totalRevenue = soldProducts
          .reduce(
            (sum, p) =>
              sum +
              (Number(p.price_selling) || 0) * (Number(p.count) || 0),
            0
          )
          .toFixed(2);

        const topProducts = soldProducts
          .sort(
            (a, b) => (Number(b.count) || 0) - (Number(a.count) || 0)
          )
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            name: p.name || "Без названия",
            count: Number(p.count) || 0,
            revenue: (
              (Number(p.price_selling) || 0) * (Number(p.count) || 0)
            ).toFixed(2),
          }));

        const monthlyMap = soldProducts.reduce((acc, p) => {
          if (!p.date_selling) return acc;
          const d = new Date(p.date_selling);
          if (isNaN(d.getTime())) return acc;
          const key = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;
          acc[key] = (acc[key] || 0) + (Number(p.count) || 0);
          return acc;
        }, {});
        const monthlySales = Object.entries(monthlyMap)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setAnalytics({ totalSold, totalRevenue, topProducts, monthlySales });
      } catch (err) {
        setError(
          "Ошибка загрузки аналитики: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="product-analytics">
      <h2 className="product-analytics__title">Аналитика продуктов</h2>

      {loading ? (
        <div className="product-analytics__loader" />
      ) : error ? (
        <p className="product-analytics__error">{error}</p>
      ) : (
        <div className="product-analytics__content">
          <div className="product-analytics__summary">
            <div className="product-analytics__card">
              <h3>Общее количество проданных единиц</h3>
              <p>{analytics.totalSold}</p>
            </div>
            <div className="product-analytics__card">
              <h3>Общая выручка</h3>
              <p>{analytics.totalRevenue} ₽</p>
            </div>
          </div>

          <div className="product-analytics__top-products">
            <h3>Топ-3 продукта по продажам</h3>
            {analytics.topProducts.length ? (
              <table className="product-analytics__table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Количество проданных</th>
                    <th>Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.count}</td>
                      <td>{p.revenue} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Нет данных о продажах</p>
            )}
          </div>

          <div className="product-analytics__monthly-sales">
            <h3>Продажи по месяцам</h3>
            {analytics.monthlySales.length ? (
              <table className="product-analytics__table">
                <thead>
                  <tr>
                    <th>Месяц</th>
                    <th>Количество проданных</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthlySales.map((sale) => (
                    <tr key={sale.month}>
                      <td>{sale.month}</td>
                      <td>{sale.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Нет данных о продажах</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAnalytics;
