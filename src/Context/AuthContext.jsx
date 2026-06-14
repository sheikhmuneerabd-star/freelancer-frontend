import { createContext } from 'react'

export const authDataContext = createContext();
function AuthContext({children}) {
    const serverUrl = "http://localhost:8000"
    const data = {
        serverUrl
    }
  return (
    <authDataContext.Provider value={data}>
        {children}
    </authDataContext.Provider>
  )
}

export default AuthContext