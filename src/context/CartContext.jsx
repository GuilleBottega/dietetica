import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./useLanguage.js";

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
  const { t } = useLanguage();
  const [cart, setCart] = useState([]);

  const isInCart = (item) => {
    const inCart = cart.some((element) => String(element.id) === String(item.id));
    return inCart;
  };

  const addItem = (item, quantity = 1) => {
    const quantityToAdd = Math.max(1, Number(quantity) || 1);

    setCart((prev) => {
      const productId = String(item.id);
      const existingItem = prev.find((element) => String(element.id) === productId);

      if (existingItem) {
        alert(t("addedAnother"));
        return prev.map((element) =>
          String(element.id) === productId
            ? { ...element, quantity: (element.quantity || 1) + quantityToAdd }
            : element
        );
      }

      alert(t("addedToCart"));
      return [...prev, { ...item, quantity: quantityToAdd }];
    });
  };

  //Eliminar del carrito
  const removeItem = (id) => {
    setCart((prev) => prev.filter((element) => String(element.id) !== String(id)));
    alert(t("removedFromCart"));
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
    alert(t("purchaseComplete"));
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