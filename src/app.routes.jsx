import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Features/auth/pages/Login'
import Register from './Features/auth/pages/Register'
import Protected from './Features/auth/components/Protected'
import Home from './Features/interview-ai/pages/Home'
import InterviewReport from './Features/interview-ai/pages/InterviewReport'
import InterviewReports from './Features/interview-ai/pages/InterviewReports'

const Router = () => {
  return (
    <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      
            <Route path='/' element={ <Protected><Home/></Protected>} />
            <Route path='/interview-reports' element={ <Protected><InterviewReports/></Protected>} />
            <Route path='/interview-report/:id' element={ <Protected><InterviewReport/></Protected>} />
       
    </Routes>
  )
}

export default Router