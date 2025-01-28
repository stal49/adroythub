'use client'
import React from 'react'
import AdminSidebar from "../../components/Admin/sidebar/AdminSidebar";
import Heading from '../../../app/utils/Heading';
import OrdersAnalytics from "../../components/Admin/Analytics/OrdersAnalytics";
import DashboardHeader from '../../../app/components/Admin/DashboardHeader';

type Props = {}

const page = (props: Props) => {
  return (
    <div>
        <Heading
         title="Adroythub - Admin"
         description="Adroythub: Transforming Education for a Brighter Future
Adroythub, a subsidiary of Adsium Innovation Pvt. Ltd., is a leading educational platform committed to empowering learners across diverse fields. We provide top-notch online and offline courses designed for students, professionals, and lifelong learners. From IT-related programs like programming languages and web development to leadership development and marketing courses, Adroythub caters to every learner’s needs.
Our platform partners with expert educators and offers personalized learning experiences to ensure skill enhancement and career growth. We also provide scholarships for students from grades 5th to 12th, fostering educational accessibility for all. Adroythub goes beyond education by connecting students with internship opportunities under Adsium Innovation, ensuring practical exposure and industry readiness.
Join Adroythub today to unlock your potential and achieve your dreams. Explore our free and premium courses, tailored for skill-building and career advancement. Visit www.adroythub.com to learn more.
"
        keywords="Online learning platform, skill development courses, free IT courses, marketing courses, programming languages, leadership training, scholarships, internships, Adroythub education platform."
       />
        <div className="flex">
            <div className="1500px:w-[16%] w-1/5">
                <AdminSidebar />
            </div>
            <div className="w-[85%]">
               <DashboardHeader />
               <OrdersAnalytics />
            </div>
        </div>
    </div>
  )
}

export default page