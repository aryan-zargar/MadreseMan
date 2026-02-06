import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import Logo from '../assets/MadreseManLogo.png'
import { useParams } from 'react-router-dom'
import axios from 'axios'
export default function EmailConfirmation() {
    const [email, setEmail] = useState("")
    const [mailSent, setMailSent] = useState(false)
    const [code, setCode] = useState("")

    const { usermail } = useParams()
    console.log(usermail)
    useEffect(() => {
        if (mailSent == false) {
            axios.get(`http://localhost:5217/api/v1/auth/sendEmail?email=${usermail}`)
            setMailSent(true)
        }
    })
    console.log(email)
    console.log(code)

    function Submit() {
        if (usermail == usermail) {
            if (code != null && code != "") {
                axios.get(`http://localhost:5217/api/v1/auth/ConfirmUser?code=${code}&email=${usermail}`)
                    .then(
                        (res) => {
                            window.localStorage.setItem("token", res.data)
                            window.location.pathname = "/"
                        }
                    )
                    .catch(
                        (res) => {
                            Swal.fire({
                                icon: "error",
                                title: "خطا",
                                text: (res.response.data.error)
                            })
                        }
                    )
            }
            else {
                Swal.fire(
                    {
                        icon: "error",
                        title: "خطا",
                        text: "کد را وارد کنید"
                    }
                )
            }
        }
        else {
            Swal.fire(
                {
                    icon: "error",
                    title: "خطا",
                    text: "ایمیل اشتباه است"
                }
            )
        }
    }

    return (
        <div className='login_bg h-screen flex justify-center items-center' >
            <div class="grid grid-cols-5 lg:w-[70vw] lg:h-100 w-screen h-screen" >
                <div className='col-span-3 items-center ' >
                        <div className='justify-center items-center border-l-4 border-t-4 border-b-4 border-blue-900 px-14 py-18 rounded-l-xl bg-gray-50 '>

                            <form className='' >
                                <div className='flex justify-center -mt-10 mb-10 ' >
                                    <p className='text-2xl' >احراز هویت</p>
                                </div>
                                <div className='flex justify-center mt-10 mb-10' >
                                    <p className='text-md' >لطفا ایمیل خود را چک کنید </p>
                                </div>
                                <div className='flex -mt-10 justify-center'>
                                    <p className='text-xl' >{usermail}</p>
                                </div>
                                <div className=' mt-6' dir='rtl' >
                                    <label for="username" class="block mb-2 text-base font-medium text-gray-900 ">کد احراز هویت</label>
                                    <input type="text" id="code" class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  " onChange={(e) => setCode(e.target.value)} placeholder="code" required />
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
