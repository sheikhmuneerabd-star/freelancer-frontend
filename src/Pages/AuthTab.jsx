import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function AuthTab() {
    const navigate = useNavigate();
    const location = useLocation();
  return (
    <div className="bg-[#000000d3] w-full min-h-screen py-10 flex justify-center items-center">
        <div className="bg-[#8080801e] w-[90%] max-w-[420px] min-h-[92vh] rounded-md border-[1px] border-gray-500">
            <div className="flex">
                <button className={`border-[1px] border-gray-500 text-white w-full h-[39px] font-medium rounded-md ${location.pathname === "/auth/login" ? "bg-[#00000032]" : ""} hover:bg-[#00000032] text-lg`} 
                    onClick={() => {
                        navigate("/auth/login")
                    }}
                >Login</button>
                <button className={`border-[1px] border-gray-500 text-white w-full h-[39px] font-medium rounded-md ${location.pathname === "/auth/signUp" ? "bg-[#00000032]" : ""} hover:bg-[#00000032] text-lg`} 
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