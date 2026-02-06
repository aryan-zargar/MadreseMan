import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import Logo from '../assets/MadreseManLogo.png'
import { useParams, useHistory } from 'react-router-dom'
import axios from 'axios'

export default function SReportCard() {
    const [mailSent, setMailSent] = useState(false)
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const { usermail } = useParams()
    const history = useHistory()

    // Sample report card data - you can replace with your actual data
    const [reportData, setReportData] = useState({
        studentName: "علی محمدی",
        studentId: "980123456",
        grade: "دهم",
        field: "ریاضی فیزیک",
        schoolYear: "1403-1404",
        term: "اول",
        gpa: 18.75,
        status: "قبول",
        courses: [
            { id: 1, name: "ریاضی", score: 19, grade: "A+", credit: 4, teacher: "دکتر احمدی" },
            { id: 2, name: "فیزیک", score: 18, grade: "A", credit: 3, teacher: "دکتر رضایی" },
            { id: 3, name: "شیمی", score: 17.5, grade: "B+", credit: 3, teacher: "خانم محمدی" },
            { id: 4, name: "ادبیات فارسی", score: 16, grade: "B", credit: 2, teacher: "استاد حسینی" },
            { id: 5, name: "زبان انگلیسی", score: 19.5, grade: "A+", credit: 2, teacher: "خانم کریمی" },
            { id: 6, name: "دینی", score: 18.25, grade: "A", credit: 2, teacher: "آقای محمودی" },
            { id: 7, name: "ورزش", score: 20, grade: "A+", credit: 1, teacher: "آقای علیزاده" },
            { id: 8, name: "هنر", score: 17, grade: "B", credit: 1, teacher: "خانم امیری" },
        ],
        attendance: {
            totalDays: 90,
            present: 85,
            absent: 5,
            late: 3
        },
        behavior: [
            { aspect: "نظم و انضباط", score: "عالی" },
            { aspect: "مشارکت در کلاس", score: "خوب" },
            { aspect: "تکالیف", score: "عالی" },
            { aspect: "همکاری با دیگران", score: "خوب" },
        ],
        teacherComments: "علی دانش آموز کوشا و با استعدادی است. در دروس ریاضی و فیزیک عملکرد درخشان داشته و پیشرفت قابل توجهی نشان داده است. پیشنهاد می‌شود در دروس علوم انسانی بیشتر تمرکز کند."
    })

    const SendConfirmationEmail = async () => {
        if (!mailSent && usermail) {
            try {
                await axios.get(`http://localhost:5217/api/v1/auth/sendEmail?email=${usermail}`)
                setMailSent(true)
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "خطا",
                    text: "ارسال ایمیل با مشکل مواجه شد. لطفا مجددا تلاش کنید."
                })
            }
        }
    }

    useEffect(() => {
        SendConfirmationEmail()
    }, [mailSent, usermail])

    const Submit = async () => {
        if (!code || code.trim() === "") {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "لطفا کد تایید را وارد کنید"
            })
            return
        }

        setLoading(true)
        
        try {
            const response = await axios.get(
                `http://localhost:5217/api/v1/auth/ConfirmUser?code=${code}&email=${usermail}`
            )
            
            if (response.data) {
                window.localStorage.setItem("token", response.data)
                Swal.fire({
                    icon: "success",
                    title: "موفقیت آمیز",
                    text: "احراز هویت با موفقیت انجام شد",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    history.push("/")
                })
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "خطا در احراز هویت"
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: errorMessage
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResendCode = async () => {
        setLoading(true)
        try {
            await axios.get(`http://localhost:5217/api/v1/auth/sendEmail?email=${usermail}`)
            Swal.fire({
                icon: "success",
                title: "ارسال شد",
                text: "کد جدید به ایمیل شما ارسال گردید",
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "ارسال ایمیل با مشکل مواجه شد"
            })
        } finally {
            setLoading(false)
        }
    }

    // Helper function to get grade color
    const getGradeColor = (score) => {
        if (score >= 19) return 'text-green-600 bg-green-50 border-green-200'
        if (score >= 17) return 'text-blue-600 bg-blue-50 border-blue-200'
        if (score >= 15) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6'>
            {/* Header */}
            <div className='max-w-7xl mx-auto'>
                <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-white p-3 rounded-2xl shadow-lg'>
                            <img 
                                src={Logo} 
                                alt="MadreseMan Logo" 
                                className='w-16 h-16 lg:w-20 lg:h-20'
                            />
                        </div>
                        <div>
                            <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>
                                کارنامه تحصیلی
                            </h1>
                            <p className='text-gray-600 mt-1'>سامانه هوشمند مدرسه من</p>
                        </div>
                    </div>
                    
                    <div className='bg-white rounded-2xl shadow-lg p-4 lg:p-6'>
                        <div className='flex items-center gap-4'>
                            <div className='text-right'>
                                <h2 className='text-lg font-semibold text-gray-800'>{reportData.studentName}</h2>
                                <p className='text-gray-600 text-sm'>{reportData.grade} - {reportData.field}</p>
                                <p className='text-gray-500 text-xs'>شماره دانش آموزی: {reportData.studentId}</p>
                            </div>
                            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl'>
                                {reportData.gpa.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Left Column - Email Verification (1/3 width) */}
                    <div className='lg:col-span-1'>
                        <div className='bg-white rounded-2xl shadow-xl p-6 sticky top-6'>
                            <div className='text-center mb-6'>
                                <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <h3 className='text-xl font-bold text-gray-800'>تایید هویت</h3>
                                <p className='text-gray-600 mt-2'>برای مشاهده کامل کارنامه، لطفا کد تایید را وارد کنید</p>
                            </div>

                            <div className='bg-blue-50 rounded-xl p-4 mb-6'>
                                <p className='text-sm text-gray-600 mb-2'>ایمیل شما:</p>
                                <p className='text-blue-700 font-medium truncate text-center' dir='ltr'>
                                    {usermail}
                                </p>
                            </div>

                            <div className='mb-6' dir='rtl'>
                                <label className='block mb-2 font-medium text-gray-700'>کد تایید</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className='w-full p-4 text-center border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-lg'
                                    placeholder="••••••"
                                    maxLength="6"
                                    dir='ltr'
                                    disabled={loading}
                                />
                            </div>

                            <button
                                onClick={Submit}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98]'} text-white flex items-center justify-center`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 ml-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        در حال بررسی...
                                    </>
                                ) : 'تایید و مشاهده'}
                            </button>

                            <div className='mt-4 text-center'>
                                <button
                                    onClick={handleResendCode}
                                    disabled={loading}
                                    className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 disabled:text-gray-400 text-sm'
                                >
                                    ارسال مجدد کد
                                </button>
                            </div>

                            <div className='mt-6 pt-6 border-t border-gray-200'>
                                <div className='flex items-center justify-between text-sm text-gray-600'>
                                    <span>سال تحصیلی:</span>
                                    <span className='font-medium'>{reportData.schoolYear}</span>
                                </div>
                                <div className='flex items-center justify-between text-sm text-gray-600 mt-2'>
                                    <span>نیمسال:</span>
                                    <span className='font-medium'>{reportData.term}</span>
                                </div>
                                <div className='flex items-center justify-between text-sm text-gray-600 mt-2'>
                                    <span>وضعیت:</span>
                                    <span className={`font-medium ${reportData.status === 'قبول' ? 'text-green-600' : 'text-red-600'}`}>
                                        {reportData.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Columns - Report Card (2/3 width) */}
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Grades Summary */}
                        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                            <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white'>
                                <h3 className='text-xl font-bold'>نمرات دروس</h3>
                                <p className='text-blue-100 opacity-90 mt-1'>میانگین کل: {reportData.gpa.toFixed(2)}</p>
                            </div>
                            <div className='p-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                                    {reportData.courses.map((course) => (
                                        <div 
                                            key={course.id} 
                                            className={`border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${getGradeColor(course.score)}`}
                                        >
                                            <div className='flex justify-between items-start mb-3'>
                                                <span className='text-lg font-bold'>{course.score.toFixed(1)}</span>
                                                <span className='text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded'>
                                                    {course.grade}
                                                </span>
                                            </div>
                                            <h4 className='font-semibold text-gray-800 mb-1'>{course.name}</h4>
                                            <div className='flex justify-between items-center text-sm text-gray-600 mt-3'>
                                                <span>{course.teacher}</span>
                                                <span className='bg-gray-100 px-2 py-1 rounded'>{course.credit} واحد</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            {/* GPA Card */}
                            <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-green-100 opacity-90'>میانگین کل</p>
                                        <h3 className='text-3xl font-bold mt-2'>{reportData.gpa.toFixed(2)}</h3>
                                    </div>
                                    <div className='w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center'>
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className='mt-4 pt-4 border-t border-green-400 border-opacity-30'>
                                    <div className='flex justify-between text-sm'>
                                        <span>بالاترین نمره</span>
                                        <span className='font-bold'>20</span>
                                    </div>
                                    <div className='flex justify-between text-sm mt-1'>
                                        <span>پایین‌ترین نمره</span>
                                        <span className='font-bold'>16</span>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Card */}
                            <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-purple-100 opacity-90'>حضور و غیاب</p>
                                        <h3 className='text-3xl font-bold mt-2'>{reportData.attendance.present}</h3>
                                        <p className='text-sm mt-1'>روز از {reportData.attendance.totalDays} روز</p>
                                    </div>
                                    <div className='w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center'>
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className='mt-4 space-y-2'>
                                    <div className='flex justify-between text-sm'>
                                        <span>تاخیر</span>
                                        <span className='font-bold'>{reportData.attendance.late} روز</span>
                                    </div>
                                    <div className='flex justify-between text-sm'>
                                        <span>غیبت</span>
                                        <span className='font-bold'>{reportData.attendance.absent} روز</span>
                                    </div>
                                </div>
                            </div>

                            {/* Behavior Card */}
                            <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-orange-100 opacity-90'>رفتار و اخلاق</p>
                                        <h3 className='text-2xl font-bold mt-2'>مطلوب</h3>
                                    </div>
                                    <div className='w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center'>
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className='mt-4'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-sm'>نظم و انضباط</span>
                                        <span className='font-bold text-green-200'>عالی</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm'>مشارکت کلاسی</span>
                                        <span className='font-bold text-green-200'>خوب</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Teacher Comments */}
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <div className='flex items-center gap-3 mb-4'>
                                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                    </svg>
                                </div>
                                <h3 className='text-xl font-bold text-gray-800'>نظر دبیران</h3>
                            </div>
                            <div className='bg-gray-50 rounded-xl p-6 border-2 border-gray-200'>
                                <p className='text-gray-700 leading-relaxed' dir='rtl'>
                                    {reportData.teacherComments}
                                </p>
                            </div>
                            <div className='mt-4 flex justify-end'>
                                <div className='text-right'>
                                    <p className='font-medium text-gray-800'>مشاور تحصیلی</p>
                                    <p className='text-gray-600 text-sm'>خانم دکتر رضایی</p>
                                </div>
                            </div>
                        </div>

                        {/* Download & Print Section */}
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                                <div>
                                    <h3 className='text-lg font-bold text-gray-800'>کارنامه تحصیلی</h3>
                                    <p className='text-gray-600 text-sm'>نسخه دیجیتال - سال تحصیلی {reportData.schoolYear}</p>
                                </div>
                                <div className='flex gap-3'>
                                    <button className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-300 flex items-center gap-2'>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                        </svg>
                                        دانلود PDF
                                    </button>
                                    <button className='px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2'>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                        </svg>
                                        پرینت
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='mt-8 text-center text-gray-500 text-sm'>
                    <p>سامانه مدرسه من - کلیه حقوق محفوظ است © ۱۴۰۳</p>
                    <p className='mt-1'>این کارنامه به صورت رسمی صادر شده و دارای اعتبار می‌باشد</p>
                </div>
            </div>
        </div>
    )
}