import { Link } from "react-router-dom";
import "./Nav.css";

export const Nav = () => {
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

  return (
    <nav>
      <ul className="nav-list">
        <li>
          <Link to={"/"}>Home</Link>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <Link to={`/category/${encodeURIComponent(category)}`}>
              {category}
            </Link>
          </li>
        ))}
        <li>
          <Link to={"/cart"}>Carrito</Link>
        </li>
      </ul>
    </nav>
  );
};