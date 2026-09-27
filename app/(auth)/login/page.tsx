"use client";
import React from "react";
import Login from "../../components/Auth/Login";

const LoginPage = () => {
  return (
    <div  className="flex justify-center items-center min-h-screen">
    <div className="w-[400px] p-5">
      <Login setOpen={() => {}} refetch={() => {}} />
    </div>
    </div>
  );
};

export default LoginPage;
