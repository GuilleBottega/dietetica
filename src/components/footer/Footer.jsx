import { useEffect, useState } from 'react'
import './Footer.css'
import { useLanguage } from '../../context/useLanguage.js'

function Footer() {
  const { t, language } = useLanguage()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  const dateTime = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-AR', {
    dateStyle: 'full',
    timeStyle: 'medium',
    hourCycle: 'h23',
  }).format(now)

  return (
    <footer className="site-footer">
      <p>© 2026 Dietética</p>
      <p className="site-footer__datetime">
        <time dateTime={now.toISOString()}>
          {dateTime}
        </time>
      </p>
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
