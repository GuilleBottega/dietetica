import "./Item.css";
import { useLanguage } from "../../context/useLanguage.js";

export const Item = ({
  id,
  name,
  price,
  stock = 0,
  stockCapacity = stock,
  description,
  image,
  children,
}) => {
  const { translateProduct, formatPrice, t } = useLanguage();
  const translated = translateProduct({ id, name, description });
  const stockStatus =
    stock <= 0
      ? "outOfStock"
      : stockCapacity > 0 && stock / stockCapacity <= 0.2
        ? "lowStock"
        : "stockAvailable";

  return (
    <article className="card">
      <img src={image} alt={translated.name} />
      <h3>{translated.name}</h3>
      <p>{translated.description}</p>
      <p className={`card__stock card__stock--${stockStatus}`}>
        {t(stockStatus)}
      </p>
      <p>{formatPrice(price)}</p>

      {/* Podemos usar children y reutilizar este componente */}
      {children}
    </article>
  );
};
