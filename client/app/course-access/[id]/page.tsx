'use client'
import CourseContent from "@/app/components/Course/CourseContent";
import Loader from "@/app/components/Loader/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
    params:any;
}

const Page = ({ params }: Props) => {
  const id = params.id;
  const { isLoading, error, data, refetch } = useLoadUserQuery(undefined, {});

  useEffect(() => {
    if (data) {
      const isPurchased = data.user.courses.find(
        (item: any) => item._id === id
      );

      // Check if the course price is 0 (free)
      const course = data.user.courses.find((item: any) => item._id === id);
      if (course?.price === 0 || isPurchased) {
        // Allow access to course
        return;
      }

      redirect("/"); // If not purchased or free, redirect
    }

    if (error) {
      redirect("/");
    }
  }, [data, error]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <CourseContent id={id} user={data.user} />
        </div>
      )}
    </>
  );
};


export default Page