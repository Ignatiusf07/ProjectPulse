import React from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Credential from './Components/Credential'
import Contact from './Components/Contact'
import Blog from './Components/Blog'
import Navbar from './Components/Navbar'
import Index from './Components/Index'
import Dashboard from './Components/Dashboard'
import Registration from './Components/registration'
import Profile from './Components/Profile'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Index/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/credential' element={<Credential/>}/>
          <Route path='/Contact' element={<Contact/>}/>
          <Route path='/blog' element={<Blog/>}/>
          <Route path='/registration' element={<Registration/>}/>
          <Route path='/profile' element={<Profile/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
