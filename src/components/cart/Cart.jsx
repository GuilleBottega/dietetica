import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/useLanguage.js";
import "./Cart.css";

const Cart = () => {
  const { cart, removeItem, clearCart, getCartTotal, checkout } = useCart();
  const { t, translateProduct, formatPrice } = useLanguage();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = async (event) => {
    event.preventDefault();
    const customer = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
    };

    if (!customer.name || !customer.phone) {
      setCheckoutError(t("customerRequired"));
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      await checkout(customer);
    } catch (error) {
      console.error("No se pudo registrar el pedido:", error);
      setCheckoutError(t("purchaseError"));
    } finally {
      setIsCheckingOut(false);
    }
  };

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

      <form className="cart-checkout" onSubmit={handleCheckout}>
        <h2>{t("customerDetails")}</h2>
        <label htmlFor="customer-name">{t("customerName")}</label>
        <input
          id="customer-name"
          name="customerName"
          type="text"
          autoComplete="name"
          required
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />
        <label htmlFor="customer-phone">{t("customerPhone")}</label>
        <input
          id="customer-phone"
          name="customerPhone"
          type="tel"
          autoComplete="tel"
          required
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
        />
        {checkoutError && (
          <p className="cart-checkout__error" role="alert">
            {checkoutError}
          </p>
        )}
        <div className="cart-summary">
          <p>
            {t("total")}: {formatPrice(getCartTotal())}
          </p>
          <div className="cart-actions">
            <button className="cart-btn" type="button" onClick={clearCart}>
              {t("clearCart")}
            </button>
            <button
              className="cart-btn-primary"
              type="submit"
              disabled={isCheckingOut}
            >
              {isCheckingOut ? t("savingOrder") : t("checkout")}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Cart;
