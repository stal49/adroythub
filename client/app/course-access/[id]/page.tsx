'use client'
import CourseContent from "@/app/components/Course/CourseContent";
import Loader from "@/app/components/Loader/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
    params: any;
}

const Page = ({ params }: Props) => {
    const id = params.id;
    const { isLoading, error, data, refetch } = useLoadUserQuery(undefined, {});

    useEffect(() => {
        if (data) {
            const isPurchased = data.user.courses.find((item: any) => item._id === id);
            const isFreeCourse = data.user.courses.find((item: any) => item._id === id && item.price === 0);
            
            // Allow access if course is purchased or free
            if (!isPurchased && !isFreeCourse) {
                redirect("/");  // Redirect if not purchased and not free
            }
        }
        
        if (error) {
            redirect("/");  // Handle errors by redirecting
        }
    }, [data, error, id]);

    return (
        <>
            {
                isLoading ? (
                    <Loader />
                ) : (
                    <div>
                        <CourseContent id={id} user={data.user} />
                    </div>
                )
            }
        </>
    );
}

export default Page;
