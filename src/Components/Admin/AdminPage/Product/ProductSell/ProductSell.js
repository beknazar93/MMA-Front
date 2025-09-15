import { useState, useEffect } from "react";
import { fetchProducts, sellProduct } from "../../api/Product";
import "./ProductSell.scss";

const ProductSell = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dateSelling, setDateSelling] = useState("");
  const [count, setCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data.filter((p) => p.product_quantity > 0));
      } catch (error) {
        setMessage(
          "Ошибка загрузки товаров: " +
            (error.response?.data?.message || error.message)
        );
      }
    };
    loadProducts();
  }, []);

  const validateInputs = () => {
    if (!selectedProduct) return "Выберите товар.";
    if (!dateSelling) return "Дата продажи обязательна.";
    if (!count || Number(count) <= 0) return "Количество должно быть больше 0.";
    if (Number(count) > selectedProduct.product_quantity)
      return "Недостаточно товара на складе.";
    return "";
  };

  const handleSell = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const updatedProduct = await sellProduct(
        selectedProduct.id,
        Number(selectedProduct.product_price),
        dateSelling,
        Number(count)
      );

      setProducts((prev) =>
        prev
          .map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
          .filter((p) => p.product_quantity > 0)
      );

      setMessage(`Товар "${selectedProduct.name}" успешно продан!`);
      setSelectedProduct(null);
      setDateSelling("");
      setCount("");
    } catch (error) {
      setMessage(
        "Ошибка при продаже товара: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-sell">
      <h2 className="product-sell__title">Продажа товара</h2>

      <select
        className="product-sell__select"
        aria-label="Выберите товар"
        value={selectedProduct ? selectedProduct.id : ""}
        onChange={(e) => {
          const product = products.find((p) => p.id === Number(e.target.value));
          setSelectedProduct(product || null);
          setMessage("");
        }}
      >
        <option value="">Выберите товар</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} (Цена: {product.product_price || "-"}, Остаток:{" "}
            {product.product_quantity || "-"})
          </option>
        ))}
      </select>

      {selectedProduct && (
        <>
          <p className="product-sell__price">
            Цена продажи: {selectedProduct.product_price || "-"}
          </p>

          <input
            type="date"
            required
            className="product-sell__input"
            aria-label="Дата продажи"
            value={dateSelling}
            onChange={(e) => setDateSelling(e.target.value)}
          />

          <input
            type="number"
            required
            min="1"
            placeholder="Количество для продажи"
            className="product-sell__input"
            aria-label="Количество для продажи"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            max={selectedProduct.product_quantity}
          />

          <button
            className="product-sell__btn"
            onClick={handleSell}
            disabled={loading}
          >
            {loading ? "Продажа..." : "Продать"}
          </button>
        </>
      )}

      {message && (
        <p
          className={`product-sell__message ${
            message.includes("Ошибка")
              ? "product-sell__message--error"
              : "product-sell__message--success"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default ProductSell;
