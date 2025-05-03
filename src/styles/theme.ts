export const theme = {
  colors: {
    // Base colors
    background: {
      primary: '#18181B', // zinc-900
      secondary: '#27272A', // zinc-800
      tertiary: '#3F3F46', // zinc-700
    },
    text: {
      primary: '#FAFAFA', // zinc-50
      secondary: '#A1A1AA', // zinc-400
      muted: '#71717A', // zinc-500
    },
    // Brand colors
    brand: {
      primary: '#02563D', // dark green
      secondary: '#059669', // emerald-600
      accent: '#34D399', // emerald-400
    },
    // Status colors
    status: {
      success: '#22C55E', // green-500
      warning: '#F59E0B', // amber-500
      error: '#EF4444', // red-500
      info: '#3B82F6', // blue-500
    },
    // Border colors
    border: {
      primary: '#3F3F46', // zinc-700
      secondary: '#27272A', // zinc-800
      focus: '#02563D', // dark green
    }
  },
  
  // Spacing scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '4rem',
  },
  
  // Typography
  typography: {
    fonts: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    glow: '0 0 15px rgb(2 86 61 / 0.5)', // dark green glow
  },
  
  // Transitions
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Border radius
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  // Z-index scale
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Effects
  effects: {
    glassMorphism: {
      background: 'rgba(24, 24, 27, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(63, 63, 70, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(to right, #9333EA, #A855F7)',
      dark: 'linear-gradient(to bottom, #18181B, #09090B)',
      glow: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15), transparent 80%)',
    },
  },
} as const;

export type Theme = typeof theme;

// Utility types for theme values
export type ThemeColor = keyof typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;
export type ThemeRadius = keyof typeof theme.radius;
export type ThemeShadow = keyof typeof theme.shadows;
export type ThemeBreakpoint = keyof typeof theme.breakpoints;

// Helper function to get theme values with TypeScript support
export const getThemeValue = <
  K extends keyof Theme,
  SK extends keyof Theme[K],
  SSK extends keyof Theme[K][SK]
>(
  category: K,
  subcategory: SK,
  value: SSK
): Theme[K][SK][SSK] => {
  return theme[category][subcategory][value];
}; 
