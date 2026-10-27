import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header.jsx';
import Footer from '../components/footer/Footer.jsx';
import { Nav } from '../components/nav/Nav.jsx';
import { useLanguage } from '../context/useLanguage.js';

export default function PublicLayouts() {
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
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
