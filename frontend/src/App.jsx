import { ToastContainer } from "react-toastify"
import Navbar from "./components/Navbar"
import { useContext } from "react"
import { HabitContext } from "./context/HabitContext"
import { Navigate, Route, Routes } from "react-router-dom"
import Habits from "./components/Habits"
import LandingPage from "./pages/LandingPage"
import Signin from "./pages/Signin"
import Register from "./pages/Register"

const App = () => {
  const { token } = useContext(HabitContext)
  
  console.log("App rendering, token:", token);
  
  // Show loading or blank screen briefly while initializing
  if (token === undefined) {
    return <div className="bg-[#140746] min-h-screen"></div>
  }

  return (
    <div className="bg-[#140746] min-h-screen">
      <ToastContainer />
      <Navbar />
      <Routes>
        {token && token.length > 0 ? (
          <Route path="/Habits" element={<Habits />} />
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Signin />} />
            <Route path="/register" element={<Register />} />
          </>
        )}
        <Route path="*" element={<Navigate to={token && token.length > 0 ? '/Habits' : '/'} />} />
      </Routes>
    </div>
  )
}

export default App
