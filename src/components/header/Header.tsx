import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './Header.css'

export interface NavItem {
  id: string
  label: string
  href: string
}

export interface HeaderProps {
  items?: NavItem[]
  brandName?: string
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'apresentacao', label: 'Apresentação', href: '#apresentacao' },
  { id: 'revista', label: 'Revista', href: '#revista' },
]

interface IndicatorState {
  left: number
  width: number
  visible: boolean
}

export function Header({
  items = DEFAULT_NAV_ITEMS,
  brandName = 'IMPIÉTÉ',
}: HeaderProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? 'home')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [indicator, setIndicator] = useState<IndicatorState>({
    left: 0,
    width: 0,
    visible: false,
  })

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const targetId = hoverId ?? activeId

  // Estado de rolagem + barra de progresso
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setIsScrolled(window.scrollY > 24)
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Seção ativa conforme a rolagem
  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  // Pílula deslizante que acompanha o link ativo / em hover
  useLayoutEffect(() => {
    const update = () => {
      const el = linkRefs.current[targetId]
      if (!el) {
        setIndicator((prev) => ({ ...prev, visible: false }))
        return
      }
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, visible: true })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [targetId])

  const indicatorStyle: CSSProperties = {
    transform: `translateX(${indicator.left}px)`,
    width: `${indicator.width}px`,
    opacity: indicator.visible ? 1 : 0,
  }

  return (
    <header
      className={`impiete-header${isScrolled ? ' impiete-header--scrolled' : ''}`}
    >
      <div className="impiete-header__frame">
        <div className="impiete-header__bar">
          <a
            href="#home"
            className="impiete-header__logo"
            aria-label={`${brandName} — Início`}
            onClick={() => setActiveId('home')}
          >
            <span className="impiete-header__logo-text" aria-hidden="true">
              {Array.from(brandName).map((char, i) => (
                <span
                  key={`${char}-${i}`}
                  className="impiete-header__logo-char"
                  style={{ '--i': i } as CSSProperties}
                >
                  {char}
                </span>
              ))}
            </span>
          </a>

          <nav className="impiete-header__nav" aria-label="Navegação principal">
            <ul
              className="impiete-header__list"
              onMouseLeave={() => setHoverId(null)}
            >
              <span
                className="impiete-header__indicator"
                style={indicatorStyle}
                aria-hidden="true"
              />
              {items.map((item) => {
                const isActive = activeId === item.id
                const isLit = targetId === item.id
                return (
                  <li key={item.id}>
                    <a
                      ref={(el) => {
                        linkRefs.current[item.id] = el
                      }}
                      href={item.href}
                      className={`impiete-header__link${
                        isLit ? ' impiete-header__link--lit' : ''
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      onMouseEnter={() => setHoverId(item.id)}
                      onFocus={() => setHoverId(item.id)}
                      onBlur={() => setHoverId(null)}
                      onClick={() => setActiveId(item.id)}
                    >
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <span
            className="impiete-header__progress"
            style={{ transform: `scaleX(${progress})` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  )
}
