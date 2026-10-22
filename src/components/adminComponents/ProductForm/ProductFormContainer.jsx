import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductFormUI } from "./ProductFormUI.jsx";
import { validateProduct } from "../../../utils/validateProduct.js";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../../../services/products.js";
import { uploadImage } from "../../../services/uploadImage.js";
import "./ProductFormContainer.css";

const additionalCategories = ["Aceites"];
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
    category: "",
    description: "",
  });

  useEffect(() => {
    let isCurrent = true;

    const loadFormData = async () => {
      try {
        const [products, existingProduct] = await Promise.all([
          getProducts(),
          id ? getProductById(id) : Promise.resolve(null),
        ]);
        const loadedCategories = [
          ...new Set([
            ...additionalCategories,
            ...products
              .map((existingProduct) => existingProduct.category?.trim())
              .filter(Boolean),
          ]),
        ].sort((first, second) => first.localeCompare(second, "es"));

        if (isCurrent) {
          setCategories(loadedCategories);
          if (id && existingProduct) {
            setProduct({
              name: existingProduct.name ?? "",
              price: String(existingProduct.price ?? ""),
              category: existingProduct.category ?? "",
              description: existingProduct.description ?? "",
            });
            setExistingImage(existingProduct.image ?? "");
          } else if (id) {
            setErrors({ general: "No se encontró el producto para editar." });
          }
        }
      } catch (error) {
        console.error("No se pudieron cargar los datos del formulario:", error);
        if (isCurrent) {
          setCategories(additionalCategories);
          setCategoriesError(
            "No se pudieron cargar las categorías existentes. Solo está disponible Aceites."
          );
          if (id) {
            setErrors({
              general: "No se pudo cargar el producto. Intentá recargar la página.",
            });
          }
        }
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
        category: product.category.trim(),
        description: product.description.trim(),
        image,
      };

      if (id) {
        await updateProduct(id, productData);
        navigate("/admin/products", { replace: true });
      } else {
        const newProductId = await createProduct(productData);
        setProduct({ name: "", price: "", category: "", description: "" });
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
