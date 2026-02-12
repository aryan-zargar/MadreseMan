import React, { useEffect, useState } from 'react'
import Logo from '../assets/MadreseManLogo.png'
import Swal from 'sweetalert2'
import axios from 'axios'
export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    console.log(username)
    console.log(password)

    function Submit() {
        if (username != "" && password != "") {
            axios.post(`http://localhost:5217/api/v1/auth/login?username=${username}&password=${password}`, {}).then((res) => {

                window.location.pathname = `/emailConfirmation/${res.data.email}`
            }).catch(
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
        <div className='login_bg h-screen flex justify-center items-center ' dir='ltr' >
            <div className='grid grid-cols-5 lg:w-[70vw] lg:h-100 w-screen h-screen ' >
                <div className='col-span-3 items-center ' >
                    <div className='justify-center items-center border-l-4 border-t-4 border-b-4 border-blue-900 px-14 py-18 rounded-l-xl bg-gray-50 '>
                        <form className='' >
                            <div className='flex justify-center -mt-10 mb-10 ' dir='rtl' >
                                <p className='text-2xl' >خوش آمدید !</p>
                            </div>
                            <div className='flex justify-center -mt-10 mb-10 ' dir='rtl' >
                                <p className='text-sm text-blue-800' >لطفا اطلاعات خود را وارد نمایید.</p>
                            </div>
                            <div className='' dir='rtl' >
                                <label for="username" class="block mb-2 text-base font-medium text-gray-900 ">نام کابری</label>
                                <input type="text" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  " onChange={(e) => setUsername(e.target.value)} placeholder="username" required />
                            </div>
                            <div className=' mt-6' dir='rtl' >
                                <label for="username" class="block mb-2 text-base font-medium text-gray-900 ">گذر واژه</label>
                                <input size="small" type="password" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  " onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
                            </div>
                            <div className=' mt-10' dir='rtl' >
                                <button type="button" onClick={() => { (Submit()) }} class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">ورود</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className=' col-span-2 login_secondary_bg border-r-4 border-t-4 border-b-4 border-blue-900 bg-[#1a1b75] flex justify-center rounded-r-xl items-center ' >
                    <div>
                        <img src={Logo} className='w-[12vw] h-[12vw]' />
                        <div style={{ fontFamily: "sgkara" }} className='flex justify-center' >
                            <p className='text-white text-[1.9vw]' >مدرسه من</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
