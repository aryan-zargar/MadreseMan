import React, { useEffect, useState } from 'react'
import Logo from '../assets/MadreseManLogo.png'
import Swal from 'sweetalert2'
import axios from 'axios'
import { FiUser, FiLock, FiLogIn, FiMail } from 'react-icons/fi'
import { BiShield } from 'react-icons/bi'
import { MdSchool } from 'react-icons/md'
import { ArcaptchaWidget } from "arcaptcha-react";

export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isHovered, setIsHovered] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const [ArRef, setArRef] = useState(React.createRef())
    const [CaptchaApproved, setCaptchaApproval] = useState(false)
    console.log(username)
    console.log(password)

    function Submit() {
        if (username != "" && password != "") {
            if (CaptchaApproved == true) {
                axios.post(`http://localhost:5217/api/v1/auth/login?username=${username}&password=${password}`, {}).then((res) => {
                    window.location.pathname = `/emailConfirmation/${res.data.email}`
                }).catch(
                    (res) => {
                        Swal.fire({
                            title: "خطا",
                            text: (res.response.data.error),
                            icon: "error",
                            draggable: true,
                            confirmButtonColor: "#2563eb",
                            background: "#1e1e2f",
                            color: "#fff",
                            backdrop: "rgba(0,0,0,0.7)"
                        });
                    }
                )
            }
            else {
                Swal.fire({
                    title: "خطا",
                    text: "لطفا کپچا را کامل کنید",
                    icon: "error",
                    draggable: true,
                    confirmButtonColor: "#2563eb",
                    background: "#1e1e2f",
                    color: "#fff",
                    backdrop: "rgba(0,0,0,0.7)"
                });
            }
        }
        else {
            Swal.fire({
                title: "خطا",
                text: "لطفا همه فیلد ها را پر کنید",
                icon: "error",
                draggable: true,
                confirmButtonColor: "#2563eb",
                background: "#1e1e2f",
                color: "#fff",
                backdrop: "rgba(0,0,0,0.7)"
            });
        }
    }
    function getToken() {
        setCaptchaApproval(true)
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            Submit()
        }
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 relative overflow-hidden' dir='rtl'>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                <div className="absolute bottom-40 right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
            </div>

            {/* Main Container */}
            <div className='relative w-full max-w-6xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
                <div className='flex flex-col lg:flex-row'>

                    {/* Right Side - Brand Section (Order changes for RTL) */}
                    <div className='w-full lg:w-2/5 bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-700 p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden order-2 lg:order-1'>

                        {/* Animated shapes */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full filter blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-300 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
                        </div>

                        {/* Floating icons */}
                        <div className="absolute top-10 right-10 text-white/20">
                            <MdSchool size={60} className="animate-float" />
                        </div>
                        <div className="absolute bottom-10 left-10 text-white/20">
                            <BiShield size={50} className="animate-float animation-delay-2000" />
                        </div>

                        {/* Logo and Brand */}
                        <div className='relative z-10 text-center transform hover:scale-105 transition-transform duration-500'>
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <img
                                    src={Logo}
                                    className='w-32 h-32 lg:w-40 lg:h-40 object-contain relative'
                                    alt="MadreseMan"
                                />
                            </div>
                            <div style={{ fontFamily: "sgkara" }} className='mt-6'>
                                <p className='text-white text-3xl lg:text-4xl font-bold drop-shadow-lg'>
                                    مدرسه من
                                </p>
                                <p className='text-white/80 text-sm lg:text-base mt-2'>
                                    سامانه یکپارچه مدیریت مدارس
                                </p>
                            </div>
                            <div className="mt-8 flex gap-2 justify-center">
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-200"></div>
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-400"></div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="relative z-10 mt-12 hidden lg:block w-full">
                            <div className="flex items-center gap-3 text-white/90 mb-4">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <span className="text-sm">مدیریت هوشمند دانش‌آموزان</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90 mb-4">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <span className="text-sm">گزارشات لحظه‌ای و دقیق</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <span className="text-sm">پشتیبانی ۲۴ ساعته</span>
                            </div>
                        </div>
                    </div>

                    {/* Left Side - Login Form (Order changes for RTL) */}
                    <div className='w-full lg:w-3/5 bg-white backdrop-blur-xl p-8 lg:p-12 order-1 lg:order-2'>
                        <div className='max-w-md mx-auto'>

                            {/* Header */}
                            <div className='text-center mb-10'>

                                <h1 className='text-3xl lg:text-4xl font-bold text-gray-800 mb-2'>
                                    خوش آمدید!
                                </h1>
                                <p className='text-gray-500 text-sm lg:text-base'>
                                    لطفا برای ورود به سامانه اطلاعات خود را وارد کنید
                                </p>
                            </div>

                            {/* Form */}
                            <form className='space-y-6' onKeyPress={handleKeyPress}>

                                {/* Username Field */}
                                <div className='space-y-2'>
                                    <label className="block text-sm font-medium text-gray-700 mr-1">
                                        نام کاربری
                                    </label>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'username' ? 'transform scale-[1.02]' : ''}`}>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FiUser className={`text-lg transition-colors duration-300 ${focusedField === 'username' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pr-10 pl-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 placeholder-gray-400"
                                            placeholder="نام کاربری خود را وارد کنید"
                                            required
                                        />
                                        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-500 ${focusedField === 'username' ? 'w-full' : 'w-0'}`}></div>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className='space-y-2'>
                                    <label className="block text-sm font-medium text-gray-700 mr-1">
                                        گذرواژه
                                    </label>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FiLock className={`text-lg transition-colors duration-300 ${focusedField === 'password' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pr-10 pl-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 placeholder-gray-400"
                                            placeholder="گذرواژه خود را وارد کنید"
                                            required
                                        />
                                        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-500 ${focusedField === 'password' ? 'w-full' : 'w-0'}`}></div>
                                    </div>
                                </div>
                                <div className='space-y-2 flex justify-center items-center'>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                                        <ArcaptchaWidget
                                            ref={ArRef}
                                            site-key="k1cuucaatn"
                                            callback={getToken}
                                            className="w-full"
                                            theme="light"
                                            lang="fa"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Forgot Password */}
                                {/* <div className='flex justify-end'>
                                    <a href="#" className='text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-300 hover:underline'>
                                        گذرواژه خود را فراموش کرده‌اید؟
                                    </a>
                                </div> */}

                                {/* Submit Button */}
                                <div className='pt-4'>
                                    <button
                                        type="button"
                                        onClick={Submit}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                        className="relative w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                        <span className="relative flex items-center justify-center gap-2">
                                            <FiLogIn className={`text-lg transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                                            ورود به سامانه
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 15s infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animation-delay-200 {
                    animation-delay: 200ms;
                }
                .animation-delay-400 {
                    animation-delay: 400ms;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-6000 {
                    animation-delay: 6s;
                }
            `}</style>
        </div>
    )
}