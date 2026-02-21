
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import { BrowserRouter } from 'react-router-dom'
import HabitContextProvider from './context/HabitContext.jsx'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <HabitContextProvider>
        <App />
      </HabitContextProvider>
    </BrowserRouter>
  </ErrorBoundary>,
)
