import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductFormUI } from "./ProductFormUI.jsx";
import { validateProduct } from "../../../utils/validateProduct.js";
import { createProduct, getProducts } from "../../../services/products.js";
import { uploadImage } from "../../../services/uploadImage.js";
import "./ProductFormContainer.css";

const additionalCategories = ["Aceites"];

export const ProductFormContainer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    let isCurrent = true;

    const loadCategories = async () => {
      try {
        const products = await getProducts();
        const loadedCategories = [
          ...new Set([
            ...additionalCategories,
            ...products
              .map((existingProduct) => existingProduct.category?.trim())
              .filter(Boolean),
          ]),
        ].sort((first, second) => first.localeCompare(second, "es"));

        if (isCurrent) setCategories(loadedCategories);
      } catch (error) {
        console.error("No se pudieron cargar las categorías:", error);
        if (isCurrent) {
          setCategories(additionalCategories);
          setCategoriesError(
            "No se pudieron cargar las categorías existentes. Solo está disponible Aceites."
          );
        }
      } finally {
        if (isCurrent) setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
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
    const newErrors = validateProduct({ ...product, file });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const image = await uploadImage(file);
      const productData = {
        name: product.name.trim(),
        price: Number(product.price),
        category: product.category.trim(),
        description: product.description.trim(),
        image,
      };

      //alta
      const id = await createProduct(productData);
      //vaciar formulario
      setProduct({ name: "", price: "", category: "", description: "" });
      setFile(null);

      //navegar a la pagina de exito
      navigate(`/admin/products/success/${id}`, { replace: true });
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductFormUI
      product={product}
      errors={errors}
      loading={loading}
      categories={categories}
      categoriesLoading={categoriesLoading}
      categoriesError={categoriesError}
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
    />
  );
};

export default ProductFormContainer;
