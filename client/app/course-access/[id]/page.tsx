'use client'
import CourseContent from "@/app/components/Course/CourseContent";
import Loader from "@/app/components/Loader/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
    params: Promise<{ id: string }>;
}

const Page = ({ params }: Props) => {
    const { id } = React.use(params);
    const { isLoading, error, data, refetch } = useLoadUserQuery(undefined, {});

    useEffect(() => {
        if (data) {
            const isPurchased = data.user.courses.find((item: any) =>
                (typeof item === 'string' ? item === id : item._id === id)
            );

            // Allow access if course is purchased
            if (!isPurchased) {
                redirect("/");  // Redirect if not purchased
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
                ) : data?.user ? (
                    <div>
                        <CourseContent id={id} user={data.user} />
                    </div>
                ) : null
            }
        </>
    );
}

export default Page;
