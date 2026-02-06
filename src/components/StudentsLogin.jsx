import React, { useEffect, useState } from 'react'
import Logo from '../assets/MadreseManLogo.png'
import Swal from 'sweetalert2'
import axios from 'axios'
export default function StLogin() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    console.log(username)
    console.log(password)

    function Submit() {
        if (username != "" && password != "") {
            axios.post(`http://localhost:5217/login?username=${username}&password=${password}`, {})
                .then((res) => {
                    localStorage.setItem("stoken",res.data)
                    window.location.pathname = "/sdashboard"
                })
                .catch(
                    (res) => {
                        Swal.fire({
                            title: "خطا",
                            text: (res.response.data.error),
                            icon: "error",
                            draggable: true
                        });
                    }
                )

        }
        else {
            Swal.fire({
                title: "خطا",
                text: "لطفا همه فیلد ها را پر کنید",
                icon: "error",
                draggable: true
            });
        }
    }

    return (
        <div className='grid grid-cols-3 h-screen' >
            <div className='col-span-2 flex justify-center items-center ' >

                <form className='w-[20vw]' >
                    <div className='flex justify-center -mt-10 mb-10 ' >
                        <p className='text-3xl mt-1' >ورود</p>
                    </div>
                    <div className='' dir='rtl' >
                        <label for="username" class="block mb-2 text-base font-medium text-gray-900 ">نام کابری (کدملی)</label>
                        <input type="text" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  " onChange={(e) => setUsername(e.target.value)} placeholder="username" required />
                    </div>
                    <div className=' mt-6' dir='rtl' >
                        <label for="username" class="block mb-2 text-base font-medium text-gray-900 ">گذر واژه</label>
                        <input type="password" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  " onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
                    </div>
                    <div className=' mt-10' dir='rtl' >
                        <button type="button" onClick={()=>Submit()} class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">ورود</button>
                    </div>
                </form>
            </div>
            <div className='col-span-1 bg-[#1a3e75] flex justify-center items-center ' >
                <div>
                    <img src={Logo} className='w-[17vw] h-[17vw]' />
                    <div className='flex justify-center -mt-10' >
                        <p className='text-white text-4xl' >مدرسه من</p>
                    </div>
                    <div className='flex justify-center mt-5' >
                        <p className='text-white text-[0.9vw]' >ورود دانش آموزان</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
