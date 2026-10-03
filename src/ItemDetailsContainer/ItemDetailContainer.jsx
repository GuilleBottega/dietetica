import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ItemDetail } from "../ItemDetails/ItemDetail";
import { useLanguage } from "../context/useLanguage.js";

export const ItemDetailContainer = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [result, setResult] = useState({ id: null, item: null, error: null });

  useEffect(() => {
    let isCurrent = true;

    fetch("/data/products.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load products");
        }
        return response.json();
      })
      .then((products) => {
        const item = products.find((product) => String(product.id) === id);
        if (isCurrent) {
          setResult({ id, item, error: item ? null : "not-found" });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setResult({ id, item: null, error: "load-failed" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  if (result.id !== id) return <p>{t("loading")}</p>;
  if (result.error === "not-found") return <p>{t("productNotFound")}</p>;
  if (result.error) return <p>{t("loadProductsError")}</p>;
  if (!result.item) return <p>{t("productNotFound")}</p>;

  return (
    <section>
      <h1>{t("productDetails")}</h1>
      <div className="products-container">
        <ItemDetail item={result.item} />
      </div>
    </section>
  );
};