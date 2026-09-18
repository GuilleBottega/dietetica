import { Link } from "react-router-dom";
import "./Nav.css";

export const Nav = () => {
  return (
    <nav>
      <ul className="nav-list">
        <li>
          <Link to={"/"}>Home</Link>
        </li>
        <li>
          <Link to={"/cart"}>Carrito</Link>
        </li>
      </ul>
    </nav>
  );
};