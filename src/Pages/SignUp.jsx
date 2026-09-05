import { MdOutlineMailOutline } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";
import { SlSocialGoogle } from "react-icons/sl";
import { MdArrowOutward } from "react-icons/md";
import { FaCode } from "react-icons/fa6";
import { TbBuilding } from "react-icons/tb";
import { LuUser } from "react-icons/lu";
import { GoVerified } from "react-icons/go";
import { useContext, useState } from "react";
import axios from 'axios'
import { authDataContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../Context/UserContext";
import toast from "react-hot-toast";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [client, setClient] = useState(false);
    const [freelancer, setFreelancer] = useState(true);

    const { setUserData } = useContext(userDataContext);

    const navigate = useNavigate();

    const { serverUrl } = useContext(authDataContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("freelancer");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${serverUrl}/api/auth/signUp`, {
                name,
                email,
                password,
                confirmPassword,
                role,
            }, {withCredentials: true});
            toast.success("Account ban gaya!");

            const user = res.data;
            setUserData(user);

            setLoading(false);
            setError("");
            const userRole = res.data.role;
            if(userRole === "client") {
                navigate("/client/dashboard");
            }else{
                navigate("/freelancer/dashboard");
            }
        } catch (error) {
            if (error.response) {
                toast.error(error.response?.data?.message || "Signup fail ho gaya");
                setError(error.response.data.message);
            } else if (error.request) {
                setError("Server se connection nahi ho paaya. Backend chal raha hai?");
            } else {
                setError(error.message);
            }
            setLoading(false);
        }
    }
  return (
    <div>
        <div className="mt-2">
            <h2 className="text-center text-[30px] text-gray-900 dark:text-white font-medium">Create an account</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center text-[15px] font-medium">Register on FreelanceHub</p>
        </div>

        <form className="space-y-3 px-6 mt-4" onSubmit={handleSignUp}>
            <div>
                <label className="flex items-center text-gray-600 dark:text-gray-300 font-medium text-[15px] gap-1 mb-1">Who are you?</label>
                <div className="flex gap-2">
                    <div className={`w-full h-[100px] ${client ? "border-[#534AB7] bg-[#534ab715] dark:bg-purple-100 border-2" : "border-gray-300 dark:border-gray-500"} cursor-pointer border-[1px] rounded-md flex flex-col items-center justify-center`}
                    onClick={(e) => {
                        setClient(true);
                        setFreelancer(false);
                        setRole("client")
                    }}>
                        <p className="text-[#534AB7] text-[25px]"><TbBuilding /></p>
                        <p className={`font-medium ${client ? "text-gray-800 dark:text-gray-500" : "text-gray-800 dark:text-white"} text-lg`}>Client</p>
                        <p className={`${client ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-300"} font-medium text-[15px]`}>Hire people</p>
                    </div>
                    <div className={`w-full h-[100px] ${freelancer ? "border-[#534AB7] bg-[#534ab715] dark:bg-purple-100 border-2" : "border-gray-300 dark:border-gray-500"} cursor-pointer border-[1px] rounded-md flex flex-col items-center justify-center`}
                    onClick={() => {
                        setFreelancer(true);
                        setClient(false);
                        setRole("freelancer")
                    }}>
                        <p className="text-[#534AB7] text-[25px]"><FaCode /></p>
                        <p className={`font-medium ${freelancer ? "text-gray-800 dark:text-gray-500" : "text-gray-800 dark:text-white"} text-lg`}>Freelancer</p>
                        <p className={`${freelancer ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-300"} font-medium text-[15px]`}>Work as a freelancer</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-1 flex-col">
                <label className="flex items-center text-gray-600 dark:text-gray-300 font-medium text-[15px] gap-1"><LuUser />  Full name</label>
                <input type="text" className="h-[40px] hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-100 focus:border-blue-500 outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-transparent border-[1px] border-gray-300 dark:border-gray-500 rounded-md pl-2" placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="flex gap-1 flex-col">
                <label className="flex items-center text-gray-600 dark:text-gray-300 font-medium text-[15px] gap-1"><MdOutlineMailOutline /> Email address</label>
                <input type="email" className="h-[40px] hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-100 focus:border-blue-500 outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-transparent border-[1px] border-gray-300 dark:border-gray-500 rounded-md pl-2" placeholder="app@example.com" required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex gap-1 flex-col relative">
                <label className="flex items-center text-gray-600 dark:text-gray-300 font-medium text-[15px] gap-1"><TbLockPassword /> Password</label>
                <input type={showPassword ? "text": "password"} className="h-[40px] hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-100 focus:border-blue-500 outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-transparent border-[1px] border-gray-300 dark:border-gray-500 rounded-md pl-2" placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="w-[45px] h-[41px] absolute right-3 top-[26px] cursor-pointer rounded-md border-[1px] border-gray-300 dark:border-gray-400 flex justify-center items-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#00000032]" onClick={() => setShowPassword(prev => !prev)}>
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </div>
            </div>
            <div className="flex gap-1 flex-col relative">
                <label className="flex items-center text-gray-600 dark:text-gray-300 font-medium text-[15px] gap-1"><GoVerified /> Confirm Password</label>
                <input type={showConfirmPassword ? "text": "password"} className="h-[40px] hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-100 focus:border-blue-500 outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-transparent border-[1px] border-gray-300 dark:border-gray-500 rounded-md pl-2" placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="w-[45px] h-[41px] absolute right-3 top-[26px] cursor-pointer rounded-md border-[1px] border-gray-300 dark:border-gray-400 flex justify-center items-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#00000032]" onClick={() => setShowConfirmPassword(prev => !prev)}>
                    {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </div>
            </div>
            {error && <span className="text-red-500 font-medium">*{error}</span>}
            <button className="border-[1px] mt-3 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-white w-full h-[39px] font-medium rounded-md hover:bg-gray-100 dark:hover:bg-[#00000032] text-lg">{loading ? "Loading..." : "Sign Up"}</button>
            <div className="flex items-center gap-2">
                <div className="w-full h-[1px] bg-gray-300 dark:bg-gray-400"></div>
                <div className="text-gray-500 dark:text-gray-300 text-[15px]">or</div>
                <div className="w-full h-[1px] bg-gray-300 dark:bg-gray-400"></div>
            </div>
            <div className="flex items-center justify-center pb-5">
                <span className="text-gray-500 dark:text-gray-300 font-medium mt-1 text-[15px] flex items-center gap-1">Already have an account? <span className="text-[#534AB7] text-[15px] cursor-pointer font-medium flex gap-1 items-center" onClick={() => navigate("/auth/login")}>Login <MdArrowOutward /></span></span>
            </div>
        </form>
    </div>
  )
}

export default SignUp