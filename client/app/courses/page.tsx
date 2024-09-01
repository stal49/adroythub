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
    <div>
      <Header route="Login" setRoute={() => {}} open={false} setOpen={() => {}} activeItem={1} />
      <div className="w-[95%] 800px:w-[85%] m-auto min-h-[70vh]">
        <Heading
          title={"All courses - Adroythub"}
          description={"Adroythub is a programming community."}
          keywords={
            "programming community, coding skills, expert insights, collaboration, growth"
          }
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
