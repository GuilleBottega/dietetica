import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  getProducts,
} from "../../services/products.js";
import {
  createCategory,
  deleteCategory,
  initializeCategories,
  updateCategory,
} from "../../services/categories.js";
import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deletingCategory, setDeletingCategory] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categorySaveError, setCategorySaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [stockReportError, setStockReportError] = useState("");
  const selectedProducts = products.filter((product) =>
    selectedProductIds.includes(product.id)
  );

  useEffect(() => {
    let isCurrent = true;

    getProducts()
      .then((loadedProducts) => {
        if (isCurrent) setProducts(loadedProducts);
      })
      .catch((loadError) => {
        console.error("No se pudieron cargar los productos para administrar:", loadError);
        if (isCurrent) {
          setError("No se pudieron cargar los productos. Revisá la conexión y los permisos de Firestore.");
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    initializeCategories()
      .then((loadedCategories) => {
        if (isCurrent) setCategories(loadedCategories);
      })
      .catch((loadError) => {
        console.error("No se pudieron cargar las categorías para administrar:", loadError);
        if (isCurrent) {
          const errorDetails = loadError.code ?? loadError.message;
          setCategoriesError(
            `No se pudieron cargar las categorías${errorDetails ? ` (${errorDetails})` : ""}.`
          );
        }
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

  const handleProductSelection = (productId) => {
    setSelectedProductIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId]
    );
  };

  const handleSelectAllProducts = () => {
    setSelectedProductIds(products.map((product) => product.id));
  };

  const handleExportStockPdf = () => {
    if (selectedProducts.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setStockReportError(
        "El navegador bloqueó la ventana del reporte. Permití las ventanas emergentes e intentá nuevamente."
      );
      return;
    }
    setStockReportError("");

    const escapeHtml = (value) =>
      String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]);
    const rows = selectedProducts
      .map((product) => {
        const stock =
          Number.isInteger(product.stock) && product.stock >= 0
            ? product.stock
            : 0;
        return `<tr><td>${escapeHtml(product.name)}</td><td>${stock}</td></tr>`;
      })
      .join("");

    printWindow.document.write(`<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Stock actual de productos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #222; }
            h1 { font-size: 22px; margin-bottom: 8px; }
            p { color: #555; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px 12px; border: 1px solid #bbb; text-align: left; }
            th { background: #f0f0f0; }
            @media print { body { margin: 15mm; } }
          </style>
        </head>
        <body>
          <h1>Stock actual de productos</h1>
          <p>Generado: ${escapeHtml(new Date().toLocaleString("es-AR"))}</p>
          <table>
            <thead><tr><th>Producto</th><th>Stock actual</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`);
    printWindow.document.close();
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const handleDeleteCategory = async (category) => {
    const categoryProducts = products.filter(
      (product) => product.category?.trim() === category
    );
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar la categoría "${category}" y sus ${categoryProducts.length} productos? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingCategory(category);
    setDeleteError("");
    try {
      await deleteCategory(category);
      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.category?.trim() !== category
        )
      );
      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) => currentCategory !== category
        )
      );
      if (editingCategory === category) {
        setEditingCategory("");
        setCategoryName("");
      }
    } catch (deleteCategoryError) {
      console.error("No se pudo eliminar la categoría:", deleteCategoryError);
      try {
        const [updatedProducts, updatedCategories] = await Promise.all([
          getProducts(),
          initializeCategories(),
        ]);
        setProducts(updatedProducts);
        setCategories(updatedCategories);
      } catch (refreshError) {
        console.error(
          "No se pudieron actualizar los datos tras el error de eliminación:",
          refreshError
        );
      }
      setDeleteError(
        `No se pudo eliminar "${category}". Revisá los permisos de Firestore e intentá nuevamente.`
      );
    } finally {
      setDeletingCategory("");
    }
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    const normalizedName = categoryName.trim();
    if (!normalizedName) {
      setCategorySaveError("El nombre de la categoría es obligatorio.");
      return;
    }

    setSavingCategory(true);
    setCategorySaveError("");
    try {
      if (editingCategory) {
        await updateCategory(editingCategory, normalizedName);
        setCategories((currentCategories) =>
          currentCategories
            .map((category) =>
              category === editingCategory ? normalizedName : category
            )
            .sort((first, second) => first.localeCompare(second, "es"))
        );
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.category?.trim() === editingCategory
              ? { ...product, category: normalizedName }
              : product
          )
        );
      } else {
        await createCategory(normalizedName);
        setCategories((currentCategories) =>
          [...currentCategories, normalizedName].sort((first, second) =>
            first.localeCompare(second, "es")
          )
        );
      }

      setCategoryName("");
      setEditingCategory("");
    } catch (saveError) {
      console.error("No se pudo guardar la categoría:", saveError);
      setCategorySaveError(
        saveError.message || "No se pudo guardar la categoría. Intentá nuevamente."
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category);
    setCategorySaveError("");
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategory("");
    setCategoryName("");
    setCategorySaveError("");
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
      {categoriesError && (
        <p className="admin-products__error" role="alert">
          {categoriesError}
        </p>
      )}
      {!loading && !error && products.length === 0 && (
        <p>Todavía no hay productos para editar.</p>
      )}

      {!loading && !error && !categoriesError && (
        <section className="admin-products__categories" aria-labelledby="admin-categories-title">
          <h2 id="admin-categories-title">Administrar categorías</h2>
          <form className="admin-products__category-form" onSubmit={handleSaveCategory}>
            <label htmlFor="admin-category-name">
              {editingCategory ? "Editar categoría:" : "Nueva categoría:"}
            </label>
            <input
              id="admin-category-name"
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              disabled={savingCategory}
            />
            <button
              className="admin-products__add"
              type="submit"
              disabled={savingCategory || Boolean(deletingId || deletingCategory)}
            >
              {savingCategory
                ? "Guardando..."
                : editingCategory
                  ? "Guardar cambios"
                  : "Agregar categoría"}
            </button>
            {editingCategory && (
              <button
                className="admin-products__category-cancel"
                type="button"
                onClick={handleCancelCategoryEdit}
                disabled={savingCategory}
              >
                Cancelar
              </button>
            )}
            {categorySaveError && (
              <p className="admin-products__error" role="alert">
                {categorySaveError}
              </p>
            )}
          </form>
          <ul className="admin-products__category-list">
            {categories.map((category) => {
              const productCount = products.filter(
                (product) => product.category?.trim() === category
              ).length;

              return (
                <li className="admin-products__category" key={category}>
                  <span>
                    {category} ({productCount} {productCount === 1 ? "producto" : "productos"})
                  </span>
                  <div className="admin-products__category-actions">
                    <button
                      className="admin-products__edit"
                      type="button"
                      disabled={Boolean(deletingId || deletingCategory || savingCategory)}
                      onClick={() => handleEditCategory(category)}
                    >
                      Editar
                    </button>
                    <button
                      className="admin-products__delete"
                      type="button"
                      disabled={Boolean(deletingId || deletingCategory || savingCategory)}
                      onClick={() => handleDeleteCategory(category)}
                    >
                      {deletingCategory === category
                        ? "Eliminando..."
                        : "Eliminar categoría"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="admin-products__stock-report">
            <p>
              {selectedProducts.length} producto(s) seleccionado(s) para el reporte
            </p>
            <div>
              <button
                className="admin-products__category-cancel"
                type="button"
                onClick={handleSelectAllProducts}
              >
                Seleccionar todos
              </button>
              <button
                className="admin-products__category-cancel"
                type="button"
                onClick={() => setSelectedProductIds([])}
                disabled={selectedProductIds.length === 0}
              >
                Limpiar selección
              </button>
              <button
                className="admin-products__add"
                type="button"
                onClick={handleExportStockPdf}
                disabled={selectedProducts.length === 0}
              >
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>
          {stockReportError && (
            <p className="admin-products__error" role="alert">
              {stockReportError}
            </p>
          )}
          <ul className="admin-products__list">
          {products.map((product) => (
            <li className="admin-products__item" key={product.id}>
              <label className="admin-products__product-selection">
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => handleProductSelection(product.id)}
                  aria-label={`Incluir ${product.name} en el PDF de stock`}
                />
                <span>Incluir en PDF</span>
              </label>
              {product.image && (
                <img src={product.image} alt="" loading="lazy" />
              )}
              <div className="admin-products__details">
                <h2>{product.name}</h2>
                <p>{product.category}</p>
                <p>
                  Stock:{" "}
                  {Number.isInteger(product.stock) && product.stock >= 0
                    ? product.stock
                    : 0}
                </p>
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
                disabled={Boolean(deletingId || deletingCategory)}
                onClick={() => handleDelete(product)}
              >
                {deletingId === product.id ? "Eliminando..." : "Eliminar"}
              </button>
            </li>
          ))}
          </ul>
        </>
      )}
    </section>
  );
}
