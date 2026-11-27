import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './Revista.css'

export interface RevistaView {
  id: 'capa' | 'contracapa'
  label: string
  src: string
  alt: string
}

export interface RevistaEdition {
  id: string
  volume: number
  title: string
  subtitle: string
  badge: string
  priceLabel: string
  priceNote: string
  description: string
  format: string
  frontSrc: string
  backSrc: string
  downloadUrl?: string
}

export interface RevistaProps {
  editions?: RevistaEdition[]
  onDownload?: (edition: RevistaEdition) => void
}

type LightboxPhase = 'closed' | 'entering' | 'open' | 'closing'

interface FlipMetrics {
  dx: number
  dy: number
  scale: number
  width: number
  height: number
}

const IMAGE_ASPECT = 1409 / 2000

const DEFAULT_EDITIONS: RevistaEdition[] = [
  {
    id: 'vol-1',
    volume: 1,
    title: 'Revista Impiété — Volume 1',
    subtitle: 'Vol. 1 · Edição Digital',
    badge: 'Edição Atual',
    priceLabel: 'Grátis',
    priceNote: 'Acesso livre em formato digital (PDF)',
    description:
      'Edição inaugural da Revista Impiété. Uma publicação independente de filosofia, literatura e arte visual dedicada ao pensamento trágico, reunindo ensaios, textos literários e ilustrações em torno da figura de Prometeu.',
    format: 'Digital (PDF)',
    frontSrc: '/CapaImpieteVol1.png',
    backSrc: '/ContraCapaImpieteVol1.png',
  },
]

function computeFlipMetrics(previewEl: HTMLElement): FlipMetrics {
  const rect = previewEl.getBoundingClientRect()
  const maxW = Math.min(window.innerWidth * 0.88, 660)
  const maxH = window.innerHeight * 0.88

  let targetW = maxW
  let targetH = targetW / IMAGE_ASPECT
  if (targetH > maxH) {
    targetH = maxH
    targetW = targetH * IMAGE_ASPECT
  }

  const targetCenterX = window.innerWidth / 2
  const targetCenterY = window.innerHeight / 2
  const previewCenterX = rect.left + rect.width / 2
  const previewCenterY = rect.top + rect.height / 2

  return {
    dx: previewCenterX - targetCenterX,
    dy: previewCenterY - targetCenterY,
    scale: rect.width / targetW,
    width: targetW,
    height: targetH,
  }
}

