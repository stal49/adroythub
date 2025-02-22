'use client'
import { redirect, useSearchParams } from 'next/navigation';
import { Suspense, use, useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import GenerateCertificate from '../../components/Course/GenerateCertificate';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import {  useLoadUserQuery } from '@/redux/features/api/apiSlice';
import { useGetCourseDetailsQuery } from '@/redux/features/courses/coursesApi';

type Props = {
  params:any;
}
 
const Page = ({params}: Props) => {
 


  








  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("Login");

  const id = params.id;

  const { data, isLoading, error } = useGetCourseDetailsQuery(id);
  const [courseName, setCourseName] = useState<string | null>(null);
  useEffect(() => {
    if (data) {
      setCourseName(data.course.name);
    }
  }, [data]);



0
  return (
    <Suspense fallback={<div>Loading...</div>}> 

      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
      />
      <GenerateCertificate  id={id} courseName={courseName ?? "Course Name"}/>
      <Footer/>
    </Suspense>
  );
};

export default Page;
