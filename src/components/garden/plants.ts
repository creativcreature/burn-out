// Hand-drawn style plant SVGs for the garden
// Each plant is designed to feel organic and unique

export interface PlantConfig {
  id: string
  name: string
  svg: string
  color: string
  accentColor?: string
}

// Generate a deterministic "random" plant for each day
export function getPlantForDay(dayOfYear: number): PlantConfig {
  const plantIndex = dayOfYear % PLANTS.length
  return PLANTS[plantIndex]
}

// Get day of year from date string (YYYY-MM-DD)
export function getDayOfYear(dateStr: string): number {
  const date = new Date(dateStr)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

// Collection of hand-drawn style plants
// Using simple, organic shapes with slight imperfections for warmth
export const PLANTS: PlantConfig[] = [
  // Flowering plants
  {
    id: 'sunflower',
    name: 'Sunflower',
    color: '#F59E0B',
    accentColor: '#92400E',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 19 22 20 18" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="20" cy="14" rx="5" ry="4.5" fill="#92400E"/>
      <ellipse cx="20" cy="7" rx="4" ry="5" fill="#F59E0B"/>
      <ellipse cx="13" cy="10" rx="4" ry="5" fill="#F59E0B" transform="rotate(-40 13 10)"/>
      <ellipse cx="27" cy="10" rx="4" ry="5" fill="#F59E0B" transform="rotate(40 27 10)"/>
      <ellipse cx="11" cy="17" rx="4" ry="5" fill="#F59E0B" transform="rotate(-80 11 17)"/>
      <ellipse cx="29" cy="17" rx="4" ry="5" fill="#F59E0B" transform="rotate(80 29 17)"/>
      <path d="M15 28 Q12 26 10 30" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M25 28 Q28 26 30 30" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'tulip',
    name: 'Tulip',
    color: '#EC4899',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 20 20 16" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M12 16 Q14 6 20 4 Q26 6 28 16 Q24 18 20 17 Q16 18 12 16Z" fill="#EC4899"/>
      <path d="M14 14 Q17 10 20 9" stroke="#DB2777" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <path d="M14 26 Q10 24 8 28" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'daisy',
    name: 'Daisy',
    color: '#FEFCE8',
    accentColor: '#F59E0B',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 19 24 20 18" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="20" cy="12" rx="4" ry="3.5" fill="#F59E0B"/>
      <ellipse cx="20" cy="5" rx="3" ry="5" fill="white" stroke="#E5E7EB" stroke-width="0.5"/>
      <ellipse cx="13" cy="9" rx="3" ry="5" fill="white" stroke="#E5E7EB" stroke-width="0.5" transform="rotate(-45 13 9)"/>
      <ellipse cx="27" cy="9" rx="3" ry="5" fill="white" stroke="#E5E7EB" stroke-width="0.5" transform="rotate(45 27 9)"/>
      <ellipse cx="10" cy="15" rx="3" ry="5" fill="white" stroke="#E5E7EB" stroke-width="0.5" transform="rotate(-90 10 15)"/>
      <ellipse cx="30" cy="15" rx="3" ry="5" fill="white" stroke="#E5E7EB" stroke-width="0.5" transform="rotate(90 30 15)"/>
      <ellipse cx="13" cy="20" rx="3" ry="5" fill="white" stroke="#E5E7EB" stroke-width="0.5" transform="rotate(-135 13 20)"/>
      <ellipse cx="27" cy="20" rx="3" ry="5" fill="white" stroke="#E5E7EB" stroke-width="0.5" transform="rotate(135 27 20)"/>
    </svg>`
  },
  {
    id: 'rose',
    name: 'Rose',
    color: '#F43F5E',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 21 24 20 18" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M18 22 Q14 21 12 24" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 26 Q26 25 28 28" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <circle cx="20" cy="11" r="7" fill="#F43F5E"/>
      <path d="M16 11 Q18 8 20 9 Q22 8 24 11 Q22 14 20 13 Q18 14 16 11Z" fill="#BE123C" opacity="0.6"/>
      <path d="M20 6 Q21 9 20 11" stroke="#BE123C" stroke-width="0.8" opacity="0.4"/>
    </svg>`
  },
  {
    id: 'lavender',
    name: 'Lavender',
    color: '#A78BFA',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 16 20 8" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="20" cy="7" rx="2" ry="2.5" fill="#A78BFA"/>
      <ellipse cx="18" cy="10" rx="2" ry="2.5" fill="#A78BFA"/>
      <ellipse cx="22" cy="10" rx="2" ry="2.5" fill="#A78BFA"/>
      <ellipse cx="17" cy="14" rx="2" ry="2.5" fill="#A78BFA"/>
      <ellipse cx="23" cy="14" rx="2" ry="2.5" fill="#A78BFA"/>
      <ellipse cx="18" cy="18" rx="2" ry="2.5" fill="#A78BFA"/>
      <ellipse cx="22" cy="18" rx="2" ry="2.5" fill="#A78BFA"/>
      <path d="M15 28 Q12 27 10 30" stroke="#4ADE80" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  // Succulents and simple plants
  {
    id: 'succulent',
    name: 'Succulent',
    color: '#10B981',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="32" rx="8" ry="4" fill="#6B7280" opacity="0.3"/>
      <ellipse cx="20" cy="26" rx="5" ry="8" fill="#10B981"/>
      <ellipse cx="14" cy="24" rx="4" ry="6" fill="#34D399" transform="rotate(-25 14 24)"/>
      <ellipse cx="26" cy="24" rx="4" ry="6" fill="#34D399" transform="rotate(25 26 24)"/>
      <ellipse cx="20" cy="20" rx="3" ry="5" fill="#6EE7B7"/>
      <ellipse cx="16" cy="19" rx="2.5" ry="4" fill="#6EE7B7" transform="rotate(-15 16 19)"/>
      <ellipse cx="24" cy="19" rx="2.5" ry="4" fill="#6EE7B7" transform="rotate(15 24 19)"/>
    </svg>`
  },
  {
    id: 'cactus',
    name: 'Cactus',
    color: '#22C55E',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="34" rx="6" ry="3" fill="#6B7280" opacity="0.3"/>
      <rect x="16" y="14" width="8" height="20" rx="4" fill="#22C55E"/>
      <rect x="8" y="20" width="6" height="10" rx="3" fill="#22C55E"/>
      <path d="M14 25 L16 25" stroke="#22C55E" stroke-width="2"/>
      <rect x="26" y="18" width="6" height="8" rx="3" fill="#22C55E"/>
      <path d="M24 22 L26 22" stroke="#22C55E" stroke-width="2"/>
      <circle cx="20" cy="10" r="3" fill="#F472B6"/>
    </svg>`
  },
  {
    id: 'fern',
    name: 'Fern',
    color: '#4ADE80',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 28 20 10" stroke="#22C55E" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 12 Q14 10 10 14" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 12 Q26 10 30 14" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 18 Q13 16 9 20" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 18 Q27 16 31 20" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 24 Q14 22 11 26" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 24 Q26 22 29 26" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 30 Q16 28 13 31" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 30 Q24 28 27 31" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  // Whimsical elements
  {
    id: 'mushroom',
    name: 'Mushroom',
    color: '#EF4444',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <rect x="17" y="22" width="6" height="14" rx="2" fill="#FEF3C7"/>
      <ellipse cx="20" cy="18" rx="12" ry="8" fill="#EF4444"/>
      <circle cx="15" cy="15" r="2" fill="white"/>
      <circle cx="23" cy="13" r="1.5" fill="white"/>
      <circle cx="19" cy="19" r="1" fill="white"/>
      <circle cx="26" cy="17" r="1.5" fill="white"/>
    </svg>`
  },
  {
    id: 'clover',
    name: 'Clover',
    color: '#22C55E',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 22 20 18" stroke="#15803D" stroke-width="2" stroke-linecap="round"/>
      <circle cx="20" cy="10" r="5" fill="#22C55E"/>
      <circle cx="14" cy="14" r="5" fill="#22C55E"/>
      <circle cx="26" cy="14" r="5" fill="#22C55E"/>
      <circle cx="20" cy="18" r="5" fill="#22C55E"/>
      <path d="M20 8 L20 12" stroke="#15803D" stroke-width="1" opacity="0.4"/>
      <path d="M12 14 L16 14" stroke="#15803D" stroke-width="1" opacity="0.4"/>
      <path d="M24 14 L28 14" stroke="#15803D" stroke-width="1" opacity="0.4"/>
    </svg>`
  },
  // More variety
  {
    id: 'poppy',
    name: 'Poppy',
    color: '#F97316',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 21 24 20 16" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="20" cy="10" rx="8" ry="7" fill="#F97316"/>
      <ellipse cx="16" cy="9" rx="5" ry="6" fill="#FB923C" transform="rotate(-20 16 9)"/>
      <ellipse cx="24" cy="9" rx="5" ry="6" fill="#FB923C" transform="rotate(20 24 9)"/>
      <circle cx="20" cy="11" r="3" fill="#1F2937"/>
    </svg>`
  },
  {
    id: 'bluebell',
    name: 'Bluebell',
    color: '#3B82F6',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 18 22 10" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 12 Q18 10 16 14 Q18 16 22 14Z" fill="#3B82F6"/>
      <path d="M24 16 Q20 14 18 18 Q20 20 24 18Z" fill="#3B82F6"/>
      <path d="M26 20 Q22 18 20 22 Q22 24 26 22Z" fill="#3B82F6"/>
      <path d="M18 26 Q13 25 11 29" stroke="#4ADE80" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'lily',
    name: 'Lily',
    color: '#FBBF24',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 22 20 14" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 14 Q16 6 20 2 Q24 6 20 14Z" fill="#FBBF24"/>
      <path d="M20 14 Q10 10 8 14 Q12 18 20 14Z" fill="#FBBF24"/>
      <path d="M20 14 Q30 10 32 14 Q28 18 20 14Z" fill="#FBBF24"/>
      <path d="M20 14 Q14 20 14 24 Q18 22 20 14Z" fill="#FBBF24"/>
      <path d="M20 14 Q26 20 26 24 Q22 22 20 14Z" fill="#FBBF24"/>
      <circle cx="20" cy="12" r="2" fill="#F59E0B"/>
    </svg>`
  },
  {
    id: 'sprout',
    name: 'Sprout',
    color: '#86EFAC',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 28 20 22" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 22 Q14 18 14 12 Q20 16 20 22Z" fill="#86EFAC"/>
      <path d="M20 22 Q26 18 26 12 Q20 16 20 22Z" fill="#4ADE80"/>
    </svg>`
  },
  {
    id: 'dandelion',
    name: 'Dandelion',
    color: '#FEF3C7',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 20 20 20 12" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
      <circle cx="20" cy="10" r="8" fill="none" stroke="#FEF3C7" stroke-width="0.5"/>
      <line x1="20" y1="10" x2="20" y2="2" stroke="#E5E7EB" stroke-width="0.5"/>
      <line x1="20" y1="10" x2="12" y2="6" stroke="#E5E7EB" stroke-width="0.5"/>
      <line x1="20" y1="10" x2="28" y2="6" stroke="#E5E7EB" stroke-width="0.5"/>
      <line x1="20" y1="10" x2="10" y2="12" stroke="#E5E7EB" stroke-width="0.5"/>
      <line x1="20" y1="10" x2="30" y2="12" stroke="#E5E7EB" stroke-width="0.5"/>
      <line x1="20" y1="10" x2="14" y2="16" stroke="#E5E7EB" stroke-width="0.5"/>
      <line x1="20" y1="10" x2="26" y2="16" stroke="#E5E7EB" stroke-width="0.5"/>
      <circle cx="20" cy="2" r="1.5" fill="#FEF3C7"/>
      <circle cx="12" cy="6" r="1.5" fill="#FEF3C7"/>
      <circle cx="28" cy="6" r="1.5" fill="#FEF3C7"/>
      <circle cx="10" cy="12" r="1.5" fill="#FEF3C7"/>
      <circle cx="30" cy="12" r="1.5" fill="#FEF3C7"/>
      <circle cx="14" cy="16" r="1.5" fill="#FEF3C7"/>
      <circle cx="26" cy="16" r="1.5" fill="#FEF3C7"/>
    </svg>`
  },
  {
    id: 'monstera',
    name: 'Monstera',
    color: '#059669',
    svg: `<svg viewBox="0 0 40 40" fill="none">
      <path d="M20 38 C20 38 19 28 20 20" stroke="#065F46" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M8 16 Q12 4 20 4 Q28 4 32 16 Q28 24 20 22 Q12 24 8 16Z" fill="#059669"/>
      <path d="M16 8 L18 14" stroke="#065F46" stroke-width="1" opacity="0.4"/>
      <path d="M24 8 L22 14" stroke="#065F46" stroke-width="1" opacity="0.4"/>
      <ellipse cx="13" cy="14" rx="2" ry="3" fill="var(--bg, #fdf8f3)"/>
      <ellipse cx="27" cy="14" rx="2" ry="3" fill="var(--bg, #fdf8f3)"/>
    </svg>`
  }
]

// Empty/future day placeholder
export const EMPTY_PLANT_SVG = `<svg viewBox="0 0 40 40" fill="none">
  <circle cx="20" cy="32" r="4" fill="currentColor" opacity="0.15"/>
</svg>`

// Seed waiting to be planted (today)
export const SEED_SVG = `<svg viewBox="0 0 40 40" fill="none">
  <ellipse cx="20" cy="30" rx="5" ry="3" fill="currentColor" opacity="0.2"/>
  <ellipse cx="20" cy="28" rx="4" ry="5" fill="currentColor" opacity="0.3"/>
  <path d="M20 23 Q22 20 20 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
</svg>`
