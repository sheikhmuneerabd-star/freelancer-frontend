import React, { useContext, useEffect } from 'react'
import { userDataContext } from './UserContext'
import { Navigate } from 'react-router-dom';

function ProtectedRoute({children, allowedRole}) {
    const { userData } = useContext(userDataContext);

    if(!userData) return <Navigate to="/auth/login" />

    if(allowedRole && userData.role !== allowedRole){
        return <Navigate to={`/${userData.role}/dashboard`} />
    }

  return children;
}

export default ProtectedRoute