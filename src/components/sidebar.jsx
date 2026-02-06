import React, { useEffect, useState } from 'react'
import MadreseManLogo from '../assets/MadreseManLogo.png'
import { BiSolidDashboard } from 'react-icons/bi'
import { FaCashRegister, FaDoorOpen, FaFile, FaGear, FaMoneyBillTransfer, FaTableCellsColumnLock, FaTableList, FaUser, FaVault } from 'react-icons/fa6'
import { FaFileArchive, FaFileContract, FaTable, FaUserFriends } from 'react-icons/fa'
import { IoIosExit, IoMdExit } from "react-icons/io"
import { } from "react-icons/fi"
import { AiFillMoneyCollect, AiOutlineFullscreenExit } from "react-icons/ai"
import { } from "react-icons/lu"
import axios from 'axios'
export default function Sidebar() {
  const [isStLoggedIn, SetLoggedStatus] = useState(localStorage.stoken != undefined)
  const [studentData, SetStudentData] = useState({})
  function getStudentData() {
    if (isStLoggedIn == true) {
      axios.get(`http://localhost:5217/api/v1/auth/sessions/GetStudentBySessionId/${localStorage.getItem("stoken")}`)
        .then((res) => {
          SetStudentData(res.data)
        })

    }
  }
  useEffect(() => {
    getStudentData()
  }, [])
  return (
    <>
      {!isStLoggedIn ?
        <div className='col-span-1 h-screen sticky top-0 w-full bg-zinc-900 text-white ' dir='rtl'>
          <div className='h-fit flex me-[1vw]  '  >
            <img src={MadreseManLogo} className='size-[4.7vw] self-center' />
            <div className='flex justify-between w-full  items-center  ' >
              <h2 className='text-[1.2vw] font-bold text-cyan-100  ' style={{ fontFamily: "sgkara" }} >مدرسه من</h2>
              <span className='text-[1.5vw]   text-red-400 hover:cursor-pointer ' onClick={() => {
                localStorage.removeItem("token")
                location.pathname = "/"
              }} >
                <IoMdExit />
              </span>
            </div>
          </div>
          <div className='border border-cyan-600 mx-[1.5vw] ' ></div>
          {/* <div className='-mt-4 flex justify-center me-4 '>
        <h2 className='text-3xl font-bold text-[#90e0ef]' style={{ fontFamily: "sgkara" }} >مدرسه من</h2>
      </div> */}

          <div className='mt-8 mb-2'>
            <a href='/dashboard' className={`flex items-center gap-10 p-2.5 text-[#90e0ef]  rounded-xl mx-3 hover:bg-cyan-900 hover:text-white transition-all duration-300 hover:cursor-pointer ${window.location.pathname == "/dashboard" ? "text-cyan-500  " : "text-white"}`}  >
              <div className='text-[1.6vw]' >
                <BiSolidDashboard />
              </div>
              <div className='text-[1.2vw]' >
                <p>داشبورد</p>
              </div>
            </a>
          </div>
          <div className='my-[1vh]'>
            <a href='/baseinfo' className={`flex items-center gap-10 p-2.5 text-[#90e0ef]  rounded-xl mx-3 hover:bg-cyan-900 hover:border-0 hover:text-white transition-all duration-300 hover:cursor-pointer ${window.location.pathname == "/baseinfo" ? "text-cyan-500  " : "text-white"}`}  >
              <div className='text-[1.6vw]' >
                <FaGear />
              </div>
              <div className='text-[1.2vw]' >
                <p>اطلاعات پایه</p>
              </div>
            </a>
          </div>

          <div className='my-[1vh]'>
            <a href='/studentManagment' className={`flex items-center gap-10 p-2.5 text-[#90e0ef]  rounded-xl mx-3 hover:bg-cyan-900 hover:text-white transition-all duration-300 hover:cursor-pointer ${window.location.pathname == "/studentManagment" ? "text-cyan-500  " : "text-white"}`}  >
              <div className='text-[1.6vw]' >
                <FaUserFriends />
              </div>
              <div className='text-[1.2vw]' >
                <p>مدیریت دانش آموزان</p>
              </div>
            </a>
          </div>

          <div className='my-[1vh]'>
            <a href='/budget' className={`flex items-center gap-10 p-2.5 text-[#90e0ef]  rounded-xl mx-3 hover:bg-cyan-900 hover:text-white transition-all duration-300 hover:cursor-pointer ${window.location.pathname == "/budget" ? "text-cyan-500  " : "text-white"}`}  >
              <div className='text-[1.6vw]' >
                <FaCashRegister />
              </div>
              <div className='text-[1.2vw]' >
                <p>مدریت بودجه</p>
              </div>
            </a>
          </div>
          <div className='my-[1vh]'>
            <a href='/reportcard' className={`flex items-center gap-10 p-2.5 text-[#90e0ef]  rounded-xl mx-3 hover:bg-cyan-900 hover:text-white transition-all duration-300 hover:cursor-pointer ${window.location.pathname == "/reportcard" ? "text-cyan-500  " : "text-white"}`}  >
              <div className='text-[1.6vw]' >
                <FaTableList />
              </div>
              <div className='text-[1.1vw]' >
                <p>کارنامه ها</p>
              </div>
              
            </a>
          </div>
          <div className='my-[1vh]'>
            <a href='/tuition' className={`flex items-center gap-6 p-2.5 text-[#90e0ef]  rounded-xl mx-3 hover:bg-cyan-900 hover:text-white transition-all duration-300 hover:cursor-pointer ${window.location.pathname == "/tuition_payment" ? "text-cyan-500  " : "text-white"}`}  >
              <div className='text-[1.6vw]' >
                <FaMoneyBillTransfer />
              </div>
              <div className='text-[1.1vw]' >
                <p>مدیریت شهریه</p>
              </div>
              
            </a>
          </div>
        </div>
        :
        <div className='col-span-1 h-screen w-full bg-zinc-900 text-white ' dir='rtl'>
          <div className='h-fit flex  me-4 '  >
            <img src={MadreseManLogo} className='size-18 self-center' />
            <h2 className='text-xl font-bold text-cyan-100 self-center ' style={{ fontFamily: "sgkara" }} >مدرسه من</h2>
            <span className='text-[1.6vw] self-center ms-auto me-3 text-red-400 hover:cursor-pointer ' onClick={() => {
              localStorage.removeItem("stoken")
              location.pathname = "/"
            }} >
              <IoMdExit />
            </span>
          </div>
          <div className='mt-2 flex justify-center mb-4 me-6' > <p className='text-xl' >سلام {studentData.name + " " + studentData.lastname}!</p> </div>

          <div className='border border-cyan-600 me-4 ms-3 ' ></div>
          <div className='mt-8 mb-2'>
            <a href='/sdashboard' className={`flex items-center gap-10 p-2.5 text-[#90e0ef]  rounded-xl mx-3 hover:bg-cyan-900 hover:text-white transition-all duration-300 hover:cursor-pointer ${window.location.pathname == "/sdashboard" ? "text-cyan-500  " : "text-white"}`}  >
              <div className='text-2xl' >
                <BiSolidDashboard />
              </div>
              <div className='text-[1.2vw]' >
                <p>داشبورد</p>
              </div>
              <div className='text-[1.3vw]' >
                <span className='text-sm text-white py-2 px-2 rounded-xl bg-sky-500 ' >در حال توسعه</span>
              </div>
            </a>
          </div>

        </div>
      }
    </>
  )
}
