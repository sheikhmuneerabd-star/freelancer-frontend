import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function AuthTab() {
    const navigate = useNavigate();
    const location = useLocation();
  return (
    <div className="bg-[#0a0a0f] w-full min-h-screen py-6 sm:py-10 flex justify-center items-center px-4">
        <div className="bg-[#8080801e] w-full max-w-[420px] rounded-md border-[1px] border-gray-500 my-auto">
            <div className="flex">
                <button className={`border-[1px] border-gray-500 text-white w-full h-[39px] font-medium rounded-md ${location.pathname === "/auth/login" ? "bg-[#9b989832]" : ""} hover:bg-[#9b989832] text-lg`} 
                    onClick={() => {
                        navigate("/auth/login")
                    }}
                >Login</button>
                <button className={`border-[1px] border-gray-500 text-white w-full h-[39px] font-medium rounded-md ${location.pathname === "/auth/signUp" ? "bg-[#9b989832]" : ""} hover:bg-[#9b989832] text-lg`} 
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