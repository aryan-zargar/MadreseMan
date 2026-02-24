import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import Logo from '../assets/MadreseManLogo.png';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
    FaReceipt, FaMoneyBillWave, FaCalendarAlt, FaUserGraduate, 
    FaSearch, FaDownload, FaPrint, FaHistory, FaUpload,
    FaCheck, FaAdjust, FaTimes, FaTrash, FaFilePdf, FaFilter
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5217/api/v1';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

axiosInstance.interceptors.request.use((config) => {
    const session = localStorage.getItem('token');
    if (session) {
        config.params = { ...config.params, session };
    }
    return config;
});

export default function TuitionManagement() {
    const [activeTab, setActiveTab] = useState("payments");
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
    const [selectedChartAcademicYear, setSelectedChartAcademicYear] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [isAddingPayment, setIsAddingPayment] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const studentDropdownRef = useRef(null);
    const [gradeFees, setGradeFees] = useState({});
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalPending: 0,
        totalStudents: 0,
        monthlyStats: {},
        byGrade: {},
        byStatus: { C: 0, H: 0, N: 0 }
    });

    const [paymentForm, setPaymentForm] = useState({
        student_id: "",
        student_display: "",
        amount: "",
        month: new Date().getMonth() + 1,
        discount: 0,
        fine: 0,
        net_amount: 0,
        status: "N",
        due: new Date().toISOString().split('T')[0],
        date: new Date().toISOString().split('T')[0],
        receipt_number: "",
        description: "",
        attachment_id: 0,
        academic_year_id: null
    });

    const monthMap = {
        1: "فروردین", 2: "اردیبهشت", 3: "خرداد",
        4: "تیر", 5: "مرداد", 6: "شهریور",
        7: "مهر", 8: "آبان", 9: "آذر",
        10: "دی", 11: "بهمن", 12: "اسفند"
    };

    const statusMap = {
        'C': { label: "پرداخت کامل", color: "bg-green-100 text-green-800", icon: FaCheck },
        'H': { label: "پرداخت نیمه", color: "bg-yellow-100 text-yellow-800", icon: FaAdjust },
        'N': { label: "پرداخت نشده", color: "bg-red-100 text-red-800", icon: FaTimes }
    };

    const gradeFeeMap = {
        "پایه هفتم": 1500000,
        "پایه هشتم": 1600000,
        "پایه نهم": 1700000
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
                setShowStudentDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (selectedAcademicYear) {
            filterPaymentsByAcademicYear();
        }
    }, [selectedAcademicYear, payments, searchTerm, selectedGrade, selectedStatus, selectedMonth]);

    useEffect(() => {
        if (selectedChartAcademicYear) {
            fetchAndCalculateChartData();
        }
    }, [selectedChartAcademicYear]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [studentsRes, gradesRes, classesRes, academicYearsRes, paymentsRes] = await Promise.all([
                axiosInstance.get('/Student/GetAll'),
                axiosInstance.get('/Grade/GetAll'),
                axiosInstance.get('/Class/GetAll'),
                axiosInstance.get('/AcademicYear/GetAll'),
                axiosInstance.get('/TuitionPayment/GetAll')
            ]);

            setStudents(studentsRes.data);
            setGrades(gradesRes.data);
            setClasses(classesRes.data);
            setAcademicYears(academicYearsRes.data);
            
            const activeYear = academicYearsRes.data.find(y => y.active === true);
            setSelectedAcademicYear(activeYear);
            setSelectedChartAcademicYear(activeYear);
            
            const gradeFeeData = {};
            gradesRes.data.forEach(grade => {
                gradeFeeData[grade.grade_name] = gradeFeeMap[grade.grade_name] || 1500000;
            });
            setGradeFees(gradeFeeData);
            
            const enrichedPayments = enrichPaymentsData(paymentsRes.data, studentsRes.data, gradesRes.data, classesRes.data);
            setPayments(enrichedPayments);
            
            filterPaymentsByAcademicYear(enrichedPayments, activeYear);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "خطا در دریافت اطلاعات از سرور"
            });
        } finally {
            setLoading(false);
        }
    };

    const enrichPaymentsData = (paymentsData, studentsData, gradesData, classesData) => {
        return paymentsData.map(payment => {
            const student = studentsData.find(s => s.id === payment.student_id);
            const studentGrade = student ? gradesData.find(g => g.id === student.grade_id) : null;
            const studentClass = student ? classesData.find(c => c.id === student.class_id) : null;
            
            return {
                ...payment,
                student_name: student ? `${student.name} ${student.lastname}` : "نامشخص",
                student_grade: studentGrade?.grade_name || "نامشخص",
                student_class: studentClass?.class_name || "نامشخص",
                formatted_date: payment.date ? formatDate(payment.date) : "نامشخص",
                month_name: monthMap[payment.month] || payment.month,
                status_info: statusMap[payment.status] || statusMap.N,
                formatted_amount: formatAmount(payment.net_amount),
                formatted_due: payment.due ? formatDate(payment.due) : "نامشخص"
            };
        });
    };

    const filterPaymentsByAcademicYear = (paymentsList = payments, academicYear = selectedAcademicYear) => {
        if (!academicYear) return;
        
        let filtered = paymentsList.filter(p => p.academic_year_id === academicYear.id);
        
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.student_name?.includes(searchTerm) ||
                payment.student_id?.toString().includes(searchTerm)
            );
        }
        
        if (selectedGrade !== "all") {
            const grade = grades.find(g => g.id === parseInt(selectedGrade));
            filtered = filtered.filter(payment => 
                payment.student_grade === grade?.grade_name
            );
        }
        
        if (selectedStatus !== "all") {
            filtered = filtered.filter(payment => payment.status === selectedStatus);
        }
        
        if (selectedMonth !== "all") {
            filtered = filtered.filter(payment => payment.month.toString() === selectedMonth);
        }
        
        setFilteredPayments(filtered);
        calculateStats(filtered, students, academicYear);
    };

    const calculateStats = (paymentsData, studentsData, academicYear) => {
        const totalPaid = paymentsData
            .filter(p => p.status === 'C')
            .reduce((sum, p) => sum + p.net_amount, 0);
        
        const studentsInAcademicYear = studentsData.filter(s => s.academic_year_id === academicYear?.id);
        
        const studentsByGrade = {};
        studentsInAcademicYear.forEach(student => {
            const grade = grades.find(g => g.id === student.grade_id);
            if (grade) {
                studentsByGrade[grade.grade_name] = (studentsByGrade[grade.grade_name] || 0) + 1;
            }
        });
        
        let totalPending = 0;
        Object.entries(studentsByGrade).forEach(([gradeName, count]) => {
            const fee = gradeFees[gradeName] || 1500000;
            const paidForGrade = paymentsData
                .filter(p => p.status === 'C' && p.student_grade === gradeName)
                .reduce((sum, p) => sum + p.net_amount, 0);
            
            const expectedTotal = count * fee;
            totalPending += Math.max(0, expectedTotal - paidForGrade);
        });
        
        const monthlyStats = {};
        const byGrade = {};
        const byStatus = { C: 0, H: 0, N: 0 };
        
        paymentsData.forEach(payment => {
            const monthKey = `${payment.month}`;
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { C: 0, H: 0, N: 0 };
            }
            monthlyStats[monthKey][payment.status] += payment.net_amount;
            
            const gradeName = payment.student_grade;
            byGrade[gradeName] = (byGrade[gradeName] || 0) + 1;
            
            byStatus[payment.status] = (byStatus[payment.status] || 0) + 1;
        });
        
        setStats({
            totalPaid,
            totalPending,
            totalStudents: studentsInAcademicYear.length,
            monthlyStats,
            byGrade,
            byStatus
        });
    };

    const fetchAndCalculateChartData = async () => {
        if (!selectedChartAcademicYear) return;
        
        setLoading(true);
        try {
            const response = await axiosInstance.get('/TuitionPayment/GetAll');
            const yearPayments = response.data.filter(p => p.academic_year_id === selectedChartAcademicYear.id);
            const enrichedYearPayments = enrichPaymentsData(yearPayments, students, grades, classes);
            calculateStats(enrichedYearPayments, students, selectedChartAcademicYear);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => {
            const updated = { ...prev, [name]: value };
            
            if (['amount', 'discount', 'fine'].includes(name)) {
                const amount = parseInt(updated.amount) || 0;
                const discount = parseInt(updated.discount) || 0;
                const fine = parseInt(updated.fine) || 0;
                updated.net_amount = amount - discount + fine;
            }
            
            return updated;
        });
    };

    const selectStudent = (student) => {
        const grade = grades.find(g => g.id === student.grade_id);
        const defaultAmount = gradeFees[grade?.grade_name] || 1500000;
        
        setPaymentForm(prev => ({
            ...prev,
            student_id: student.id,
            student_display: `${student.name} ${student.lastname}`,
            amount: defaultAmount,
            net_amount: defaultAmount
        }));
        setStudentSearch("");
        setShowStudentDropdown(false);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const generateReceiptNumber = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        
        if (!paymentForm.student_id || !paymentForm.amount || !selectedAcademicYear) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "لطفا فیلدهای ضروری را پر کنید"
            });
            return;
        }

        setLoading(true);
        
        try {
            const paymentData = {
                ...paymentForm,
                student_id: parseInt(paymentForm.student_id),
                amount: parseInt(paymentForm.amount),
                discount: parseInt(paymentForm.discount) || 0,
                fine: parseInt(paymentForm.fine) || 0,
                net_amount: parseInt(paymentForm.net_amount),
                month: parseInt(paymentForm.month),
                receipt_number: generateReceiptNumber(),
                date: paymentForm.date,
                due: paymentForm.due,
                status: paymentForm.status,
                academic_year_id: selectedAcademicYear.id,
                attachment_id: 0
            };

            await axiosInstance.post('/TuitionPayment/Add', paymentData);
            
            if (selectedFile) {
                console.log('File upload will be implemented:', selectedFile);
            }
            
            const updatedPayments = await axiosInstance.get('/TuitionPayment/GetAll');
            const enrichedPayments = enrichPaymentsData(updatedPayments.data, students, grades, classes);
            setPayments(enrichedPayments);
            
            filterPaymentsByAcademicYear(enrichedPayments, selectedAcademicYear);
            
            Swal.fire({
                icon: "success",
                title: "موفقیت",
                text: "پرداخت با موفقیت ثبت شد",
                timer: 2000
            });
            
            resetForm();
            
        } catch (error) {
            console.error('Error submitting payment:', error);
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: error.response?.data?.error || "خطا در ثبت پرداخت"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (paymentId, newStatus) => {
        setLoading(true);
        
        try {
            const paymentToUpdate = payments.find(p => p.id === paymentId);
            if (!paymentToUpdate) return;

            const updatedPayment = {
                ...paymentToUpdate,
                status: newStatus
            };

            await axiosInstance.put('/TuitionPayment/Update', updatedPayment);
            
            const response = await axiosInstance.get('/TuitionPayment/GetAll');
            const enrichedPayments = enrichPaymentsData(response.data, students, grades, classes);
            setPayments(enrichedPayments);
            
            filterPaymentsByAcademicYear(enrichedPayments, selectedAcademicYear);
            
            Swal.fire({
                icon: "success",
                title: "موفقیت",
                text: "وضعیت پرداخت بروزرسانی شد"
            });
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: error.response?.data?.error || "خطا در بروزرسانی وضعیت"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        const result = await Swal.fire({
            title: 'آیا مطمئن هستید؟',
            text: "این عملیات قابل بازگشت نیست!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'بله، حذف کن',
            cancelButtonText: 'انصراف'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await axiosInstance.delete(`/TuitionPayment/Delete/${paymentId}`);
                
                const response = await axiosInstance.get('/TuitionPayment/GetAll');
                const enrichedPayments = enrichPaymentsData(response.data, students, grades, classes);
                setPayments(enrichedPayments);
                
                filterPaymentsByAcademicYear(enrichedPayments, selectedAcademicYear);
                
                Swal.fire({
                    icon: "success",
                    title: "موفقیت",
                    text: "پرداخت با موفقیت حذف شد"
                });
            } catch (error) {
                console.error('Error deleting payment:', error);
                Swal.fire({
                    icon: "error",
                    title: "خطا",
                    text: error.response?.data?.error || "خطا در حذف پرداخت"
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePrintReceipt = (payment) => {
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <title>رسید پرداخت - ${payment.receipt_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                    .receipt { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 20px; }
                    .header h1 { color: #10b981; margin: 10px 0; }
                    .receipt-number { background: #f3f4f6; padding: 10px; text-align: center; font-family: monospace; font-size: 18px; border-radius: 5px; margin-bottom: 20px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; border-bottom: 1px dashed #e5e7eb; }
                    .label { font-weight: bold; color: #4b5563; }
                    .value { color: #1f2937; }
                    .total { font-size: 18px; font-weight: bold; color: #10b981; }
                    .status { display: inline-block; padding: 5px 10px; border-radius: 5px; background: ${payment.status === 'C' ? '#10b981' : payment.status === 'H' ? '#f59e0b' : '#ef4444'}; color: white; }
                    .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h1>رسید پرداخت شهریه</h1>
                        <p>مدرسه من</p>
                    </div>
                    
                    <div class="receipt-number">
                        شماره رسید: ${payment.receipt_number}
                    </div>
                    
                    <div class="row">
                        <span class="label">دانش‌آموز:</span>
                        <span class="value">${payment.student_name}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">پایه و کلاس:</span>
                        <span class="value">${payment.student_grade} - ${payment.student_class}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">ماه:</span>
                        <span class="value">${payment.month_name}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">مبلغ اصلی:</span>
                        <span class="value">${formatAmount(payment.amount)}</span>
                    </div>
                    
                    ${payment.discount > 0 ? `
                    <div class="row">
                        <span class="label">تخفیف:</span>
                        <span class="value">${formatAmount(payment.discount)}</span>
                    </div>
                    ` : ''}
                    
                    ${payment.fine > 0 ? `
                    <div class="row">
                        <span class="label">جریمه:</span>
                        <span class="value">${formatAmount(payment.fine)}</span>
                    </div>
                    ` : ''}
                    
                    <div class="row total">
                        <span class="label">مبلغ نهایی:</span>
                        <span class="value">${formatAmount(payment.net_amount)}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">تاریخ پرداخت:</span>
                        <span class="value">${payment.formatted_date}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">سررسید:</span>
                        <span class="value">${payment.formatted_due}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">وضعیت:</span>
                        <span class="value status">${statusMap[payment.status].label}</span>
                    </div>
                    
                    ${payment.description ? `
                    <div class="row">
                        <span class="label">توضیحات:</span>
                        <span class="value">${payment.description}</span>
                    </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p>این رسید به صورت الکترونیکی صادر شده است</p>
                        <p>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</p>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    };

    const resetForm = () => {
        setPaymentForm({
            student_id: "",
            student_display: "",
            amount: "",
            month: new Date().getMonth() + 1,
            discount: 0,
            fine: 0,
            net_amount: 0,
            status: "N",
            due: new Date().toISOString().split('T')[0],
            date: new Date().toISOString().split('T')[0],
            receipt_number: "",
            description: "",
            attachment_id: 0,
            academic_year_id: selectedAcademicYear?.id || null
        });
        setSelectedFile(null);
        setStudentSearch("");
        setIsAddingPayment(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "نامشخص";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fa-IR').format(date);
        } catch {
            return dateString;
        }
    };

    const formatAmount = (amount) => {
        if (!amount) return "0 تومان";
        return new Intl.NumberFormat('fa-IR').format(amount) + " تومان";
    };

    const filteredStudents = students.filter(student => {
        const searchLower = studentSearch.toLowerCase();
        const grade = grades.find(g => g.id === student.grade_id);
        const className = classes.find(c => c.id === student.class_id);
        return (
            student.name?.toLowerCase().includes(searchLower) ||
            student.lastname?.toLowerCase().includes(searchLower) ||
            student.national_id?.includes(searchLower) ||
            grade?.grade_name?.toLowerCase().includes(searchLower) ||
            className?.class_name?.toLowerCase().includes(searchLower)
        );
    }).slice(0, 10);

    const statusChartData = [
        { name: "پرداخت کامل", value: stats.byStatus.C, color: "#10B981" },
        { name: "پرداخت نیمه", value: stats.byStatus.H, color: "#F59E0B" },
        { name: "پرداخت نشده", value: stats.byStatus.N, color: "#EF4444" }
    ];

    const monthlyChartData = Object.entries(stats.monthlyStats)
        .slice(-12)
        .map(([month, data]) => ({
            name: monthMap[month] || month,
            paid: data.C || 0,
            pending: (data.H || 0) + (data.N || 0),
            overdue: data.N || 0
        }));

    const gradeChartData = Object.entries(stats.byGrade).map(([grade, count]) => ({
        name: grade,
        value: count
    }));

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 lg:p-6'>
            <div className='max-w-7xl mx-auto'>
                
                {loading && (
                    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-lg p-6'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto'></div>
                            <p className='text-center mt-4'>در حال بارگذاری...</p>
                        </div>
                    </div>
                )}

                <div className='bg-white rounded-2xl shadow-xl p-6 mb-6'>
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-green-100 p-3 rounded-2xl'>
                                <img src={Logo} alt="MadreseMan Logo" className='w-16 h-16' />
                            </div>
                            <div>
                                <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>
                                    مدیریت پرداخت شهریه
                                </h1>
                                <div className='flex items-center gap-2 mt-1'>
                                    <FaFilter className="text-gray-400" />
                                    <select
                                        value={selectedAcademicYear?.id || ''}
                                        onChange={(e) => {
                                            const year = academicYears.find(y => y.id === parseInt(e.target.value));
                                            setSelectedAcademicYear(year);
                                        }}
                                        className='border-2 border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                    >
                                        {academicYears.map(year => (
                                            <option key={year.id} value={year.id}>
                                                {year.title} {year.active ? '(سال جاری)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className='flex gap-4'>
                            <div className='text-right'>
                                <p className='text-sm text-gray-600'>مجموع پرداخت‌ها</p>
                                <p className='text-2xl font-bold text-green-600'>
                                    {formatAmount(stats.totalPaid)}
                                </p>
                            </div>
                            <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold'>
                                <FaReceipt className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    
                    <div className='lg:col-span-1 space-y-6'>
                        
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>آمار سریع</h3>
                            <div className='space-y-4'>
                                <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200'>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <p className='text-sm text-gray-600'>پرداخت شده</p>
                                            <p className='text-xl font-bold text-green-700'>
                                                {formatAmount(stats.totalPaid)}
                                            </p>
                                        </div>
                                        <FaMoneyBillWave className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>
                                
                                <div className='bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200'>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <p className='text-sm text-gray-600'>در انتظار پرداخت</p>
                                            <p className='text-xl font-bold text-yellow-700'>
                                                {formatAmount(stats.totalPending)}
                                            </p>
                                        </div>
                                        <FaCalendarAlt className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </div>
                                
                                <div className='bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200'>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <p className='text-sm text-gray-600'>تعداد دانش‌آموزان</p>
                                            <p className='text-xl font-bold text-blue-700'>{stats.totalStudents} نفر</p>
                                        </div>
                                        <FaUserGraduate className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>وضعیت پرداخت‌ها</h3>
                            <div className='space-y-3'>
                                {statusChartData.map((item, index) => (
                                    <div key={index} className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                                            <span className='text-sm text-gray-700'>{item.name}</span>
                                        </div>
                                        <span className='font-medium'>{item.value} مورد</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>عملیات سریع</h3>
                            <div className='space-y-3'>
                                <button
                                    onClick={() => setIsAddingPayment(true)}
                                    className='w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2'
                                >
                                    <FaMoneyBillWave className="w-5 h-5" />
                                    ثبت پرداخت جدید
                                </button>
                                <button
                                    onClick={fetchInitialData}
                                    className='w-full p-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2'
                                >
                                    <FaHistory className="w-5 h-5" />
                                    بروزرسانی اطلاعات
                                </button>
                                <button
                                    onClick={() => {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'خروجی Excel',
                                            text: 'این قابلیت در حال توسعه است'
                                        });
                                    }}
                                    className='w-full p-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2'
                                >
                                    <FaDownload className="w-5 h-5" />
                                    خروجی Excel
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className='lg:col-span-3'>
                        
                        <div className='bg-white rounded-2xl shadow-xl mb-6'>
                            <div className='flex overflow-x-auto border-b border-gray-200'>
                                <button
                                    onClick={() => setActiveTab("payments")}
                                    className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors duration-300 ${activeTab === "payments" ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    لیست پرداخت‌ها
                                </button>
                                <button
                                    onClick={() => setActiveTab("charts")}
                                    className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors duration-300 ${activeTab === "charts" ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    آمار و نمودارها
                                </button>
                            </div>
                        </div>
                        
                        {activeTab === "payments" && (
                            <div className='space-y-6'>
                                
                                {isAddingPayment && (
                                    <div className='bg-white rounded-2xl shadow-xl p-6'>
                                        <div className='flex justify-between items-center mb-6'>
                                            <h3 className='text-xl font-bold text-gray-800'>ثبت پرداخت جدید</h3>
                                            <button 
                                                onClick={resetForm}
                                                className='text-gray-500 hover:text-gray-700'
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        
                                        <form onSubmit={handleSubmitPayment}>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                                <div className='relative' ref={studentDropdownRef}>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>دانش‌آموز *</label>
                                                    <input
                                                        type="text"
                                                        value={studentSearch}
                                                        onChange={(e) => {
                                                            setStudentSearch(e.target.value);
                                                            setShowStudentDropdown(true);
                                                        }}
                                                        onFocus={() => setShowStudentDropdown(true)}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                        placeholder="جستجوی دانش‌آموز..."
                                                        autoComplete="off"
                                                    />
                                                    {showStudentDropdown && filteredStudents.length > 0 && (
                                                        <div className='absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                                                            {filteredStudents.map(student => {
                                                                const grade = grades.find(g => g.id === student.grade_id);
                                                                const className = classes.find(c => c.id === student.class_id);
                                                                return (
                                                                    <div
                                                                        key={student.id}
                                                                        className='p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0'
                                                                        onClick={() => selectStudent(student)}
                                                                    >
                                                                        <div className='font-medium'>{student.name} {student.lastname}</div>
                                                                        <div className='text-sm text-gray-600'>{grade?.grade_name} - {className?.class_name}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    {paymentForm.student_id && (
                                                        <div className='mt-2 p-2 bg-green-50 rounded-lg'>
                                                            <span className='text-sm text-green-700'>انتخاب شده: {paymentForm.student_display}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>مبلغ اصلی (تومان) *</label>
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        value={paymentForm.amount}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                        placeholder="مبلغ به تومان"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>تخفیف (تومان)</label>
                                                    <input
                                                        type="number"
                                                        name="discount"
                                                        value={paymentForm.discount}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                        placeholder="مبلغ تخفیف"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>جریمه (تومان)</label>
                                                    <input
                                                        type="number"
                                                        name="fine"
                                                        value={paymentForm.fine}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                        placeholder="مبلغ جریمه"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>مبلغ نهایی</label>
                                                    <input
                                                        type="number"
                                                        name="net_amount"
                                                        value={paymentForm.net_amount}
                                                        readOnly
                                                        className='w-full p-3 border-2 border-gray-300 bg-gray-50 rounded-lg'
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>ماه مربوطه</label>
                                                    <select
                                                        name="month"
                                                        value={paymentForm.month}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    >
                                                        {Object.entries(monthMap).map(([id, name]) => (
                                                            <option key={id} value={id}>{name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>وضعیت پرداخت</label>
                                                    <select
                                                        name="status"
                                                        value={paymentForm.status}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    >
                                                        <option value="C">پرداخت کامل</option>
                                                        <option value="H">پرداخت نیمه</option>
                                                        <option value="N">پرداخت نشده</option>
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>تاریخ پرداخت</label>
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        value={paymentForm.date}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>تاریخ سررسید</label>
                                                    <input
                                                        type="date"
                                                        name="due"
                                                        value={paymentForm.due}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>فایل ضمیمه</label>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className='mt-6'>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>توضیحات (اختیاری)</label>
                                                <textarea
                                                    name="description"
                                                    value={paymentForm.description}
                                                    onChange={handleFormChange}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    rows="3"
                                                    placeholder="توضیحات مربوط به پرداخت..."
                                                />
                                            </div>
                                            
                                            <div className='flex gap-3 mt-6'>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className='flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                                                >
                                                    {loading ? 'در حال ثبت...' : 'ثبت پرداخت'}
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
                                
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6'>
                                        <h3 className='text-xl font-bold text-gray-800'>لیست پرداخت‌ها</h3>
                                        <div className='flex gap-3'>
                                            <button
                                                onClick={() => setIsAddingPayment(true)}
                                                className='px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2'
                                            >
                                                <FaMoneyBillWave className="w-5 h-5" />
                                                ثبت پرداخت جدید
                                            </button>
                                            <button
                                                onClick={fetchInitialData}
                                                className='px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2'
                                            >
                                                <FaHistory className="w-5 h-5" />
                                                بروزرسانی
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                                        <div>
                                            <label className='block mb-2 text-sm font-medium text-gray-700'>جستجو</label>
                                            <div className='relative'>
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className='w-full p-3 pr-10 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    placeholder="نام دانش‌آموز..."
                                                />
                                                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className='block mb-2 text-sm font-medium text-gray-700'>پایه تحصیلی</label>
                                            <select
                                                value={selectedGrade}
                                                onChange={(e) => setSelectedGrade(e.target.value)}
                                                className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                            >
                                                <option value="all">همه پایه‌ها</option>
                                                {grades.map(grade => (
                                                    <option key={grade.id} value={grade.id}>{grade.grade_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className='block mb-2 text-sm font-medium text-gray-700'>وضعیت</label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                            >
                                                <option value="all">همه وضعیت‌ها</option>
                                                <option value="C">پرداخت کامل</option>
                                                <option value="H">پرداخت نیمه</option>
                                                <option value="N">پرداخت نشده</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className='block mb-2 text-sm font-medium text-gray-700'>ماه</label>
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                            >
                                                <option value="all">همه ماه‌ها</option>
                                                {Object.entries(monthMap).map(([id, name]) => (
                                                    <option key={id} value={id}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className='overflow-x-auto'>
                                        <div className='max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg'>
                                            <table className='w-full'>
                                                <thead className='bg-gray-50 sticky top-0 z-10'>
                                                    <tr>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>شماره رسید</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>دانش‌آموز</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>مبلغ نهایی</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>تاریخ/ماه</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>وضعیت</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>عملیات</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y divide-gray-200'>
                                                    {filteredPayments.slice(0, 50).map((payment) => {
                                                        const StatusIcon = statusMap[payment.status].icon;
                                                        return (
                                                            <tr key={payment.id} className='hover:bg-gray-50'>
                                                                <td className='p-4 font-mono text-sm'>
                                                                    {payment.receipt_number}
                                                                </td>
                                                                <td className='p-4'>
                                                                    <div>
                                                                        <div className='font-medium text-gray-800'>{payment.student_name}</div>
                                                                        <div className='text-sm text-gray-600'>{payment.student_grade} - {payment.student_class}</div>
                                                                    </div>
                                                                </td>
                                                                <td className='p-4'>
                                                                    <div className='font-bold text-gray-800'>{formatAmount(payment.net_amount)}</div>
                                                                    <div className='text-xs text-gray-500'>
                                                                        {payment.discount > 0 && `تخفیف: ${formatAmount(payment.discount)}`}
                                                                        {payment.fine > 0 && ` جریمه: ${formatAmount(payment.fine)}`}
                                                                    </div>
                                                                </td>
                                                                <td className='p-4'>
                                                                    <div className='text-gray-600'>{payment.formatted_date}</div>
                                                                    <div className='text-sm text-gray-500'>{payment.month_name}</div>
                                                                </td>
                                                                <td className='p-4'>
                                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${statusMap[payment.status].color}`}>
                                                                        <StatusIcon className="w-3 h-3" />
                                                                        {statusMap[payment.status].label}
                                                                    </span>
                                                                </td>
                                                                <td className='p-4'>
                                                                    <div className='flex gap-2'>
                                                                        <button
                                                                            onClick={() => handlePrintReceipt(payment)}
                                                                            className='p-2 text-green-600 hover:bg-green-50 rounded-lg'
                                                                            title='چاپ رسید'
                                                                        >
                                                                            <FaPrint className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(payment.id, 'C')}
                                                                            className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg'
                                                                            title='تایید کامل پرداخت'
                                                                            disabled={payment.status === 'C'}
                                                                        >
                                                                            <FaCheck className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(payment.id, 'H')}
                                                                            className='p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg'
                                                                            title='نیمه پرداخت'
                                                                            disabled={payment.status === 'H'}
                                                                        >
                                                                            <FaAdjust className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(payment.id, 'N')}
                                                                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg'
                                                                            title='پرداخت نشده'
                                                                            disabled={payment.status === 'N'}
                                                                        >
                                                                            <FaTimes className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeletePayment(payment.id)}
                                                                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg'
                                                                            title='حذف'
                                                                        >
                                                                            <FaTrash className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {filteredPayments.length === 0 && (
                                            <div className='text-center py-12 border border-gray-200 rounded-lg mt-4'>
                                                <div className='text-gray-400 mb-4'>
                                                    <FaReceipt className="w-16 h-16 mx-auto" />
                                                </div>
                                                <h4 className='text-lg font-medium text-gray-800'>هیچ پرداختی یافت نشد</h4>
                                                <p className='text-gray-600 mt-2'>می‌توانید پرداخت جدیدی ثبت کنید</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === "charts" && (
                            <div className='space-y-6'>
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <div className='flex justify-between items-center mb-6'>
                                        <h3 className='text-xl font-bold text-gray-800'>انتخاب سال تحصیلی</h3>
                                        <select
                                            value={selectedChartAcademicYear?.id || ''}
                                            onChange={(e) => {
                                                const year = academicYears.find(y => y.id === parseInt(e.target.value));
                                                setSelectedChartAcademicYear(year);
                                            }}
                                            className='border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                        >
                                            {academicYears.map(year => (
                                                <option key={year.id} value={year.id}>
                                                    {year.title} {year.active ? '(سال جاری)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                    <div className='bg-white rounded-2xl shadow-xl p-6'>
                                        <h3 className='text-xl font-bold text-gray-800 mb-6'>وضعیت پرداخت‌ها</h3>
                                        <div className='h-80'>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={statusChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, value }) => `${name}: ${value}`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {statusChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [`${value} مورد`, 'تعداد']} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    
                                    <div className='bg-white rounded-2xl shadow-xl p-6'>
                                        <h3 className='text-xl font-bold text-gray-800 mb-6'>پرداخت‌های ماهانه</h3>
                                        <div className='h-80'>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={monthlyChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => [formatAmount(value), 'مبلغ']} />
                                                    <Legend />
                                                    <Bar dataKey="paid" name="پرداخت کامل" fill="#10B981" />
                                                    <Bar dataKey="pending" name="در انتظار" fill="#F59E0B" />
                                                    <Bar dataKey="overdue" name="پرداخت نشده" fill="#EF4444" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    
                                    <div className='bg-white rounded-2xl shadow-xl p-6 lg:col-span-2'>
                                        <h3 className='text-xl font-bold text-gray-800 mb-6'>توزیع پرداخت‌ها بر اساس پایه</h3>
                                        <div className='h-80'>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={gradeChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => [`${value} مورد`, 'تعداد']} />
                                                    <Legend />
                                                    <Bar dataKey="value" name="تعداد پرداخت‌ها" fill="#3B82F6" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className='mt-8 text-center text-gray-500 text-sm'>
                    <p>سیستم مدیریت پرداخت شهریه مدرسه من</p>
                    <p className='mt-1'>سال تحصیلی جاری: {selectedAcademicYear?.title || 'نامشخص'}</p>
                </div>
            </div>
        </div>
    );
}