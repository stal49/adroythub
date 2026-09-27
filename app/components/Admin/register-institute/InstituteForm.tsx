'use client'
import React, { useState } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import axios from "axios";
import { RootState } from "@/redux/features/store";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";



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
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();

    fileReader.onload = () => {
      if (fileReader.readyState === 2) {
        setCertificateImage(fileReader.result as string);
      }
    };
    fileReader.readAsDataURL(file);
  };



  const handleSubmit  = async (e: any) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to register an institute");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        certificateImage,
      };

      const serverUri = process.env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8000/api";
      await axios.post(`${serverUri}/register-institute`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      toast.success("Institute registered successfully!");
      
      setFormData({
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
      setSelectedCourses([]);
      setCertificateImage(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to register institute. Please try again.";
      toast.error(errorMessage);
      console.error("Institute registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 shadow-md border-2  rounded-lg mt-[100px] dark:text-white text-black">
      <h2 className="text-2xl font-bold mb-4 text-center">Register Institute</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="instituteName" placeholder="Institute Name" onChange={handleChange} value={formData.instituteName} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="offerCode" placeholder="Offer Code" onChange={handleChange} value={formData.offerCode} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="pincode" placeholder="Pincode" onChange={handleChange} value={formData.pincode} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="registeringUser" placeholder="Registering User" onChange={handleChange} value={formData.registeringUser} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="number" name="validity" placeholder="Validity" onChange={handleChange} value={formData.validity} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="date" name="issuedDate" placeholder="Issued Date" onChange={handleChange} value={formData.issuedDate} required className="w-full p-2 border border-gray-300 rounded" />
        <input type="text" name="eventName" placeholder="Event Name" onChange={handleChange} value={formData.eventName} className="w-full p-2 border border-gray-300 rounded" />
        
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
        {certificateImage && (
          <p className="text-sm text-green-600">Certificate image selected</p>
        )}
        <input type="text" name="certificateData" placeholder="Certificate Data" onChange={handleChange} value={formData.certificateData} required className="w-full p-2 border border-gray-300 rounded" />
        <button type="submit" disabled={isSubmitting} className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default RegisterInstituteForm;

