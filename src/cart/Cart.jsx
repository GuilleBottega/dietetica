import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/useLanguage.js";
import "./Cart.css";

const Cart = () => {
  const { cart, removeItem, clearCart, getCartTotal, checkout } = useCart();
  const { t, translateProduct, formatPrice } = useLanguage();

  if (!cart.length) {
    return (
      <section className="cart-page">
        <h1>{t("cart")}</h1>
        <p>{t("emptyCart")}</p>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1>{t("cart")}</h1>
      <div className="cart-items">
        {cart.map((product) => {
          const translated = translateProduct(product);

          return (
            <article key={product.id} className="card cart-item">
              <img src={product.image} alt={translated.name} />
              <h3>{translated.name}</h3>
              <p>{translated.description}</p>
              <p>{formatPrice(product.price)}</p>
              <button
                className="cart-btn-danger"
                onClick={() => removeItem(product.id)}
              >
                {t("remove")}
              </button>
            </article>
          );
        })}
      </div>

      <div className="cart-summary">
        <p>
          {t("total")}: {formatPrice(getCartTotal())}
        </p>
        <div className="cart-actions">
          <button className="cart-btn" onClick={clearCart}>
            {t("clearCart")}
          </button>
          <button className="cart-btn-primary" onClick={checkout}>
            {t("checkout")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Cart;
