import { MdOutlineMailOutline } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";
import { SlSocialGoogle } from "react-icons/sl";
import { MdArrowOutward } from "react-icons/md";
import { useContext, useState } from "react";
import { authDataContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { userDataContext } from "../Context/UserContext";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { setUserData } = useContext(userDataContext);

  const navigate = useNavigate();
  
  const { serverUrl } = useContext(authDataContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await axios.post(`${serverUrl}/api/auth/login`, {
            email,
            password
        }, {withCredentials: true});
        toast.success("Login successful!");

        const user = res.data;
        setUserData(user);

        setLoading(false);
        setError("");
        const role = res.data.role;
        if(role === "client") {
            navigate("/client/dashboard");
        }else{
            navigate("/freelancer/dashboard");
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Login fail ho gaya");
        setError(error.response.data.message);
        setLoading(false);
        console.log(error.response.data.message);
    }
  }

  return (
    <div>
        <div className="mt-2 px-4">
            <h2 className="text-center text-2xl sm:text-[30px] text-gray-900 dark:text-white font-medium">Login</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center text-[13px] sm:text-[15px] font-medium">Apne account mein login karein</p>
        </div>

        <form className="space-y-3 px-4 sm:px-6 mt-4 mb-4" onSubmit={handleLogin}>
            <div className="flex gap-1 flex-col">
                <label className="flex items-center text-gray-600 dark:text-gray-300 font-medium text-[13px] sm:text-[15px] gap-1">
                    <MdOutlineMailOutline /> Email address
                </label>
                <input
                  type="email"
                  className="h-[40px] hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-100 focus:border-blue-500 outline-none focus:ring-2 text-gray-900 dark:text-white text-sm bg-white dark:bg-transparent border-[1px] border-gray-300 dark:border-gray-500 rounded-md pl-2 pr-2"
                  placeholder="app@example.com"
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex gap-1 flex-col relative">
                <label className="flex items-center text-gray-600 dark:text-gray-300 font-medium text-[13px] sm:text-[15px] gap-1">
                    <TbLockPassword /> Password
                </label>
                <input
                  type={showPassword ? "text": "password"}
                  className="h-[40px] hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-100 focus:border-blue-500 outline-none focus:ring-2 text-gray-900 dark:text-white text-sm bg-white dark:bg-transparent border-[1px] border-gray-300 dark:border-gray-500 rounded-md pl-2 pr-[52px]"
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="w-[40px] h-[40px] sm:w-[45px] sm:h-[41px] absolute right-1 sm:right-3 top-[24px] sm:top-[26px] cursor-pointer rounded-md border-[1px] border-gray-300 dark:border-gray-400 flex justify-center items-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#00000032]"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </div>
            </div>
            {error && <span className="text-red-500 text-sm font-medium block">*{error}</span>}
            <p className="text-[#534AB7] text-[13px] sm:text-[15px] text-right cursor-pointer font-medium">Password bhool gaye?</p>
            <button className="border-[1px] mt-3 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-white w-full h-[39px] font-medium rounded-md hover:bg-gray-100 dark:hover:bg-[#00000032] text-base sm:text-lg">
                {loading ? "Loading..." : "Login karein"}
            </button>
            <div className="flex items-center gap-2">
                <div className="w-full h-[1px] bg-gray-300 dark:bg-gray-400"></div>
                <div className="text-gray-500 dark:text-gray-300 text-[13px] sm:text-[15px]">ya</div>
                <div className="w-full h-[1px] bg-gray-300 dark:bg-gray-400"></div>
            </div>
            <button className="border-[1px] mt-3 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-white w-full h-[39px] font-medium rounded-md hover:bg-gray-100 dark:hover:bg-[#00000032] text-sm sm:text-lg flex items-center justify-center gap-1.5 sm:gap-2 px-2">
                <SlSocialGoogle className="text-orange-600 flex-shrink-0" />
                <span className="truncate">Google se login karein</span>
                <MdArrowOutward className="flex-shrink-0" />
            </button>
            <div className="flex items-center justify-center flex-wrap text-center">
                <span className="text-gray-500 dark:text-gray-300 font-medium mt-2 text-[13px] sm:text-[15px]">
                    Account nahi?{" "}
                    <span className="text-[#534AB7] cursor-pointer font-medium" onClick={() => navigate("/auth/signUp")}>
                        Sign up karein
                    </span>
                </span>
            </div>
        </form>
    </div>
  )
}

export default Login