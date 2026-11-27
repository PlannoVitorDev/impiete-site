import './Footer.css'

export interface FooterLink {
  id: string
  label: string
  href: string
}

export interface FooterProps {
  brandName?: string
  sealSrc?: string
  links?: FooterLink[]
}

const DEFAULT_LINKS: FooterLink[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'apresentacao', label: 'Apresentação', href: '#apresentacao' },
  { id: 'revista', label: 'Revista', href: '#revista' },
]

export function Footer({
  brandName = 'IMPIÉTÉ',
  sealSrc = '/Selo.png',
  links = DEFAULT_LINKS,
}: FooterProps) {
  const year = new Date().getFullYear()

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="impiete-footer" aria-label="Rodapé">
      <div className="impiete-footer__container">
        <div className="impiete-footer__top">
          {/* Identidade e Selo */}
          <div className="impiete-footer__brand">
            <a href="#home" className="impiete-footer__brand-link">
              <span className="impiete-footer__seal">
                <img
                  src={sealSrc}
                  alt="Selo Dionysos da Revista Impiété"
                  className="impiete-footer__seal-img"
                />
              </span>
              <span className="impiete-footer__wordmark">{brandName}</span>
            </a>
            <p className="impiete-footer__tagline">
              Publicação independente de filosofia, literatura e arte visual.
              Pensamento trágico e criação livre em edições digitais gratuitas.
            </p>
          </div>

          {/* Navegação principal */}
          <div className="impiete-footer__col">
            <h3 className="impiete-footer__heading">Navegação</h3>
            <ul className="impiete-footer__list">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="impiete-footer__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Edições + Voltar ao topo */}
          <div className="impiete-footer__col">
            <h3 className="impiete-footer__heading">Edições</h3>
            <ul className="impiete-footer__list">
              <li>
                <a href="#revista" className="impiete-footer__link">
                  Volume 1 · O Fogo Roubado
                  <span className="impiete-footer__pill">Grátis</span>
                </a>
              </li>
              <li>
                <span className="impiete-footer__muted">
                  Volume 2 · Em breve
                </span>
              </li>
            </ul>

            <button
              type="button"
              className="impiete-footer__top-btn"
              onClick={handleBackToTop}
              aria-label="Voltar ao topo da página"
            >
              <span>Voltar ao topo</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="impiete-footer__bottom">
          <span className="impiete-footer__colophon">
            IMPIÉTÉ · ΠΡΟΜΗΘΕΥΣ · VOL. 1
          </span>
          <span className="impiete-footer__copy">
            © {year} {brandName} · Download gratuito
          </span>
        </div>
      </div>
    </footer>
  )
}
