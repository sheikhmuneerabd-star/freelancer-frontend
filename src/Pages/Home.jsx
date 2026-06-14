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
    <div className='bg-[#000000d3] w-full min-h-screen'>
      <Nav />

      <div className='w-full h-[80vh] flex gap-5 flex-col items-center justify-center'>
        <h2 className="font-medium text-[35px] text-gray-50">Apna kaam karo, apni marzi se</h2>
        <p className="font-medium text-gray-300 text-[18px]">Client projects post karo ya freelancer ke tor pe kaam dhundo</p>

        <div className="flex gap-3">
          {!userData ? (
            <div>
              <button className="w-[140px] h-[39px] rounded-md bg-[#534AB7] hover:bg-[#534ab7d1] font-medium text-gray-300" onClick={() => navigate("/auth/login")}>Post a Project</button>
              <button className="w-[100px] h-[39px] rounded-md border-[1px] font-medium text-gray-300" onClick={() => navigate("/auth/login")}>Find Work</button>
            </div>
            ) : userData.role === "client" ? (
              <button className="w-[140px] h-[39px] rounded-md bg-[#534AB7] hover:bg-[#534ab7d1] font-medium text-gray-300" onClick={() => {
                navigate("/client/post-project");
              }}>Post a Project</button>
            ) : (
              <button className="w-[100px] h-[39px] rounded-md border-[1px] font-medium text-gray-300" onClick={() => navigate("/freelancer/projects")}>Find Work</button>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default Home