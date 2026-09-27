"use client";
import React from "react";
import Signup from "../../components/Auth/SignUp";

const SignupPage = () => {
  return (
    <div  className="flex justify-center items-center min-h-screen">
    <div className="w-[500px] p-5">
      <Signup />
    </div>
    </div>

  );
};

export default SignupPage;
