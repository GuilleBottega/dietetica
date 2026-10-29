import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./useLanguage.js";
import { createOrder } from "../services/orders.js";

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
    const quantityToAdd = Math.max(1, Math.floor(Number(quantity) || 1));
    const stock = Number.isInteger(item.stock) && item.stock > 0 ? item.stock : 0;

    setCart((prev) => {
      const productId = String(item.id);
      const existingItem = prev.find((element) => String(element.id) === productId);
      const currentQuantity = existingItem?.quantity || 0;
      const availableStock = stock - currentQuantity;

      if (availableStock <= 0) {
        alert(t("outOfStock"));
        return prev;
      }

      const allowedQuantity = Math.min(quantityToAdd, availableStock);
      if (allowedQuantity < quantityToAdd) alert(t("quantityLimited"));

      if (existingItem) {
        return prev.map((element) =>
          String(element.id) === productId
            ? { ...element, quantity: currentQuantity + allowedQuantity }
            : element
        );
      }

      alert(t("addedToCart"));
      return [...prev, { ...item, quantity: allowedQuantity }];
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
  const checkout = async (customer) => {
    const items = cart.map((product) => ({
      id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
    }));

    try {
      await createOrder({ customer, items });
    } catch (error) {
      if (error.code === "insufficient-stock") {
        const stockError = new Error(t("stockUnavailable"));
        stockError.code = error.code;
        throw stockError;
      }
      throw error;
    }
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