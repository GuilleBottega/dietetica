import { useCart } from "../context/CartContext";
import "./Cart.css";

const Cart = () => {
  const { cart, removeItem, clearCart, getCartTotal, checkout } = useCart();

  if (!cart.length) {
    return (
      <section className="cart-page">
        <h1>Carrito</h1>
        <p>Tu carrito está vacío.</p>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1>Carrito</h1>
      <div className="cart-items">
        {cart.map((product) => (
          <article key={product.id} className="card cart-item">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <button className="cart-btn-danger" onClick={() => removeItem(product.id)}>
              Eliminar
            </button>
          </article>
        ))}
      </div>

      <div className="cart-summary">
        <p>Total: ${getCartTotal()}</p>
        <div className="cart-actions">
          <button className="cart-btn" onClick={clearCart}>Vaciar carrito</button>
          <button className="cart-btn-primary" onClick={checkout}>Finalizar compra</button>
        </div>
      </div>
    </section>
  );
};

export default Cart;
