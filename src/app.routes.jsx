import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Features/auth/pages/Login'
import Register from './Features/auth/pages/Register'
import ResetPassword from './Features/auth/pages/ResetPassword'
import Protected from './Features/auth/components/Protected'
import Landing from './Features/interview-ai/pages/Landing'
import Home from './Features/interview-ai/pages/Home'
import InterviewReport from './Features/interview-ai/pages/InterviewReport'
import InterviewReports from './Features/interview-ai/pages/InterviewReports'

const Router = () => {
  return (
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* Reset Password routes supporting query params and path params */}
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/reset-password/:token' element={<ResetPassword />} />
      <Route path='/auth/reset-password' element={<ResetPassword />} />
      <Route path='/auth/reset-password/:token' element={<ResetPassword />} />
      <Route path='/resetpassword' element={<ResetPassword />} />
      <Route path='/resetpassword/:token' element={<ResetPassword />} />

      <Route path='/dashboard' element={<Protected><Home /></Protected>} />
      <Route path='/interview-reports' element={<Protected><InterviewReports /></Protected>} />
      <Route path='/interview-report/:id' element={<Protected><InterviewReport /></Protected>} />

      {/* Fallback route so unknown URLs never render a blank screen */}
      <Route path='*' element={<Login />} />
    </Routes>
  )
}

export default Router
