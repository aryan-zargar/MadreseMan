import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import Logo from '../assets/MadreseManLogo.png'
import { useParams, useHistory } from 'react-router-dom'
import axios from 'axios'

export default function ScoreEntrySystem() {
    const [mailSent, setMailSent] = useState(false)
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const { usermail } = useParams()
    const history = useHistory()

    // State for score entry system
    const [selectedClass, setSelectedClass] = useState("")
    const [selectedSubject, setSelectedSubject] = useState("")
    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState([])
    const [subjects, setSubjects] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [semester, setSemester] = useState("first")
    const [examType, setExamType] = useState("midterm")
    const [activeTab, setActiveTab] = useState("entry") // 'entry' or 'view'

    // Mock data - replace with API calls
    const mockClasses = [
        { id: 1, name: "کلاس ۱۰۱", grade: "دهم", field: "ریاضی فیزیک", teacher: "دکتر احمدی", studentCount: 30 },
        { id: 2, name: "کلاس ۱۰۲", grade: "دهم", field: "علوم تجربی", teacher: "خانم محمدی", studentCount: 28 },
        { id: 3, name: "کلاس ۹۰۱", grade: "نهم", field: "متوسطه اول", teacher: "آقای رضایی", studentCount: 32 },
    ]

    const mockSubjects = [
        { id: 1, name: "ریاضی", code: "MATH101" },
        { id: 2, name: "فیزیک", code: "PHYS101" },
        { id: 3, name: "شیمی", code: "CHEM101" },
        { id: 4, name: "ادبیات فارسی", code: "PERS101" },
        { id: 5, name: "زبان انگلیسی", code: "ENG101" },
        { id: 6, name: "دینی", code: "REL101" },
    ]

    const mockStudents = [
        { id: 1, studentId: "9801001", name: "علی محمدی", scores: { midterm: null, final: null } },
        { id: 2, studentId: "9801002", name: "سارا احمدی", scores: { midterm: 18.5, final: null } },
        { id: 3, studentId: "9801003", name: "محمد حسینی", scores: { midterm: 16, final: null } },
        { id: 4, studentId: "9801004", name: "فاطمه کریمی", scores: { midterm: 19.25, final: null } },
        { id: 5, studentId: "9801005", name: "رضا محمودی", scores: { midterm: 15.5, final: null } },
        { id: 6, studentId: "9801006", name: "زهرا رضایی", scores: { midterm: 17.75, final: null } },
        { id: 7, studentId: "9801007", name: "امیر جعفری", scores: { midterm: 14, final: null } },
        { id: 8, studentId: "9801008", name: "نازنین امیری", scores: { midterm: 20, final: null } },
    ]

    // Initialize with mock data
    useEffect(() => {
        setClasses(mockClasses)
        setSubjects(mockSubjects)
        setStudents(mockStudents)
        if (mockClasses.length > 0) {
            setSelectedClass(mockClasses[0].id)
        }
        if (mockSubjects.length > 0) {
            setSelectedSubject(mockSubjects[0].id)
        }
    }, [])

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

    // Handle score change
    const handleScoreChange = (studentId, score) => {
        const updatedStudents = students.map(student => {
            if (student.id === studentId) {
                return {
                    ...student,
                    scores: {
                        ...student.scores,
                        [examType]: score ? parseFloat(score) : null
                    }
                }
            }
            return student
        })
        setStudents(updatedStudents)
    }

    // Save scores
    const handleSaveScores = async () => {
        setIsSaving(true)
        try {
            // Filter students with updated scores
            const scoresToSave = students
                .filter(student => student.scores[examType] !== null)
                .map(student => ({
                    studentId: student.studentId,
                    classId: selectedClass,
                    subjectId: selectedSubject,
                    semester: semester,
                    examType: examType,
                    score: student.scores[examType]
                }))

            // TODO: Replace with actual API call
            console.log('Saving scores:', scoresToSave)
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            Swal.fire({
                icon: "success",
                title: "ذخیره شد",
                text: `نمرات ${scoresToSave.length} دانش آموز با موفقیت ذخیره شد`,
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "ذخیره نمرات با مشکل مواجه شد"
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Get selected class info
    const selectedClassInfo = classes.find(c => c.id == selectedClass)
    const selectedSubjectInfo = subjects.find(s => s.id == selectedSubject)

    // Calculate statistics
    const calculateStats = () => {
        const validScores = students
            .map(s => s.scores[examType])
            .filter(score => score !== null && score !== undefined)
        
        if (validScores.length === 0) return null
        
        const sum = validScores.reduce((a, b) => a + b, 0)
        const average = sum / validScores.length
        const max = Math.max(...validScores)
        const min = Math.min(...validScores)
        
        return { average, max, min, count: validScores.length }
    }

    const stats = calculateStats()

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='bg-white rounded-2xl shadow-xl p-6 mb-6'>
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-blue-100 p-3 rounded-2xl'>
                                <img 
                                    src={Logo} 
                                    alt="MadreseMan Logo" 
                                    className='w-16 h-16'
                                />
                            </div>
                            <div>
                                <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>
                                    سیستم ثبت نمرات
                                </h1>
                                <p className='text-gray-600 mt-1'>مناسب برای مدیران و دبیران</p>
                            </div>
                        </div>
                        
                        <div className='flex gap-4'>
                            <div className='text-right'>
                                <p className='text-sm text-gray-600'>کاربر: مدیر سیستم</p>
                                <p className='font-medium text-gray-800'>دسترسی سطح ۳ (ثبت نمرات)</p>
                            </div>
                            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold'>
                                ام
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    {/* Left Column - Authentication & Filters (1/4 width) */}
                    <div className='lg:col-span-1 space-y-6'>                        
                        {/* Filters Card */}
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>فیلترها و تنظیمات</h3>
                            
                            <div className='space-y-4'>
                                <div>
                                    <label className='block mb-2 text-sm font-medium text-gray-700'>انتخاب کلاس</label>
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none'
                                    >
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name} - {cls.grade} ({cls.field}) - {cls.studentCount} دانش آموز
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className='block mb-2 text-sm font-medium text-gray-700'>انتخاب درس</label>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none'
                                    >
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name} ({subject.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                        <label className='block mb-2 text-sm font-medium text-gray-700'>نیمسال</label>
                                        <select
                                            value={semester}
                                            onChange={(e) => setSemester(e.target.value)}
                                            className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none'
                                        >
                                            <option value="first">نیمسال اول</option>
                                            <option value="second">نیمسال دوم</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className='block mb-2 text-sm font-medium text-gray-700'>نوع آزمون</label>
                                        <select
                                            value={examType}
                                            onChange={(e) => setExamType(e.target.value)}
                                            className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none'
                                        >
                                            <option value="midterm">میان ترم</option>
                                            <option value="final">پایان ترم</option>
                                            <option value="quiz">کوئیز</option>
                                            <option value="activity">فعالیت کلاسی</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className='flex border-b border-gray-200'>
                                    <button
                                        onClick={() => setActiveTab("entry")}
                                        className={`flex-1 py-3 text-center font-medium transition-colors duration-300 ${activeTab === "entry" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        ثبت نمرات
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("view")}
                                        className={`flex-1 py-3 text-center font-medium transition-colors duration-300 ${activeTab === "view" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        مشاهده نمرات
                                    </button>
                                </div>

                                {/* Statistics */}
                                {stats && (
                                    <div className='bg-gray-50 rounded-lg p-4'>
                                        <h4 className='font-medium text-gray-800 mb-3'>آمار کلاسی</h4>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between text-sm'>
                                                <span className='text-gray-600'>میانگین کلاس:</span>
                                                <span className='font-bold text-blue-600'>{stats.average.toFixed(2)}</span>
                                            </div>
                                            <div className='flex justify-between text-sm'>
                                                <span className='text-gray-600'>بیشترین نمره:</span>
                                                <span className='font-bold text-green-600'>{stats.max.toFixed(1)}</span>
                                            </div>
                                            <div className='flex justify-between text-sm'>
                                                <span className='text-gray-600'>کمترین نمره:</span>
                                                <span className='font-bold text-red-600'>{stats.min.toFixed(1)}</span>
                                            </div>
                                            <div className='flex justify-between text-sm'>
                                                <span className='text-gray-600'>تعداد ثبت شده:</span>
                                                <span className='font-bold text-gray-800'>{stats.count} / {students.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Score Entry Table (3/4 width) */}
                    <div className='lg:col-span-3'>
                        {/* Class Info Header */}
                        <div className='bg-white rounded-2xl shadow-xl p-6 mb-6'>
                            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
                                <div>
                                    <h2 className='text-xl font-bold text-gray-800 mb-2'>
                                        {selectedClassInfo?.name} - {selectedSubjectInfo?.name}
                                    </h2>
                                    <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
                                        <div className='flex items-center gap-2'>
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                            </svg>
                                            <span>دانش آموز: {selectedClassInfo?.studentCount} نفر</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                            </svg>
                                            <span>درس: {selectedSubjectInfo?.name}</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            <span>آزمون: {examType === 'midterm' ? 'میان ترم' : examType === 'final' ? 'پایان ترم' : examType === 'quiz' ? 'کوئیز' : 'فعالیت کلاسی'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className='flex gap-3'>
                                    <button
                                        onClick={handleSaveScores}
                                        disabled={isSaving}
                                        className='px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors duration-300 flex items-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed'
                                    >
                                        {isSaving ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                </svg>
                                                در حال ذخیره...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                </svg>
                                                ذخیره نمرات
                                            </>
                                        )}
                                    </button>
                                    
                                    <button className='px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2'>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                        </svg>
                                        خروجی Excel
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Score Entry Table */}
                        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            <th className='p-4 text-right font-semibold text-gray-700'>ردیف</th>
                                            <th className='p-4 text-right font-semibold text-gray-700'>شماره دانش آموزی</th>
                                            <th className='p-4 text-right font-semibold text-gray-700'>نام و نام خانوادگی</th>
                                            <th className='p-4 text-right font-semibold text-gray-700'>نمره ({examType === 'midterm' ? 'میان ترم' : examType === 'final' ? 'پایان ترم' : examType === 'quiz' ? 'کوئیز' : 'فعالیت کلاسی'})</th>
                                            <th className='p-4 text-right font-semibold text-gray-700'>وضعیت</th>
                                            <th className='p-4 text-right font-semibold text-gray-700'>عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-200'>
                                        {students.map((student, index) => (
                                            <tr key={student.id} className='hover:bg-gray-50 transition-colors duration-200'>
                                                <td className='p-4 text-center text-gray-600 font-medium'>
                                                    {index + 1}
                                                </td>
                                                <td className='p-4 text-gray-800 font-medium'>
                                                    {student.studentId}
                                                </td>
                                                <td className='p-4 text-gray-800'>
                                                    {student.name}
                                                </td>
                                                <td className='p-4'>
                                                    <div className='relative'>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={20}
                                                            step={0.25}
                                                            value={student.scores[examType] || ''}
                                                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                            className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-center'
                                                            placeholder="0 - 20"
                                                            dir='ltr'
                                                        />
                                                        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                                                            نمره
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        student.scores[examType] === null || student.scores[examType] === undefined 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : student.scores[examType] >= 17 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : student.scores[examType] >= 14 
                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {student.scores[examType] === null || student.scores[examType] === undefined 
                                                            ? 'ثبت نشده' 
                                                            : student.scores[examType] >= 17 
                                                                ? 'عالی' 
                                                                : student.scores[examType] >= 14 
                                                                    ? 'قابل قبول' 
                                                                    : 'نیاز به تلاش'
                                                        }
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => handleScoreChange(student.id, null)}
                                                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300'
                                                            title="حذف نمره"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleScoreChange(student.id, 20)}
                                                            className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300'
                                                            title="نمره کامل"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer */}
                            <div className='bg-gray-50 p-4 border-t border-gray-200'>
                                <div className='flex flex-col lg:flex-row justify-between items-center gap-4'>
                                    <div className='text-sm text-gray-600'>
                                        <span className='font-medium'>{students.length}</span> دانش آموز در این کلاس
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 bg-green-100 rounded-full border-2 border-green-400'></div>
                                            <span className='text-sm text-gray-600'>عالی (۱۷-۲۰)</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 bg-blue-100 rounded-full border-2 border-blue-400'></div>
                                            <span className='text-sm text-gray-600'>قابل قبول (۱۴-۱۶.۷۵)</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 bg-red-100 rounded-full border-2 border-red-400'></div>
                                            <span className='text-sm text-gray-600'>نیاز به تلاش (زیر ۱۴)</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 bg-yellow-100 rounded-full border-2 border-yellow-400'></div>
                                            <span className='text-sm text-gray-600'>ثبت نشده</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <button
                                onClick={() => {
                                    const confirmed = window.confirm('آیا از ثبت نمره ۱۰ برای همه دانش آموزان اطمینان دارید؟')
                                    if (confirmed) {
                                        const updatedStudents = students.map(student => ({
                                            ...student,
                                            scores: { ...student.scores, [examType]: 10 }
                                        }))
                                        setStudents(updatedStudents)
                                    }
                                }}
                                className='p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-colors duration-300 text-center'
                            >
                                <div className='text-orange-600 font-medium'>ثبت نمره ۱۰ برای همه</div>
                                <div className='text-sm text-orange-500 mt-1'>برای غایبین و دانش آموزان خاص</div>
                            </button>
                            
                            <button
                                onClick={() => {
                                    const updatedStudents = students.map(student => ({
                                        ...student,
                                        scores: { ...student.scores, [examType]: null }
                                    }))
                                    setStudents(updatedStudents)
                                }}
                                className='p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors duration-300 text-center'
                            >
                                <div className='text-red-600 font-medium'>پاک کردن همه نمرات</div>
                                <div className='text-sm text-red-500 mt-1'>شروع مجدد ثبت نمرات</div>
                            </button>
                            
                            <button
                                onClick={() => {
                                    // Navigate to class report
                                    history.push(`/class-report/${selectedClass}`)
                                }}
                                className='p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors duration-300 text-center'
                            >
                                <div className='text-blue-600 font-medium'>مشاهده گزارش کلاسی</div>
                                <div className='text-sm text-blue-500 mt-1'>آمار و نمودارهای کلاس</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='mt-8 text-center text-gray-500 text-sm'>
                    <p>سیستم مدیریت نمرات مدرسه من - نسخه 1.1</p>
                    <p className='mt-1'>کلیه نمرات وارد شده در سیستم بایگانی می‌شوند و قابلیت ویرایش دارند</p>
                </div>
            </div>
        </div>
    )
}