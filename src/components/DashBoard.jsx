import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventIcon from "@mui/icons-material/Event";

import { BarChart, PieChart, LineChart } from "@mui/x-charts";
import axios from "axios";
import toman from "../assets/toman.png"

export default function PrincipalDashboard() {
  const [students, setStudents] = useState([])
  const [budgets, setBudgets] = useState([])
  const [totalBudgetsAmount, setTBA] = useState(0)
  function getStudents() {
    axios.get(`http://localhost:5217/api/v1/Student/GetAll?session=${localStorage.getItem("token")}`)
      .then((res) => {
        setStudents(res.data)
      })
  }
  function getBudgets() {
    axios.get(`http://localhost:5217/api/v1/Budget/GetAll?session=${localStorage.getItem("token")}`)
      .then((res) => {
        setBudgets(res.data)
        var tempTBA = 0
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          tempTBA += element.budget_amount
        }
        setTBA(tempTBA)
      })
  }
  const attendanceSeries = [{ data: [92, 94, 95, 90, 85], label: "درصد حضور دانش آموزلن" }];
  const attendanceXAxis = [{ data: ["شنبه", "یکشنبه", "دوشنبه", "سه شنبیه", "چهارشنبه"] }];

  // Fees (Iranian Toman)
  const feeData = [
    { id: 0, value: 271450000, label: "دریافت شده" },
    { id: 1, value: 49550000, label: "در انتظار پرداخت" },
  ];

  // Enrollment trend (6 months)
  const enrollmentSeries = [
    { data: [1100, 1120, 1135, 1150, 1180, 1200], label: "Enrollment" },
  ];
  const enrollmentXAxis = [{ data: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"] }];

  // Class performance
  const performanceSeries = [
    { data: [18.92, 19, 19.91], label: "کلاس 1" },
    { data: [18.3, 18.91, 19.7], label: "کلاس 2" },
    { data: [19.6, 19.3, 19], label: "کلاس 3" },
  ];
  const performanceXAxis = [{ data: ["پایه نهم", " پایه هشتم", " پایه هفتم"] }];

  // Attendance breakdown
  const attendanceBreakdown = [
    { id: 0, value: 85, label: "Present" },
    { id: 1, value: 10, label: "Absent" },
    { id: 2, value: 5, label: "Late" },
  ];

  // Issues
  const issues = [
    { id: 1, title: "مشکل کار پروژکتور", priority: "High" },
    { id: 2, title: "مشکل سیستم کتابخونه", priority: "Medium" },
    { id: 3, title: "تمیز کردن زیر زمین", priority: "Low" },
  ];
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    getStudents()
    getBudgets()
  }, [])
  return (
    <div className="p-6 space-y-6" dir="rtl" style={{ fontFamily: "Rubik" }}>
      {/* Top Stats */}
      <div dir="rtl" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <PeopleIcon color="primary" fontSize="large" />
            <div>
              <p className="text-sm text-gray-500">مجموع دانش آموزان</p>
              <h3 className="text-lg font-semibold">{(students.length).toLocaleString("fa-ir")}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <SchoolIcon color="success" fontSize="large" />
            <div>
              <p className="text-sm text-gray-500">مجموع بودجه ها</p>
              <h3 className="text-lg font-semibold flex gap-2 items-center">{numberWithCommas(totalBudgetsAmount.toLocaleString('fa-ir'))} <img src={toman} className="w-9 h-5" /> </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <MonetizationOnIcon color="warning" fontSize="large" />
            <div>
              <p className="text-sm text-gray-500">مجموع شهریه های دریافت شده</p>
              <h3 className="text-lg font-semibold flex gap-2 items-center">{numberWithCommas((271450000).toLocaleString('fa-ir'))}<img src={toman} className="w-9 h-5" /></h3>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Row 1: Attendance + Fees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader title="میزان حضور هفتگی" />
          <CardContent>
            <BarChart xAxis={attendanceXAxis} series={attendanceSeries} height={300} />
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader sx={{ fontFamily: "sgkara" }} title="شهریه های دریافت شده" />
          <CardContent>
            <PieChart sx={{ fontFamily: "Rubik", fontSize: "20px" }} series={[{ data: feeData }]} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Enrollment + Class Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        <Card className="p-4">
          <CardHeader title="عملکرد کلاس ها" />
          <CardContent>
            <BarChart xAxis={performanceXAxis} series={performanceSeries} height={300} />
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader title="کار های باز" />
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>مشکل</TableCell>
                  <TableCell>اولویت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>{issue.title}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-white ${issue.priority === "High"
                            ? "bg-red-500"
                            : issue.priority === "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                      >
                        {issue.priority}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
