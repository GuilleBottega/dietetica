import './Header.css'
import { useLanguage } from '../context/useLanguage.js'
import { Link } from 'react-router-dom'

function Header() {
	const { language, setLanguage, t } = useLanguage()

	return (
		<header className="site-header">
			<Link className="site-header__name" to="/" aria-label={t('home')}>
				Dietética Punto Diet
			</Link>
			<div className="site-header__tools">
				<label className="language-picker">
					<span>{t('language')}</span>
					<select
						value={language}
						onChange={(event) => setLanguage(event.target.value)}
						aria-label={t('language')}
					>
						<option value="es">Español</option>
						<option value="en">English</option>
					</select>
				</label>
				<img className="site-header__logo" src="/logo.jpg" alt={t('logoAlt')} />
			</div>
		</header>
	)
}

export default Header
