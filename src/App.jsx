import Header from './header/Header.jsx'
import Footer from './footer/Footer.jsx'
import { Route, Routes} from 'react-router-dom';
import './App.css'
import { ItemDetailContainer } from './ItemDetailsContainer/ItemDetailContainer.jsx';
import { ItemListContainer } from './ItemListContainer/ItemListContainer.jsx';
import { Nav } from './nav/Nav.jsx';


function App() {
  return (
    <>
      <Header />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<ItemListContainer />} />
          <Route path="/category/:category" element={<ItemListContainer />} />
          <Route path="/cart" element={<h1>Carrito</h1>} />
          <Route path="/product/:id" element={<ItemDetailContainer />} />        
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;