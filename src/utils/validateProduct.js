export const validateProduct = (product, { requireImage = true } = {}) => {
  const errors = {};

  if (!product.name.trim()) {
    errors.name = "El nombre es obligatorio";
  }

  if (!product.price || product.price <= 0) {
    errors.price = "El precio debe ser mayor que 0";
  }

  if (!product.description.trim()) {
    errors.description = "La descripción es obligatoria";
  }

  if (!product.category.trim()) {
    errors.category = "La categoria es obligatoria";
  }

  const stock = Number(product.stock);
  if (
    product.stock === "" ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    errors.stock = "El stock debe ser un número entero igual o mayor que 0";
  }

  if (requireImage && !product.file) {
    errors.file = "Debes seleccionar una imagen";
  }
  return errors;
};