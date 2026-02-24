import React, { useEffect, useState } from 'react'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'
import Logo from '../assets/MadreseManLogo.png'
import { useParams, useHistory } from 'react-router-dom'
import axios from 'axios'
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line, AreaChart, Area,
    ResponsiveContainer
} from 'recharts'
import { FaCashRegister, FaFilePdf, FaRegFileExcel, FaRegFilePdf } from 'react-icons/fa'
import _ from 'lodash'
import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

export default function BudgetManagement() {
    const [mailSent, setMailSent] = useState(false)
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const { usermail } = useParams()
    const history = useHistory()
    const [activeTab, setActiveTab] = useState("budgets") // Changed default to "budgets"
    const [budgetYear, setBudgetYear] = useState(new Date().getFullYear() + 1400)
    const [selectedBudget, setSelectedBudget] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [transactions, setTransactions] = useState([])
    const [budgets, setBudgets] = useState([])
    const [isAddingTransaction, setIsAddingTransaction] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)
    const [isAddingBudget, setIsAddingBudget] = useState(false) // New state for budget creation
    const [transferData, setTransferData] = useState({
        fromBudget: "",
        toBudget: "",
        amount: "",
        description: "انتقال بودجه"
    })

    // New state for budget creation form
    const [newBudget, setNewBudget] = useState({
        budget_name: "",
        budget_description: "",
        budget_amount: "",
        color_code: ""
    })

    const departments = [
        { id: "general", name: "عمومی" },
        { id: "elementary", name: "ابتدایی" },
        { id: "middle", name: "متوسطه اول" },
        { id: "high", name: "متوسطه دوم" },
        { id: "administration", name: "اداری" },
        { id: "maintenance", name: "تعمیرات" },
    ]

    const transactionTypes = [
        { id: false, name: "برداشت", color: "text-red-600 bg-red-50" },
        { id: true, name: "واریز", color: "text-green-600 bg-green-50" },
    ]

    const [newTransaction, setNewTransaction] = useState({
        is_deposit: true,
        transaction_amount: 0,
        date: new Date().toISOString().split('T')[0],
        budget_id: 0
    })

    // Color options for budget creation
    const colorOptions = [
        { value: "blue-600", name: "آبی" },
        { value: "orange-600", name: "نارنجی" },
        { value: "green-600", name: "سبز" },
        { value: "purple-600", name: "بنفش" },
        { value: "red-600", name: "قرمز" },
        { value: "yellow-500", name: "زرد" },
    ]

    useEffect(() => {
        GetBudgets()
        GetTransactions()
    }, [])

    const totalIncome = transactions
        .filter(t => t.is_deposit == true)
        .reduce((sum, t) => sum + t.transaction_amount, 0)

    const totalExpenses = transactions
        .filter(t => t.is_deposit == false)
        .reduce((sum, t) => sum + t.transaction_amount, 0)
    var totalAllocated = totalIncome - totalExpenses
    for (let index = 0; index < budgets.length; index++) {
        const element = budgets[index];
        totalAllocated += element.budget_amount
    }

    // Handle budget click
    const handleBudgetClick = (budget) => {
        let tempBudget = budget
        var SelectedBudgetTransactionList = _.filter(transactions, { "budget_id": budget.id })
        var DepositTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": true })
        var WithdrawTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": false })
        var DepositSum = 0
        var WithdrawSum = 0
        for (let index = 0; index < DepositTransactions.length; index++) {
            const element = DepositTransactions[index];
            DepositSum += element.transaction_amount
        } for (let index = 0; index < WithdrawTransactions.length; index++) {
            const element = WithdrawTransactions[index];
            WithdrawSum += element.transaction_amount
        }
        tempBudget.total_withdraw = WithdrawSum
        tempBudget.total_deposit = DepositSum
        tempBudget.transactions = SelectedBudgetTransactionList
        setSelectedBudget(tempBudget)

        setActiveTab("budgetDetail")
    }

    function GetBudgets() {
        axios.get(`http://localhost:5217/api/v1/Budget/GetAll?session=${localStorage.getItem("token")}`)
            .then(res => {
                setBudgets(res.data)
            })
            .catch(err => {
                alert("error")
                console.log(err)
            })
    }
    function GetTransactions() {
        axios.get(`http://localhost:5217/api/v1/BudgetTransaction/GetAll?session=${localStorage.getItem("token")}`)
            .then(res => {
                setTransactions(res.data)
            })
            .catch(err => {
                alert("error")
                console.log(err)
            })
    }

    // Handle add transaction   
    const handleAddTransaction = () => {
        if (!newTransaction.transaction_amount || !newTransaction.budget_id || newTransaction.is_deposit == null) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "لطفا تمامی فیلد ها را پر کنید"
            })
            console.log(newTransaction)
            return
        }

        const newTrans = {
            ...newTransaction,
            transaction_amount: parseInt(newTransaction.transaction_amount)

        }
        console.log(newTrans)
        setIsAddingTransaction(false)
        setNewTransaction({
            is_deposit: true,
            transaction_amount: 0,
            date: new Date().toISOString().split('T')[0],
            budget_id: 0
        })

        axios.post(`http://localhost:5217/api/v1/BudgetTransaction/Add?session=${localStorage.getItem("token")}`, newTrans)
            .then(res => {
                Swal.fire({
                    icon: "success",
                    title: "ثبت شد",
                    text: "تراکنش جدید با موفقیت ثبت شد",
                    timer: 2000,
                    showConfirmButton: false
                })
                setTransactions([newTrans, ...transactions])
                GetTransactions()
                GetBudgets()
            })


    }

    const handleCreateBudget = () => {
        if (!newBudget.budget_name || !newBudget.budget_amount || !newBudget.budget_description || !newBudget.color_code) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "لطفا نام و مبلغ بودجه را وارد کنید"
            })
            return
        }

        const budgetData = {
            ...newBudget,
            budget_amount: parseInt(newBudget.budget_amount),
        }

        // In a real application, you would send this to your backend
        setIsAddingBudget(false)

        setNewBudget({
            budget_name: "",
            budget_description: "",
            allocated: "",
            color: "",
        })
        axios.post(`http://localhost:5217/api/v1/Budget/Add?session=${localStorage.getItem("token")}`, budgetData)
            .then((res) => {
                setBudgets([...budgets, budgetData])
                Swal.fire({
                    icon: "success",
                    title: "بودجه ایجاد شد",
                    text: "بودجه جدید با موفقیت ایجاد گردید",
                    timer: 2000,
                    showConfirmButton: false
                })
            })
            .catch(err => {
                console.log(err)
            })

    }

    // Handle transfer

    function deleteTransaction(id) {
        axios.delete(`http://localhost:5217/api/v1/BudgetTransaction/Delete/${id}?session=${localStorage.getItem("token")}`)
            .then((res) => {
                Swal.fire({
                    icon: "success",
                    title: "حذف موفق",
                    text: `تراکنش با موفقیت حذف شد`,
                    timer: 2000,
                    showConfirmButton: false
                })
                var deleted_tranaction = _.find(transactions, { "id": id })
                for (let index = 0; index < budgets.length; index++) {
                    const element = budgets[index];
                    if (element.id == id) {
                        if (deleted_tranaction.is_deposit == true) {
                            budgets[index].budget_amount -= newTrans.transaction_amount
                        }
                        else {
                            budgets[index].budget_amount += newTrans.transaction_amount
                        }
                    }

                }
                for (let index = 0; index < transactions.length; index++) {
                    const element = transactions[index];
                    if (element.id == id) {
                        setTransactions(transactions.filter(e => e.id !== id))
                        location.pathname = "/budget"
                        return
                    }
                }



            })
            .catch(err => {
                alert("error")
                console.log(err)
            })

    }

    const handleTransfer = () => {
        if (!transferData.fromBudget || !transferData.toBudget || !transferData.amount) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: "لطفا تمام فیلدهای انتقال را پر کنید"
            })
            return
        }

        const amount = parseInt(transferData.amount)

        // Check if source budget has enough remaining
        const fromBudget = budgets.find(b => b.id === transferData.fromBudget)
        const fromRemaining = fromBudget.allocated - fromBudget.spent

        if (amount > fromRemaining) {
            Swal.fire({
                icon: "error",
                title: "خطا",
                text: `بودجه ${fromBudget.name} تنها ${formatCurrency(fromRemaining)} مانده دارد`
            })
            return
        }

        Swal.fire({
            icon: "success",
            title: "انتقال موفق",
            text: `مبلغ ${formatCurrency(amount)} با موفقیت انتقال یافت`,
            timer: 2000,
            showConfirmButton: false
        })
    }

    // Handle approve transaction

    function findBudgetById(BudgetId) {
        for (let index = 0; index < budgets.length; index++) {
            const element = budgets[index];
            if (element.id == BudgetId) {
                return element;
            }
        }
    }
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + " تومان"
    }

    // Data for charts
    const budgetChartData = budgets.map(budget => ({
        name: budget.budget_name,
        allocated: budget.allocated / 1000000, // Convert to million
        spent: budget.spent / 1000000,
        remaining: (budget.allocated - budget.spent) / 1000000
    }))

    const spendingByDepartment = departments.map(dept => {
        const deptExpenses = transactions
            .filter(t => t.department === dept.id && t.type === "expense" && t.approved)
            .reduce((sum, t) => sum + t.amount, 0)
        return {
            name: dept.name,
            value: deptExpenses / 1000000
        }
    })

    const monthlyData = [
        { month: 'فروردین', income: 120, expense: 85, profit: 35 },
        { month: 'اردیبهشت', income: 90, expense: 75, profit: 15 },
        { month: 'خرداد', income: 110, expense: 92, profit: 18 },
        { month: 'تیر', income: 80, expense: 65, profit: 15 },
        { month: 'مرداد', income: 95, expense: 78, profit: 17 },
        { month: 'شهریور', income: 105, expense: 88, profit: 17 },
    ]


    const exportBudgetToCSVSimple = () => {
        const headers = ['Budget Name', 'Sum of Withdraws', 'Sum of Deposits', 'Description', 'Budget Amount'];

        // Create a copy of budgets instead of referencing
        var tempbudgets = JSON.parse(JSON.stringify(budgets)); // Deep copy

        for (let index = 0; index < tempbudgets.length; index++) {
            const element = tempbudgets[index];
            var SelectedBudgetTransactionList = _.filter(transactions, { "budget_id": element.id });
            var DepositTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": true });
            var WithdrawTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": false });

            var DepositSum = 0;
            var WithdrawSum = 0;

            for (let index = 0; index < DepositTransactions.length; index++) {
                const element = DepositTransactions[index];
                DepositSum += element.transaction_amount;
            }

            for (let index = 0; index < WithdrawTransactions.length; index++) {
                const element = WithdrawTransactions[index];
                WithdrawSum += element.transaction_amount;
            }

            tempbudgets[index].total_withdraw = WithdrawSum;
            tempbudgets[index].total_deposit = DepositSum;
        }

        const escapeCSV = (str) => {
            if (str === null || str === undefined) return '';
            const stringValue = String(str);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const csvContent = [
            headers.join(','),
            ...tempbudgets.map(item => [
                escapeCSV(item.budget_name || item.name), // Try both property names
                item.total_withdraw?.toFixed(2) || '0.00',
                item.total_deposit?.toFixed(2) || '0.00',
                escapeCSV(item.budget_description || item.description || ''), // Try both property names
                item.budget_amount?.toFixed(2) || '0.00'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Added charset for Persian text
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget_export_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    const exportBudgetToXLSX = () => {
        // Prepare data for Excel
        const excelData = [];

        // Add headers
        excelData.push([
            'Budget Name',
            'Sum of Withdraws',
            'Sum of Deposits',
            'Description',
            'Budget Amount'
        ]);

        // Create a copy of budgets
        var tempbudgets = JSON.parse(JSON.stringify(budgets));

        // Calculate totals
        for (let index = 0; index < tempbudgets.length; index++) {
            const element = tempbudgets[index];
            var SelectedBudgetTransactionList = _.filter(transactions, { "budget_id": element.id });
            var DepositTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": true });
            var WithdrawTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": false });

            var DepositSum = 0;
            var WithdrawSum = 0;

            for (let index = 0; index < DepositTransactions.length; index++) {
                const element = DepositTransactions[index];
                DepositSum += element.transaction_amount;
            }

            for (let index = 0; index < WithdrawTransactions.length; index++) {
                const element = WithdrawTransactions[index];
                WithdrawSum += element.transaction_amount;
            }

            tempbudgets[index].total_withdraw = WithdrawSum;
            tempbudgets[index].total_deposit = DepositSum;
        }

        // Add data rows
        tempbudgets.forEach(item => {
            excelData.push([
                item.budget_name || item.name || '',  // Budget Name
                item.total_withdraw?.toFixed(2) || '0.00',  // Withdraws
                item.total_deposit?.toFixed(2) || '0.00',  // Deposits
                item.budget_description || item.description || '',  // Description
                item.budget_amount?.toFixed(2) || '0.00'  // Budget Amount
            ]);
        });

        // Create worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths (optional)
        ws['!cols'] = [
            { wch: 30 }, // Budget Name
            { wch: 20 }, // Withdraws
            { wch: 20 }, // Deposits
            { wch: 40 }, // Description
            { wch: 20 }  // Budget Amount
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Budget Report');
        const fileName = `budget_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };
    const exportTranscationToXLSX = () => {
        // Prepare data for Excel
        const excelData = [];

        // Add headers
        excelData.push([
            'Budget Name',
            'type',
            'Transactions Amount'
        ]);

        // Create a copy of budgets
        var tempTransactions = transactions;
        tempTransactions.forEach(item => {
            excelData.push([
                _.find(budgets, { id: item.budget_id }).budget_name,  // Budget Name
                item.is_deposit == true ? "واریز" : "برداشت",  // type
                item.transaction_amount?.toFixed(2) || '0.00'  // Budget Amount
            ]);
        });

        // Create worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths (optional)
        ws['!cols'] = [
            { wch: 20 }, // Budget Name
            { wch: 20 }, // Withdraws
            { wch: 30 }, // Deposits
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions Report');
        const fileName = `transactions_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 lg:p-6' dir='rtl'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='bg-white rounded-2xl shadow-xl p-6 mb-6'>
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-blue-100 py-4 rounded-2xl'>
                                <FaCashRegister className='w-[4vw] h-[4vh]' />
                            </div>
                            <div>
                                <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>
                                    مدیریت بودجه و امور مالی
                                </h1>
                                <p className='text-gray-600 mt-1'>سیستم یکپارچه مدیریت مالی مدرسه</p>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            <div className='text-right'>
                                <p className='text-sm text-gray-600'>سال مالی: {budgetYear}</p>
                                <p className='font-medium text-gray-800'>دسترسی: مدیر مالی</p>
                            </div>
                            <div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold'>
                                م
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    {/* Left Column - Authentication & Quick Stats */}
                    <div className='lg:col-span-1 space-y-6'>

                        {/* Quick Stats */}
                        <div className='bg-white rounded-2xl shadow-xl p-6'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4'>خلاصه مالی</h3>

                            <div className='space-y-4'>
                                <div className='bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-amber-200'>
                                    <div className='flex justify-center items-center mb-2'>
                                        <span className='text-sm text-gray-600'>پول تخصیص داده شده</span>

                                    </div>
                                    <div className='flex justify-center items-center' >
                                        <span className='text-lg font-bold text-yellow-700'>{formatCurrency(totalAllocated)}</span>
                                    </div>
                                </div>
                                <div className='bg-gradient-to-r from-red-50 to-red-50 rounded-xl p-4 border border-red-200'>
                                    <div className='flex justify-between items-center mb-2'>
                                        <span className='text-sm text-gray-600'>برداشت شده</span>
                                        <span className='text-lg font-bold text-red-700'>{formatCurrency(totalExpenses)}</span>
                                    </div>
                                </div>

                                <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200'>
                                    <div className='flex justify-between items-center mb-2'>
                                        <span className='text-sm text-gray-600'>واریز شده</span>
                                        <span className='text-lg font-bold text-green-700'>{formatCurrency(totalIncome)}</span>
                                    </div>
                                </div>


                                {/* Progress Bar */}
                                <div className='mt-4'>
                                    <div className='flex justify-between text-sm text-gray-600 mb-1'>
                                        <span>میزان مصرف بودجه</span>
                                        {/* <span>{spentPercentage.toFixed(1)}%</span> */}
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-2'>
                                        {/* <div
                                            className={`h-2 rounded-full ${spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                        ></div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='mt-6 grid grid-cols-1 md:grid-cols-1 gap-4' dir='rtl'>
                            <button onClick={exportBudgetToXLSX} className='p-4 bg-emerald-50 flex justify-around border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors duration-300 '>
                                <div className='flex justify-center items-center' >
                                    <FaRegFileExcel className='w-7 h-7' color="green" />
                                </div>
                                <div className='text-center' >
                                    <div className='text-emerald-600 font-medium'>دانلود لیست بودجه ها</div>
                                    <div className='text-sm text-emerald-500 mt-1'>Excel (xlsx)</div>
                                </div>
                            </button>
                            <button onClick={exportTranscationToXLSX} className='p-4 bg-emerald-50 flex justify-around border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors duration-300 '>
                                <div className='flex justify-center items-center' >
                                    <FaRegFileExcel className='w-7 h-7' color="green" />
                                </div>
                                <div className='text-center' >
                                    <div className='text-emerald-600 font-medium'>دانلود لیست تراکنش ها</div>
                                    <div className='text-sm text-emerald-500 mt-1'>Excel (xlsx)</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className='lg:col-span-3'>
                        {/* Tabs Navigation - UPDATED */}
                        <div className='bg-white rounded-2xl shadow-xl mb-6'>
                            <div className='flex overflow-x-auto border-b border-gray-200'>
                                <button
                                    onClick={() => { setActiveTab("budgets"); setSelectedBudget(null); }}
                                    className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors duration-300 ${activeTab === "budgets" ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    بودجه‌ها {/* Changed from بررسی کلی to بودجه‌ها */}
                                </button>
                                <button
                                    onClick={() => { setActiveTab("transactions"); setSelectedBudget(null); }}
                                    className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors duration-300 ${activeTab === "transactions" ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    تراکنش‌ها
                                </button>
                                <button
                                    disabled
                                    onClick={() => { setActiveTab("reports"); setSelectedBudget(null); }}
                                    className={`flex-1 min-w-[120px] py-4 disabled:bg-gray-200 rounded-2xl text-center font-medium transition-colors duration-300 ${activeTab === "reports" ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    گزارشات
                                </button>
                            </div>
                        </div>

                        {/* Content based on active tab */}
                        {activeTab === "budgets" && (
                            <div className='space-y-6'>
                                {/* Budget Creation Form */}
                                {isAddingBudget && (
                                    <div className='bg-white rounded-2xl shadow-xl p-6'>
                                        <div className='flex justify-between items-center mb-6'>
                                            <h3 className='text-xl font-bold text-gray-800'>ایجاد بودجه جدید</h3>
                                            <button
                                                onClick={() => setIsAddingBudget(false)}
                                                className='text-gray-500 hover:text-gray-700'
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                            <div>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>نام بودجه *</label>
                                                <input
                                                    type="text"
                                                    value={newBudget.budget_name}
                                                    onChange={(e) => setNewBudget({ ...newBudget, budget_name: e.target.value })}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                                    placeholder="مثال: بودجه ورزشی"
                                                />
                                            </div>

                                            <div>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>مبلغ تخصیص یافته (تومان) *</label>
                                                <input
                                                    type="number"
                                                    value={newBudget.budget_amount}
                                                    onChange={(e) => setNewBudget({ ...newBudget, budget_amount: e.target.value })}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                                    placeholder="مبلغ را وارد کنید"
                                                    dir='rtl'
                                                />
                                            </div>

                                            <div>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>رنگ بودجه</label>
                                                <div className='grid grid-cols-3 gap-2'>
                                                    {colorOptions.map((color) => (
                                                        <button
                                                            key={color.value}
                                                            type='button'
                                                            onClick={() => setNewBudget({ ...newBudget, color_code: color.value })}
                                                            className={`h-10 bg-${color.value} rounded-lg border-2 ${newBudget.color_code === color.value ? 'border-gray-800' : 'border-gray-300'}`}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className='md:col-span-1'>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>توضیحات</label>
                                                <textarea
                                                    value={newBudget.budget_description}
                                                    onChange={(e) => setNewBudget({ ...newBudget, budget_description: e.target.value })}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                                    rows="3"
                                                    placeholder="توضیحاتی درباره این بودجه وارد کنید..."
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className='flex gap-3 mt-6'>
                                            <button
                                                onClick={handleCreateBudget}
                                                className='flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-300'
                                            >
                                                ایجاد بودجه
                                            </button>
                                            <button
                                                onClick={() => setIsAddingBudget(false)}
                                                className='flex-1 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-300'
                                            >
                                                انصراف
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Budget Categories Grid */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <div className='flex justify-between items-center mb-6'>
                                        <h3 className='text-xl font-bold text-gray-800'>مدیریت بودجه‌ها</h3>
                                        <div className='flex gap-3'>

                                            <button
                                                onClick={() => setIsAddingBudget(true)}
                                                className='px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2'
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                ایجاد بودجه جدید
                                            </button>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {budgets.map((budget) => {
                                            const remaining = budget.allocated - budget.spent
                                            var border_color_string = `border-${budget.color_code}`
                                            let tempBudget = budget
                                            var SelectedBudgetTransactionList = _.filter(transactions, { "budget_id": budget.id })
                                            var DepositTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": true })
                                            var WithdrawTransactions = _.filter(SelectedBudgetTransactionList, { "is_deposit": false })
                                            var DepositSum = 0
                                            var WithdrawSum = 0
                                            for (let index = 0; index < DepositTransactions.length; index++) {
                                                const element = DepositTransactions[index];
                                                DepositSum += element.transaction_amount
                                            } for (let index = 0; index < WithdrawTransactions.length; index++) {
                                                const element = WithdrawTransactions[index];
                                                WithdrawSum += element.transaction_amount
                                            }
                                            tempBudget.total_withdraw = WithdrawSum
                                            tempBudget.total_deposit = DepositSum
                                            var TotalTransactionOutput = DepositSum - WithdrawSum
                                            if (TotalTransactionOutput > 0) {
                                                var FirstAllocatedBudget = budget.budget_amount - TotalTransactionOutput
                                            }
                                            else {
                                                var FirstAllocatedBudget = budget.budget_amount + TotalTransactionOutput
                                            }
                                            var usedPercentage = ((-TotalTransactionOutput) * 100 / FirstAllocatedBudget).toFixed(1)
                                            var usedPercentageForStyling = usedPercentage < 0 ? -usedPercentage : usedPercentage
                                            return (
                                                <div
                                                    key={budget.id}
                                                    onClick={() => handleBudgetClick(budget)}
                                                    className={`bg-gray-50 rounded-xl p-4 border-3 ${border_color_string} hover:shadow-md transition-all duration-500 cursor-pointer`}
                                                >

                                                    <div className='flex items-center gap-3 mb-2'>
                                                        <h4 className='font-semibold text-gray-800'>{budget.budget_name}</h4>
                                                    </div>
                                                    <p className='text-xs line-clamp-2 text-gray-600 mb-3'>{budget.budget_description}</p>

                                                    <div className='space-y-2'>
                                                        <div className='flex justify-between text-sm'>
                                                            <span className='text-gray-600'>واریز شده :</span>
                                                            <span className='font-medium'>{formatCurrency(tempBudget.total_deposit)}</span>
                                                        </div>
                                                        <div className='flex justify-between text-sm'>
                                                            <span className='text-gray-600'>برداشت شده:</span>
                                                            <span className='font-medium'>{formatCurrency(tempBudget.total_withdraw)}</span>
                                                        </div>
                                                        <div className='flex justify-between text-sm'>
                                                            <span className='text-gray-600'>مانده:</span>
                                                            <span className='font-medium text-emerald-600'>{formatCurrency(budget.budget_amount)}</span>
                                                        </div>
                                                    </div>

                                                    <div className='mt-3'>
                                                        <div className='flex justify-between text-xs text-gray-500 mb-1'>
                                                            <span>میزان مصرف</span>
                                                            <span dir='ltr'>{usedPercentage}%</span>
                                                        </div>
                                                        <div className='w-full bg-gray-200 rounded-full h-1.5' dir='ltr'>
                                                            <div
                                                                className={`h-1.5 rounded-full`}
                                                                style={{
                                                                    width: `${usedPercentageForStyling}%`,
                                                                    backgroundColor: `${usedPercentage > 0 ? "red" : "green"}`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Quick Chart */}

                            </div>
                        )}

                        {selectedBudget && (
                            <div className='bg-white rounded-2xl shadow-xl p-6'>
                                <div className='flex justify-between items-center mb-6'>
                                    <div className='flex items-center gap-3'>
                                        <div>
                                            <h3 className='text-xl font-bold text-gray-800'>{selectedBudget.budget_name}</h3>
                                            <p className='text-gray-600'>{selectedBudget.budget_description}</p>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => { setActiveTab("budgets"); setSelectedBudget(null) }}
                                            className='px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-300'
                                        >
                                            بازگشت
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                                    <div className='bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200'>
                                        <div className='text-center'>
                                            <div className='text-3xl font-bold text-emerald-700'>{formatCurrency(selectedBudget.budget_amount)}</div>
                                            <div className='text-gray-600 mt-2'>بودجه تخصیص یافته</div>
                                        </div>
                                    </div>
                                    <div className='bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200'>
                                        <div className='text-center'>
                                            <div className='text-3xl font-bold text-blue-700'>{formatCurrency(selectedBudget.total_withdraw)}</div>
                                            <div className='text-gray-600 mt-2'>برداشت شده</div>
                                        </div>
                                    </div>
                                    <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200'>
                                        <div className='text-center'>
                                            <div className='text-3xl font-bold text-green-700'>{formatCurrency(selectedBudget.total_deposit)}</div>
                                            <div className='text-gray-600 mt-2'>واریز شده</div>
                                        </div>
                                    </div>
                                </div>

                                <h4 className='text-lg font-bold text-gray-800 mb-4'>تراکنش‌های این بودجه</h4>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead className='bg-gray-50'>
                                            <tr>
                                                <th className='p-4 text-right font-semibold text-gray-700'>تاریخ</th>
                                                <th className='p-4 text-right font-semibold text-gray-700'>مبلغ</th>
                                                <th className='p-4 text-right font-semibold text-gray-700'>عملیات</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-200'>
                                            {selectedBudget.transactions.map((transaction) => (
                                                <tr key={transaction.id} className='hover:bg-gray-50 transition-colors duration-200'>
                                                    <td className='p-4 text-gray-600 font-medium'>
                                                        {new Date(transaction.date).toLocaleDateString("fa-ir")}
                                                    </td>

                                                    <td className='p-4'>
                                                        <div className={`text-lg font-bold ${transaction.is_deposit == true ? 'text-green-600' : transaction.is_deposit == false ? 'text-red-600' : 'text-blue-600'}`}>
                                                            {transaction.is_deposit == true ? '+' : transaction.is_deposit == false ? '-' : ''}
                                                            {formatCurrency(transaction.transaction_amount)}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='flex gap-2'>
                                                            <button onClick={() => { deleteTransaction(transaction.id) }} className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300' title='حذف'>
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
                            </div>
                        )}

                        {activeTab === "transactions" && (
                            <div className='space-y-6'>
                                {isAddingTransaction && (
                                    <div className='bg-white rounded-2xl shadow-xl p-6'>
                                        <div className='flex justify-between items-center mb-6'>
                                            <h3 className='text-xl font-bold text-gray-800'>ثبت تراکنش جدید</h3>
                                            <button
                                                onClick={() => setIsAddingTransaction(false)}
                                                className='text-gray-500 hover:text-gray-700'
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                            <div>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>نوع تراکنش</label>
                                                <div className='flex gap-3'>
                                                    {transactionTypes.map(type => (
                                                        <button
                                                            key={type.id}
                                                            type='button'
                                                            onClick={() => {
                                                                setNewTransaction({ ...newTransaction, is_deposit: type.id });
                                                            }}
                                                            className={`flex-1 p-3 rounded-lg border-2 transition-all duration-300 ${newTransaction.is_deposit === type.id ? type.color.replace('text-', 'border-').replace('bg-', 'border-') + ' ' + type.color : 'border-gray-300 hover:border-gray-400'}`}
                                                        >
                                                            <div className={`text-center ${newTransaction.type === type.id ? type.color.split(' ')[0] : 'text-gray-600'}`}>
                                                                {type.name}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>بودجه مربوطه</label>
                                                <select
                                                    value={newTransaction.budget_id}
                                                    onChange={(e) => setNewTransaction({ ...newTransaction, budget_id: e.target.value })}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                                >
                                                    <option value="">انتخاب بودجه</option>
                                                    {budgets.map(budget => (
                                                        <option key={budget.id} value={budget.id}>{budget.budget_name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>مبلغ (تومان)</label>
                                                <input
                                                    type="number"
                                                    value={newTransaction.transaction_amount}
                                                    onChange={(e) => setNewTransaction({ ...newTransaction, transaction_amount: e.target.value })}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                                    placeholder="مبلغ را وارد کنید"
                                                    dir='rtl'
                                                />
                                            </div>

                                            {/* <div>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>بخش مربوطه</label>
                                                <select
                                                    value={newTransaction.department}
                                                    onChange={(e) => setNewTransaction({ ...newTransaction, department: e.target.value })}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                                >
                                                    {departments.map(dept => (
                                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            </div> */}

                                            {/* <div className='md:col-span-2'>
                                                <label className='block mb-2 text-sm font-medium text-gray-700'>توضیحات</label>
                                                <textarea
                                                    value={newTransaction.description}
                                                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                                    rows="3"
                                                    placeholder="شرح تراکنش را وارد کنید"
                                                ></textarea>
                                            </div> */}
                                        </div>

                                        <div className='flex gap-3 mt-6'>
                                            <button
                                                // onClick={handleAddTransaction}
                                                onClick={() => { handleAddTransaction() }}
                                                className='flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-300'
                                            >
                                                ثبت تراکنش
                                            </button>
                                            <button
                                                onClick={() => setIsAddingTransaction(false)}
                                                className='flex-1 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-300'
                                            >
                                                انصراف
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Transactions List */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4'>
                                        <div>
                                            <h3 className='text-xl font-bold text-gray-800'>لیست تراکنش‌ها</h3>
                                        </div>

                                        <div className='flex gap-3'>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className='p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none'
                                            >
                                                <option value="all">همه دسته‌بندی‌ها</option>
                                                {budgets.map(budget => (
                                                    <option key={budget.id} value={budget.id}>{budget.budget_name}</option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() => setIsAddingTransaction(true)}
                                                className='px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2'
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                تراکنش جدید
                                            </button>
                                        </div>
                                    </div>

                                    <div className='overflow-x-auto'>
                                        <table className='w-full'>
                                            <thead className='bg-gray-50'>
                                                <tr>
                                                    <th className='p-4 text-right font-semibold text-gray-700'>تاریخ</th>
                                                    <th className='p-4 text-right font-semibold text-gray-700'>نوع</th>
                                                    <th className='p-4 text-right font-semibold text-gray-700'>بودجه</th>
                                                    <th className='p-4 text-right font-semibold text-gray-700'>مبلغ</th>
                                                    <th className='p-4 text-right font-semibold text-gray-700'>عملیات</th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y divide-gray-200'>
                                                {transactions.map((transaction) => {
                                                    const budget = budgets.find(b => b.id === transaction.budgetId || b.id === transaction.fromBudget)
                                                    return (
                                                        <tr key={transaction.id} className='hover:bg-gray-50 transition-colors duration-200'>
                                                            <td className='p-4 text-gray-600 font-medium'>
                                                                {new Date(transaction.date).toLocaleDateString("Fa-IR").toString()}
                                                            </td>
                                                            <td className='p-4'>
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${transaction.is_deposit ? 'bg-green-100 text-green-800' : !transaction.is_deposit ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                                    {transaction.is_deposit ? "واریز" : "برداشت"}
                                                                </span>
                                                            </td>
                                                            <td className='p-4'>

                                                                <div className='flex items-center gap-2'>
                                                                    <div className={`w-3 h-3 rounded-full bg-${findBudgetById(transaction.budget_id).color_code}`}></div>
                                                                    <span>{findBudgetById(transaction.budget_id).budget_name}</span>
                                                                </div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                                                                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                                                                    {formatCurrency(transaction.transaction_amount)}
                                                                </div>
                                                            </td>
                                                            <td className='p-4'>
                                                                <div className='flex gap-2'>
                                                                    <button onClick={() => { deleteTransaction(transaction.id) }} className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300' title='حذف'>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "reports" && (
                            <div className='space-y-6'>
                                {/* Budget Distribution Pie Chart */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-6'>توزیع بودجه</h3>
                                    <div className='h-80'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={budgets}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ budget_name, percent }) => `${budget_name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="allocated"
                                                >
                                                    {budgets.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [formatCurrency(value), 'بودجه تخصیص یافته']}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Income vs Expense Trend */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-6'>روند درآمد و هزینه</h3>
                                    <div className='h-80'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis label={{ value: 'میلیون تومان', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip
                                                    formatter={(value) => [`${value} میلیون تومان`, '']}
                                                />
                                                <Legend />
                                                <Area type="monotone" dataKey="income" name="درآمد" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                                                <Area type="monotone" dataKey="expense" name="هزینه" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                                                <Line type="monotone" dataKey="profit" name="سود" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Department Spending */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-6'>هزینه به تفکیک بخش</h3>
                                    <div className='h-80'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={spendingByDepartment}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis label={{ value: 'میلیون تومان', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip
                                                    formatter={(value) => [`${value} میلیون تومان`, 'هزینه']}
                                                    labelFormatter={(label) => `بخش: ${label}`}
                                                />
                                                <Legend />
                                                <Bar dataKey="value" name="هزینه بخش" fill="#8B5CF6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Budget Utilization */}
                                <div className='bg-white rounded-2xl shadow-xl p-6'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-6'>میزان استفاده از بودجه</h3>
                                    <div className='h-80'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={budgetChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis label={{ value: 'میلیون تومان', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip
                                                    formatter={(value) => [`${value} میلیون تومان`, '']}
                                                />
                                                <Legend />
                                                <Bar dataKey="allocated" name="بودجه کل" fill="#D1D5DB" />
                                                <Bar dataKey="spent" name="مصرف شده" fill="#3B82F6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='mt-8 text-center text-gray-500 text-sm'>
                    <p>سیستم مدیریت مالی مدرسه من - نسخه ۲.۱</p>
                    <p className='mt-1'>کلیه تراکنش‌های مالی تحت نظارت کامل حسابداری انجام می‌شوند</p>
                </div>
            </div>
        </div>
    )
}