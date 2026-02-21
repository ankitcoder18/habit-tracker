

import { useContext, useState } from "react"
import { HabitContext } from "../context/HabitContext"
import { useNavigate } from "react-router-dom"
const Register=()=>{
    const {handleRegister} = useContext(HabitContext)
    const[userFormData,setUserFormData]= useState({
        name:"",
        email:"",
        password:""

    })

    const navigate = useNavigate()
    const handleChange = (e)=>{
        const{name,value}= e.target 
        setUserFormData((prevFormData)=>({...prevFormData, [name]:value}))
    }
    const handleSignIn = (e)=>{
        e.preventDefault()
        handleRegister(userFormData.name, userFormData.email, userFormData.password)
    }
    return(
        <div className="flex items-center justify-center min-h-screen bg-[#140746]">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sign Up</h2>
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                            Enter Name
                        </label>
                        <input 
                        type="text"
                        id="name"
                        value={userFormData.name}
                        onChange={handleChange}
                        name="name"
                        placeholder="Enter your Fullname"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required

                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                            Email Address 
                        </label>
                        <input 
                        type="email"
                        id="email"
                        value={userFormData.email}
                        onChange={handleChange}
                        name="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required

                        />
                    </div>
                      <div>
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                            Password
                        </label>
                        <input 
                        type="password"
                        id="password"
                        value={userFormData.password}
                        onChange={handleChange}
                        name="password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required

                        />
                    </div>
                    <button type="submit" className="w-full bg-[#140746] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
                        Sign Up
                    </button>

                </form>
                <p className="mt-4 text-sm text-center text-gray-600">
                    Already have an account?&nbsp;&nbsp;<span onClick={()=>navigate("/login")} className="text-blue-400 underline cursor-pointer">Sign In</span>
                </p>

            </div>

        </div>
    )
}
export default Register