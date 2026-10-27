export const ProductFormUI = ({
  product,
  errors,
  loading,
  categories,
  categoryIsCustom,
  customCategoryOption,
  categoriesLoading,
  categoriesError,
  isEditing = false,
  existingImage = "",
  onChange,
  onFileChange,
  onSubmit,
}) => {
  return (
    <section>
      <form className="product-form" onSubmit={onSubmit}>
        <h2>{isEditing ? "Editar producto" : "Agregar nuevo producto"}</h2>

        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={onChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        <div>
          <label>Precio:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={onChange}
            min="0"
          />
          {errors.price && <p className="error">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="product-category">Categoría:</label>
          <select
            id="product-category"
            name="category"
            value={categoryIsCustom ? customCategoryOption : product.category}
            onChange={onChange}
            disabled={categoriesLoading}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={
              errors.category ? "product-category-error" : undefined
            }
          >
            <option value="">
              {categoriesLoading
                ? "Cargando categorías..."
                : categories.length > 0
                  ? "Seleccioná una categoría"
                  : "No hay categorías guardadas"}
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value={customCategoryOption}>Otra categoría...</option>
          </select>
          {categoryIsCustom && (
            <input
              type="text"
              name="customCategory"
              value={product.category}
              onChange={onChange}
              placeholder="Escribí la nueva categoría"
              aria-label="Nueva categoría"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? "product-category-error" : undefined
              }
              autoFocus
            />
          )}
          {errors.category && <p className="error">{errors.category}</p>}
          {categoriesError && <p className="error" role="alert">{categoriesError}</p>}
        </div>

        <div>
          <label>Descripción:</label>
          <textarea
            name="description"
            value={product.description}
            onChange={onChange}
          />
          {errors.description && <p className="error">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="product-image">
            Imagen{isEditing ? " (opcional para conservar la actual)" : ""}:
          </label>
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
          {isEditing && existingImage && (
            <img
              className="product-form__image-preview"
              src={existingImage}
              alt={`Imagen actual de ${product.name}`}
            />
          )}
          {errors.file && <p className="error">{errors.file}</p>}
        </div>

        <button
          className="btn bg-primary"
          type="submit"
          disabled={loading || categoriesLoading}
        >
          {loading
            ? "Guardando..."
            : categoriesLoading
              ? "Cargando categorías..."
              : isEditing
                ? "Guardar cambios"
                : "Guardar"}
        </button>

        {errors.general && <p className="error">{errors.general}</p>}
      </form>
    </section>
  );
};