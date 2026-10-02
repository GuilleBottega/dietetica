import "./Item.css";
import { useLanguage } from "../context/useLanguage.js";

export const Item = ({ id, name, price, description, image, children }) => {
  const { translateProduct, formatPrice } = useLanguage();
  const translated = translateProduct({ id, name, description });

  return (
    <article className="card">
      <img src={image} alt={translated.name} />
      <h3>{translated.name}</h3>
      <p>{translated.description}</p>
      <p>{formatPrice(price)}</p>

      {/* Podemos usar children y reutilizar este componente */}
      {children}
    </article>
  );
};
