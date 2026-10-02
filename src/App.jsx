import Header from './header/Header.jsx'
import Footer from './footer/Footer.jsx'
import { Route, Routes} from 'react-router-dom';
import './App.css'
import { ItemDetailContainer } from './ItemDetailsContainer/ItemDetailContainer.jsx';
import { ItemListContainer } from './ItemListContainer/ItemListContainer.jsx';
import { Nav } from './nav/Nav.jsx';
import Cart from './cart/Cart.jsx';
import { useLanguage } from './context/useLanguage.js';


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
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;