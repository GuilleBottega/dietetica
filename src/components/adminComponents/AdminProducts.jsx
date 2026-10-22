import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteProduct, getProducts } from "../../services/products.js";
import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getProducts()
      .then((loadedProducts) => {
        if (isCurrent) setProducts(loadedProducts);
      })
      .catch((loadError) => {
        console.error("No se pudieron cargar los productos para administrar:", loadError);
        if (isCurrent) {
          setError("No se pudieron cargar los productos. Intentá nuevamente.");
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar "${product.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    setDeleteError("");
    try {
      await deleteProduct(product.id);
      setProducts((currentProducts) =>
        currentProducts.filter((currentProduct) => currentProduct.id !== product.id)
      );
    } catch (deleteProductError) {
      console.error("No se pudo eliminar el producto:", deleteProductError);
      setDeleteError(
        `No se pudo eliminar "${product.name}". Revisá los permisos de Firestore e intentá nuevamente.`
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="admin-products">
      <div className="admin-products__header">
        <h1>Administrar productos</h1>
        <Link className="admin-products__add" to="/admin">
          Agregar producto
        </Link>
      </div>

      {loading && <p role="status">Cargando productos...</p>}
      {error && <p className="admin-products__error" role="alert">{error}</p>}
      {deleteError && (
        <p className="admin-products__error" role="alert">
          {deleteError}
        </p>
      )}
      {!loading && !error && products.length === 0 && (
        <p>Todavía no hay productos para editar.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <ul className="admin-products__list">
          {products.map((product) => (
            <li className="admin-products__item" key={product.id}>
              {product.image && (
                <img src={product.image} alt="" loading="lazy" />
              )}
              <div className="admin-products__details">
                <h2>{product.name}</h2>
                <p>{product.category}</p>
              </div>
              <Link
                className="admin-products__edit"
                to={`/admin/products/${encodeURIComponent(product.id)}/edit`}
              >
                Editar
              </Link>
              <button
                className="admin-products__delete"
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => handleDelete(product)}
              >
                {deletingId === product.id ? "Eliminando..." : "Eliminar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
