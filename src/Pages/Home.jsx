import React from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { userDataContext } from '../Context/UserContext';
import Nav from '../Components/Nav';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { userData } = useContext(userDataContext);
  const navigate = useNavigate();
  
  return (
    <div className='bg-gray-50 dark:bg-[#0a0a0f] w-full min-h-screen transition-colors'>
      <Nav />

      <div className='w-full min-h-[80vh] flex gap-5 flex-col items-center justify-center px-4 text-center'>
        <h2 className="font-medium text-2xl sm:text-[35px] text-gray-900 dark:text-gray-50 leading-snug">
          Apna kaam karo, apni marzi se
        </h2>
        <p className="font-medium text-gray-500 dark:text-gray-400 text-sm sm:text-[18px] max-w-[500px]">
          Client projects post karo ya freelancer ke tor pe kaam dhundo
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center mt-2">
          {!userData ? (
            <>
              <button
                className="w-full sm:w-[140px] h-[42px] rounded-md bg-[#534AB7] hover:bg-[#534ab7d1] font-medium text-gray-100 transition-colors"
                onClick={() => navigate("/auth/login")}
              >
                Post a Project
              </button>
              <button
                className="w-full sm:w-[100px] h-[42px] rounded-md border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#ffffff08] transition-colors"
                onClick={() => navigate("/auth/login")}
              >
                Find Work
              </button>
            </>
          ) : userData.role === "client" ? (
            <button
              className="w-full sm:w-[140px] h-[42px] rounded-md bg-[#534AB7] hover:bg-[#534ab7d1] font-medium text-gray-100 transition-colors"
              onClick={() => navigate("/client/post-project")}
            >
              Post a Project
            </button>
          ) : (
            <button
              className="w-full sm:w-[140px] h-[42px] rounded-md border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#ffffff08] transition-colors"
              onClick={() => navigate("/freelancer/projects")}
            >
              Find Work
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home