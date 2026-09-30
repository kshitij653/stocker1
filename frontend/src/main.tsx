import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Login from './Login.tsx'
import './index.css'

function Root() {
  const token = localStorage.getItem('stocker_token')

  if (!token) {
    return (
      <Login
        onLogin={() => {
          window.location.reload()
        }}
      />
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)