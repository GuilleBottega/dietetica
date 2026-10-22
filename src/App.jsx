import Header from './components/header/Header.jsx'
import Footer from './components/footer/Footer.jsx'
import { Route, Routes} from 'react-router-dom';
import './App.css'
import { ItemDetailContainer } from './components/ItemDetailsContainer/ItemDetailContainer.jsx';
import { ItemListContainer } from './components/ItemListContainer/ItemListContainer.jsx';
import { Nav } from './components/nav/Nav.jsx';
import Cart from './components/cart/Cart.jsx';
import { useLanguage } from './context/useLanguage.js';
import ProductFormContainer from './components/adminComponents/ProductForm/ProductFormContainer.jsx';
import ProductSuccess from './components/adminComponents/ProductSuccess.jsx';

function App() {
  const { language, t, exchangeRate, exchangeRateError } = useLanguage();

  return (
    <>
      <Header />
      <Nav />
      {language === 'en' && !exchangeRate && (
        <p className="exchange-rate-status" role="status">
          {exchangeRateError ? t('rateError') : t('rateLoading')}
        </p>
      )}
      <main>
        <Routes>
          <Route path="/" element={<ItemListContainer />} />
          <Route path="/category/:category" element={<ItemListContainer />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ItemDetailContainer />} />    
          <Route path="/admin" element={<ProductFormContainer />} />
          <Route
            path="/admin/products/success/:id"
            element={<ProductSuccess />}/>
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;