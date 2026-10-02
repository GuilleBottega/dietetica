import { useEffect, useState } from "react";
import { LanguageContext } from "./languageContext.js";

const translations = {
  es: {
    home: "Inicio",
    categories: "Categorías",
    cart: "Carrito",
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
    mainNavigation: "Navegación principal",
    products: "Productos",
    loading: "Cargando...",
    loadProductsError: "Error al cargar los productos",
    noProducts: "No hay productos",
    productDetails: "Detalles del producto",
    productNotFound: "Producto no encontrado",
    addToCart: "Agregar al carrito",
    quantity: "Cantidad",
    emptyCart: "Tu carrito está vacío.",
    remove: "Eliminar",
    total: "Total",
    clearCart: "Vaciar carrito",
    checkout: "Finalizar compra",
    contact: "Contacto",
    rateLoading: "Obteniendo la cotización oficial de venta del dólar...",
    rateError: "No se pudo obtener la cotización oficial de venta del dólar.",
    logoAlt: "Logo de Dietética",
    addedAnother: "Se agregó otra unidad del producto",
    addedToCart: "Producto agregado al carrito 🎉",
    removedFromCart: "Producto eliminado ✅",
    purchaseComplete: "Su compra ha sido realizada 🎉",
    whatsappMessage: "Hola, quiero hacer una consulta",
    categoriesNames: {
      "Frutos secos": "Frutos secos",
      Cereales: "Cereales",
      Colaciones: "Colaciones",
      Semillas: "Semillas",
      "Frutas deshidratadas": "Frutas deshidratadas",
      Untables: "Untables",
      Harinas: "Harinas",
      Legumbres: "Legumbres",
      Dulces: "Dulces",
      Endulzantes: "Endulzantes",
    },
  },
  en: {
    home: "Home",
    categories: "Categories",
    cart: "Cart",
    language: "Language",
    spanish: "Spanish",
    english: "English",
    mainNavigation: "Main navigation",
    products: "Products",
    loading: "Loading...",
    loadProductsError: "Error loading products",
    noProducts: "No products found",
    productDetails: "Product details",
    productNotFound: "Product not found",
    addToCart: "Add to cart",
    quantity: "Quantity",
    emptyCart: "Your cart is empty.",
    remove: "Remove",
    total: "Total",
    clearCart: "Empty cart",
    checkout: "Checkout",
    contact: "Contact",
    rateLoading: "Loading the official USD selling rate...",
    rateError: "Could not load the official USD selling rate.",
    logoAlt: "Dietética logo",
    addedAnother: "Another unit of the product was added",
    addedToCart: "Product added to cart 🎉",
    removedFromCart: "Product removed ✅",
    purchaseComplete: "Your purchase is complete 🎉",
    whatsappMessage: "Hello, I have a question",
    categoriesNames: {
      "Frutos secos": "Nuts",
      Cereales: "Cereals",
      Colaciones: "Snacks",
      Semillas: "Seeds",
      "Frutas deshidratadas": "Dried fruit",
      Untables: "Spreads",
      Harinas: "Flours",
      Legumbres: "Legumes",
      Dulces: "Sweets",
      Endulzantes: "Sweeteners",
    },
  },
};

const productTranslations = {
  1: {
    name: "Almonds",
    description: "Natural almonds, a source of fiber and healthy fats.",
  },
  2: {
    name: "Oats",
    description: "Oats ideal for breakfasts, smoothies, and homemade recipes.",
  },
  3: {
    name: "Granola bar",
    description: "A convenient snack to enjoy throughout the day.",
  },
  4: {
    name: "Chia seeds",
    description: "Chia seeds, a nutritious addition to your meals.",
  },
  5: {
    name: "Coconut",
    description: "Dried coconut for sweet and savory recipes.",
  },
  6: {
    name: "Corn flakes",
    description: "Crunchy corn flakes to enjoy with breakfast.",
  },
  7: {
    name: "Peanut butter",
    description: "Smooth, creamy peanut butter with no added preservatives.",
  },
  8: {
    name: "Dates",
    description: "Naturally sweet dates, ideal for snacks and recipes.",
  },
  9: {
    name: "Whole-grain cookies",
    description: "Whole-grain cookies to enjoy during a relaxing break.",
  },
  10: {
    name: "Whole-wheat flour",
    description: "Whole-wheat flour for breads, cakes, and other recipes.",
  },
  11: {
    name: "Legumes",
    description: "A selection of dried legumes for a varied diet.",
  },
  12: {
    name: "Quince paste",
    description: "Quince paste to enjoy with breakfast and afternoon tea.",
  },
  13: {
    name: "Jam",
    description: "Fruit jam to spread and enjoy with your meals.",
  },
  14: {
    name: "Walnuts",
    description: "Selected walnuts, a source of nutrients and healthy fats.",
  },
  15: {
    name: "Raisins",
    description: "Sweet raisins to enjoy on their own or add to your recipes.",
  },
  16: {
    name: "Pistachios",
    description: "Crunchy pistachios to enjoy as a healthy snack.",
  },
  17: {
    name: "Stevia",
    description: "Stevia-based sweetener for drinks and recipes.",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => (window.localStorage.getItem("language") === "en" ? "en" : "es")
  );
  const [exchangeRate, setExchangeRate] = useState(null);
  const [exchangeRateError, setExchangeRateError] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (language !== "en" || exchangeRate !== null || exchangeRateError) {
      return undefined;
    }

    const controller = new AbortController();

    fetch("https://dolarapi.com/v1/dolares/oficial", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Exchange rate request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((quote) => {
        if (typeof quote.venta !== "number" || !Number.isFinite(quote.venta) || quote.venta <= 0) {
          throw new Error("The official USD exchange rate is invalid");
        }
        setExchangeRate(quote.venta);
        setExchangeRateError(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setExchangeRateError(true);
      });

    return () => controller.abort();
  }, [language, exchangeRate, exchangeRateError]);

  const t = (key) => translations[language][key];
  const translateCategory = (category) =>
    translations[language].categoriesNames[category] || category;
  const translateProduct = (product) =>
    language === "en"
      ? { ...product, ...productTranslations[product.id] }
      : product;
  const formatPrice = (amount) => {
    if (language === "en" && !exchangeRate) return null;

    const currency = language === "en" ? "USD" : "ARS";
    const value = language === "en" ? amount / exchangeRate : amount;
    return new Intl.NumberFormat(language === "en" ? "en-US" : "es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCategory,
        translateProduct,
        formatPrice,
        exchangeRate,
        exchangeRateError,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
