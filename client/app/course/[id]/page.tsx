'use client'
import React, { use } from "react";
import CourseDetailsPage from "../../components/Course/CourseDetailsPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = ({ params }: PageProps) => {
    const { id } = use(params);
    return (
        <div>
            <CourseDetailsPage id={id} />
        </div>
    )
}

export default Page;
