'use client';
import CourseContent from "@/app/components/Course/CourseContent";
import Loader from "@/app/components/Loader/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  params: { id: string };
};

const Page = ({ params }: Props) => {
  const id = params.id;
  const { isLoading, error, data } = useLoadUserQuery(undefined, {});

  useEffect(() => {
    if (data) {
      // Check if the course is free
      const course = data.user.courses.find((item: any) => item._id === id);
      if (course?.price === 0) {
        return; // Allow access to free course
      }

      // Check if the user has purchased the course
      const isPurchased = course !== undefined;
      if (isPurchased) {
        return;
      }

      // Redirect if the course is neither free nor purchased
      redirect("/");
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

export default Page;
