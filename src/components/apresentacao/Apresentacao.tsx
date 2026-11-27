import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import './Apresentacao.css'

export interface ApresentacaoStep {
  id: string
  kicker: string
  title: string
  text: string
}

export interface ApresentacaoProps {
  steps?: ApresentacaoStep[]
  frontSrc?: string
  backSrc?: string
}

const DEFAULT_STEPS: ApresentacaoStep[] = [
  {
    id: 'passo-1',
    kicker: 'Capítulo I',
    title: 'Título de apresentação',
    text: 'Texto de apresentação genérico. Aqui entrará uma breve introdução sobre a revista, sua proposta editorial e o espírito que move esta primeira edição.',
  },
  {
    id: 'passo-2',
    kicker: 'Capítulo II',
    title: 'Segundo tema da revista',
    text: 'Parágrafo provisório para descrever um dos eixos da publicação. Este espaço receberá o conteúdo definitivo, apresentando ideias, autores e referências.',
  },
  {
    id: 'passo-3',
    kicker: 'Capítulo III',
    title: 'Um terceiro movimento',
    text: 'Mais um bloco de texto genérico, pensado para acompanhar o giro da revista. Use-o para aprofundar o conceito da edição ou destacar uma citação.',
  },
  {
    id: 'passo-4',
    kicker: 'Capítulo IV',
    title: 'O outro lado da edição',
    text: 'Encerramento provisório da apresentação, revelado junto à contracapa. Aqui pode entrar um convite à leitura ou as informações sobre o volume.',
  },
]

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
const MARQUEE = 'IMPIÉTÉ · ΠΡΟΜΗΘΕΥΣ · VOL. 1 · '

const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max)
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function Apresentacao({
  steps = DEFAULT_STEPS,
  frontSrc = '/CapaImpieteVol1.png',
  backSrc = '/ContraCapaImpieteVol1.png',
}: ApresentacaoProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const stepRefs = useRef<(HTMLElement | null)[]>([])
  const railRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const total = steps.length
    let raf = 0
    let target = 0
    let current = 0

    const apply = (p: number) => {
      const rot = smoothstep(0.06, 0.94, p) * 180
      const rad = (rot * Math.PI) / 180
      const arc = Math.sin(rad)
      const flat = Math.abs(Math.cos(rad))

      stage.style.setProperty('--p', p.toFixed(4))
      stage.style.setProperty('--rot', `${rot.toFixed(2)}deg`)
      stage.style.setProperty('--arc', arc.toFixed(4))
      stage.style.setProperty('--flat', flat.toFixed(4))
      stage.dataset.side = rot > 90 ? 'back' : 'front'

      if (counterRef.current) {
        counterRef.current.textContent = `${Math.round(rot)}°`
      }

      const activeIndex = Math.min(Math.floor(p * total), total - 1)

      stepRefs.current.forEach((el, i) => {
        if (!el) return
        const center = (i + 0.5) / total
        let d = (p - center) * total
        // Primeiro e último textos permanecem visíveis nas extremidades
        if (i === 0 && d < 0) d = 0
        if (i === total - 1 && d > 0) d = 0
        const o = 1 - smoothstep(0.2, 0.5, Math.abs(d))
        el.style.setProperty('--d', d.toFixed(4))
        el.style.setProperty('--o', o.toFixed(4))
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
        el.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false')
      })

      railRefs.current.forEach((el, i) => {
        if (!el) return
        el.classList.toggle('is-active', i === activeIndex)
        el.classList.toggle('is-done', i < activeIndex)
      })
    }

    const measure = () => {
      const rect = section.getBoundingClientRect()
      const scrollable = section.offsetHeight - window.innerHeight
      target = scrollable > 0 ? clamp(-rect.top / scrollable) : 0
    }

    const render = () => {
      current += (target - current) * 0.14
      if (Math.abs(target - current) < 0.0005) current = target
      apply(current)
      raf = current !== target ? requestAnimationFrame(render) : 0
    }

    const onScroll = () => {
      measure()
      if (!raf) raf = requestAnimationFrame(render)
    }

    measure()
    current = target
    apply(current)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [steps.length])

  return (
    <section
      id="apresentacao"
      ref={sectionRef}
      className="impiete-apre"
      style={{ '--steps': steps.length } as CSSProperties}
      aria-label="Apresentação"
    >
      <div ref={stageRef} className="impiete-apre__stage" data-side="front">
        <div className="impiete-apre__marquee" aria-hidden="true">
          <span>{MARQUEE.repeat(4)}</span>
        </div>

        {/* Coluna de textos */}
        <div className="impiete-apre__copy">
          <div className="impiete-apre__rail" aria-hidden="true">
            <span className="impiete-apre__rail-track">
              <span className="impiete-apre__rail-fill" />
            </span>
            <ol className="impiete-apre__rail-list">
              {steps.map((step, i) => (
                <li
                  key={step.id}
                  ref={(el) => {
                    railRefs.current[i] = el
                  }}
                  className="impiete-apre__rail-item"
                >
                  {ROMAN[i] ?? i + 1}
                </li>
              ))}
            </ol>
          </div>

          <div className="impiete-apre__steps">
            {steps.map((step, i) => (
              <article
                key={step.id}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                className="impiete-apre__step"
              >
                <span className="impiete-apre__kicker">
                  <span className="impiete-apre__kicker-line" />
                  {step.kicker}
                </span>
                <h2 className="impiete-apre__title">{step.title}</h2>
                <p className="impiete-apre__text">{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Revista 3D */}
        <div className="impiete-apre__visual">
          <div className="impiete-apre__scene">
            <div className="impiete-apre__float">
              <div className="impiete-apre__book">
                <figure className="impiete-apre__face impiete-apre__face--front">
                  <img src={frontSrc} alt="Capa da Revista Impiété Vol. 1" />
                  <span className="impiete-apre__shade" />
                  <span className="impiete-apre__glare" />
                </figure>
                <figure className="impiete-apre__face impiete-apre__face--back">
                  <img
                    src={backSrc}
                    alt="Contracapa da Revista Impiété Vol. 1"
                  />
                  <span className="impiete-apre__shade" />
                  <span className="impiete-apre__glare" />
                </figure>
                <span className="impiete-apre__edge impiete-apre__edge--left" />
                <span className="impiete-apre__edge impiete-apre__edge--right" />
              </div>
            </div>
            <span className="impiete-apre__floor" aria-hidden="true" />
          </div>

          <div className="impiete-apre__meta" aria-hidden="true">
            <span className="impiete-apre__label">
              <span className="impiete-apre__label-front">Capa</span>
              <span className="impiete-apre__label-back">Contracapa</span>
            </span>
            <span className="impiete-apre__divider" />
            <span ref={counterRef} className="impiete-apre__counter">
              0°
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
