import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ItemList } from "../ItemList/ItemList";
import { useLanguage } from "../context/useLanguage.js";
import { getProducts } from "../services/products";

export const ItemListContainer = () => {
  const { category } = useParams();
  const { t, translateCategory } = useLanguage();
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch(() => setErrors(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t("loading")}</p>;
  if (errors) return <p>{t("loadProductsError")}</p>;

  const visibleProducts = category
    ? products.filter((product) => product.category === category)
    : products;

  return (
    <section>
      <h1>{category ? translateCategory(category) : t("products")}</h1>
      <ItemList products={visibleProducts} />
    </section>
  );
};