import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import Logo from '../assets/MadreseManLogo.png'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts'
import { LuGraduationCap } from 'react-icons/lu'

export default function StudentManagement() {
    const history = useHistory()

    // API Configuration
    const API_BASE_URL = 'http://localhost:5217/api/v1/Student'
    const token = localStorage.getItem('token') || ''
    const sessionParam = `?session=${token}`

    // Student Management State
    const [activeTab, setActiveTab] = useState("students")
    const [students, setStudents] = useState([])
    const [filteredStudents, setFilteredStudents] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedGrade, setSelectedGrade] = useState("all")
    const [selectedClass, setSelectedClass] = useState("all")
    const [isAddingStudent, setIsAddingStudent] = useState(false)
    const [isEditingStudent, setIsEditingStudent] = useState(false)
    const [currentStudentId, setCurrentStudentId] = useState(null)
    const [stats, setStats] = useState({
        total: 0,
        byGrade: {},
        byClass: {}
    })

    // Simple grade and class mappings
    const gradeMap = {
        1: { name: "پایه هفتم", classes: [1, 2, 3] },
        2: { name: "پایه هشتم", classes: [4, 5, 6] },
        3: { name: "پایه نهم", classes: [7, 8, 9] }
    }

    const classMap = {
        1: "کلاس ۷۰۱", 2: "کلاس ۷۰۲", 3: "کلاس ۷۰۳",
        4: "کلاس ۸۰۱", 5: "کلاس ۸۰۲", 6: "کلاس ۸۰۳",
        7: "کلاس ۹۰۱", 8: "کلاس ۹۰۲", 9: "کلاس ۹۰۳"
    }

    // New student form state - using defaultValue for uncontrolled inputs
    const formDefaults = {
        name: "",
        lastname: "",
        national_id: "",
        birth_date: new Date().toISOString().split('T')[0],
        grade_id: 1,
        class_id: 1
    }

    const [studentForm, setStudentForm] = useState({ ...formDefaults })
    const formRef = useRef(studentForm)
    useEffect(() => {
        formRef.current = studentForm
    }, [studentForm])
    // Fetch students from API
    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/GetAll${sessionParam}`)

            const mappedStudents = response.data.map(student => ({
                ...student,
                grade_name: gradeMap[student.grade_id]?.name || "نامشخص",
                class_name: classMap[student.class_id] || "نامشخص",
                birth_date_formatted: formatBirthDate(student.birth_date),
                age: calculateAge(student.birth_date)
            }))

            setStudents(mappedStudents)
            setFilteredStudents(mappedStudents)
            calculateStats(mappedStudents)
        } catch (error) {
            console.error('Error fetching students:', error)
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "خطا در دریافت اطلاعات دانش آموزان"
            })
        }
    }

    // Format date from API
    const formatBirthDate = (dateString) => {
        if (!dateString) return "نامشخص"
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return dateString
            return new Intl.DateTimeFormat('fa-IR').format(date)
        } catch {
            return dateString
        }
    }

    // Calculate age from birth date
    const calculateAge = (birthDate) => {
        if (!birthDate) return null
        try {
            const today = new Date()
            const birth = new Date(birthDate)
            if (isNaN(birth.getTime())) return null

            let age = today.getFullYear() - birth.getFullYear()
            const monthDiff = today.getMonth() - birth.getMonth()

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--
            }

            return age
        } catch {
            return null
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target

        if (name === 'grade_id') {
            const newGrade = Number(value)
            const firstClass = gradeMap[newGrade]?.classes[0] || 1

            // Immediate DOM update for class select
            const classSelect = e.target.form.querySelector('select[name="class_id"]')
            if (classSelect) {
                classSelect.value = firstClass
            }

            setStudentForm(prev => ({
                ...prev,
                [name]: value,
                class_id: firstClass
            }))
        } else {
            setStudentForm(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    // Handle delete student
    const handleDeleteStudent = async (studentId) => {
        const result = await Swal.fire({
            title: 'آیا مطمئن هستید؟',
            text: "این عمل قابل بازگشت نیست!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'بله، حذف کن',
            cancelButtonText: 'لغو'
        })

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/Delete/${studentId}${sessionParam}`)

                Swal.fire({
                    icon: "success",
                    title: "حذف شد",
                    text: "دانش آموز با موفقیت حذف شد",
                    timer: 2000,
                    showConfirmButton: false
                })

                fetchStudents()
            } catch (error) {
                console.error('Error deleting student:', error)
                Swal.fire({
                    icon: "error",
                    title: "خطا",
                    text: "خطا در حذف دانش آموز"
                })
            }
        }
    }

    // Handle edit student
    const handleEditStudent = (student) => {
        setStudentForm({
            name: student.name,
            lastname: student.lastname,
            national_id: student.national_id,
            birth_date: student.birth_date.split('T')[0],
            grade_id: student.grade_id,
            class_id: student.class_id
        })
        setCurrentStudentId(student.id)
        setIsEditingStudent(true)
        setIsAddingStudent(true)
    }

    // Reset form
    const resetForm = () => {
        setStudentForm({ ...formDefaults })
        setCurrentStudentId(null)
        setIsEditingStudent(false)
        setIsAddingStudent(false)
    }

    const handleSubmitStudent = async (e) => {
        e.preventDefault()

        // Basic required field check
        if (!studentForm.name || !studentForm.lastname || !studentForm.national_id || !studentForm.birth_date) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "لطفا تمام فیلدهای ضروری را پر کنید"
            })
            return
        }

        // National ID length check
        if (studentForm.national_id.length !== 10) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "کد ملی باید ۱۰ رقم باشد"
            })
            return
        }

        const isUpdate = isEditingStudent
        const url = isUpdate
            ? `${API_BASE_URL}/Update${sessionParam}`
            : `${API_BASE_URL}/Add${sessionParam}`

        const method = isUpdate ? 'put' : 'post'

        // Prepare data
        const apiData = {
            name: studentForm.name,
            lastname: studentForm.lastname,
            national_id: studentForm.national_id,
            birth_date: studentForm.birth_date,
            grade_id: Number(studentForm.grade_id),
            class_id: Number(studentForm.class_id),
            id: isUpdate ? currentStudentId : 0
        }

        try {
            await axios[method](url, apiData)

            Swal.fire({
                icon: "success",
                title: "موفقیت",
                text: isUpdate ? "دانش آموز با موفقیت ویرایش شد" : "دانش آموز با موفقیت اضافه شد",
                timer: 2000,
                showConfirmButton: false
            })

            resetForm()
            fetchStudents()

        } catch (error) {
            console.error('Error saving student:', error)
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: error.response?.data?.message || "خطا در ذخیره اطلاعات"
            })
        }
    }

    // Filter students
    useEffect(() => {
        let filtered = [...students]

        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.name?.includes(searchTerm) ||
                student.lastname?.includes(searchTerm) ||
                student.national_id?.includes(searchTerm)
            )
        }

        if (selectedGrade !== "all") {
            filtered = filtered.filter(student => student.grade_id.toString() === selectedGrade)
        }

        if (selectedClass !== "all") {
            filtered = filtered.filter(student => student.class_id.toString() === selectedClass)
        }

        setFilteredStudents(filtered)
    }, [searchTerm, selectedGrade, selectedClass, students])



    // Calculate statistics
    const calculateStats = (studentsData) => {
        const total = studentsData.length

        const byGrade = {}
        const byClass = {}

        studentsData.forEach(student => {
            const gradeName = gradeMap[student.grade_id]?.name || "نامشخص"
            byGrade[gradeName] = (byGrade[gradeName] || 0) + 1

            const className = classMap[student.class_id] || "نامشخص"
            byClass[className] = (byClass[className] || 0) + 1
        })

        setStats({
            total,
            byGrade,
            byClass
        })
    }

    // Initialize
    useEffect(() => {
        fetchStudents()
    }, [])

    // Chart data
    const gradeChartData = Object.entries(stats.byGrade).map(([name, value]) => ({
        name,
        value
    }))

    const classChartData = Object.entries(stats.byClass).map(([name, value]) => ({
        name,
        value
    }))

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1']

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6' dir='rtl'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='bg-white rounded-2xl shadow-xl p-6 mb-6'>
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-blue-100 py-4 rounded-2xl'>
                                <LuGraduationCap className='w-[4vw] h-[4vh]' />
                            </div>
                            <div>
                                <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>
                                    مدیریت دانش آموزان
                                </h1>
                                <p className='text-gray-600 mt-1'>مدرسه متوسطه اول - پایه‌های هفتم تا نهم</p>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            <div className='text-right'>
                                <p className='text-sm text-gray-600'>تعداد دانش آموزان</p>
                                <p className='text-2xl font-bold text-blue-600'>{stats.total}</p>
                            </div>
                            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold'>
                                د
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    {/* Left Column - Quick Stats */}
                    <div className='lg:col-span-1 space-y-6'>
                        {/* Quick Stats */}
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>آمار کلی</h3>

                            <div className='space-y-4'>
                                <div className='bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200'>
                                    <div className='flex justify-between items-center mb-2'>
                                        <span className='text-sm text-gray-600'>تعداد کل</span>
                                        <span className='text-xl font-bold text-blue-700'>{stats.total}</span>
                                    </div>
                                </div>

                                {/* Grade Distribution */}
                                <div className='bg-gray-50 rounded-xl p-4'>
                                    <h4 className='font-medium text-gray-800 mb-3'>توزیع بر اساس پایه</h4>
                                    <div className='space-y-2'>
                                        {Object.entries(stats.byGrade).map(([grade, count]) => (
                                            <div key={grade} className='flex items-center justify-between'>
                                                <span className='text-sm text-gray-600'>{grade}</span>
                                                <span className='text-sm font-medium text-blue-600'>{count} نفر</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Class Distribution */}
                                <div className='bg-gray-50 rounded-xl p-4'>
                                    <h4 className='font-medium text-gray-800 mb-3'>پر جمعیت‌ترین کلاس‌ها</h4>
                                    <div className='space-y-2'>
                                        {Object.entries(stats.byClass)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 3)
                                            .map(([className, count]) => (
                                                <div key={className} className='flex items-center justify-between'>
                                                    <span className='text-sm text-gray-600'>{className}</span>
                                                    <span className='text-sm font-medium text-green-600'>{count} نفر</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>عملیات سریع</h3>
                            <div className='space-y-3'>
                                <button
                                    onClick={() => {
                                        resetForm()
                                        setIsAddingStudent(true)
                                    }}
                                    className='w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2'
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    افزودن دانش آموز جدید
                                </button>
                                <button
                                    onClick={fetchStudents}
                                    className='w-full p-3 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2'
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    بروزرسانی اطلاعات
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className='lg:col-span-3'>
                        {/* Tabs Navigation */}
                        <div className='bg-white rounded-2xl shadow-xl mb-6'>
                            <div className='flex overflow-x-auto border-b border-gray-200'>
                                <button
                                    onClick={() => setActiveTab("students")}
                                    className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors duration-300 ${activeTab === "students" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    لیست دانش آموزان
                                </button>
                                <button
                                    onClick={() => setActiveTab("charts")}
                                    className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors duration-300 ${activeTab === "charts" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    نمودارها
                                </button>
                            </div>
                        </div>

                        {activeTab === "students" && (
                            <div className='space-y-6'>
                                {/* Add/Edit Student Form */}
                                {isAddingStudent && (
                                    <div className='bg-white rounded-2xl shadow-xl p-6'>
                                        <div className='flex justify-between items-center mb-6'>
                                            <h3 className='text-xl font-bold text-gray-800'>
                                                {isEditingStudent ? 'ویرایش دانش آموز' : 'افزودن دانش آموز جدید'}
                                            </h3>
                                            <button
                                                onClick={resetForm}
                                                className='text-gray-500 hover:text-gray-700'
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitStudent}>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                                {/* Name Field */}
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>نام *</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        defaultValue={studentForm.name}
                                                        onBlur={handleBlur}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                                        placeholder="نام دانش آموز"
                                                        required
                                                    />
                                                </div>

                                                {/* Lastname Field */}
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>نام خانوادگی *</label>
                                                    <input
                                                        type="text"
                                                        name="lastname"
                                                        defaultValue={studentForm.lastname}
                                                        onBlur={handleBlur}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                                        placeholder="نام خانوادگی"
                                                        required
                                                    />
                                                </div>

                                                {/* National ID Field */}
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>کد ملی *</label>
                                                    <input
                                                        type="text"
                                                        name="national_id"
                                                        defaultValue={studentForm.national_id}
                                                        onBlur={handleBlur}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                                        placeholder="کد ملی ۱۰ رقمی"
                                                        maxLength="10"
                                                        dir='ltr'
                                                        required
                                                    />
                                                </div>

                                                {/* Birth Date Field */}
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>تاریخ تولد *</label>
                                                    <input
                                                        type="date"
                                                        name="birth_date"
                                                        defaultValue={studentForm.birth_date}
                                                        onBlur={handleBlur}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                                        required
                                                    />
                                                </div>

                                                {/* Grade Field */}
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>پایه تحصیلی</label>
                                                    <select
                                                        name="grade_id"
                                                        defaultValue={studentForm.grade_id}
                                                        onBlur={handleBlur}
                                                        key={`grade_${studentForm.grade_id}`} // Force re-render on grade change
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                                    >
                                                        {Object.entries(gradeMap).map(([id, grade]) => (
                                                            <option key={id} value={id}>{grade.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Class Field */}
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>کلاس</label>
                                                    <select
                                                        name="class_id"
                                                        defaultValue={studentForm.class_id}
                                                        onBlur={handleBlur}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                                    >
                                                        {gradeMap[studentForm.grade_id]?.classes.map(classId => (
                                                            <option key={classId} value={classId}>{classMap[classId]}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className='flex gap-3 mt-6'>
                                                <button
                                                    type="submit"
                                                    className='flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300'
                                                >
                                                    {isEditingStudent ? 'ویرایش دانش آموز' : 'ثبت دانش آموز'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={resetForm}
                                                    className='flex-1 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-300'
                                                >
                                                    انصراف
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Search and Filters */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6'>
                                        <h3 className='text-xl font-bold text-gray-800'>لیست دانش آموزان</h3>

                                        <div className='flex gap-3'>
                                            <button
                                                onClick={() => {
                                                    resetForm()
                                                    setIsAddingStudent(true)
                                                }}
                                                className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2'
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                افزودن دانش آموز
                                            </button>
                                            <button
                                                onClick={fetchStudents}
                                                className='px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2'
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                بروزرسانی لیست
                                            </button>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                                        <div>
                                            <label className='block mb-2 text-sm font-medium text-gray-700'>جستجو</label>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                                placeholder="جستجو بر اساس نام، نام خانوادگی یا کد ملی..."
                                            />
                                        </div>

                                        <div>
                                            <label className='block mb-2 text-sm font-medium text-gray-700'>پایه تحصیلی</label>
                                            <select
                                                value={selectedGrade}
                                                onChange={(e) => setSelectedGrade(e.target.value)}
                                                className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                            >
                                                <option value="all">همه پایه‌ها</option>
                                                {Object.entries(gradeMap).map(([id, grade]) => (
                                                    <option key={id} value={id}>{grade.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className='block mb-2 text-sm font-medium text-gray-700'>کلاس</label>
                                            <select
                                                value={selectedClass}
                                                onChange={(e) => setSelectedClass(e.target.value)}
                                                className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                                            >
                                                <option value="all">همه کلاس‌ها</option>
                                                {Object.entries(classMap).map(([id, name]) => (
                                                    <option key={id} value={id}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Students Table with Scroll */}
                                    <div className='overflow-x-auto' dir='rtl'>
                                        <div className='max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg'>
                                            <table className='w-full'>
                                                <thead className='bg-gray-50 sticky top-0 z-10'>
                                                    <tr>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>نام و نام خانوادگی</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>کد ملی</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>پایه/کلاس</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>تاریخ تولد</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>عملیات</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y divide-gray-200'>
                                                    {filteredStudents.map((student) => (
                                                        <tr key={student.id} className='hover:bg-gray-50 transition-colors duration-200'>
                                                            <td className='p-4'>
                                                                <div className='flex items-center gap-3'>
                                                                    <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600'>
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <div className='font-medium text-gray-800'>
                                                                            {student.name} {student.lastname}
                                                                        </div>
                                                                        <div className='text-sm text-gray-600'>سن: {student.age || 'نامشخص'}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className='font-mono text-gray-800' >{student.national_id}</div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div>
                                                                    <div className='font-medium text-gray-800'>{student.grade_name}</div>
                                                                    <div className='text-sm text-gray-600'>{student.class_name}</div>
                                                                </div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className='text-gray-600'>{student.birth_date_formatted}</div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className='flex gap-2'>
                                                                    <button
                                                                        onClick={() => handleEditStudent(student)}
                                                                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300'
                                                                        title='ویرایش'
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteStudent(student.id)}
                                                                        className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300'
                                                                        title='حذف'
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* No Results Message */}
                                        {filteredStudents.length === 0 && (
                                            <div className='text-center py-12 border border-gray-200 rounded-lg mt-4'>
                                                <div className='text-gray-400 mb-4'>
                                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h4 className='text-lg font-medium text-gray-800'>هیچ دانش آموزی یافت نشد</h4>
                                                <p className='text-gray-600 mt-2'>می‌توانید دانش آموز جدیدی اضافه کنید</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "charts" && (
                            <div className='space-y-6'>
                                {/* Grade Distribution Chart */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-6'>توزیع دانش آموزان بر اساس پایه</h3>
                                    <div className='h-80'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={gradeChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, value }) => `${name}: ${value} نفر`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {gradeChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [`${value} نفر`, 'تعداد']}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Class Distribution Chart */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-6'>توزیع دانش آموزان بر اساس کلاس</h3>
                                    <div className='h-80'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={classChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value) => [`${value} نفر`, 'تعداد']}
                                                />
                                                <Legend />
                                                <Bar dataKey="value" name="تعداد دانش آموزان" fill="#3B82F6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className='mt-8 text-center text-gray-500 text-sm'>
                    <p>سیستم مدیریت دانش آموزان مدرسه من</p>
                    <p className='mt-1'>مدرسه متوسطه اول (پایه‌های هفتم تا نهم)</p>
                </div>
            </div>
        </div>
    )
}