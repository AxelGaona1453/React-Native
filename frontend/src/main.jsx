import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ChampionProvider } from './context/ChampionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChampionProvider>
      <App />
    </ChampionProvider>
  </StrictMode>,
)
