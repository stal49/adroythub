"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loader from "../components/Loader/Loader";
import Header from "../components/Header";
import Heading from "../utils/Heading";
import Footer from "../components/Footer";

// Dynamically import the component that uses useSearchParams
const CoursesComponent = dynamic(() => import("../courses/CoursesComponent"), {
  ssr: false,
  loading: () => <Loader />,
});

type Props = {};

const Page = (props: Props) => {
  return (
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
      <Header open={false} setOpen={() => {}} activeItem={1} />
      <div className="w-[95%] 800px:w-[85%] m-auto min-h-[70vh] py-8">
        <Heading
          title={"All courses - Adroythub"}
          description="Adroythub: Transforming Education for a Brighter Future
Adroythub is a leading educational platform committed to empowering learners across diverse fields. We provide top-notch online and offline courses designed for students, professionals, and lifelong learners. From IT-related programs like programming languages and web development to leadership development and marketing courses, Adroythub caters to every learner’s needs.
Our platform partners with expert educators and offers personalized learning experiences to ensure skill enhancement and career growth. We also provide scholarships for students from grades 5th to 12th, fostering educational accessibility for all. Adroythub provides practical exposure and industry readiness through internship opportunities and real-world experience.
Join Adroythub today to unlock your potential and achieve your dreams. Explore our free and premium courses, tailored for skill-building and career advancement. Visit www.adroythub.com to learn more.
"
          keywords="Online learning platform, skill development courses, free IT courses, marketing courses, programming languages, leadership training, scholarships, internships, Adroythub education platform."
  
        />
        <br />
        <Suspense fallback={<Loader />}>
          <CoursesComponent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
