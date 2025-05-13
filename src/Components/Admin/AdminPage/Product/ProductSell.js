import { useState, useEffect } from "react";
import { fetchProducts, sellProduct } from "../api/Product";

const ProductSell = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceSelling, setPriceSelling] = useState("");
  const [dateSelling, setDateSelling] = useState("");
  const [count, setCount] = useState("");
  const [sale, setSale] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
      }
    };
    loadProducts();
  }, []);

  const calculateDiscountedPrice = () => {
    if (!priceSelling || !sale) return priceSelling || "0.00";
    const discount = parseFloat(priceSelling) * (parseFloat(sale) / 100);
    return (parseFloat(priceSelling) - discount).toFixed(2);
  };

  const handleSell = async () => {
    if (!selectedProduct || !priceSelling || !dateSelling || !count) {
      setMessage("Заполните все поля.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const updatedProduct = await sellProduct(
        selectedProduct.id,
        priceSelling,
        dateSelling,
        count,
        sale || "0"
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setMessage(`Товар "${selectedProduct.name}" успешно продан!`);
      setSelectedProduct(null);
      setPriceSelling("");
      setDateSelling("");
      setCount("");
      setSale("");
    } catch (error) {
      setMessage("Ошибка при продаже товара.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-sell">
      <h2 className="product-sell__title">Продажа товара</h2>
      <select
        onChange={(e) => {
          const product = products.find((p) => p.id === Number(e.target.value));
          setSelectedProduct(product);
        }}
        value={selectedProduct ? selectedProduct.id : ""}
        className="product-sell__select"
      >
        <option value="">Выберите товар</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} (Цена: {product.product_price}, Остаток: {product.product_quantity})
          </option>
        ))}
      </select>
      {selectedProduct && (
        <>
          <input
            type="number"
            placeholder="Цена продажи"
            value={priceSelling}
            onChange={(e) => setPriceSelling(e.target.value)}
            className="product-sell__input"
          />
          <input
            type="date"
            value={dateSelling}
            onChange={(e) => setDateSelling(e.target.value)}
            className="product-sell__input"
          />
          <input
            type="number"
            placeholder="Количество для продажи"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="product-sell__input"
          />
          <input
            type="number"
            placeholder="Скидка (%)"
            value={sale}
            onChange={(e) => setSale(e.target.value)}
            className="product-sell__input"
          />
          {priceSelling && (
            <p className="product-sell__discount">
              Цена со скидкой: {calculateDiscountedPrice()}
            </p>
          )}
          <button
            onClick={handleSell}
            disabled={loading}
            className="product-sell__button"
          >
            {loading ? "Продажа..." : "Продать"}
          </button>
        </>
      )}
      {message && <p className="product-sell__message">{message}</p>}
    </div>
  );
};

export default ProductSell;