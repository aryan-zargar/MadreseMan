import React, { useEffect, useState } from 'react';
import MadreseManLogo from '../assets/MadreseManLogo.png';
import { BiSolidDashboard, BiChevronDown, BiChevronUp } from 'react-icons/bi';
import {
  FaCashRegister,
  FaGear,
  FaMoneyBillTransfer,
  FaTableList,
  FaUserGraduate,
  FaRegCreditCard
} from 'react-icons/fa6';
import {
  FaUserFriends,
} from 'react-icons/fa';
import { IoMdExit } from 'react-icons/io';
import { MdMenu, MdClose } from 'react-icons/md';
import axios from 'axios';

export default function Sidebar({ collapsed, onCollapse, isMobile }) {
  const [isStLoggedIn, SetLoggedStatus] = useState(localStorage.stoken != undefined);
  const [studentData, SetStudentData] = useState({});
  const [openMenus, setOpenMenus] = useState({});
  const [activePath, setActivePath] = useState(window.location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track active path
  useEffect(() => {
    setActivePath(window.location.pathname);
  }, [window.location.pathname]);

  function getStudentData() {
    if (isStLoggedIn) {
      axios.get(`http://localhost:5217/api/v1/auth/sessions/GetStudentBySessionId/${localStorage.getItem("stoken")}`)
        .then((res) => {
          SetStudentData(res.data);
        })
        .catch((err) => {
          console.error("Error fetching student data:", err);
        });
    }
  }

  useEffect(() => {
    getStudentData();
  }, []);

  const toggleCollapse = () => {
    const newState = !collapsed;
    onCollapse(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    if (isStLoggedIn) {
      localStorage.removeItem("stoken");
    } else {
      localStorage.removeItem("token");
    }
    window.location.pathname = "/";
  };

  // Navigation items
  const adminNavItems = [
    {
      title: 'داشبورد',
      path: '/dashboard',
      icon: <BiSolidDashboard />,
      exact: true
    },
    {
      title: 'اطلاعات پایه',
      path: '/baseinfo',
      icon: <FaGear />,
    },
    {
      title: 'مدیریت دانش آموزان',
      path: '/studentManagment',
      icon: <FaUserFriends />,
    },
    {
      title: 'کارنامه ها',
      path: '/reportcard',
      icon: <FaTableList />,
    },
    {
      title: 'مدیریت مالی',
      icon: <FaRegCreditCard />,
      submenu: [
        {
          title: 'مدیریت شهریه',
          path: '/tuition',
          icon: <FaMoneyBillTransfer />,
        },
        {
          title: 'مدیریت بودجه',
          path: '/budget',
          icon: <FaCashRegister />,
        },
      ]
    }
  ];

  const studentNavItems = [
    {
      title: 'داشبورد',
      path: '/sdashboard',
      icon: <BiSolidDashboard />,
      badge: 'در حال توسعه',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      title: 'کارنامه',
      path: '/stdreport',
      icon: <FaTableList />,
    },
    {
      title: 'پرداخت شهریه',
      path: '/tuition',
      icon: <FaMoneyBillTransfer />,
    }
  ];

  const isActive = (path) => {
    if (!path) return false;
    return activePath === path || activePath?.startsWith(path);
  };

  const NavItem = ({ item, depth = 0, mobile = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActiveItem = isActive(item.path);
    const isOpen = openMenus[item.title] || false;

    if (hasSubmenu) {
      return (
        <div className="mb-1">
          <button
            onClick={() => toggleMenu(item.title)}
            className={`w-full flex items-center p-2.5 text-gray-300 rounded-xl mx-1 
              hover:bg-gradient-to-l hover:from-cyan-900/50 hover:to-blue-900/50 
              hover:text-white transition-all duration-300 group
              ${isActiveItem ? 'text-cyan-400 bg-cyan-900/30' : ''}
              ${(collapsed || isMobile) && !mobile ? 'justify-center' : 'justify-between'}`}
          >
            <div className={`flex items-center ${(collapsed || isMobile) && !mobile ? 'justify-center' : 'gap-3'}`}>
              <div className={`text-xl transition-transform duration-300 group-hover:scale-110 
                ${isActiveItem ? 'text-cyan-400' : 'text-gray-400'}`}>
                {item.icon}
              </div>
              {((!collapsed && !isMobile) || mobile) && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </div>
            {((!collapsed && !isMobile) || mobile) && (
              <div className="text-gray-400">
                {isOpen ? <BiChevronUp /> : <BiChevronDown />}
              </div>
            )}
          </button>
          {((!collapsed && !isMobile) || mobile) && isOpen && (
            <div className="mr-6 mt-1 space-y-1 border-r-2 border-cyan-800/50 pr-2">
              {item.submenu.map((subItem, index) => (
                <NavItem key={index} item={subItem} depth={depth + 1} mobile={mobile} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a
        href={item.path}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`flex items-center ${(collapsed || isMobile) && !mobile ? 'justify-center' : 'gap-3'} p-2.5 text-gray-300 rounded-xl mx-1 
          hover:bg-gradient-to-l hover:from-cyan-900/50 hover:to-blue-900/50 
          hover:text-white transition-all duration-300 group relative
          ${isActiveItem ? 'bg-gradient-to-l from-cyan-900 to-blue-900 text-white shadow-lg shadow-cyan-900/30' : ''}`}
      >
        <div className={`text-xl transition-all duration-300 group-hover:scale-110 
          ${isActiveItem ? 'text-cyan-300' : 'text-gray-400 group-hover:text-cyan-400'}`}>
          {item.icon}
        </div>
        {((!collapsed && !isMobile) || mobile) && (
          <>
            <span className="text-sm font-medium">{item.title}</span>
            {item.badge && (
              <span className={`text-[0.7rem] px-2 py-1 rounded-full ${item.badgeColor} text-white mr-auto animate-pulse`}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {isActiveItem && !collapsed && !isMobile && (
          <div className="absolute right-0 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-l-full" />
        )}
      </a>
    );
  };

  // Mobile Bottom Navigation
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 right-0 left-0 bg-gradient-to-t from-zinc-900 to-zinc-800 
      border-t border-cyan-800/50 p-2 flex justify-around items-center z-50 md:hidden">
      {!isStLoggedIn ? (
        <>
          <a href="/dashboard" className="flex flex-col items-center p-2 text-gray-300 hover:text-cyan-400">
            <BiSolidDashboard className="text-xl" />
            <span className="text-[0.6rem] mt-1">داشبورد</span>
          </a>
          <a href="/studentManagment" className="flex flex-col items-center p-2 text-gray-300 hover:text-cyan-400">
            <FaUserFriends className="text-xl" />
            <span className="text-[0.6rem] mt-1">دانش آموزان</span>
          </a>
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col items-center p-2 bg-gradient-to-r from-cyan-500 to-blue-500 
              rounded-full text-white -mt-8 w-14 h-14 justify-center shadow-lg shadow-cyan-500/50"
          >
            {mobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>
          <a href="/reportcard" className="flex flex-col items-center p-2 text-gray-300 hover:text-cyan-400">
            <FaTableList className="text-xl" />
            <span className="text-[0.6rem] mt-1">کارنامه</span>
          </a>
          <button onClick={handleLogout} className="flex flex-col items-center p-2 text-gray-300 hover:text-red-400">
            <IoMdExit className="text-xl" />
            <span className="text-[0.6rem] mt-1">خروج</span>
          </button>
        </>
      ) : (
        <>
          <a href="/sdashboard" className="flex flex-col items-center p-2 text-gray-300 hover:text-cyan-400">
            <BiSolidDashboard className="text-xl" />
            <span className="text-[0.6rem] mt-1">داشبورد</span>
          </a>
          <a href="/stdreport" className="flex flex-col items-center p-2 text-gray-300 hover:text-cyan-400">
            <FaTableList className="text-xl" />
            <span className="text-[0.6rem] mt-1">کارنامه</span>
          </a>
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col items-center p-2 bg-gradient-to-r from-cyan-500 to-blue-500 
              rounded-full text-white -mt-8 w-14 h-14 justify-center shadow-lg shadow-cyan-500/50"
          >
            {mobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>
          <a href="/tuition" className="flex flex-col items-center p-2 text-gray-300 hover:text-cyan-400">
            <FaMoneyBillTransfer className="text-xl" />
            <span className="text-[0.6rem] mt-1">شهریه</span>
          </a>
          <button onClick={handleLogout} className="flex flex-col items-center p-2 text-gray-300 hover:text-red-400">
            <IoMdExit className="text-xl" />
            <span className="text-[0.6rem] mt-1">خروج</span>
          </button>
        </>
      )}
    </div>
  );

  // Mobile Menu Overlay
  const MobileMenuOverlay = () => (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden
      ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute top-0 bottom-0 right-0 w-64 bg-gradient-to-b from-zinc-900 to-zinc-800 
        shadow-2xl transform transition-transform duration-300 ease-out
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <img src={MadreseManLogo} className="w-10 h-10" alt="MadreseMan" />
            <h2 className="text-lg font-bold text-cyan-300">مدرسه من</h2>
          </div>
          <div className="space-y-1">
            {!isStLoggedIn
              ? adminNavItems.map((item, index) => (
                <NavItem key={index} item={item} mobile={true} />
              ))
              : studentNavItems.map((item, index) => (
                <NavItem key={index} item={item} mobile={true} />
              ))
            }
          </div>

          {/* Logout button in mobile menu */}
          <div className="mt-6 pt-4 border-t border-cyan-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2.5 text-gray-300 
                hover:bg-gradient-to-l hover:from-red-900/50 hover:to-red-800/50 
                rounded-xl transition-all duration-300 group"
            >
              <div className="text-xl text-gray-400 group-hover:text-red-400 
                group-hover:rotate-180 transition-all duration-500">
                <IoMdExit />
              </div>
              <span className="text-sm font-medium">خروج</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Tablet/Desktop Sidebar
  // Tablet/Desktop Sidebar
  // Tablet/Desktop Sidebar
  const DesktopSidebar = () => (
    <div className={`h-screen sticky top-0 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-800 
    text-white transition-all duration-500 ease-in-out overflow-y-auto overflow-x-hidden
    ${collapsed ? 'w-20' : 'w-64'} shadow-2xl shadow-black/50 hidden md:block`}
      dir="rtl">

      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />
        <div className={`relative p-4 transition-all duration-500 ease-in-out ${collapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center transition-all duration-500 ease-in-out ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative group flex-shrink-0 transition-all duration-500 ease-in-out">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-50 
                group-hover:opacity-75 transition-opacity duration-300" />
              <img
                src={MadreseManLogo}
                className={`relative object-contain transition-all duration-500 ease-in-out 
                  group-hover:scale-110 ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
                alt="MadreseMan"
              />
            </div>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out 
              ${collapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible'}`}>
              <h2 className="text-xl font-bold bg-gradient-to-l from-cyan-300 to-blue-300 
                bg-clip-text text-transparent whitespace-nowrap" style={{ fontFamily: "sgkara" }}>
                مدرسه من
              </h2>
              {isStLoggedIn && studentData?.name && (
                <p className="text-xs text-gray-400 mt-1 truncate transition-all duration-500">
                  {studentData.name} {studentData.lastname}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Info for Students - Expanded State */}
      {isStLoggedIn && studentData?.name && (
        <div className={`mx-4 mt-2 transition-all duration-500 ease-in-out
          ${!collapsed
            ? 'opacity-100 visible h-auto p-3 mb-2 bg-gradient-to-l from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-800/50 backdrop-blur-sm'
            : 'opacity-0 invisible h-0 p-0 mb-0 overflow-hidden'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex-shrink-0">
              <FaUserGraduate className="text-white text-lg" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-400">خوش آمدید</p>
              <p className="text-sm font-bold text-white truncate">
                {studentData.name} {studentData.lastname}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick User Info for Collapsed State */}
      {isStLoggedIn && studentData?.name && (
        <div className={`mx-2 mt-4 transition-all duration-500 ease-in-out
          ${collapsed
            ? 'opacity-100 visible h-auto p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl text-center'
            : 'opacity-0 invisible h-0 p-0 overflow-hidden'}`}>
          <FaUserGraduate className="text-white text-xl mx-auto transition-transform duration-500" />
          <p className="text-[0.6rem] text-white mt-1 font-bold transition-all duration-500">
            {studentData.name?.charAt(0)}
          </p>
        </div>
      )}

      {/* Full Width Collapse Button - Under Logo/Name, Above Divider */}
      <div className="px-4 mt-2 mb-2 transition-all duration-500 ease-in-out">
        <button
          onClick={toggleCollapse}
          className={`w-full flex items-center justify-center gap-2 p-2.5 text-gray-300 
            bg-gradient-to-r from-cyan-900/30 to-blue-900/30
            hover:bg-gradient-to-l hover:from-cyan-600 hover:to-blue-600 
            rounded-xl transition-all duration-500 ease-in-out group border border-cyan-800/50
            hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]
            ${collapsed ? 'flex-col py-3' : 'flex-row'}`}
        >
          <div className={`text-gray-400 group-hover:text-white transition-all duration-500 ease-in-out
            ${collapsed ? 'rotate-0' : 'rotate-0'} 
            group-hover:rotate-12`}>
            {collapsed ? <MdMenu size={20} /> : <MdClose size={20} />}
          </div>
          <span className={`text-sm font-medium text-gray-300 group-hover:text-white 
            transition-all duration-500 ease-in-out
            ${collapsed ? 'text-[0.6rem] mt-1' : 'text-sm'}`}>
            {collapsed ? 'باز' : 'بستن منو'}
          </span>
        </button>
      </div>

      {/* Divider - Now below the collapse button */}
      <div className={`my-2 mx-4 transition-all duration-500 ease-in-out
        ${collapsed ? 'opacity-50' : 'opacity-100'}`}>
        <div className="h-px bg-gradient-to-l from-cyan-500/50 via-blue-500/50 to-transparent" />
      </div>

      {/* Navigation */}
      <div className="px-2 space-y-1 transition-all duration-500 ease-in-out">
        {!isStLoggedIn
          ? adminNavItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))
          : studentNavItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))
        }
      </div>

      {/* Footer with Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 to-transparent 
        transition-all duration-500 ease-in-out">
        <div className="mx-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2.5 text-gray-300 
              hover:bg-gradient-to-l hover:from-red-900/50 hover:to-red-800/50 
              rounded-xl transition-all duration-500 ease-in-out group relative overflow-hidden
              hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-red-500/20 to-transparent 
              translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
            <div className={`relative flex items-center transition-all duration-500 ease-in-out 
              ${collapsed ? '' : 'gap-3'}`}>
              <div className="text-xl text-gray-400 group-hover:text-red-400 
                group-hover:rotate-180 transition-all duration-700 ease-in-out">
                <IoMdExit />
              </div>
              <span className={`text-sm font-medium transition-all duration-500 ease-in-out
                ${collapsed
                  ? 'opacity-0 w-0 invisible absolute'
                  : 'opacity-100 w-auto visible relative'}`}>
                خروج
              </span>
            </div>
          </button>
        </div>

        {/* Version Info */}
        <div className={`mt-4 text-center transition-all duration-500 ease-in-out
          ${collapsed
            ? 'opacity-0 h-0 invisible'
            : 'opacity-100 h-auto visible'}`}>
          <p className="text-[0.6rem] text-gray-600">نسخه ۲.۰.۰</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      {isMobile && (
        <>
          <MobileBottomNav />
          <MobileMenuOverlay />
        </>
      )}
    </>
  );
}