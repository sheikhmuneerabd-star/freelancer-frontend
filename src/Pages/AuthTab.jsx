import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function AuthTab() {
    const navigate = useNavigate();
    const location = useLocation();
  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0f] w-full min-h-screen py-6 sm:py-10 flex justify-center items-center px-4 transition-colors">
        <div className="bg-white dark:bg-[#8080801e] w-full max-w-[420px] rounded-md border-[1px] border-gray-300 dark:border-gray-500 my-auto shadow-lg dark:shadow-none">
            <div className="flex">
                <button className={`border-[1px] border-gray-300 dark:border-gray-500 text-gray-800 dark:text-white w-full h-[39px] font-medium rounded-md ${location.pathname === "/auth/login" ? "bg-gray-100 dark:bg-[#9b989832]" : ""} hover:bg-gray-100 dark:hover:bg-[#9b989832] text-lg`} 
                    onClick={() => {
                        navigate("/auth/login")
                    }}
                >Login</button>
                <button className={`border-[1px] border-gray-300 dark:border-gray-500 text-gray-800 dark:text-white w-full h-[39px] font-medium rounded-md ${location.pathname === "/auth/signUp" ? "bg-gray-100 dark:bg-[#9b989832]" : ""} hover:bg-gray-100 dark:hover:bg-[#9b989832] text-lg`} 
                    onClick={() => {
                        navigate("/auth/signUp")
                    }}
                >Sign Up</button>
            </div>
            <Outlet />
        </div>
    </div>
  )
}

export default AuthTab