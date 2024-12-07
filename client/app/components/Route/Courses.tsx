import { useGetUsersAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import React, { useEffect, useState } from "react";
import CourseCard from "../Course/CourseCard";
import RegisterationForm from "../../components/Registeration/RegisterationForm";

type Props = {};

const Courses = (props: Props) => {
  const { data, isLoading } = useGetUsersAllCoursesQuery({});
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    setCourses(data?.courses);
  }, [data]);

  const [isFormVisible, setFormVisible] = useState(false);

    const toggleFormVisibility = () => {
        setFormVisible((prev) => !prev);
    };
    const closeForm = () => {
      setFormVisible(false);
  };

  return (
    <div>
      <div className={`w-[90%] 800px:w-[80%] m-auto`}>
        <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:!leading-[60px] text-[#000] font-[700] tracking-tight">
          Expand Your Career <span className="text-gradient">Opportunity</span>{" "}
          <br />
          With Our Courses
        </h1>
        <br />
        <button className="items-center text-xs sm:text-sm md:text-base bg-purple-500 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl text-white dark:text-white mt-4"
         onClick={toggleFormVisibility}> Register Now!</button>
        {isFormVisible && <RegisterationForm onClose={closeForm} />}
        <br />
        <br />
        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] 1500px:grid-cols-4 1500px:gap-[35px] mb-12 border-0">
          {courses &&
            courses.map((item: any, index: number) => (
              <CourseCard item={item} key={index} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
