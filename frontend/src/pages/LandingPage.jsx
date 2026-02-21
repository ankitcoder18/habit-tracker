import { useNavigate } from "react-router-dom"

const LandingPage=()=>{
    const navigate = useNavigate()
    return(
        <div className="flex flex-col items-center justify-center mt-24 px-4 sm:px-6 lg:px-8">
<h1 className="font-bold text-white text-3xl sm:text-4xl lg:text-5xl text-center">
    Take a first step towords <br/> <span className="text-red-500">positive change </span>
</h1>
<p className="mt-6 sm:mt-8 text-gray-300 text-center text-sm sm:text-base ms:text-lg `sm:w-[430px]` w-full max-w-md">
    Start your journey to a more orgnized and fulfilling life with our powerful habit tracker. stay motivated and on track!
</p>
<button onClick={()=>navigate('/register')} className="bg-red-500 mt-8 py-2 px-6 sm:px-8 rounded-md text-white font-semibold text-sm sm:text-base">
    Lets&apos;s get started
</button>
        </div>
    )
}
export default LandingPage