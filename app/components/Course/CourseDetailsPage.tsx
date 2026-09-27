import { useGetCourseDetailsQuery } from "@/redux/features/courses/coursesApi";
import React, { useState } from "react";
import Loader from "../Loader/Loader";
import Heading from "@/app/utils/Heading";
import Header from "../Header";
import Footer from "../Footer";
import CourseDetails from "./CourseDetails";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { toast } from "react-toastify";

type Props = {
  id: string;
};

const CourseDetailsPage = ({ id }: Props) => {
  const [route, setRoute] = useState("Login");
  const [open, setOpen] = useState(false);
  const { data, isLoading, refetch: refetchCourseDetails } = useGetCourseDetailsQuery(id);
  const { refetch: refetchUserData } = useLoadUserQuery(undefined, {});

  const onPaymentSuccess = async () => {
    toast.success("Payment Successful!");
    
    await refetchUserData(); // Refresh user data (already in your code)
    await refetchCourseDetails(); // Refresh course details after payment
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
          <Heading
            title={data.course.name + " - Adroythub"}
            description={
              "Adroythub is a community for helping students"
            }
            keywords={data?.course?.tags}
          />
          <Header
            
            open={open}
            setOpen={setOpen}
            activeItem={1}
          />
          <CourseDetails
            data={data.course}
            setRoute={setRoute}
            setOpen={setOpen}
            onPaymentSuccess={onPaymentSuccess}
          />
          <Footer />
        </div>
      )}
    </>
  );
};

export default CourseDetailsPage;
