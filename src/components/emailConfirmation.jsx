import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import Logo from '../assets/MadreseManLogo.png'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { FiMail, FiCheck, FiShield, FiCopy, FiArrowLeft } from 'react-icons/fi'
import { BiTime, BiLockAlt } from 'react-icons/bi'
import { MdMarkEmailRead, MdSchool } from 'react-icons/md'
import { IoMdRefresh } from 'react-icons/io'

export default function EmailConfirmation() {
    const [email, setEmail] = useState("")
    const [mailSent, setMailSent] = useState(false)
    const [code, setCode] = useState("")
    const [focusedField, setFocusedField] = useState(null)
    const [isResending, setIsResending] = useState(false)
    const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds

    const { usermail } = useParams()
    console.log(usermail)

    useEffect(() => {
        if (mailSent == false) {
            axios.get(`http://localhost:5217/api/v1/auth/sendEmail?email=${usermail}`)
            setMailSent(true)
            
            // Start countdown
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            
            return () => clearInterval(timer)
        }
    }, [mailSent, usermail])

    console.log(email)
    console.log(code)

    const handleResendCode = () => {
        if (timeLeft > 0) return
        
        setIsResending(true)
        axios.get(`http://localhost:5217/api/v1/auth/sendEmail?email=${usermail}`)
            .then(() => {
                setTimeLeft(120)
                setIsResending(false)
                Swal.fire({
                    icon: "success",
                    title: "ارسال مجدد",
                    text: "کد جدید با موفقیت ارسال شد",
                    confirmButtonColor: "#2563eb",
                    background: "#1e1e2f",
                    color: "#fff",
                    backdrop: "rgba(0,0,0,0.7)",
                    timer: 2000,
                    showConfirmButton: false
                })
            })
            .catch(() => {
                setIsResending(false)
            })
    }

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(usermail)
        Swal.fire({
            icon: "success",
            title: "کپی شد",
            text: "ایمیل با موفقیت کپی شد",
            confirmButtonColor: "#2563eb",
            background: "#1e1e2f",
            color: "#fff",
            timer: 1500,
            showConfirmButton: false
        })
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    function Submit() {
        if (usermail == usermail) {
            if (code != null && code != "") {
                axios.get(`http://localhost:5217/api/v1/auth/ConfirmUser?code=${code}&email=${usermail}`)
                    .then(
                        (res) => {
                            window.localStorage.setItem("token", res.data)
                            Swal.fire({
                                icon: "success",
                                title: "احراز هویت موفق",
                                text: "به سامانه خوش آمدید",
                                confirmButtonColor: "#2563eb",
                                background: "#1e1e2f",
                                color: "#fff",
                                timer: 2000,
                                showConfirmButton: false
                            }).then(() => {
                                window.location.pathname = "/"
                            })
                        }
                    )
                    .catch(
                        (res) => {
                            Swal.fire({
                                icon: "error",
                                title: "خطا",
                                text: (res.response.data.error),
                                confirmButtonColor: "#2563eb",
                                background: "#1e1e2f",
                                color: "#fff",
                                backdrop: "rgba(0,0,0,0.7)"
                            })
                        }
                    )
            }
            else {
                Swal.fire({
                    icon: "error",
                    title: "خطا",
                    text: "کد را وارد کنید",
                    confirmButtonColor: "#2563eb",
                    background: "#1e1e2f",
                    color: "#fff",
                    backdrop: "rgba(0,0,0,0.7)"
                })
            }
        }
        else {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "ایمیل اشتباه است",
                confirmButtonColor: "#2563eb",
                background: "#1e1e2f",
                color: "#fff",
                backdrop: "rgba(0,0,0,0.7)"
            })
        }
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
                    
                    {/* Right Side - Brand Section */}
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
                            <FiShield size={50} className="animate-float animation-delay-2000" />
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
                                    تأیید هویت دو مرحله‌ای
                                </p>
                            </div>
                            
                            {/* Security Badge */}
                            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <BiLockAlt className="text-white text-lg" />
                                <span className="text-white text-xs">احراز هویت امن</span>
                            </div>
                        </div>
                    </div>

                    {/* Left Side - Verification Form */}
                    <div className='w-full lg:w-3/5 bg-white/95 backdrop-blur-xl p-8 lg:p-12 order-1 lg:order-2'>
                        <div className='max-w-md mx-auto'>
                            
                            {/* Back Button */}
                            <button 
                                onClick={() => window.location.pathname = '/login'}
                                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors duration-300 mb-6 group"
                            >
                                <FiArrowLeft className="text-lg transform group-hover:-translate-x-1 transition-transform duration-300" />
                                <span className="text-sm">بازگشت به صفحه ورود</span>
                            </button>
                            
                            {/* Header */}
                            <div className='text-center mb-8'>
                                
                                <h1 className='text-3xl lg:text-4xl font-bold text-gray-800 mb-2'>
                                    احراز هویت
                                </h1>
                                <p className='text-gray-500 text-sm lg:text-base'>
                                    کد تأیید به ایمیل شما ارسال شد
                                </p>
                            </div>

                            {/* Email Display */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 mb-6 flex items-center justify-between group hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                                        <FiMail className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">ایمیل دریافت کننده</p>
                                        <p className="text-sm font-medium text-gray-800 dir-ltr text-left">{usermail}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleCopyEmail}
                                    className="p-2 hover:bg-white rounded-lg transition-all duration-300 group/copy"
                                    title="کپی ایمیل"
                                >
                                    <FiCopy className="text-gray-400 group-hover/copy:text-indigo-600 transition-colors duration-300" />
                                </button>
                            </div>

                            {/* Form */}
                            <form className='space-y-6' onKeyPress={handleKeyPress}>
                                
                                {/* Verification Code Field */}
                                <div className='space-y-2'>
                                    <label className="block text-sm font-medium text-gray-700 mr-1">
                                        کد احراز هویت
                                    </label>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'code' ? 'transform scale-[1.02]' : ''}`}>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FiShield className={`text-lg transition-colors duration-300 ${focusedField === 'code' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            type="text"
                                            id="code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            onFocus={() => setFocusedField('code')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pr-10 pl-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 placeholder-gray-400"
                                            placeholder="کد ۶ رقمی را وارد کنید"
                                            required
                                            maxLength="6"
                                            autoComplete="off"
                                        />
                                        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-500 ${focusedField === 'code' ? 'w-full' : 'w-0'}`}></div>
                                    </div>
                                </div>

                                {/* Resend Code Section */}
                                <div className='flex items-center justify-between'>
                                    <div className="flex items-center gap-2">
                                        <BiTime className={`text-lg ${timeLeft > 0 ? 'text-gray-400' : 'text-green-500'}`} />
                                        <span className={`text-sm ${timeLeft > 0 ? 'text-gray-500' : 'text-green-600'}`}>
                                            {timeLeft > 0 ? `ارسال مجدد پس از ${formatTime(timeLeft)}` : 'کد منقضی شد'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={timeLeft > 0 || isResending}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                                            ${timeLeft > 0 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 hover:from-indigo-100 hover:to-blue-100'
                                            }`}
                                    >
                                        <IoMdRefresh className={`text-lg ${isResending ? 'animate-spin' : ''}`} />
                                        <span className="text-xs font-medium">
                                            {isResending ? 'در حال ارسال...' : 'ارسال مجدد'}
                                        </span>
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <div className='pt-4'>
                                    <button
                                        type="button"
                                        onClick={Submit}
                                        className="relative w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                        <span className="relative flex items-center justify-center gap-2">
                                            <FiCheck className="text-lg" />
                                            تأیید و ورود
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