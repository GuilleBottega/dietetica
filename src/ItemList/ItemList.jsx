import { Item } from "../Item/Item";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";
import "./ItemList.css";

export const ItemList = ({ products }) => {
  const { t } = useLanguage();

  if (!products.length) {
    return <p>{t("noProducts")}</p>;
  }

  return (
    <div className="products-container">
      {products.map((product) => (
        <Link to={`/product/${product.id}`} key={product.id}>
          <Item {...product} />
        </Link>
      ))}
    </div>
  );
};