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
        if (data?.user) {
            const courses: any[] = data.user.courses || [];

            const isPurchased = courses.some((item: any) => {
                // Format 1: plain ObjectId or string (from orderController)
                if (typeof item === "string") return item === id;
                // Format 2: { _id: ... } (from activateUser with promo code)
                if (item._id) return item._id.toString() === id || item._id === id;
                // Format 3: { courseId: ... } (legacy)
                if (item.courseId) return item.courseId.toString() === id || item.courseId === id;
                return false;
            });

            if (!isPurchased) {
                redirect("/");
            }
        }
    }, [data, id]);

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
