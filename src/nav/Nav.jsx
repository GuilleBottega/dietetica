import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/useLanguage.js";
import "./Nav.css";

export const Nav = () => {
  const { getTotalItems } = useCart();
  const { language, t, translateCategory } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const categories = [
    "Frutos secos",
    "Cereales",
    "Colaciones",
    "Semillas",
    "Frutas deshidratadas",
    "Untables",
    "Harinas",
    "Legumbres",
    "Dulces",
    "Endulzantes",
  ];
  const sortedCategories = [...categories].sort((first, second) =>
    new Intl.Collator(language).compare(
      translateCategory(first),
      translateCategory(second)
    )
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <nav className="site-nav" aria-label={t("mainNavigation")}>
      <div className="site-nav__inner">
        <Link className="nav-fixed-link" to="/">
          {t("home")}
        </Link>
        <button
          className={`menu-toggle${isOpen ? " menu-toggle--open" : ""}`}
          type="button"
          aria-expanded={isOpen}
          aria-controls="category-menu"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>{t("categories")}</span>
        </button>
        <Link className="nav-fixed-link nav-fixed-link--cart" to="/cart">
          {t("cart")}
          {getTotalItems() > 0 && (
            <span className="incart">{getTotalItems()}</span>
          )}
        </Link>
      </div>
      {isOpen && (
        <ul className="nav-list" id="category-menu">
          {sortedCategories.map((category) => (
            <li key={category}>
              <Link
                to={`/category/${encodeURIComponent(category)}`}
                onClick={() => setIsOpen(false)}
              >
                {translateCategory(category)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};