import React, { useEffect, useState } from 'react'
import Table from '@mui/joy/Table';
import { FaCircleArrowDown, FaPenClip, FaPlus, FaTrashCan } from 'react-icons/fa6';
import { FiRefreshCw } from 'react-icons/fi'
import axios from 'axios';
import { FaEdit, FaPlusCircle, FaTruckLoading } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function Baseinfo() {
    const [grades, setGrades] = useState([])
    const [academicYear, setAcademicYear] = useState([])
    const [classes, setClasses] = useState([])
    function getGrades() {
        axios.get(`http://localhost:5217/api/v1/Grade/GetAll?session=${localStorage.getItem("token")}`)
            .then((res) => {
                setGrades(res.data)
                console.log(res.data)
            })
    }
    function getAcadyear() {
        axios.get(`http://localhost:5217/api/v1/AcademicYear/GetAll?session=${localStorage.getItem("token")}`)
            .then((res) => {
                setAcademicYear(res.data)
                console.log(res.data)
            })
    }
    function getClasses() {
        axios.get(`http://localhost:5217/api/v1/Class/GetAll?session=${localStorage.getItem("token")}`)
            .then((res) => {
                setClasses(res.data)
                console.log(res.data)
            })
    }
    useEffect(() => {
        getGrades()
        getAcadyear()
        getClasses()
    }, [])

    function editGrades(id) {
        var NewGrade = prompt("لطفا مقدار جدید را وارد کنید")
        if (NewGrade != "" && NewGrade != null) {
            axios.put(`http://localhost:5217/api/v1/Grade/Update?session=${localStorage.getItem("token")}`, {
                id: id,
                grade_name: NewGrade
            })
                .then((res) => {
                    Swal.fire({
                        icon: 'success',
                        title: "نام این پایه با موفقیت تغییر یافت"
                    })
                    setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
                })
        }
    }
    function addGrades() {
        var NewGrade = prompt("لطفا مقدار جدید را وارد کنید")
        if (NewGrade != "" && NewGrade != null) {
            axios.post(`http://localhost:5217/api/v1/Grade/Add?session=${localStorage.getItem("token")}`, {
                grade_name: NewGrade
            })
                .then((res) => {
                    Swal.fire({
                        icon: 'success',
                        title: " این پایه با موفقیت ساخته شد"
                    })
                    setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
                })
        }
    }
    function deleteGrades(id) {
        axios.delete(`http://localhost:5217/api/v1/Grade/Delete/${id}?session=${localStorage.getItem("token")}`)
            .then((res) => {
                Swal.fire({
                    icon: 'success',
                    title: " این پایه با موفقیت حذف شد"
                })
                setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
            })
            .catch((res) => {
                Swal.fire({
                    icon: 'error',
                    title: "خطا",
                    text: (res.response.data.error)
                })
            })
    }
    function editAcadYear(id) {
        var newAcadYear = prompt("لطفا مقدار جدید را وارد کنید")
        if (newAcadYear != "" && newAcadYear != null) {
            axios.put(`http://localhost:5217/api/v1/AcademicYear/Update?session=${localStorage.getItem("token")}`, {
                id: id,
                title: newAcadYear
            })
                .then((res) => {
                    Swal.fire({
                        icon: 'success',
                        title: "نام این سال تحصیلی با موفقیت تغییر یافت"
                    })
                    setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
                })
        }
    }
    function addAcadYear() {
        var NewAcadyear = prompt("لطفا مقدار جدید را وارد کنید")
        if (NewAcadyear != "" && NewAcadyear != null) {
            axios.post(`http://localhost:5217/api/v1/AcademicYear/Add?session=${localStorage.getItem("token")}`, {
                title: NewAcadyear
            })
                .then((res) => {
                    Swal.fire({
                        icon: 'success',
                        title: " این سال تحصیلی با موفقیت ساخته شد"
                    })
                    setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
                })
        }
    }
    function deleteAcadYear(id) {
        axios.delete(`http://localhost:5217/api/v1/AcademicYear/Delete/${id}?session=${localStorage.getItem("token")}`)
            .then((res) => {
                Swal.fire({
                    icon: 'success',
                    title: " این سال تحصیلی با موفقیت حذف شد"
                })
                setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
            })
            .catch((res) => {
                Swal.fire({
                    icon: 'error',
                    title: "خطا",
                    text: (res.response.data.error)
                })
            })
    }
    function editClass(id) {
        var newClassname = prompt("لطفا مقدار جدید نام کلاس را وارد کنید")
        var newGradeId = Number(prompt("لطفا ایدی پایه جدید را وارد کنید"))
        var does_grade_id_exist = false;
        for (let index = 0; index < grades.length; index++) {
            const element = grades[index];
            if (element.id == newGradeId) {
                does_grade_id_exist = true
                break;
            }
        }
        if (does_grade_id_exist == false) {
            Swal.fire({
                icon: "error",
                title: "این ایدی پایه وجود ندارد"
            })
        }
        else {
            if (newClassname != "" && newClassname != null) {
                axios.put(`http://localhost:5217/api/v1/Class/Update?session=${localStorage.getItem("token")}`, {
                    id: id,
                    class_name: newClassname,
                    grade_id: newGradeId
                })
                    .then((res) => {
                        Swal.fire({
                            icon: 'success',
                            title: " این کلاس با موفقیت تغییر یافت"
                        })
                        setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
                    })
            }
        }
    }
    function addClass() {
        var newClassname = prompt("لطفا مقدار جدید نام کلاس را وارد کنید")
        var newGradeId = Number(prompt("لطفا ایدی پایه جدید را وارد کنید"))
        var does_grade_id_exist = false;
        for (let index = 0; index < grades.length; index++) {
            const element = grades[index];
            if (element.id == newGradeId) {
                does_grade_id_exist = true
                break;
            }
        }
        if (does_grade_id_exist == false) {
            Swal.fire({
                icon: "error",
                title: "این ایدی پایه وجود ندارد"
            })
        }
        else {
            if (newClassname != "" && newClassname != null && newGradeId != "" && newGradeId != null) {
                axios.post(`http://localhost:5217/api/v1/Class/Add?session=${localStorage.getItem("token")}`, {
                    class_name: newClassname,
                    grade_id: newGradeId
                })
                    .then((res) => {
                        Swal.fire({
                            icon: 'success',
                            title: " این  کلاس با موفقیت ساخته شد"
                        })
                        setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
                    })
            }
        }

    }
    function deleteClass(id) {
        axios.delete(`http://localhost:5217/api/v1/Class/Delete/${id}?session=${localStorage.getItem("token")}`)
            .then((res) => {
                Swal.fire({
                    icon: 'success',
                    title: " این  کلاس با موفقیت حذف شد"
                })
                setInterval(() => { window.location.pathname = "/baseinfo" }, 1000)
            })
            .catch((res) => {
                Swal.fire({
                    icon: 'error',
                    title: "خطا",
                    text: (res.response.data.error)
                })
            })
    }
    function find_grade_name(id){
        for (let index = 0; index < grades.length; index++) {
            const element = grades[index];
            if (element.id == id){
                return element.grade_name
            }
        }
    }
    return (
        <div className='grid grid-cols-3 h-screen ' >
            <div className='col-span-1 p-7' >
                <div dir='rtl' ><p className='text-[1.2vw]' >سال تحصیلی</p></div>
                <div class="max-h-64 overflow-x-auto overflow-y-auto scrl shadow-md sm:rounded-lg mt-3">
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500  ">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    سال تحصیلی
                                </th>
                                <td className='text-lg text-sky-600 px-3   hover:cursor-pointer ' >
                                    <div onClick={() => { getAcadyear() }} className=' w-fit h-fit p-2 transition-all duration-300 hover:bg-sky-600 hover:text-white rounded-2xl' >
                                        <FiRefreshCw className='' />
                                    </div>
                                </td>
                                <td className='text-lg text-green-600 px-3  hover:cursor-pointer ' >
                                    <div onClick={() => { addAcadYear() }} className=' w-fit h-fit p-2 transition-all duration-300 hover:bg-green-600 hover:text-white rounded-2xl' >
                                        <FaPlus className='' />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {academicYear.map((e) => {
                                return (
                                    <tr class="odd:bg-white  even:bg-gray-50  border-b  border-gray-200">
                                        <td class="px-6 py-4">
                                            {e.id}
                                        </td>
                                        <td class="px-6 py-4">
                                            {e.title}
                                        </td>
                                        <td className='text-lg text-yellow-500 px-3  hover:cursor-pointer ' >
                                            <div onClick={() => { editAcadYear(e.id) }} className=' w-fit h-fit p-2 hover:bg-yellow-500 hover:text-white rounded-2xl' >
                                                <FaEdit className='' />
                                            </div>
                                        </td>
                                        <td className='text-lg text-red-800 px-3  hover:cursor-pointer ' >
                                            <div onClick={() => { deleteAcadYear(e.id) }} className=' w-fit h-fit p-2 hover:bg-red-800 hover:text-white rounded-2xl' >
                                                <FaTrashCan className='' />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                        </tbody>

                    </table>
                </div>

            </div>
            <div className='col-span-1 p-7' >
                <div dir='rtl' ><p className='text-[1.2vw] '  >پایه</p></div>
                <div class="max-h-64 overflow-x-auto overflow-y-auto scrl shadow-md sm:rounded-lg mt-3">
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500 ">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-400 ">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    پایه
                                </th>
                                <td className='text-lg text-sky-600 px-3  hover:cursor-pointer ' >
                                    <div onClick={() => { getGrades() }} className=' w-fit h-fit p-2 transition-all duration-300 hover:bg-sky-600 hover:text-white rounded-2xl' >
                                        <FiRefreshCw className='' />
                                    </div>
                                </td>
                                <td className='text-lg text-green-600 px-3  hover:cursor-pointer ' >
                                    <div onClick={() => { addGrades() }} className=' w-fit h-fit p-2 transition-all duration-300 hover:bg-green-600 hover:text-white rounded-2xl' >
                                        <FaPlus className='' />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((e) => {
                                return (
                                    <tr class="odd:bg-white  even:bg-gray-50  border-b  border-gray-200">
                                        <td class="px-6 py-4">
                                            {e.id}
                                        </td>
                                        <td class="px-6 py-4">
                                            {e.grade_name}
                                        </td>
                                        <td className='text-lg text-yellow-500 px-3  hover:cursor-pointer ' >
                                            <div onClick={() => { editGrades(e.id) }} className=' w-fit h-fit p-2 hover:bg-yellow-500 hover:text-white rounded-2xl duration-300' >
                                                <FaEdit className='' />
                                            </div>
                                        </td>
                                        <td className='text-lg text-red-800 px-3  hover:cursor-pointer ' >
                                            <div onClick={() => { deleteGrades(e.id) }} className=' w-fit h-fit p-2 hover:bg-red-800 hover:text-white rounded-2xl duration-300' >
                                                <FaTrashCan className='' />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </table>
                </div>
            </div>
            <div className='col-span-1 p-7' >
                <div dir='rtl' ><p className='text-[1.2vw]'  >کلاس</p></div>
                <div class="max-h-[70vh] overflow-x-hidden overflow-y-auto scrl shadow-md sm:rounded-lg mt-3">
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500 ">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-400 ">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    کلاس
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    پایه
                                </th>
                                <td className='text-lg text-sky-600 px-3  hover:cursor-pointer ' >
                                    <div onClick={() => { getClasses() }} className=' w-fit h-fit p-2 transition-all duration-300 hover:bg-sky-600 hover:text-white rounded-2xl' >
                                        <FiRefreshCw className='' />
                                    </div>
                                </td>
                                <td className='text-lg text-green-600 px-3  hover:cursor-pointer ' >
                                    <div onClick={() => { addClass() }} className=' w-fit h-fit p-2 transition-all duration-300 hover:bg-green-600 hover:text-white rounded-2xl' >
                                        <FaPlus className='' />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((e) => {
                                return (
                                    <tr class="odd:bg-white  even:bg-gray-50  border-b  border-gray-200">
                                        <td class="px-6 py-4">
                                            {e.id}
                                        </td>
                                        <td class="px-6 py-4">
                                            {e.class_name}
                                        </td>
                                        <td class="px-6 py-4">
                                            {find_grade_name(e.grade_id)}
                                        </td>
                                        <td className='text-lg text-yellow-500 px-3  hover:cursor-pointer ' >
                                            <div onClick={() => { editClass(e.id) }} className=' w-fit h-fit p-2 hover:bg-yellow-500 hover:text-white rounded-2xl duration-300' >
                                                <FaEdit className='' />
                                            </div>
                                        </td>
                                        <td className='text-lg text-red-800 px-3  hover:cursor-pointer ' >
                                            <div onClick={() => { deleteClass(e.id) }} className=' w-fit h-fit p-2 hover:bg-red-800 hover:text-white rounded-2xl duration-300' >
                                                <FaTrashCan className='' />
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
    )
}
