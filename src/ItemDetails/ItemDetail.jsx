import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/useLanguage.js";
import { Item } from "../Item/Item";
import "./ItemDetail.css";

export const ItemDetail = ({ item }) => {
  const { addItem } = useCart();
  const { t } = useLanguage();

  return (
    <div className="detail-wrapper">
      <Item {...item}>
        <button
          type="button"
          className="add-to-cart-btn"
          onClick={() => addItem(item)}
        >
          <span aria-hidden="true">🛒</span>
          {t("addToCart")}
        </button>
      </Item>
    </div>
  );
};