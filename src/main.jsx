import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient();

// console.info('%cPowered by Ekalon Solutions', 'color:#90caf9;font-size:12px;');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)