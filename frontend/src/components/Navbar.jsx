import { useContext, useState } from "react"
import { HabitContext } from "../context/HabitContext"
import { useNavigate } from "react-router-dom"
import cookie from "js-cookie"
import { FaUserCircle, FaBars, FaTimes, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa"

const Navbar = () => {
    const { token, setToken } = useContext(HabitContext)
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        cookie.remove("token")
        setToken("")
        navigate('/')
        setMobileMenuOpen(false)
    }

    const navigateTo = (path) => {
        navigate(path)
        setMobileMenuOpen(false)
    }

    return (
        <nav className="bg-gradient-to-r from-[#140746] via-purple-900 to-indigo-900 shadow-2xl sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo/Brand */}
                    <div 
                        onClick={() => navigateTo('/')} 
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl">🎯</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                            Habit<span className="text-pink-400">Tracker</span>
                        </h1>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {token ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                                    <FaUserCircle className="text-2xl text-purple-200" />
                                    <span className="text-white font-medium">Welcome back!</span>
                                </div>
                                <button 
                                    onClick={handleLogout} 
                                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-3 px-6 rounded-xl text-white font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => navigateTo('/login')} 
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 py-3 px-6 rounded-xl text-white font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                    <FaSignInAlt /> Sign In
                                </button>
                                <button 
                                    onClick={() => navigateTo("/register")} 
                                    className="border-2 border-pink-400 hover:bg-pink-400 py-3 px-6 rounded-xl text-pink-400 hover:text-white font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                    <FaUserPlus /> Sign Up
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 animate-slideDown">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 space-y-3 border border-white/20">
                            {token ? (
                                <>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl border border-white/20">
                                        <FaUserCircle className="text-2xl text-purple-200" />
                                        <span className="text-white font-medium">Welcome back!</span>
                                    </div>
                                    <button 
                                        onClick={handleLogout} 
                                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-3 px-4 rounded-xl text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => navigateTo('/login')} 
                                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 py-3 px-4 rounded-xl text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FaSignInAlt /> Sign In
                                    </button>
                                    <button 
                                        onClick={() => navigateTo("/register")} 
                                        className="w-full border-2 border-pink-400 hover:bg-pink-400 py-3 px-4 rounded-xl text-pink-400 hover:text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FaUserPlus /> Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </nav>
    )
}

export default Navbar