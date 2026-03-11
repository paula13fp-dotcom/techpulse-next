// Source icons — matches the current Streamlit app's icon map
export const SOURCE_ICONS: Record<string, string> = {
  reddit: '🤖',
  youtube: '▶️',
  xda: '🛠️',
  gsmarena: '📱',
  tiktok: '🎵',
  x: '𝕏',
  xataka: '⚡',
  xatakamovil: '📲',
  muycomputer: '💻',
  andro4all: '🤖',
  hipertextual: '🧪',
  applesfera: '🍎',
  hardzone: '🔧',
  tuexperto: '📰',
  iphoneros: '📱',
  '9to5mac': '🍏',
  '9to5google': '🔍',
  macrumors: '🍎',
  androidauthority: '🤖',
  wccftech: '🖥️',
  theverge: '📐',
  sammobile: '📱',
  androidpolice: '🚔',
  phandroid: '📱',
  techradar: '📡',
}

// Sentiment badge styling
export const SENTIMENT_CONFIG = {
  positive: { icon: '🟢', label: 'Positivo', color: '#22c55e' },
  negative: { icon: '🔴', label: 'Negativo', color: '#ef4444' },
  neutral: { icon: '⚪', label: 'Neutral', color: '#9ca3af' },
  mixed: { icon: '🟡', label: 'Mixto', color: '#eab308' },
} as const

// Device categories
export const CATEGORIES = [
  { label: 'Todas', slug: null },
  { label: '📱 Moviles', slug: 'phones' },
  { label: '⌚ Smartwatches', slug: 'smartwatches' },
  { label: '📲 Tablets', slug: 'tablets' },
] as const

// Market intelligence categories
export const MARKET_CATEGORIES = [
  '📱 Moviles',
  '⌚ Smartwatches',
  '📲 Tablets',
  '💻 Portatiles',
  '🎮 Gaming',
] as const
