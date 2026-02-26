'use client'
import React, { useState } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import axios from "axios";
import { RootState } from "@/redux/features/store";
import { useSelector } from "react-redux";



const RegisterInstituteForm = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<{
    instituteName: string;
    offerCode: string;
    pincode: string;
    registeringUser: string;
    validity: string;
    issuedDate: string;
    eventName: string;
    coursesToAllow: any[];
    certificateData: any;
  }>({
    instituteName: "",
    offerCode: "",
    pincode: "",
    registeringUser: "",
    validity: "",
    issuedDate: "",
    eventName: "",
    coursesToAllow: [],
    certificateData: "",
  });

  const { isLoading, data } = useGetAllCoursesQuery({}, { refetchOnMountOrArgChange: true });
  
  const courses = data?.courses?.map((course: any) => ({
    id: course._id,
    name: course.name,
  })) || [];

  
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);

  const handleSelection = (course: any) => {
    setSelectedCourses((prev) => {
      const newSelection = prev.some((c) => c.id === course.id)
        ? prev.filter((c) => c.id !== course.id)
        : [...prev, course];
      
      setFormData((prevFormData) => ({
        ...prevFormData,
        coursesToAllow: newSelection.map((c) => c.id),
      }));
      
      return newSelection;
    });
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const imageHandler = async (e: any) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      if (fileReader.readyState === 2) {
        const avatar = fileReader.result;
      }
    };
    fileReader.readAsDataURL(e.target.files[0]);
  };



  const handleSubmit  = async (e: any) => {
    e.preventDefault();
    await axios.post("https://adback-w761.onrender.com/api/register-institute", formData, {
      headers: {
        Authorization: `Bearer ${token}`, // Attach token in the header
        "Content-Type": "application/json",
      }
    })
    console.log(formData);
  };

  return (
    <div className="max-w-lg mx-auto p-6 shadow-md border-2  rounded-lg mt-[100px] dark:text-white text-black">
      <h2 className="text-2xl font-bold mb-4 text-center">Register Institute</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="instituteName" placeholder="Institute Name" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="offerCode" placeholder="Offer Code" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="pincode" placeholder="Pincode" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="registeringUser" placeholder="Registering User" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="number" name="validity" placeholder="Validity" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="date" name="issuedDate" placeholder="Issued Date" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="eventName" placeholder="Event Name" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        
        <Listbox>
          <Listbox.Button className="w-full p-2 border border-gray-300 rounded flex justify-between items-center">
            <span>
              {selectedCourses.length > 0
                ? selectedCourses.map((c) => c.name).join(", ")
                : "Select Courses"}
            </span>
            <ChevronDown className="h-5 w-5" />
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-auto bg-black border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
            {courses.map((course: any) => (
              <Listbox.Option
                key={course.id}
                value={course}
                onClick={() => handleSelection(course)}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-900"
              >
                <input
                  type="checkbox"
                  checked={selectedCourses.some((c) => c.id === course.id)}
                  readOnly
                  className="mr-2"
                />
                {course.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
        <input
            type="file"
            name=""
            id="avatar"
            className=""
            onChange={imageHandler}
            accept="image/png,image/jpg,image/jpeg,image/webp"
          />
        <input type="text" name="certificateData" placeholder="Certificate Data" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Submit</button>
      </form>
    </div>
  );
};

export default RegisterInstituteForm;

