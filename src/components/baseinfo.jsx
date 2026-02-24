import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { FaSchool, FaCalendarAlt } from 'react-icons/fa'
import { MdOutlineGrade, MdClass } from 'react-icons/md'
import { BiSearch } from 'react-icons/bi'
import { IoMdRefresh } from 'react-icons/io'
import { RiDeleteBin6Line, RiEdit2Line } from 'react-icons/ri'
import { HiOutlinePlus } from 'react-icons/hi'
import axios from 'axios'
import Swal from 'sweetalert2'

// Move DataTable OUTSIDE the main component
const DataTable = ({ title, icon, data, columns, onRefresh, onAdd, loading, searchTerm, onSearchChange, type, emptyMessage, editFunctions, deleteFunctions }) => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100">
        <div className="bg-gradient-to-l from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                    {icon}
                </div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white disabled:opacity-50"
                >
                    <IoMdRefresh className={`text-white text-lg ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                    onClick={onAdd}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 group text-white"
                >
                    <HiOutlinePlus className="text-white text-lg group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>
        </div>

        <div className="p-4 border-b border-gray-200">
            <div className="relative">
                <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={`جستجو در ${title}...`}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(type, e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 placeholder-gray-400"
                />
            </div>
        </div>

        <div className="flex-1 overflow-auto max-h-96 scrl">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                {col.header}
                            </th>
                        ))}
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                            عملیات
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-8 text-center">
                                <div className="flex justify-center items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-600">در حال بارگذاری...</span>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.id || index} className="hover:bg-blue-50 transition-colors duration-200 group">
                                {columns.map((col, idx) => (
                                    <td key={idx} className="px-4 py-3 text-gray-700">
                                        {col.accessor(item)}
                                    </td>
                                ))}
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => editFunctions[type](item.id)}
                                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-300 hover:scale-110"
                                            title="ویرایش"
                                        >
                                            <RiEdit2Line className="text-lg" />
                                        </button>
                                        <button
                                            onClick={() => deleteFunctions[type](item.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                                            title="حذف"
                                        >
                                            <RiDeleteBin6Line className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-200">
            تعداد: {data.length} مورد
        </div>
    </div>
)

export default function Baseinfo() {
    const [grades, setGrades] = useState([])
    const [academicYear, setAcademicYear] = useState([])
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState({
        grades: false,
        academicYear: false,
        classes: false
    })
    const [searchTerms, setSearchTerms] = useState({
        grades: '',
        academicYear: '',
        classes: ''
    })
    const [activeTab, setActiveTab] = useState('all')

    // Fetch functions
    const getGrades = useCallback(() => {
        setLoading(prev => ({ ...prev, grades: true }))
        axios.get(`http://localhost:5217/api/v1/Grade/GetAll?session=${localStorage.getItem("token")}`)
            .then((res) => {
                setGrades(res.data)
                setTimeout(() => setLoading(prev => ({ ...prev, grades: false })), 500)
            })
            .catch(() => setLoading(prev => ({ ...prev, grades: false })))
    }, [])
    
    const getAcadyear = useCallback(() => {
        setLoading(prev => ({ ...prev, academicYear: true }))
        axios.get(`http://localhost:5217/api/v1/AcademicYear/GetAll?session=${localStorage.getItem("token")}`)
            .then((res) => {
                setAcademicYear(res.data)
                setTimeout(() => setLoading(prev => ({ ...prev, academicYear: false })), 500)
            })
            .catch(() => setLoading(prev => ({ ...prev, academicYear: false })))
    }, [])
    
    const getClasses = useCallback(() => {
        setLoading(prev => ({ ...prev, classes: true }))
        axios.get(`http://localhost:5217/api/v1/Class/GetAll?session=${localStorage.getItem("token")}`)
            .then((res) => {
                setClasses(res.data)
                setTimeout(() => setLoading(prev => ({ ...prev, classes: false })), 500)
            })
            .catch(() => setLoading(prev => ({ ...prev, classes: false })))
    }, [])
    
    useEffect(() => {
        getGrades()
        getAcadyear()
        getClasses()
    }, [getGrades, getAcadyear, getClasses])

    // Filter functions
    const filteredGrades = useMemo(() => 
        grades.filter(g => 
            g.grade_name?.toLowerCase().includes(searchTerms.grades.toLowerCase()) ||
            g.id?.toString().includes(searchTerms.grades)
        ), [grades, searchTerms.grades]
    )
    
    const filteredAcademicYear = useMemo(() => 
        academicYear.filter(a => 
            a.title?.toLowerCase().includes(searchTerms.academicYear.toLowerCase()) ||
            a.id?.toString().includes(searchTerms.academicYear)
        ), [academicYear, searchTerms.academicYear]
    )
    const find_grade_name = useCallback((id) => {
        const grade = grades.find(g => g.id === id)
        return grade ? grade.grade_name : 'نامشخص'
    }, [grades])
    const filteredClasses = useMemo(() => 
        classes.filter(c => 
            c.class_name?.toLowerCase().includes(searchTerms.classes.toLowerCase()) ||
            find_grade_name(c.grade_id)?.toLowerCase().includes(searchTerms.classes.toLowerCase()) ||
            c.id?.toString().includes(searchTerms.classes)
        ), [classes, searchTerms.classes] 
    )

    // Edit Functions
    const editGrades = useCallback((id) => {
        Swal.fire({
            title: 'ویرایش پایه',
            input: 'text',
            inputLabel: 'نام جدید پایه را وارد کنید',
            inputValue: grades.find(g => g.id === id)?.grade_name || '',
            showCancelButton: true,
            confirmButtonText: 'ویرایش',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            background: '#ffffff',
            color: '#1f2937',
            inputValidator: (value) => {
                if (!value) {
                    return 'نام پایه نمی‌تواند خالی باشد'
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                axios.put(`http://localhost:5217/api/v1/Grade/Update?session=${localStorage.getItem("token")}`, {
                    id: id,
                    grade_name: result.value
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'موفق',
                        text: 'پایه با موفقیت ویرایش شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getGrades()
                })
                .catch((err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'خطا',
                        text: err.response?.data?.error || 'خطا در ویرایش',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6'
                    })
                })
            }
        })
    }, [grades, getGrades])
    
    const addGrades = useCallback(() => {
        Swal.fire({
            title: 'افزودن پایه جدید',
            input: 'text',
            inputLabel: 'نام پایه را وارد کنید',
            showCancelButton: true,
            confirmButtonText: 'افزودن',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            background: '#ffffff',
            color: '#1f2937',
            inputValidator: (value) => {
                if (!value) {
                    return 'نام پایه نمی‌تواند خالی باشد'
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                axios.post(`http://localhost:5217/api/v1/Grade/Add?session=${localStorage.getItem("token")}`, {
                    grade_name: result.value
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'موفق',
                        text: 'پایه با موفقیت اضافه شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getGrades()
                })
            }
        })
    }, [getGrades])
    
    const deleteGrades = useCallback((id) => {
        Swal.fire({
            title: 'آیا مطمئن هستید؟',
            text: "این عملیات قابل بازگشت نیست!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            cancelButtonText: 'انصراف',
            confirmButtonText: 'بله، حذف کن',
            background: '#ffffff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:5217/api/v1/Grade/Delete/${id}?session=${localStorage.getItem("token")}`)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'حذف شد',
                        text: 'پایه با موفقیت حذف شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getGrades()
                })
                .catch((err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'خطا',
                        text: err.response?.data?.error || 'خطا در حذف',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6'
                    })
                })
            }
        })
    }, [getGrades])
    
    const editAcadYear = useCallback((id) => {
        Swal.fire({
            title: 'ویرایش سال تحصیلی',
            input: 'text',
            inputLabel: 'نام جدید سال تحصیلی را وارد کنید',
            inputValue: academicYear.find(a => a.id === id)?.title || '',
            showCancelButton: true,
            confirmButtonText: 'ویرایش',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            background: '#ffffff',
            color: '#1f2937',
            inputValidator: (value) => {
                if (!value) {
                    return 'نام سال تحصیلی نمی‌تواند خالی باشد'
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                axios.put(`http://localhost:5217/api/v1/AcademicYear/Update?session=${localStorage.getItem("token")}`, {
                    id: id,
                    title: result.value
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'موفق',
                        text: 'سال تحصیلی با موفقیت ویرایش شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getAcadyear()
                })
            }
        })
    }, [academicYear, getAcadyear])
    
    const addAcadYear = useCallback(() => {
        Swal.fire({
            title: 'افزودن سال تحصیلی جدید',
            input: 'text',
            inputLabel: 'نام سال تحصیلی را وارد کنید',
            showCancelButton: true,
            confirmButtonText: 'افزودن',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            background: '#ffffff',
            color: '#1f2937',
            inputValidator: (value) => {
                if (!value) {
                    return 'نام سال تحصیلی نمی‌تواند خالی باشد'
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                axios.post(`http://localhost:5217/api/v1/AcademicYear/Add?session=${localStorage.getItem("token")}`, {
                    title: result.value
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'موفق',
                        text: 'سال تحصیلی با موفقیت اضافه شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getAcadyear()
                })
            }
        })
    }, [getAcadyear])
    
    const deleteAcadYear = useCallback((id) => {
        Swal.fire({
            title: 'آیا مطمئن هستید؟',
            text: "این عملیات قابل بازگشت نیست!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            cancelButtonText: 'انصراف',
            confirmButtonText: 'بله، حذف کن',
            background: '#ffffff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:5217/api/v1/AcademicYear/Delete/${id}?session=${localStorage.getItem("token")}`)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'حذف شد',
                        text: 'سال تحصیلی با موفقیت حذف شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getAcadyear()
                })
                .catch((err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'خطا',
                        text: err.response?.data?.error || 'خطا در حذف',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6'
                    })
                })
            }
        })
    }, [getAcadyear])
    
    const editClass = useCallback((id) => {
        const classItem = classes.find(c => c.id === id)
        
        Swal.fire({
            title: 'ویرایش کلاس',
            html: `
                <div dir="rtl">
                    <label class="block text-sm font-medium text-gray-700 mb-2">نام کلاس</label>
                    <input id="className" class="w-full p-2 mb-4 border border-gray-300 rounded-lg text-gray-800" value="${classItem?.class_name || ''}">
                    <label class="block text-sm font-medium text-gray-700 mb-2">شناسه پایه</label>
                    <input id="gradeId" type="number" class="w-full p-2 mb-2 border border-gray-300 rounded-lg text-gray-800" value="${classItem?.grade_id || ''}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'ویرایش',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            background: '#ffffff',
            color: '#1f2937',
            preConfirm: () => {
                const className = document.getElementById('className').value
                const gradeId = parseInt(document.getElementById('gradeId').value)
                
                if (!className) {
                    Swal.showValidationMessage('نام کلاس نمی‌تواند خالی باشد')
                    return false
                }
                
                const gradeExists = grades.some(g => g.id === gradeId)
                if (!gradeExists) {
                    Swal.showValidationMessage('شناسه پایه وجود ندارد')
                    return false
                }
                
                return { className, gradeId }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                axios.put(`http://localhost:5217/api/v1/Class/Update?session=${localStorage.getItem("token")}`, {
                    id: id,
                    class_name: result.value.className,
                    grade_id: result.value.gradeId
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'موفق',
                        text: 'کلاس با موفقیت ویرایش شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getClasses()
                })
            }
        })
    }, [classes, grades, getClasses])
    
    const addClass = useCallback(() => {
        Swal.fire({
            title: 'افزودن کلاس جدید',
            html: `
                <div dir="rtl">
                    <label class="block text-sm font-medium text-gray-700 mb-2">نام کلاس</label>
                    <input id="className" class="w-full p-2 mb-4 border border-gray-300 rounded-lg text-gray-800">
                    <label class="block text-sm font-medium text-gray-700 mb-2">شناسه پایه</label>
                    <input id="gradeId" type="number" class="w-full p-2 mb-2 border border-gray-300 rounded-lg text-gray-800">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'افزودن',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            background: '#ffffff',
            color: '#1f2937',
            preConfirm: () => {
                const className = document.getElementById('className').value
                const gradeId = parseInt(document.getElementById('gradeId').value)
                
                if (!className) {
                    Swal.showValidationMessage('نام کلاس نمی‌تواند خالی باشد')
                    return false
                }
                
                if (!gradeId) {
                    Swal.showValidationMessage('شناسه پایه را وارد کنید')
                    return false
                }
                
                const gradeExists = grades.some(g => g.id === gradeId)
                if (!gradeExists) {
                    Swal.showValidationMessage('شناسه پایه وجود ندارد')
                    return false
                }
                
                return { className, gradeId }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                axios.post(`http://localhost:5217/api/v1/Class/Add?session=${localStorage.getItem("token")}`, {
                    class_name: result.value.className,
                    grade_id: result.value.gradeId
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'موفق',
                        text: 'کلاس با موفقیت اضافه شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getClasses()
                })
            }
        })
    }, [grades, getClasses])
    
    const deleteClass = useCallback((id) => {
        Swal.fire({
            title: 'آیا مطمئن هستید؟',
            text: "این عملیات قابل بازگشت نیست!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            cancelButtonText: 'انصراف',
            confirmButtonText: 'بله، حذف کن',
            background: '#ffffff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:5217/api/v1/Class/Delete/${id}?session=${localStorage.getItem("token")}`)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'حذف شد',
                        text: 'کلاس با موفقیت حذف شد',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6',
                        timer: 1500
                    })
                    getClasses()
                })
                .catch((err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'خطا',
                        text: err.response?.data?.error || 'خطا در حذف',
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6'
                    })
                })
            }
        })
    }, [getClasses])
    
    

    // Handle search changes
    const handleSearchChange = useCallback((type, value) => {
        setSearchTerms(prev => ({ ...prev, [type]: value }))
    }, [])

    // Tab navigation for mobile
    const tabs = [
        { id: 'all', name: 'همه', icon: <FaSchool className="text-blue-600" /> },
        { id: 'academic', name: 'سال تحصیلی', icon: <FaCalendarAlt className="text-blue-600" /> },
        { id: 'grades', name: 'پایه‌ها', icon: <MdOutlineGrade className="text-blue-600" /> },
        { id: 'classes', name: 'کلاس‌ها', icon: <MdClass className="text-blue-600" /> }
    ]

    // Create edit and delete function objects
    const editFunctions = {
        grades: editGrades,
        academicYear: editAcadYear,
        classes: editClass
    }

    const deleteFunctions = {
        grades: deleteGrades,
        academicYear: deleteAcadYear,
        classes: deleteClass
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6" dir="rtl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    اطلاعات پایه
                </h1>
                <p className="text-gray-600 mt-2">مدیریت سال‌های تحصیلی، پایه‌ها و کلاس‌ها</p>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden mb-6">
                <div className="flex bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
                {/* Academic Year Table */}
                <DataTable
                    type="academicYear"
                    title="سال تحصیلی"
                    icon={<FaCalendarAlt className="text-white text-xl" />}
                    data={filteredAcademicYear}
                    columns={[
                        { header: 'شناسه', accessor: (item) => <span className="font-mono text-blue-600 font-medium">#{item.id}</span> },
                        { header: 'عنوان', accessor: (item) => item.title }
                    ]}
                    onRefresh={getAcadyear}
                    onAdd={addAcadYear}
                    loading={loading.academicYear}
                    searchTerm={searchTerms.academicYear}
                    onSearchChange={handleSearchChange}
                    emptyMessage="سال تحصیلی یافت نشد"
                    editFunctions={editFunctions}
                    deleteFunctions={deleteFunctions}
                />

                {/* Grades Table */}
                <DataTable
                    type="grades"
                    title="پایه‌ها"
                    icon={<MdOutlineGrade className="text-white text-xl" />}
                    data={filteredGrades}
                    columns={[
                        { header: 'شناسه', accessor: (item) => <span className="font-mono text-blue-600 font-medium">#{item.id}</span> },
                        { header: 'نام پایه', accessor: (item) => item.grade_name }
                    ]}
                    onRefresh={getGrades}
                    onAdd={addGrades}
                    loading={loading.grades}
                    searchTerm={searchTerms.grades}
                    onSearchChange={handleSearchChange}
                    emptyMessage="پایه‌ای یافت نشد"
                    editFunctions={editFunctions}
                    deleteFunctions={deleteFunctions}
                />

                {/* Classes Table */}
                <DataTable
                    type="classes"
                    title="کلاس‌ها"
                    icon={<MdClass className="text-white text-xl" />}
                    data={filteredClasses}
                    columns={[
                        { header: 'شناسه', accessor: (item) => <span className="font-mono text-blue-600 font-medium">#{item.id}</span> },
                        { header: 'نام کلاس', accessor: (item) => item.class_name },
                        { header: 'پایه', accessor: (item) => {
                            const gradeName = find_grade_name(item.grade_id)
                            return (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                    {gradeName}
                                </span>
                            )
                        }}
                    ]}
                    onRefresh={getClasses}
                    onAdd={addClass}
                    loading={loading.classes}
                    searchTerm={searchTerms.classes}
                    onSearchChange={handleSearchChange}
                    emptyMessage="کلاسی یافت نشد"
                    editFunctions={editFunctions}
                    deleteFunctions={deleteFunctions}
                />
            </div>

            {/* Mobile Grid */}
            <div className="md:hidden space-y-4">
                {(activeTab === 'all' || activeTab === 'academic') && (
                    <DataTable
                        type="academicYear"
                        title="سال تحصیلی"
                        icon={<FaCalendarAlt className="text-white text-xl" />}
                        data={filteredAcademicYear}
                        columns={[
                            { header: 'شناسه', accessor: (item) => <span className="font-mono text-blue-600 font-medium">#{item.id}</span> },
                            { header: 'عنوان', accessor: (item) => item.title }
                        ]}
                        onRefresh={getAcadyear}
                        onAdd={addAcadYear}
                        loading={loading.academicYear}
                        searchTerm={searchTerms.academicYear}
                        onSearchChange={handleSearchChange}
                        emptyMessage="سال تحصیلی یافت نشد"
                        editFunctions={editFunctions}
                        deleteFunctions={deleteFunctions}
                    />
                )}

                {(activeTab === 'all' || activeTab === 'grades') && (
                    <DataTable
                        type="grades"
                        title="پایه‌ها"
                        icon={<MdOutlineGrade className="text-white text-xl" />}
                        data={filteredGrades}
                        columns={[
                            { header: 'شناسه', accessor: (item) => <span className="font-mono text-blue-600 font-medium">#{item.id}</span> },
                            { header: 'نام پایه', accessor: (item) => item.grade_name }
                        ]}
                        onRefresh={getGrades}
                        onAdd={addGrades}
                        loading={loading.grades}
                        searchTerm={searchTerms.grades}
                        onSearchChange={handleSearchChange}
                        emptyMessage="پایه‌ای یافت نشد"
                        editFunctions={editFunctions}
                        deleteFunctions={deleteFunctions}
                    />
                )}

                {(activeTab === 'all' || activeTab === 'classes') && (
                    <DataTable
                        type="classes"
                        title="کلاس‌ها"
                        icon={<MdClass className="text-white text-xl" />}
                        data={filteredClasses}
                        columns={[
                            { header: 'شناسه', accessor: (item) => <span className="font-mono text-blue-600 font-medium">#{item.id}</span> },
                            { header: 'نام کلاس', accessor: (item) => item.class_name },
                            { header: 'پایه', accessor: (item) => {
                                const gradeName = find_grade_name(item.grade_id)
                                return (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                        {gradeName}
                                    </span>
                                )
                            }}
                        ]}
                        onRefresh={getClasses}
                        onAdd={addClass}
                        loading={loading.classes}
                        searchTerm={searchTerms.classes}
                        onSearchChange={handleSearchChange}
                        emptyMessage="کلاسی یافت نشد"
                        editFunctions={editFunctions}
                        deleteFunctions={deleteFunctions}
                    />
                )}
            </div>

            <style jsx>{`
                .scrl::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .scrl::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .scrl::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .scrl::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    )
}