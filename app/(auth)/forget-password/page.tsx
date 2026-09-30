"use client";
import React from "react";
import ForgotPassword from "../../components/Auth/ForgotPassword";

const ForgetPasswordPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen py-10 px-4">
      <div className="w-full max-w-[440px] p-6 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800">
        <ForgotPassword />
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
