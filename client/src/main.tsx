import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppProviders from "@/app/providers";
import AppRouterProvider from "@/app/providers/router-provider";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AppProviders>
          <AppRouterProvider />
      </AppProviders>
  </StrictMode>,
)
