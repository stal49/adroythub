"use client";
import React, { FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { styles } from "../../../app/styles/style";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const schema = Yup.object().shape({
  name: Yup.string().required("Please enter your name!"),
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email!"),
  password: Yup.string().required("Please enter your password!").min(6),
  mobile: Yup.string()
    .matches(/^\d{10}$/, "Invalid mobile number")
    .required("Mobile number is required"),
  institute: Yup.string(),
  code: Yup.string(),
});

const Signup: FC = () => {
  const [show, setShow] = useState(false);
  const [register, { data, error, isSuccess, isLoading }] = useRegisterMutation();
  const router = useRouter();



  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", mobile: "", institute: "", code: "" },
    validationSchema: schema,
    onSubmit: async ({ name, email, password, mobile, institute, code }) => {
      await register({ name, email, password, mobile, institute, code });
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  useEffect(() => {
    const savedData = localStorage.getItem("signup_data");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      formik.setValues({ ...formik.values, ...parsedData, password: "" });
    }
  }, []);

  useEffect(() => {
    const { password, ...rest } = values;
    localStorage.setItem("signup_data", JSON.stringify(rest));
  }, [values]);

  useEffect(() => {
    if (isSuccess) {
      const message = data?.message || "Registration successful";
      toast.success(message);
      localStorage.removeItem("signup_data");
      router.push("/verification");
    }
    if (error) {
      if ("data" in error) {
        toast.error("Registration Failed");
      }
    }
  }, [isSuccess, error, data, router]);

  return (
    <div className="w-full">
      <h1 className={`${styles.title}`}>Join to Adroythub</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className={`${styles.label}`} htmlFor="name">
            Enter your Name
          </label>
          <input
            type="text"
            value={values.name}
            onChange={handleChange}
            id="name"
            placeholder="johndoe"
            className={`${errors.name && touched.name && "border-red-500"} ${styles.input}`}
          />
          {errors.name && touched.name && (
            <span className="text-red-500 pt-2 block">{errors.name}</span>
          )}
        </div>
        <label className={`${styles.label}`} htmlFor="email">
          Enter your Email
        </label>
        <input
          type="email"
          value={values.email}
          onChange={handleChange}
          id="email"
          placeholder="loginmail@gmail.com"
          className={`${errors.email && touched.email && "border-red-500"} ${styles.input}`}
        />
        {errors.email && touched.email && (
          <span className="text-red-500 pt-2 block">{errors.email}</span>
        )}
        <div className="w-full mt-5 relative mb-1">
          <label className={`${styles.label}`} htmlFor="password">
            Create your password
          </label>
          <input
            type={!show ? "password" : "text"}
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="password!@%"
            className={`${errors.password && touched.password && "border-red-500"} ${styles.input}`}
          />
          {!show ? (
            <AiOutlineEyeInvisible
              className="absolute bottom-3 right-2 cursor-pointer"
              size={20}
              onClick={() => setShow(true)}
            />
          ) : (
            <AiOutlineEye
              className="absolute bottom-3 right-2 cursor-pointer"
              size={20}
              onClick={() => setShow(false)}
            />
          )}
        </div>
        {errors.password && touched.password && (
          <span className="text-red-500 pt-2 block">{errors.password}</span>
        )}
        <div className="w-full mt-5 relative mb-1">
          <label className={`${styles.label}`} htmlFor="mobile">
            Mobile No.
          </label>
          <input
            type="number"
            value={values.mobile}
            onChange={handleChange}
            id="mobile"
            placeholder="9874561231"
            className={`${errors.mobile && touched.mobile && "border-red-500"} ${styles.input}`}
          />
        </div>
        <div className="w-full mt-5 relative mb-1">
          <label className={`${styles.label}`} htmlFor="institute">
            Enter Name of Institute <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            id="institute"
            onChange={handleChange}
            value={values.institute}
            placeholder="johndoe"
            className={`${errors.institute && touched.institute && "border-red-500"} ${styles.input}`}
          />
        </div>
        <div className="w-full mt-5 relative mb-1">
          <label className={`${styles.label}`} htmlFor="code">
            Enter Promo Code <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            onChange={handleChange}
            value={values.code}
            id="code"
            placeholder="johndoe"
            className={`${errors.code && touched.code && "border-red-500"} ${styles.input}`}
          />
        </div>
        <div className="w-full mt-5">
          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.button} flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
        <br />
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
          Already have an account?{" "}
          <span className="text-[#2190ff] pl-1 cursor-pointer" onClick={() => router.push("/login")}>
            Sign in
          </span>
        </h5>
      </form>
      <br />
    </div>
  );
};

export default Signup;
