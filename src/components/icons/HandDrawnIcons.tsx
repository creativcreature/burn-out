import { CSSProperties } from 'react'

interface IconProps {
  size?: number
  color?: string
  style?: CSSProperties
}

const defaultColor = 'var(--orb-orange)'

/**
 * Hand-drawn wobbly icons - imperfect bezier curves for organic feel
 * Inspired by One Day Journal's aesthetic
 */

export function WobblyFlower({ size = 32, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      {/* Stem - wobbly line */}
      <path 
        d="M50,95 C48,80 52,65 49,50" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round"
        fill="none"
      />
      {/* Petals - imperfect circles */}
      <path 
        d="M50,35 C60,30 65,20 55,12 C45,5 35,15 35,25 C35,35 45,40 50,35" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      <path 
        d="M55,40 C70,35 80,40 75,55 C70,65 55,60 55,40" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      <path 
        d="M45,40 C30,35 20,40 25,55 C30,65 45,60 45,40" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      {/* Center dot */}
      <circle cx="50" cy="42" r="4" fill={color} />
    </svg>
  )
}

export function WobblyCherries({ size = 32, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      {/* Stems - wobbly curves */}
      <path 
        d="M50,15 C45,25 35,35 30,55" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M50,15 C55,25 65,35 70,50" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      {/* Cherries - imperfect ovals */}
      <path 
        d="M30,55 C20,52 15,62 18,72 C22,85 38,88 42,75 C45,65 40,58 30,55" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      <path 
        d="M70,50 C60,48 55,58 58,68 C62,80 78,82 82,70 C85,60 80,52 70,50" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  )
}

export function WobblyTrees({ size = 32, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      {/* Trunk */}
      <path 
        d="M50,95 L50,50" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      {/* Branches - wobbly */}
      <path 
        d="M50,70 C35,65 25,55 20,45" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M50,70 C65,65 75,55 80,45" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M50,55 C40,50 30,40 28,30" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M50,55 C60,50 70,40 72,30" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M50,50 C50,40 50,25 50,15" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function WobblyMushroom({ size = 32, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      {/* Stem */}
      <path 
        d="M42,60 C40,75 43,90 50,90 C57,90 60,75 58,60" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      {/* Cap - wobbly dome */}
      <path 
        d="M20,60 C15,45 25,20 50,18 C75,16 85,45 80,60 C70,62 30,62 20,60" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      {/* Spots */}
      <circle cx="35" cy="40" r="5" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="55" cy="35" r="4" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="65" cy="48" r="3" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  )
}

export function WobblyPlus({ size = 80, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      {/* Wobbly circle */}
      <path 
        d="M50,5 C73,8 92,28 90,52 C88,78 68,95 48,93 C22,90 5,68 8,45 C11,20 28,3 50,5" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      {/* Plus sign - slightly imperfect */}
      <path 
        d="M50,30 C51,40 49,60 50,70" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M30,50 C40,49 60,51 70,50" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round"
      />
    </svg>
  )
}

export function WobblySun({ size = 32, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      {/* Center circle */}
      <path 
        d="M50,35 C60,34 68,42 67,52 C66,62 58,70 48,69 C38,68 32,58 33,48 C34,38 42,36 50,35" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
      {/* Rays - wobbly lines */}
      <path d="M50,20 L50,8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50,92 L50,80" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20,50 L8,50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M92,50 L80,50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28,28 L18,18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M82,82 L72,72" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28,72 L18,82" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M82,18 L72,28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function WobblyStar({ size = 32, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      <path 
        d="M50,10 C53,30 55,35 75,38 C55,42 53,48 50,68 C47,48 45,42 25,38 C45,35 47,30 50,10" 
        stroke={color} 
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function WobblyHeart({ size = 32, color = defaultColor, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
      <path 
        d="M50,85 C30,65 10,50 15,30 C20,15 35,12 50,28 C65,12 80,15 85,30 C90,50 70,65 50,85" 
        stroke={color} 
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  )
}
