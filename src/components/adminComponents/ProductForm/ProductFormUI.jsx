export const ProductFormUI = ({
  product,
  errors,
  loading,
  categories,
  categoriesLoading,
  categoriesError,
  onChange,
  onFileChange,
  onSubmit,
}) => {
  return (
    <section>
      <form className="product-form" onSubmit={onSubmit}>
        <h2>Agregar nuevo producto</h2>

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
            value={product.category}
            onChange={onChange}
            disabled={categoriesLoading || categories.length === 0}
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
                  : "No hay categorías disponibles"}
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
          <label>Imagen:</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {errors.file && <p className="error">{errors.file}</p>}
        </div>

        <button
          className="btn bg-primary"
          type="submit"
          disabled={loading || categoriesLoading || categories.length === 0}
        >
          {loading
            ? "Guardando..."
            : categoriesLoading
              ? "Cargando categorías..."
              : "Guardar"}
        </button>

        {errors.general && <p className="error">{errors.general}</p>}
      </form>
    </section>
  );
};