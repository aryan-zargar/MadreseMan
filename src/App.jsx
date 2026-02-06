import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/sidebar'
import "@fontsource/inter";
import {
  BrowserRouter,
  Route,
  Switch,
} from "react-router-dom/cjs/react-router-dom.min";
import DummyDashboard from './components/DummyDashboard'
import Baseinfo from './components/baseinfo'
import Login from './components/login'
import EmailConfirmation from './components/emailConfirmation'
import StudentManagment from './components/studentManagment'
import dayjs from 'dayjs';
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import "dayjs/locale/fa"
import fa from 'dayjs/locale/fa'
import Reportcard from './components/reportcard'
import Budget from './components/BudgetManagment'
import StLogin from './components/StudentsLogin'
import StDashboard from './components/stDashboard'
import PrincipalDashboard from './components/DashBoard'
import SReportCard from './components/STDReport'
import TuitionManagement from './components/tuitionPayment'
function App() {


  const [isLoggedIn, SetLoggedStatus] = useState(localStorage.token != undefined || localStorage.stoken != undefined)
  console.log(isLoggedIn)


  return (
      <LocalizationProvider dateAdapter={AdapterDateFnsJalali} localeText={fa}  >
        <div className={isLoggedIn ? 'grid grid-cols-5 bg-zinc-100 hero-section' : ' bg-zinc-100 hero-section'}>
          <div className={isLoggedIn ? 'col-span-4' : ""}>
            <BrowserRouter>
              {isLoggedIn ?
                <Switch>

                  <Route path="/sdashboard" ><StDashboard /></Route>
                  <Route path="/dashboard"><PrincipalDashboard /></Route>
                  <Route path="/baseinfo"><Baseinfo /></Route>
                  <Route path="/studentManagment" ><StudentManagment /></Route>
                  <Route path="/reportcard" ><Reportcard /></Route>
                  <Route path="/budget" ><Budget /></Route>
                  <Route path="/stdreport" ><SReportCard/></Route>
                  <Route path="/tuition" ><TuitionManagement/></Route>
                  <Route path="*"><Redirect /></Route>



                </Switch> :
                <Switch>
                  <Route path="/login"><Login /></Route>
                  <Route path="/stlogin"><StLogin /></Route>
                  <Route path="/emailConfirmation/:usermail"><EmailConfirmation /></Route>
                  <Route path="*" ><RedirectToLogin /></Route>
                </Switch>
              }
            </BrowserRouter>
          </div>
          {isLoggedIn ? <Sidebar /> : null}
        </div>
      </LocalizationProvider >
  )
}

export default App

function Redirect() {
  window.location.pathname = '/dashboard'
  return (
    <div></div>
  )
}
function RedirectToLogin() {
  window.location.pathname = '/login'
  return (
    <div></div>
  )
}