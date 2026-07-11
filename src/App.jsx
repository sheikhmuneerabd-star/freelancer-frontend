import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import AuthTab from './Pages/AuthTab'
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import { useContext } from 'react';
import { userDataContext } from './Context/UserContext';
import ClientDashboard from './Pages/ClientDashboard';
import PostProject from './Pages/PostProject';
import ClientProjects from './Pages/ClientProjects';
import ProjectList from './Pages/ProjectList';
import FreelancerDashboard from './Pages/FreelancerDashboard';
import Chat from './Pages/Chat';
import ProtectedRoute from './Context/ProtectedRoute';
import Profile from './Pages/Profile';
import FreelancerProfile from "./Pages/FreelancerProfile";
import ClientProfile from "./Pages/ClientProfile";
import { Toaster } from "react-hot-toast";

function App() {
  const { userData } = useContext(userDataContext);
  
  return (
    <div>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#131520',
            color: '#e5e7eb',
            border: '1px solid #374151',
            fontSize: '14px',
          },
        }}
      />

      <Routes>
        <Route path='/auth' element={userData ? <Navigate to={`/${userData.role}/dashboard`} /> : <AuthTab />}>
          <Route path='login' element={<Login />} />
          <Route path='signUp' element={<SignUp />} />
        </Route>

        <Route path='/' element={<Home />} />

        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client/post-project" element={
          <ProtectedRoute allowedRole="client">
            <PostProject />
          </ProtectedRoute>
        } />
        <Route path="/client/projects" element={
          <ProtectedRoute allowedRole="client">
            <ClientProjects />
          </ProtectedRoute>
        } />
        <Route path='/client/chat' element={
            <ProtectedRoute allowedRole="client">
                <Chat />
            </ProtectedRoute>
        } />

        <Route path="/client/:clientId/profile" element={
          <ProtectedRoute>
            <ClientProfile />
          </ProtectedRoute>
        } />

        <Route path='/profile' element={
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
        } />

        {/* 🔴 NEW: Freelancer public profile — koi bhi logged-in user (client ya freelancer) dekh sake */}
        <Route path="/freelancer/:freelancerId/profile" element={
          <ProtectedRoute>
            <FreelancerProfile />
          </ProtectedRoute>
        } />

        <Route path="/freelancer/dashboard" element={
          <ProtectedRoute allowedRole="freelancer">
            <FreelancerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/freelancer/projects" element={
          <ProtectedRoute allowedRole="freelancer">
            <ProjectList />
          </ProtectedRoute>
        } />
        <Route path="/freelancer/chat" element={
          <ProtectedRoute allowedRole="freelancer">
            <Chat />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App