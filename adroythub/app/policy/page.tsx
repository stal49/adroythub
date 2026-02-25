"use client";
import React, { useState } from "react";
import Heading from "../utils/Heading";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Policy from "./Policy";

type Props = {};

const Page = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(3);
  const [route, setRoute] = useState("Login");

  return (
    <div>
      <Heading
        title="Policy - Adroythub"
        description="Adroythub: Transforming Education for a Brighter Future
Adroythub, a subsidiary of Adsium Innovation Pvt. Ltd., is a leading educational platform committed to empowering learners across diverse fields. We provide top-notch online and offline courses designed for students, professionals, and lifelong learners. From IT-related programs like programming languages and web development to leadership development and marketing courses, Adroythub caters to every learner’s needs.
Our platform partners with expert educators and offers personalized learning experiences to ensure skill enhancement and career growth. We also provide scholarships for students from grades 5th to 12th, fostering educational accessibility for all. Adroythub goes beyond education by connecting students with internship opportunities under Adsium Innovation, ensuring practical exposure and industry readiness.
Join Adroythub today to unlock your potential and achieve your dreams. Explore our free and premium courses, tailored for skill-building and career advancement. Visit www.adroythub.com to learn more.
"
          keywords="Online learning platform, skill development courses, free IT courses, marketing courses, programming languages, leadership training, scholarships, internships, Adroythub education platform."
        
      />
      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
      />
      <Policy />
      <Footer />
    </div>
  );
};

export default Page;
