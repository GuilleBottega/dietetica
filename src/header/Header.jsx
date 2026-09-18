import './Header.css'

function Header() {
	return (
		<header className="site-header">
			<a className="site-header__name" href="/" aria-label="Inicio">
				Dietética Punto Diet
			</a>
			<img className="site-header__logo" src="/logo.jpg" alt="Logo de Dietética" />
		</header>
	)
}

export default Header
