import { useState } from 'react';
import { createContext } from 'react'
import axios from 'axios';
import { useContext } from 'react';
import { authDataContext } from './AuthContext';
import { useEffect } from 'react';

export const userDataContext = createContext();
function UserContext({children}) {
    const [userData, setUserData] = useState(null);
    const { serverUrl } = useContext(authDataContext);
    const getCurrentUser = async () => {
        try {
            const res = await axios.get(serverUrl + "/api/user/getCurrentUser", {withCredentials: true});
            setUserData(res.data);
        } catch (error) {
            if(error.response?.status !== 400){
                console.log(error);
            }
            setUserData(null);
        }
    }

    useEffect(() => {
        getCurrentUser();
    }, []);

    const data = {
        userData,
        setUserData
    }
  return (
    <userDataContext.Provider value={data}>
        {children}
    </userDataContext.Provider>
  )
}

export default UserContext