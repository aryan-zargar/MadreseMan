import { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/sidebar'
import "@fontsource/inter";
import {
  BrowserRouter,
  Route,
  Switch,
} from "react-router-dom/cjs/react-router-dom.min";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFnsJalali} localeText={fa}>
      <div dir="rtl" className={isLoggedIn 
        ? 'flex flex-col md:flex-row bg-zinc-100 hero-section min-h-screen relative' 
        : 'bg-zinc-100 hero-section min-h-screen'
      }>
        {isLoggedIn ? (
          <>
            {/* Main Content - Takes full width on mobile, flex-1 on desktop */}
            <div className={`
              flex-1 transition-all duration-500 
              ${isMobile ? 'p-4 pb-24' : ''}
              order-2 md:order-1
            `}>
              <BrowserRouter>
                <Switch>
                  <Route path="/sdashboard"><StDashboard /></Route>
                  <Route path="/dashboard"><PrincipalDashboard /></Route>
                  <Route path="/baseinfo"><Baseinfo /></Route>
                  <Route path="/studentManagment"><StudentManagment /></Route>
                  <Route path="/reportcard"><Reportcard /></Route>
                  <Route path="/budget"><Budget /></Route>
                  <Route path="/stdreport"><SReportCard/></Route>
                  <Route path="/tuition"><TuitionManagement/></Route>
                  <Route path="*"><Redirect /></Route>
                </Switch>
              </BrowserRouter>
            </div>
            
            {/* Sidebar - Always render but with different display modes */}
            <Sidebar 
              collapsed={sidebarCollapsed}
              onCollapse={setSidebarCollapsed} 
              isMobile={isMobile}
            />
          </>
        ) : (
          <div className="flex-1">
            <BrowserRouter>
              <Switch>
                <Route path="/login"><Login /></Route>
                <Route path="/stlogin"><StLogin /></Route>
                <Route path="/emailConfirmation/:usermail"><EmailConfirmation /></Route>
                <Route path="*"><RedirectToLogin /></Route>
              </Switch>
            </BrowserRouter>
          </div>
        )}
      </div>
    </LocalizationProvider>
  )
}

export default App

function Redirect() {
  window.location.pathname = '/dashboard'
  return <div></div>
}

function RedirectToLogin() {
  window.location.pathname = '/login'
  return <div></div>
}