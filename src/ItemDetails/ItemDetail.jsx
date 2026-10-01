import { useCart } from "../context/CartContext";
import { Item } from "../Item/Item";
import "./ItemDetail.css";

export const ItemDetail = ({ item }) => {
  const { addItem } = useCart();

  return (
    <div className="detail-wrapper">
      <Item {...item}>
        <button
          type="button"
          className="add-to-cart-btn"
          onClick={() => addItem(item)}
        >
          <span aria-hidden="true">🛒</span>
          Agregar al carrito
        </button>
      </Item>
    </div>
  );
};