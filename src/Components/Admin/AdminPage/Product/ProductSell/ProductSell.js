// import { useState, useEffect } from "react";
// import { fetchProducts, sellProduct } from "../../api/Product";
// import './ProductSell.scss';

// const ProductSell = () => {
//   const [products, setProducts] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [priceSelling, setPriceSelling] = useState("");
//   const [dateSelling, setDateSelling] = useState("");
//   const [count, setCount] = useState("");
//   const [sale, setSale] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         const data = await fetchProducts();
//         setProducts(data);
//       } catch (error) {
//         setMessage("Ошибка загрузки товаров.");
//       }
//     };
//     loadProducts();
//   }, []);

//   const calculateDiscountedPrice = () => {
//     if (!priceSelling || !sale) return priceSelling || "0.00";
//     const discount = parseFloat(priceSelling) * (parseFloat(sale) / 100);
//     return (parseFloat(priceSelling) - discount).toFixed(2);
//   };

//   const handleSell = async () => {
//     if (!selectedProduct || !priceSelling || !dateSelling || !count) {
//       setMessage("Заполните все поля.");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const updatedProduct = await sellProduct(
//         selectedProduct.id,
//         priceSelling,
//         dateSelling,
//         count,
//         sale || "0"
//       );
//       setProducts((prev) =>
//         prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
//       );
//       setMessage(`Товар "${selectedProduct.name}" успешно продан!`);
//       setSelectedProduct(null);
//       setPriceSelling("");
//       setDateSelling("");
//       setCount("");
//       setSale("");
//     } catch (error) {
//       setMessage("Ошибка при продаже товара.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="product-sell">
//       <h2 className="product-sell__title">Продажа товара</h2>
//       <select
//         onChange={(e) => {
//           const product = products.find((p) => p.id === Number(e.target.value));
//           setSelectedProduct(product);
//         }}
//         value={selectedProduct ? selectedProduct.id : ""}
//         className="product-sell__select"
//       >
//         <option value="">Выберите товар</option>
//         {products.map((product) => (
//           <option key={product.id} value={product.id}>
//             {product.name} (Цена: {product.product_price || "-"}, Остаток: {product.product_quantity || "-"})
//           </option>
//         ))}
//       </select>
//       {selectedProduct && (
//         <>
//           <input
//             type="number"
//             placeholder="Цена продажи"
//             value={priceSelling}
//             onChange={(e) => setPriceSelling(e.target.value)}
//             className="product-sell__input"
//             required
//           />
//           <input
//             type="date"
//             value={dateSelling}
//             onChange={(e) => setDateSelling(e.target.value)}
//             className="product-sell__input"
//             required
//           />
//           <input
//             type="number"
//             placeholder="Количество для продажи"
//             value={count}
//             onChange={(e) => setCount(e.target.value)}
//             className="product-sell__input"
//             required
//           />
//           <input
//             type="number"
//             placeholder="Скидка (%)"
//             value={sale}
//             onChange={(e) => setSale(e.target.value)}
//             className="product-sell__input"
//           />
//           {priceSelling && (
//             <p className="product-sell__discount">
//               Цена со скидкой: {calculateDiscountedPrice()}
//             </p>
//           )}
//           <button
//             onClick={handleSell}
//             disabled={loading}
//             className="product-sell__btn"
//           >
//             {loading ? "Продажа..." : "Продать"}
//           </button>
//         </>
//       )}
//       {message && (
//         <p className={`product-sell__message ${message.includes("Ошибка") ? "product-sell__message--error" : "product-sell__message--success"}`}>
//           {message}
//         </p>
//       )}
//     </div>
//   );
// };

// export default ProductSell;

import { useState, useEffect } from "react";
import { fetchProducts, sellProduct } from "../../api/Product";
import './ProductSell.scss';

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
        setMessage("Ошибка загрузки товаров: " + (error.response?.data?.message || error.message));
      }
    };
    loadProducts();
  }, []);

  const validateInputs = () => {
    if (!selectedProduct) return "Выберите товар.";
    if (!dateSelling) return "Дата продажи обязательна.";
    if (!count || Number(count) <= 0) return "Количество должно быть больше 0.";
    if (Number(count) > selectedProduct.product_quantity) return "Недостаточно товара на складе.";
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
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)).filter((p) => p.product_quantity > 0)
      );
      setMessage(`Товар "${selectedProduct.name}" успешно продан!`);
      setSelectedProduct(null);
      setDateSelling("");
      setCount("");
    } catch (error) {
      setMessage("Ошибка при продаже товара: " + (error.response?.data?.message || error.message));
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
          setMessage("");
        }}
        value={selectedProduct ? selectedProduct.id : ""}
        className="product-sell__select"
      >
        <option value="">Выберите товар</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} (Цена: {product.product_price || "-"}, Остаток: {product.product_quantity || "-"})
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
            value={dateSelling}
            onChange={(e) => setDateSelling(e.target.value)}
            className="product-sell__input"
            required
          />
          <input
            type="number"
            placeholder="Количество для продажи"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min="1"
            max={selectedProduct.product_quantity}
            className="product-sell__input"
            required
          />
          <button
            onClick={handleSell}
            disabled={loading}
            className="product-sell__btn"
          >
            {loading ? "Продажа..." : "Продать"}
          </button>
        </>
      )}
      {message && (
        <p className={`product-sell__message ${message.includes("Ошибка") ? "product-sell__message--error" : "product-sell__message--success"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ProductSell;