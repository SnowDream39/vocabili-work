import { defineConfig } from 'unocss'
import { presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
  ],
  theme: {
    colors: {
      primary: 'var(--md-sys-color-primary)',
      'on-primary': 'var(--md-sys-color-on-primary)',
      secondary: 'var(--md-sys-color-secondary)',
      'on-secondary': 'var(--md-sys-color-on-secondary)',
      tertiary: 'var(--md-sys-color-tertiary)',
      'on-tertiary': 'var(--md-sys-color-on-tertiary)',
      surface: 'var(--md-sys-color-surface)',
      'surface-container': 'var(--md-sys-color-surface-container)',
      'on-surface': 'var(--md-sys-color-on-surface)',
      'on-surface-variant': 'var(--md-sys-color-on-surface-variant)',
      error: 'var(--md-sys-color-error)',
      'on-error': 'var(--md-sys-color-on-error)',
    },
  }
})
