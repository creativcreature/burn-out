# Playbook 01: Initial Project Setup

## Overview
Set up the React + Vite + TypeScript foundation for BurnOut.

## Prerequisites
- Node.js 18+
- npm 9+
- Git

## Steps

### Step 1: Initialize Project
```bash
cd /Users/meltmac/Documents/app-projects/personal/burnout
npm init -y
```

### Step 2: Install Dependencies

#### Core
```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
```

#### Build Tools
```bash
npm install -D vite @vitejs/plugin-react
```

#### PWA
```bash
npm install -D vite-plugin-pwa workbox-window
```

#### Storage
```bash
npm install idb-keyval
```

#### Testing
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

#### Linting
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks
```

### Step 3: Configure TypeScript

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 4: Configure Vite

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'BurnOut',
        short_name: 'BurnOut',
        description: 'Energy-aware productivity for neurodivergent users',
        theme_color: '#1a1a1a',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    port: 3000
  }
})
```

### Step 5: Create Entry Point

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BurnOut</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 6: Create React Entry

Create `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### Step 7: Add Scripts to package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:file": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:file": "vitest run"
  }
}
```

## Verification

- [ ] `npm run dev` starts server on port 3000
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds

## Next Steps
Proceed to Playbook 02: Theme System