export function Revista({
  editions = DEFAULT_EDITIONS,
  onDownload,
}: RevistaProps) {
  // Ordena sempre da edição mais nova (atual) para a mais antiga
  const sortedEditions = [...editions].sort((a, b) => b.volume - a.volume)
  const latestEdition = sortedEditions[0]

  const [activeEditionId, setActiveEditionId] = useState<string>(
    latestEdition?.id ?? 'vol-1',
  )
  const [selectedViewId, setSelectedViewId] = useState<'capa' | 'contracapa'>(
    'capa',
  )
  const [lightboxPhase, setLightboxPhase] = useState<LightboxPhase>('closed')
  const [flip, setFlip] = useState<FlipMetrics | null>(null)

  const showcaseRef = useRef<HTMLDivElement>(null)
  const previewImgRef = useRef<HTMLImageElement>(null)
  const phaseRef = useRef<LightboxPhase>('closed')
  const rafRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const currentEdition =
    sortedEditions.find((ed) => ed.id === activeEditionId) ?? latestEdition

  const views: RevistaView[] = [
    {
      id: 'capa',
      label: 'Capa',
      src: currentEdition.frontSrc,
      alt: `Capa da ${currentEdition.title}`,
    },
    {
      id: 'contracapa',
      label: 'Contracapa',
      src: currentEdition.backSrc,
      alt: `Contracapa da ${currentEdition.title}`,
    },
  ]

  const activeView = views.find((v) => v.id === selectedViewId) ?? views[0]
  const isLightboxMounted = lightboxPhase !== 'closed'

  const setPhase = (phase: LightboxPhase) => {
    phaseRef.current = phase
    setLightboxPhase(phase)
  }

  const clearPendingFrames = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openLightbox = () => {
    const img = previewImgRef.current
    if (!img) return
    clearPendingFrames()

    const metrics = computeFlipMetrics(img)
    setFlip(metrics)
    setPhase('entering')

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        setPhase('open')
      })
    })
  }

  const closeLightbox = () => {
    if (phaseRef.current === 'closed' || phaseRef.current === 'closing') return
    clearPendingFrames()

    const img = previewImgRef.current
    if (img) {
      setFlip(computeFlipMetrics(img))
    }
    setPhase('closing')

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    closeTimerRef.current = window.setTimeout(
      () => {
        setPhase('closed')
        setFlip(null)
      },
      prefersReduced ? 0 : 1000,
    )
  }

  const handleSelectEdition = (editionId: string) => {
    setActiveEditionId(editionId)
    setSelectedViewId('capa')
    showcaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (!isLightboxMounted) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isLightboxMounted])

  useEffect(() => {
    return () => clearPendingFrames()
  }, [])

  const modalImageStyle: CSSProperties | undefined = flip
    ? ({
        width: `${flip.width}px`,
        height: `${flip.height}px`,
        '--from-x': `${flip.dx}px`,
        '--from-y': `${flip.dy}px`,
        '--from-scale': flip.scale,
      } as CSSProperties)
    : undefined

  return (
    <section
      id="revista"
      className="impiete-revista"
      aria-labelledby="revista-titulo"
    >
      {/* Área centralizada descontando o espaço do header fixo */}
      <div ref={showcaseRef} className="impiete-revista__showcase-area">
        <div className="impiete-revista__container">
          {/* Galeria à esquerda: hub de seleção + pré-visualização */}
          <div className="impiete-revista__gallery">
            <div
              className="impiete-revista__hub"
              role="tablist"
              aria-label="Selecionar visualização da revista"
            >
              {views.map((view) => {
                const isSelected = view.id === activeView.id
                return (
                  <button
                    key={view.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`impiete-revista__thumb${
                      isSelected ? ' is-selected' : ''
                    }`}
                    onClick={() => setSelectedViewId(view.id)}
                  >
                    <img src={view.src} alt="" aria-hidden="true" />
                    <span className="impiete-revista__thumb-label">
                      {view.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="impiete-revista__preview-wrap">
              <button
                type="button"
                className={`impiete-revista__preview${
                  isLightboxMounted ? ' is-hidden' : ''
                }`}
                onClick={openLightbox}
                aria-label={`Ampliar ${activeView.label} da revista`}
              >
                <img
                  ref={previewImgRef}
                  src={activeView.src}
                  alt={activeView.alt}
                  className="impiete-revista__preview-img"
                />
                <span className="impiete-revista__zoom-hint" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                    <path d="M11 8v6" />
                    <path d="M8 11h6" />
                  </svg>
                  Ampliar {activeView.label.toLowerCase()}
                </span>
              </button>
            </div>
          </div>

          {/* Informações comerciais do produto à direita */}
          <div className="impiete-revista__details">
            <div className="impiete-revista__badges">
              <span className="impiete-revista__badge">
                {currentEdition.subtitle}
              </span>
              <span className="impiete-revista__badge impiete-revista__badge--free">
                Download Gratuito
              </span>
            </div>

            <h2 id="revista-titulo" className="impiete-revista__title">
              {currentEdition.title}
            </h2>

            <div className="impiete-revista__price-row">
              <span className="impiete-revista__price">
                {currentEdition.priceLabel}
              </span>
              <span className="impiete-revista__price-note">
                {currentEdition.priceNote}
              </span>
            </div>

            <p className="impiete-revista__description">
              {currentEdition.description}
            </p>

            <div className="impiete-revista__actions">
              {currentEdition.downloadUrl ? (
                <a
                  href={currentEdition.downloadUrl}
                  download
                  className="impiete-revista__cta"
                >
                  <DownloadIcon />
                  Baixar Revista Grátis
                </a>
              ) : (
                <button
                  type="button"
                  className="impiete-revista__cta"
                  onClick={() => onDownload?.(currentEdition)}
                >
                  <DownloadIcon />
                  Baixar Revista Grátis
                </button>
              )}
              <span className="impiete-revista__cta-hint">
                Download imediato · Sem custo ou cadastro
              </span>
            </div>

            <dl className="impiete-revista__specs">
              <div className="impiete-revista__spec">
                <dt>Edição</dt>
                <dd>Volume {currentEdition.volume}</dd>
              </div>
              <div className="impiete-revista__spec">
                <dt>Formato</dt>
                <dd>{currentEdition.format}</dd>
              </div>
              <div className="impiete-revista__spec">
                <dt>Valor</dt>
                <dd>Gratuito para download</dd>
              </div>
              <div className="impiete-revista__spec">
                <dt>Prévia</dt>
                <dd>Capa e Contracapa completas</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Grid de 3 colunas com todas as edições (mais nova primeiro) */}
      <div className="impiete-revista__editions">
        <div className="impiete-revista__editions-header">
          <h3 className="impiete-revista__editions-title">Edições</h3>
          <span className="impiete-revista__editions-subtitle">
            Da edição mais recente às anteriores
          </span>
        </div>

        <div className="impiete-revista__grid">
          {sortedEditions.map((edition, index) => {
            const isSelected = edition.id === currentEdition.id
            const isLatest = index === 0
            return (
              <article
                key={edition.id}
                className={`impiete-revista__card${
                  isSelected ? ' is-active' : ''
                }`}
              >
                <button
                  type="button"
                  className="impiete-revista__card-btn"
                  onClick={() => handleSelectEdition(edition.id)}
                >
                  <div className="impiete-revista__card-media">
                    <img src={edition.frontSrc} alt={`Capa Volume ${edition.volume}`} />
                    <span
                      className={`impiete-revista__card-tag${
                        isLatest ? ' is-latest' : ''
                      }`}
                    >
                      {isLatest ? 'Edição Atual' : `Vol. ${edition.volume}`}
                    </span>
                  </div>
                  <div className="impiete-revista__card-body">
                    <h4 className="impiete-revista__card-title">
                      Volume {edition.volume}
                    </h4>
                    <p className="impiete-revista__card-meta">
                      {edition.format} · {edition.priceLabel}
                    </p>
                  </div>
                </button>
              </article>
            )
          })}

          {sortedEditions.length === 1 && (
            <article
              className="impiete-revista__card impiete-revista__card--upcoming"
              aria-label="Volume 2 em breve"
            >
              <div className="impiete-revista__card-upcoming-box">
                <span className="impiete-revista__card-tag">Em breve</span>
                <h4 className="impiete-revista__card-title">Volume 2</h4>
                <p className="impiete-revista__card-meta">
                  Próxima edição em preparação
                </p>
              </div>
            </article>
          )}
        </div>
      </div>

      {/* Lightbox com blur no fundo e crescimento suave de 1s */}
      {isLightboxMounted && (
        <div
          className="impiete-revista__lightbox"
          data-state={lightboxPhase}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeView.label} da ${currentEdition.title} em visualização completa`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="impiete-revista__close"
            onClick={closeLightbox}
            aria-label="Fechar visualização completa"
          >
            ✕
          </button>

          <figure
            className="impiete-revista__modal-figure"
            style={modalImageStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeView.src}
              alt={activeView.alt}
              className="impiete-revista__modal-img"
            />
          </figure>
        </div>
      )}
    </section>
  )
}

function DownloadIcon() {
  return (
    <svg
      className="impiete-revista__cta-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}
