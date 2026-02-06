import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { FaWallet } from 'react-icons/fa';
import { BiCalendarCheck, BiCalendarEvent, BiMoneyWithdraw, BiWallet } from 'react-icons/bi';
import { SiWalletconnect } from 'react-icons/si';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { ToPersianNumber } from 'topersiannumber';
import bg from '../assets/map.png'

export default function DummyDashboard() {
    const margin = { right: 24 };
    const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
    const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
    const xLabels = [
        'Page A',
        'Page B',
        'Page C',
        'Page D',
        'Page E',
        'Page F',
        'Page G',
    ];
    return (
        <div className='grid grid-cols-4 hero-section h-screen '  >
            <div className='m-10 bg-[#caf0f8] shadow-2xl drop-shadow-2xl rounded-xl ' >
                <span className='flex justify-center my-12 text-[#294e80] text-2xl  ' ><p className='p-5 rounded-4xl bg-[#81cee6]  ' ><FaWallet /></p></span>
                <span className='flex justify-center my-5 text-lg' ><p>باقی مانده بودجه</p></span>
                <span className='flex justify-center my-7 text-[#294e80] text-lg ' ><p>{ToPersianNumber(412560000)}تومان</p></span>
            </div>
            <div className='m-10 bg-[#f8caca] shadow-2xl drop-shadow-2xl rounded-xl ' >
                <span className='flex justify-center my-12 text-[#802929] text-2xl  ' ><p className='p-5 rounded-4xl bg-[#e68181]  ' ><FaMoneyBillTransfer /></p></span>
                <span className='flex justify-center my-5 text-lg' ><p>هزینه های ماه جاری</p></span>
                <span className='flex justify-center my-7 text-[#802929] text-lg ' ><p>{ToPersianNumber(39891200)}تومان</p></span>
            </div>
            <div className='m-10 bg-[#caf8d2] shadow-2xl drop-shadow-2xl rounded-xl ' >
                <span className='flex justify-center my-12 text-[#298030] text-2xl  ' ><p className='p-5 rounded-4xl bg-[#84e681]  ' ><BiMoneyWithdraw /></p></span>
                <span className='flex justify-center my-5 text-lg' ><p>درآمد های ماه جاری</p></span>
                <span className='flex justify-center my-7 text-[#298029] text-lg ' ><p>{ToPersianNumber(29930300)}تومان</p></span>
            </div>
            <div className='m-10 bg-[#e7caf8] shadow-2xl drop-shadow-2xl rounded-xl ' >
                <span className='flex justify-center my-12 text-[#5d2980] text-2xl  ' ><p className='p-5 rounded-4xl bg-[#be81e6]  ' ><BiCalendarEvent /></p></span>
                <span className='flex justify-center my-5 text-lg' ><p>مانده تا پایان سال</p></span>
                <span className='flex justify-center my-7 text-[#522980] text-lg ' ><p>{ToPersianNumber(18)}</p></span>
            </div>
            <div className='col-span-2  max-w-[30vw] max-h-[40vh] self-center justify-self-center  bg-zinc-100  rounded-xl shadow-2xl drop-shadow-2xl border border-zinc-300' >
                <div className='w-[30vw] h-[40vh] p-10' >
                    <div className='flex justify-center' >
                        میانگین معدل دانش آموزان
                    </div>
                    <PieChart
                        series={[
                            {
                                data: [
                                    { id: 0, value: 176, label: '10-15' },
                                    { id: 1, value: 8, label: '0-10' },
                                    { id: 2, value: 20, label: '15-20' },
                                ],
                            },
                        ]}
                    />
                </div>
            </div>
            <div className='col-span-2 max-w-[30vw] max-h-[40vh] self-center justify-self-center bg-zinc-100 rounded-xl shadow-2xl drop-shadow-2xl border border-zinc-300' >
                <div className='w-[30vw] h-[40vh] p-10' >
                    <div className='flex justify-center' >
                        میانگین معدل دانش آموزان
                    </div>
                    <LineChart

                        series={[
                            { data: pData, label: 'pv' },
                            { data: uData, label: 'uv' },
                        ]}
                        xAxis={[{ scaleType: 'point', data: xLabels }]}
                        yAxis={[{ width: 50 }]}
                    />
                </div>
            </div>
        </div>

    )
}
