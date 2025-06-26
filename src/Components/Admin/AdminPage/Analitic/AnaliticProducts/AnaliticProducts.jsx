import { useState, useEffect } from "react";
import { fetchProducts } from "../../api/Product";
import "./AnaliticProducts.scss";

const AnaliticProducts = () => {
  const [salesData, setSalesData] = useState([]);
  const [filter, setFilter] = useState("month");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        const sold = data.filter((p) => p.status);
        const sales = sold.reduce((acc, p) => {
          const key = p.date_selling
            ? p.date_selling.slice(0, filter === "year" ? 4 : filter === "month" ? 7 : 10)
            : "";
          acc[key] = (acc[key] || 0) + parseFloat(p.price_selling || 0) * parseInt(p.count || 1);
          return acc;
        }, {});
        setSalesData(Object.entries(sales).sort());
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };
    loadData();
  }, [filter]);

  return (
    <div className="analitics-products">
      <h2 className="analitics-products__title">Аналитика продаж продуктов</h2>
      <div className="analitics-products__filter">
        <select
          className="analitics-products__select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="day">День</option>
          <option value="month">Месяц</option>
          <option value="year">Год</option>
        </select>
      </div>
      <div className="analitics-products__table-container">
        <table className="analitics-products__table">
          <thead>
            <tr className="analitics-products__table-header">
              <th>Период</th>
              <th>Выручка (₽)</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map(([period, amount], index) => (
              <tr key={index} className="analitics-products__table-row">
                <td>{period || "Неизвестно"}</td>
                <td>{amount.toFixed(2)}</td>
              </tr>
            ))}
            {salesData.length === 0 && (
              <tr className="analitics-products__table-row">
                <td colSpan="2" className="analitics-products__empty">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnaliticProducts;