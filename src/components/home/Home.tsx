import { useRef } from 'react'
import type { MouseEvent } from 'react'
import './Home.css'

export interface HomeProps {
  bannerSrc?: string
  bannerAlt?: string
  sealSrc?: string
  coverSrc?: string
  coverAlt?: string
  spreadSrc?: string
  spreadAlt?: string
  nextSectionId?: string
}

export function Home({
  bannerSrc = '/BannerSiteImpiete.png',
  bannerAlt = 'Fundo texturizado azul da Revista Impiété',
  sealSrc = '/Selo.png',
  coverSrc = '/CapaImpieteVol1.png',
  coverAlt = 'Capa da Revista Impiété Vol. 1',
  spreadSrc = '/Apresentação.png',
  spreadAlt = 'Revista Impiété Vol. 1 aberta na página de Apresentação',
  nextSectionId = 'apresentacao',
}: HomeProps) {
  const sectionRef = useRef<HTMLElement>(null)

  const handleScrollDown = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const next = document.getElementById(nextSectionId)
    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const section = sectionRef.current
    if (section) {
      window.scrollTo({
        top: section.offsetTop + section.offsetHeight,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="impiete-home"
      aria-labelledby="home-titulo"
    >
      <div className="impiete-home__media" aria-hidden="true">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          width={1920}
          height={1080}
          className="impiete-home__banner"
        />
        <div className="impiete-home__seal-backdrop">
          <span className="impiete-home__seal-ring" />
          <img
            src={sealSrc}
            alt=""
            className="impiete-home__seal-watermark"
          />
        </div>
        <div className="impiete-home__glow" />
        <div className="impiete-home__fade-bottom" />
      </div>

      <div className="impiete-home__inner">
        {/* Revista flutuando em 3D */}
        <div className="impiete-home__showcase">
          <div className="impiete-home__float impiete-home__float--cover">
            <div className="impiete-home__item impiete-home__item--cover">
              <figure className="impiete-home__magazine impiete-home__magazine--cover">
                <img
                  src={coverSrc}
                  alt={coverAlt}
                  className="impiete-home__magazine-img"
                />
                <span className="impiete-home__sheen" aria-hidden="true" />
              </figure>
              <span
                className="impiete-home__edge impiete-home__edge--spine"
                aria-hidden="true"
              />
              <span
                className="impiete-home__edge impiete-home__edge--pages"
                aria-hidden="true"
              />
            </div>
            <span className="impiete-home__floor" aria-hidden="true" />
          </div>

          <div className="impiete-home__float impiete-home__float--spread">
            <div className="impiete-home__item impiete-home__item--spread">
              <figure className="impiete-home__magazine impiete-home__magazine--spread">
                <img
                  src={spreadSrc}
                  alt={spreadAlt}
                  className="impiete-home__magazine-img"
                />
                <span className="impiete-home__crease" aria-hidden="true" />
                <span className="impiete-home__sheen" aria-hidden="true" />
              </figure>
              <span
                className="impiete-home__edge impiete-home__edge--bottom"
                aria-hidden="true"
              />
            </div>
            <span
              className="impiete-home__floor impiete-home__floor--spread"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Título e apresentação ao lado direito da revista */}
        <div className="impiete-home__content">
          <span className="impiete-home__kicker">
            Revista Impiété · Vol. 1
          </span>
          <h1 id="home-titulo" className="impiete-home__title">
            O Fogo
            <br />
            Roubado
          </h1>
          <span className="impiete-home__rule" aria-hidden="true" />
          <p className="impiete-home__text">
            Uma publicação independente de filosofia, literatura e arte. Em sua
            edição inaugural, a Impiété revisita Prometeu e a tragédia do fogo
            entregue aos homens — um convite para pensar e criar sem nenhuma
            resignação.
          </p>
        </div>
      </div>

      <a
        href={`#${nextSectionId}`}
        className="impiete-home__scroll"
        aria-label="Rolar para a próxima seção"
        onClick={handleScrollDown}
      >
        <svg
          className="impiete-home__scroll-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </a>
    </section>
  )
}
