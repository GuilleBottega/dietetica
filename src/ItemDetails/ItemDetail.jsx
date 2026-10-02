import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/useLanguage.js";
import { Item } from "../Item/Item";
import "./ItemDetail.css";

export const ItemDetail = ({ item }) => {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (nextValue) => {
    const sanitizedValue = Number.isNaN(nextValue) ? 1 : Math.max(1, nextValue);
    setQuantity(sanitizedValue);
  };

  return (
    <div className="detail-wrapper">
      <Item {...item}>
        <div className="quantity-selector" aria-label={t("quantity")}>
          <button
            type="button"
            className="quantity-btn"
            onClick={() => handleQuantityChange(quantity - 1)}
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => handleQuantityChange(Number(event.target.value))}
            aria-label={t("quantity")}
          />
          <button
            type="button"
            className="quantity-btn"
            onClick={() => handleQuantityChange(quantity + 1)}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={() => addItem(item, quantity)}
        >
          <span aria-hidden="true">🛒</span>
          {t("addToCart")}
        </button>
      </Item>
    </div>
  );
};