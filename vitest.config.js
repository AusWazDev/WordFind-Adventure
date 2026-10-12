// Test-only configuration (SF-59). It reuses vite.config.js unchanged and adds the
// test settings below; vite build never reads this file.
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default defineConfig(configEnv => mergeConfig(viteConfig(configEnv), {
  test: {
    deps: {
      optimizer: {
        // lucide-react's ESM entry re-exports one module per icon (3,522 files in
        // 0.475.0). Loading them one by one took 2.9 s alone and 11 s in a full
        // parallel run, most of the 60 s budget leaderboardRoute's first test kept
        // missing. Pre-bundled, it is one file (SF-59).
        web: { enabled: true, include: ['lucide-react'] },
      },
    },
  },
}))
