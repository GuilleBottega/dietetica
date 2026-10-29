import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductFormUI } from "./ProductFormUI.jsx";
import { validateProduct } from "../../../utils/validateProduct.js";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../../services/products.js";
import { getCategories } from "../../../services/categories.js";
import { uploadImage } from "../../../services/uploadImage.js";
import "./ProductFormContainer.css";

const customCategoryOption = "__new_category__";

export const ProductFormContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [productLoading, setProductLoading] = useState(Boolean(id));
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryIsCustom, setCategoryIsCustom] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "0",
    category: "",
    description: "",
  });

  useEffect(() => {
    let isCurrent = true;

    const loadFormData = async () => {
      const categoriesPromise = getCategories()
        .then((loadedCategories) => {
          if (isCurrent) setCategories(loadedCategories);
        })
        .catch((error) => {
          console.error("No se pudieron cargar las categorías del formulario:", error);
          if (isCurrent) {
            const errorDetails = error.code ?? error.message;
            setCategoriesError(
              `No se pudieron cargar las categorías existentes${errorDetails ? ` (${errorDetails})` : ""}. Podés escribir una nueva.`
            );
          }
        })
        .finally(() => {
          if (isCurrent) setCategoriesLoading(false);
        });

      const productPromise = id
        ? getProductById(id)
            .then((existingProduct) => {
              if (!isCurrent) return;

              if (!existingProduct) {
                setErrors({ general: "No se encontró el producto para editar." });
                return;
              }

              const productCategory = existingProduct.category ?? "";
              setCategories((currentCategories) =>
                productCategory && !currentCategories.includes(productCategory)
                  ? [...currentCategories, productCategory]
                  : currentCategories
              );
              setProduct({
                name: existingProduct.name ?? "",
                price: String(existingProduct.price ?? ""),
                stock: String(existingProduct.stock ?? 0),
                category: productCategory,
                description: existingProduct.description ?? "",
              });
              setExistingImage(existingProduct.image ?? "");
            })
            .catch((error) => {
              console.error("No se pudo cargar el producto para editar:", error);
              if (isCurrent) {
                setErrors({
                  general: "No se pudo cargar el producto. Revisá los permisos de Firestore e intentá recargar la página.",
                });
              }
            })
            .finally(() => {
              if (isCurrent) setProductLoading(false);
            })
        : Promise.resolve().then(() => {
            if (isCurrent) setProductLoading(false);
          });

      try {
        await Promise.all([categoriesPromise, productPromise]);
      } finally {
        if (isCurrent) {
          setCategoriesLoading(false);
          setProductLoading(false);
        }
      }
    };

    loadFormData();
    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "customCategory") {
      setProduct((currentProduct) => ({
        ...currentProduct,
        category: value,
      }));
      setErrors((currentErrors) => ({ ...currentErrors, category: "" }));
      return;
    }

    if (name === "category" && value === customCategoryOption) {
      setCategoryIsCustom(true);
      setProduct((currentProduct) => ({ ...currentProduct, category: "" }));
      setErrors((currentErrors) => ({ ...currentErrors, category: "" }));
      return;
    }

    if (name === "category") {
      setCategoryIsCustom(false);
    }
    setProduct((currentProduct) => ({ ...currentProduct, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //modificamos los estados para el "loading mientras se procesa"
    setErrors({});
    setLoading(true);

    //validar inputs
    const newErrors = validateProduct(
      { ...product, file },
      { requireImage: !id }
    );
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const image = file ? await uploadImage(file) : existingImage;
      const productData = {
        name: product.name.trim(),
        price: Number(product.price),
        stock: Number(product.stock),
        stockCapacity: Number(product.stock),
        category: product.category.trim(),
        description: product.description.trim(),
        image,
      };

      if (id) {
        await updateProduct(id, productData);
        navigate("/admin/products", { replace: true });
      } else {
        const newProductId = await createProduct(productData);
        setProduct({
          name: "",
          price: "",
          stock: "0",
          category: "",
          description: "",
        });
        setFile(null);
        navigate(`/admin/products/success/${newProductId}`, { replace: true });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="product-form-page">
      <p className="product-form-page__actions">
        <Link to="/admin/products">Ver productos para editar</Link>
      </p>
      {productLoading ? (
        <p role="status">Cargando producto...</p>
      ) : (
        <ProductFormUI
          product={product}
          errors={errors}
          loading={loading}
          categories={categories}
          categoryIsCustom={categoryIsCustom}
          customCategoryOption={customCategoryOption}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
          isEditing={Boolean(id)}
          existingImage={existingImage}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
};

export default ProductFormContainer;
