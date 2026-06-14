import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthContext from './Context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import UserContext from './Context/UserContext.jsx'
import SocketProvider from './Context/SocketContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContext>
        <UserContext>
          <SocketProvider>
              <App />
          </SocketProvider>
        </UserContext>
    </AuthContext>
  </BrowserRouter>,
)
