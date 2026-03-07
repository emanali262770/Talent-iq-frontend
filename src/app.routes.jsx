import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Features/auth/pages/login'
import Register from './Features/auth/pages/Register'
import Protected from './Features/auth/components/Protected'
import Home from './Features/interview-ai/pages/Home'
import InterviewReport from './Features/interview-ai/pages/InterviewReport'

const Router = () => {
  return (
    <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      
            <Route path='/' element={ <Protected><Home/></Protected>} />
            <Route path='/interview-report' element={ <Protected><InterviewReport/></Protected>} />
       
    </Routes>
  )
}

export default Router