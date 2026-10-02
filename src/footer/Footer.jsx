import './Footer.css'
import { useLanguage } from '../context/useLanguage.js'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="site-footer">
      <p>© 2026 Dietética</p>
      <a href="mailto:contacto@dietetica.com">{t('contact')}</a>
      <a
        href={`https://wa.me/5491135201590?text=${encodeURIComponent(t('whatsappMessage'))}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
    </footer>
  )
}

export default Footer
