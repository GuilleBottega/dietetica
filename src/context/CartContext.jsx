import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*                              CREAMOS CONTEXTO                              */
/* -------------------------------------------------------------------------- */
const CartContext = createContext();

/* -------------------------------------------------------------------------- */
/*                                 CUSTOM HOOK                                */
/* -------------------------------------------------------------------------- */
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};

/* -------------------------------------------------------------------------- */
/*                                  PROVEEDOR                                 */
/* -------------------------------------------------------------------------- */
export const CartProvider = ({ children }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const isInCart = (item) => {
    const inCart = cart.some((element) => String(element.id) === String(item.id));
    return inCart;
  };

  const addItem = (item) => {
    setCart((prev) => {
      const productId = String(item.id);
      const existingItem = prev.find((element) => String(element.id) === productId);

      if (existingItem) {
        alert("Se agregó otra unidad del producto");
        return prev.map((element) =>
          String(element.id) === productId
            ? { ...element, quantity: (element.quantity || 1) + 1 }
            : element
        );
      }

      alert("Producto agregado al carrito 🎉");
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  //Eliminar del carrito
  const removeItem = (id) => {
    setCart((prev) => prev.filter((element) => String(element.id) !== String(id)));
    alert("Producto eliminado ✅");
  };

  //Vacia el carrito
  const clearCart = () => {
    setCart([]);
  };

  //Total de items en carrito
  const getTotalItems = () => {
    return cart.reduce((acc, element) => acc + (element.quantity || 1), 0);
  };

  //Total a pagar
  const getCartTotal = () => {
    return cart.reduce((acc, element) => acc + element.price * (element.quantity || 1), 0);
  };

  //Checkout
  const checkout = () => {
    alert("Su compra ha sido realizada 🎉");
    clearCart();
    navigate("/");
  };

  const values = {
    cart,
    addItem,
    clearCart,
    removeItem,
    getCartTotal,
    getTotalItems,
    checkout,
  };

  return <CartContext.Provider value={values}>{children}</CartContext.Provider>;
};