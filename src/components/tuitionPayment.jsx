import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Logo from '../assets/MadreseManLogo.png';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
    FaReceipt, FaMoneyBillWave, FaCalendarAlt, FaUserGraduate, 
    FaFilter, FaSearch, FaDownload, FaPrint, FaHistory 
} from 'react-icons/fa';

export default function TuitionManagement() {
    // State Management
    const [activeTab, setActiveTab] = useState("payments");
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [isAddingPayment, setIsAddingPayment] = useState(false);
    const [isViewingReceipt, setIsViewingReceipt] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalPending: 0,
        totalStudents: 0,
        monthlyStats: {},
        byGrade: {},
        byStatus: { paid: 0, pending: 0, overdue: 0 }
    });

    // Payment Form State
    const [paymentForm, setPaymentForm] = useState({
        student_id: "",
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        payment_method: "cash",
        description: ""
    });

    // Grade and Class Mappings
    const gradeMap = {
        1: { name: "پایه هفتم", fee: 1500000 },
        2: { name: "پایه هشتم", fee: 1600000 },
        3: { name: "پایه نهم", fee: 1700000 }
    };

    const classMap = {
        1: "کلاس ۷۰۱", 2: "کلاس ۷۰۲", 3: "کلاس ۷۰۳",
        4: "کلاس ۸۰۱", 5: "کلاس ۸۰۲", 6: "کلاس ۸۰۳",
        7: "کلاس ۹۰۱", 8: "کلاس ۹۰۲", 9: "کلاس ۹۰۳"
    };

    const monthMap = {
        1: "فروردین", 2: "اردیبهشت", 3: "خرداد",
        4: "تیر", 5: "مرداد", 6: "شهریور",
        7: "مهر", 8: "آبان", 9: "آذر",
        10: "دی", 11: "بهمن", 12: "اسفند"
    };

    const statusMap = {
        paid: { label: "پرداخت شده", color: "bg-green-100 text-green-800" },
        pending: { label: "در انتظار", color: "bg-yellow-100 text-yellow-800" },
        overdue: { label: "معوقه", color: "bg-red-100 text-red-800" }
    };

    // Generate Mock Students
    const generateMockStudents = () => {
        const mockStudents = [];
        const firstNames = ["علی", "محمد", "حسین", "رضا", "سارا", "فاطمه", "زهرا", "امیر", "مهدی", "پارسا"];
        const lastNames = ["محمدی", "کریمی", "احمدی", "حسینی", "رضایی", "جعفری", "موسوی", "قریشی", "نوری", "اکبری"];
        
        let id = 1;
        for (let grade = 1; grade <= 3; grade++) {
            for (let classNum = 1; classNum <= 3; classNum++) {
                for (let i = 0; i < 5; i++) {
                    mockStudents.push({
                        id: id++,
                        name: firstNames[Math.floor(Math.random() * firstNames.length)],
                        lastname: lastNames[Math.floor(Math.random() * lastNames.length)],
                        national_id: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
                        grade_id: grade,
                        class_id: (grade - 1) * 3 + classNum,
                        birth_date: `138${Math.floor(Math.random() * 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
                    });
                }
            }
        }
        return mockStudents;
    };

    // Generate Mock Payments
    const generateMockPayments = (studentsList) => {
        const mockPayments = [];
        const currentYear = 1403;
        
        studentsList.forEach(student => {
            const studentGrade = student.grade_id;
            const baseAmount = gradeMap[studentGrade].fee;
            
            // Generate payments for last 6 months
            for (let month = 1; month <= 6; month++) {
                const statuses = ['paid', 'pending', 'overdue'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                mockPayments.push({
                    id: `${student.id}-${month}`,
                    student_id: student.id,
                    amount: baseAmount + Math.floor(Math.random() * 100000),
                    payment_date: randomStatus === 'paid' 
                        ? `${currentYear}-${String(month).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
                        : null,
                    month: month,
                    year: currentYear,
                    payment_method: ['cash', 'bank', 'online'][Math.floor(Math.random() * 3)],
                    status: randomStatus,
                    description: randomStatus === 'paid' ? 'پرداخت موفق' : 'در انتظار پرداخت'
                });
            }
        });
        
        return mockPayments;
    };

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return "نامشخص";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fa-IR').format(date);
        } catch {
            return dateString;
        }
    };

    // Format Amount
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + " تومان";
    };

    // Initialize Mock Data
    useEffect(() => {
        const mockStudents = generateMockStudents();
        const mockPayments = generateMockPayments(mockStudents);
        
        // Enrich payments with student info
        const enrichedPayments = mockPayments.map(payment => {
            const student = mockStudents.find(s => s.id === payment.student_id);
            return {
                ...payment,
                student_name: student ? `${student.name} ${student.lastname}` : "نامشخص",
                student_grade: student ? gradeMap[student.grade_id]?.name : "نامشخص",
                student_class: student ? classMap[student.class_id] : "نامشخص",
                formatted_date: payment.payment_date ? formatDate(payment.payment_date) : "پرداخت نشده",
                month_name: monthMap[payment.month],
                status_info: statusMap[payment.status] || statusMap.pending,
                formatted_amount: formatAmount(payment.amount)
            };
        });
        
        setStudents(mockStudents);
        setPayments(enrichedPayments);
        setFilteredPayments(enrichedPayments);
        calculateStats(enrichedPayments, mockStudents);
    }, []);

    // Calculate Statistics
    const calculateStats = (paymentsData, studentsData) => {
        const totalPaid = paymentsData
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const totalPending = paymentsData
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const monthlyStats = {};
        const byGrade = {};
        const byStatus = { paid: 0, pending: 0, overdue: 0 };
        
        paymentsData.forEach(payment => {
            // Monthly stats
            const monthKey = `${payment.year}-${payment.month}`;
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { paid: 0, pending: 0, overdue: 0 };
            }
            monthlyStats[monthKey][payment.status] += payment.amount;
            
            // Grade stats
            const gradeName = payment.student_grade;
            byGrade[gradeName] = (byGrade[gradeName] || 0) + 1;
            
            // Status count
            byStatus[payment.status] = (byStatus[payment.status] || 0) + 1;
        });
        
        setStats({
            totalPaid,
            totalPending,
            totalStudents: studentsData.length,
            monthlyStats,
            byGrade,
            byStatus
        });
    };

    // Handle Form Changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Payment Submission
    const handleSubmitPayment = (e) => {
        e.preventDefault();
        
        if (!paymentForm.student_id || !paymentForm.amount) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "لطفا فیلدهای ضروری را پر کنید"
            });
            return;
        }
        
        // Find selected student
        const selectedStudent = students.find(s => s.id === parseInt(paymentForm.student_id));
        if (!selectedStudent) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "دانش‌آموز انتخاب شده یافت نشد"
            });
            return;
        }
        
        // Create new payment
        const newPayment = {
            id: `${Date.now()}-${Math.random()}`,
            student_id: parseInt(paymentForm.student_id),
            amount: parseInt(paymentForm.amount),
            payment_date: paymentForm.payment_date,
            month: parseInt(paymentForm.month),
            year: parseInt(paymentForm.year),
            payment_method: paymentForm.payment_method,
            status: "paid",
            description: paymentForm.description,
            student_name: `${selectedStudent.name} ${selectedStudent.lastname}`,
            student_grade: gradeMap[selectedStudent.grade_id]?.name,
            student_class: classMap[selectedStudent.class_id],
            formatted_date: formatDate(paymentForm.payment_date),
            month_name: monthMap[paymentForm.month],
            status_info: statusMap.paid,
            formatted_amount: formatAmount(parseInt(paymentForm.amount))
        };
        
        // Add to payments list
        const updatedPayments = [newPayment, ...payments];
        setPayments(updatedPayments);
        setFilteredPayments(updatedPayments);
        
        // Recalculate stats
        calculateStats(updatedPayments, students);
        
        Swal.fire({
            icon: "success",
            title: "موفقیت",
            text: "پرداخت با موفقیت ثبت شد",
            timer: 2000
        });
        
        resetForm();
    };

    // Handle Payment Status Update
    const handleUpdateStatus = (paymentId, newStatus) => {
        const updatedPayments = payments.map(payment => {
            if (payment.id === paymentId) {
                return {
                    ...payment,
                    status: newStatus,
                    status_info: statusMap[newStatus]
                };
            }
            return payment;
        });
        
        setPayments(updatedPayments);
        setFilteredPayments(updatedPayments);
        calculateStats(updatedPayments, students);
        
        Swal.fire({
            icon: "success",
            title: "موفقیت",
            text: "وضعیت پرداخت بروزرسانی شد"
        });
    };

    // View Receipt
    const handleViewReceipt = (payment) => {
        setSelectedPayment(payment);
        setIsViewingReceipt(true);
        
        Swal.fire({
            title: 'فاکتور پرداخت',
            html: `
                <div class="text-right p-4">
                    <h3 class="text-xl font-bold mb-4">رسید پرداخت شهریه</h3>
                    <div class="space-y-2">
                        <p><strong>دانش‌آموز:</strong> ${payment.student_name}</p>
                        <p><strong>مبلغ:</strong> ${payment.formatted_amount}</p>
                        <p><strong>تاریخ پرداخت:</strong> ${payment.formatted_date}</p>
                        <p><strong>ماه مربوطه:</strong> ${payment.month_name} ${payment.year}</p>
                        <p><strong>روش پرداخت:</strong> ${payment.payment_method === 'cash' ? 'نقدی' : 'کارت‌به‌کارت'}</p>
                        <p><strong>وضعیت:</strong> <span class="${payment.status_info.color} px-2 py-1 rounded">${payment.status_info.label}</span></p>
                        ${payment.description ? `<p><strong>توضیحات:</strong> ${payment.description}</p>` : ''}
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'چاپ',
            cancelButtonText: 'بستن',
            showCloseButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.print();
            }
        });
    };

    // Reset Form
    const resetForm = () => {
        setPaymentForm({
            student_id: "",
            amount: "",
            payment_date: new Date().toISOString().split('T')[0],
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            payment_method: "cash",
            description: ""
        });
        setIsAddingPayment(false);
    };

    // Filter Payments
    useEffect(() => {
        let filtered = [...payments];
        
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.student_name.includes(searchTerm) ||
                payment.student_id.toString().includes(searchTerm)
            );
        }
        
        if (selectedGrade !== "all") {
            filtered = filtered.filter(payment => 
                payment.student_grade === gradeMap[selectedGrade]?.name
            );
        }
        
        if (selectedStatus !== "all") {
            filtered = filtered.filter(payment => payment.status === selectedStatus);
        }
        
        if (selectedMonth !== "all") {
            filtered = filtered.filter(payment => payment.month.toString() === selectedMonth);
        }
        
        setFilteredPayments(filtered);
    }, [searchTerm, selectedGrade, selectedStatus, selectedMonth, payments]);

    // Chart Data
    const statusChartData = [
        { name: "پرداخت شده", value: stats.byStatus.paid, color: "#10B981" },
        { name: "در انتظار", value: stats.byStatus.pending, color: "#F59E0B" },
        { name: "معوقه", value: stats.byStatus.overdue, color: "#EF4444" }
    ];

    const monthlyChartData = Object.entries(stats.monthlyStats)
        .slice(-6)
        .map(([month, data]) => ({
            name: month.split('-')[1] + '/' + month.split('-')[0],
            paid: data.paid || 0,
            pending: data.pending || 0,
            overdue: data.overdue || 0
        }));

    const gradeChartData = Object.entries(stats.byGrade).map(([grade, count]) => ({
        name: grade,
        value: count
    }));

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 lg:p-6'>
            <div className='max-w-7xl mx-auto'>
                
                {/* Header */}
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
                                <p className='text-gray-600 mt-1'>پیگیری و مدیریت پرداخت‌های ماهانه دانش‌آموزان</p>
                            </div>
                        </div>
                        
                        <div className='flex gap-4'>
                            <div className='text-right'>
                                <p className='text-sm text-gray-600'>مجموع پرداخت‌ها</p>
                                <p className='text-2xl font-bold text-green-600'>
                                    {stats.totalPaid.toLocaleString('fa-IR')} تومان
                                </p>
                            </div>
                            <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold'>
                                <FaReceipt className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    
                    {/* Left Column - Stats */}
                    <div className='lg:col-span-1 space-y-6'>
                        
                        {/* Quick Stats */}
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>آمار سریع</h3>
                            <div className='space-y-4'>
                                <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200'>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <p className='text-sm text-gray-600'>پرداخت شده</p>
                                            <p className='text-xl font-bold text-green-700'>
                                                {stats.totalPaid.toLocaleString('fa-IR')} تومان
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
                                                {stats.totalPending.toLocaleString('fa-IR')} تومان
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
                        
                        {/* Payment Status */}
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
                        
                        {/* Quick Actions */}
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
                                    onClick={() => window.location.reload()}
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
                                            text: 'این قابلیت در نسخه Mock فعال نیست'
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
                    
                    {/* Right Column - Main Content */}
                    <div className='lg:col-span-3'>
                        
                        {/* Tabs Navigation */}
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
                                <button
                                    onClick={() => {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'گزارشات',
                                            text: 'این بخش در نسخه Mock نمایش داده می‌شود'
                                        });
                                    }}
                                    className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors duration-300 ${activeTab === "reports" ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    گزارشات
                                </button>
                            </div>
                        </div>
                        
                        {/* Payments Tab */}
                        {activeTab === "payments" && (
                            <div className='space-y-6'>
                                
                                {/* Add Payment Form */}
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
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>دانش‌آموز *</label>
                                                    <select
                                                        name="student_id"
                                                        value={paymentForm.student_id}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                        required
                                                    >
                                                        <option value="">انتخاب دانش‌آموز</option>
                                                        {students.map(student => (
                                                            <option key={student.id} value={student.id}>
                                                                {student.name} {student.lastname} - {gradeMap[student.grade_id]?.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>مبلغ (تومان) *</label>
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
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>تاریخ پرداخت</label>
                                                    <input
                                                        type="date"
                                                        name="payment_date"
                                                        value={paymentForm.payment_date}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
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
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>روش پرداخت</label>
                                                    <select
                                                        name="payment_method"
                                                        value={paymentForm.payment_method}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    >
                                                        <option value="cash">نقدی</option>
                                                        <option value="bank">کارت به کارت</option>
                                                        <option value="online">درگاه آنلاین</option>
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className='block mb-2 text-sm font-medium text-gray-700'>سال</label>
                                                    <input
                                                        type="number"
                                                        name="year"
                                                        value={paymentForm.year}
                                                        onChange={handleFormChange}
                                                        className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                        min="1400"
                                                        max="1500"
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
                                                    className='flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-300'
                                                >
                                                    ثبت پرداخت
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
                                                onClick={() => window.location.reload()}
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
                                                    className='w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none'
                                                    placeholder="نام دانش‌آموز..."
                                                />
                                                <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
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
                                                {Object.entries(gradeMap).map(([id, grade]) => (
                                                    <option key={id} value={id}>{grade.name}</option>
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
                                                <option value="paid">پرداخت شده</option>
                                                <option value="pending">در انتظار</option>
                                                <option value="overdue">معوقه</option>
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
                                    
                                    {/* Payments Table */}
                                    <div className='overflow-x-auto'>
                                        <div className='max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg'>
                                            <table className='w-full'>
                                                <thead className='bg-gray-50 sticky top-0 z-10'>
                                                    <tr>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>دانش‌آموز</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>مبلغ</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>تاریخ/ماه</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>وضعیت</th>
                                                        <th className='p-4 text-right font-semibold text-gray-700'>عملیات</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y divide-gray-200'>
                                                    {filteredPayments.slice(0, 50).map((payment) => (
                                                        <tr key={payment.id} className='hover:bg-gray-50'>
                                                            <td className='p-4'>
                                                                <div>
                                                                    <div className='font-medium text-gray-800'>{payment.student_name}</div>
                                                                    <div className='text-sm text-gray-600'>{payment.student_grade} - {payment.student_class}</div>
                                                                </div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className='font-bold text-gray-800'>{payment.amount.toLocaleString('fa-IR')} تومان</div>
                                                                <div className='text-sm text-gray-600'>{payment.month_name} {payment.year}</div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className='text-gray-600'>{payment.formatted_date}</div>
                                                                <div className='text-sm text-gray-500'>
                                                                    {payment.payment_method === 'cash' ? 'نقدی' : 
                                                                     payment.payment_method === 'bank' ? 'کارت‌به‌کارت' : 'آنلاین'}
                                                                </div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${payment.status_info.color}`}>
                                                                    {payment.status_info.label}
                                                                </span>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className='flex gap-2'>
                                                                    <button
                                                                        onClick={() => handleViewReceipt(payment)}
                                                                        className='p-2 text-green-600 hover:bg-green-50 rounded-lg'
                                                                        title='مشاهده فاکتور'
                                                                    >
                                                                        <FaReceipt className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(payment.id, 'paid')}
                                                                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg'
                                                                        title='تایید پرداخت'
                                                                        disabled={payment.status === 'paid'}
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(payment.id, 'overdue')}
                                                                        className='p-2 text-red-600 hover:bg-red-50 rounded-lg'
                                                                        title='علامت‌گذاری معوقه'
                                                                        disabled={payment.status === 'overdue'}
                                                                    >
                                                                        ⚠
                                                                    </button>
                                                                    <button 
                                                                        className='p-2 text-gray-600 hover:bg-gray-50 rounded-lg' 
                                                                        title='چاپ'
                                                                        onClick={() => window.print()}
                                                                    >
                                                                        <FaPrint className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {/* No Results */}
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
                        
                        {/* Charts Tab */}
                        {activeTab === "charts" && (
                            <div className='space-y-6'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                    {/* Payment Status Chart */}
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
                                    
                                    {/* Monthly Payments Chart */}
                                    <div className='bg-white rounded-2xl shadow-xl p-6'>
                                        <h3 className='text-xl font-bold text-gray-800 mb-6'>پرداخت‌های ۶ ماه اخیر</h3>
                                        <div className='h-80'>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={monthlyChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => [`${value.toLocaleString('fa-IR')} تومان`, 'مبلغ']} />
                                                    <Legend />
                                                    <Bar dataKey="paid" name="پرداخت شده" fill="#10B981" />
                                                    <Bar dataKey="pending" name="در انتظار" fill="#F59E0B" />
                                                    <Bar dataKey="overdue" name="معوقه" fill="#EF4444" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    
                                    {/* Grade Distribution */}
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
                                {/* this is a time capsule  */}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                <div className='mt-8 text-center text-gray-500 text-sm'>
                    <p>سیستم مدیریت پرداخت شهریه مدرسه من - نسخه Mock</p>
                    <p className='mt-1'>تمام داده‌ها به صورت نمونه‌سازی شده نمایش داده می‌شوند</p>
                </div>
            </div>
        </div>
    );
}