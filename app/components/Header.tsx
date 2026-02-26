"use client";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import NavItems from "../utils/NavItems";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import Image from "next/image";
import avatar from "../../public/assests/avatar.png";
import { useSession } from "next-auth/react";
import { useLogOutQuery, useSocialAuthMutation } from "@/redux/features/auth/authApi";
import { toast } from "react-hot-toast";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import Loader from "./Loader/Loader";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/features/store";
import { useRouter } from "next/navigation";


type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
  
};

const Header: FC<Props> = ({ activeItem }) => {
  const { theme } = useTheme();
  const [active, setActive] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);
  const {data:userData,isLoading,refetch} = useLoadUserQuery(undefined, { skip: !token });
  const { data } = useSession();
  const [socialAuth, { isSuccess, error }] = useSocialAuthMutation();
  const [logout, setLogout] = useState(false);
  const {} = useLogOutQuery(undefined, {
    skip: !logout ? true : false,
  });

  const router = useRouter();
  const [show, setShow] = useState(token);

  useEffect(() => {
  if(token || userData){
    setShow(token)
  }
  }, [data, userData, token ,isLoading, refetch]);
  

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 85) {
        setActive(true);
      } else {
        setActive(false);
      }
    });
  }

  const handleClose = (e: any) => {
    if (e.target.id === "screen") {
      {
        setOpenSidebar(false);
      }
    }
  };

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);
  useEffect(() => {
    console.log("Token:", token);
    console.log("UserData:", userData);
  }, [token, userData]);

 

  

  return (
   <>
   {
    isLoading ? (
      <Loader />
    ) : (
      <div className="w-full relative">
      <div
        className={`${
          active
            ? "dark:bg-opacity-50 bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-[#ffffff1c] shadow-xl transition duration-500"
            : "w-full border-b dark:border-[#ffffff1c] h-[80px] z-[80] dark:shadow"
        }`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
          <div className="w-full h-[80px] flex items-center justify-between p-3">
            <div>
              <Link
                href={"/"}
                className={`text-[25px] font-Poppins font-[500] text-black dark:text-white`}
              >
                {theme === "dark" ? (
                <Image
                    src={require("../../public/assests/lo.png")}
                    alt="logo"
                    width={200}
                    height={200}
                    
                  />
                ) : (
                  <Image
                    src={require("../../public/assests/logo.png")}
                    alt="logo"
                    width={200}
                    height={200}
                  />
                )}
 
        
              </Link>
            </div>
            <div className="flex items-center">
              <NavItems activeItem={activeItem} isMobile={false} />
              <ThemeSwitcher />
              {/* only for mobile */}
              <div className="800px:hidden">
                <HiOutlineMenuAlt3
                  size={25}
                  className="cursor-pointer dark:text-white text-black"
                  onClick={() => setOpenSidebar(true)}
                />
              </div>
              {token ? (
                <Link href={"/profile"}>
                  <Image
                    src={userData?.user.avatar ? userData.user.avatar.url : avatar}
                    alt=""
                    width={30}
                    height={30}
                    className="w-[30px] h-[30px] rounded-full cursor-pointer"
                    style={{border: activeItem === 6 ? "2px solid #37a39a" : "none"}}
                  />
                </Link>
              ) : (
                <button
                  className=" 800px:block cursor-pointer text-white bg-gradient py-1 text-xs rounded-3xl px-3 md:py-2 md:px-6 md:text-base"
                  onClick={() => router.push("/login")}
                >Sign Up</button>
              )}
            </div>
          </div>
        </div>

        {/* mobile sidebar */}
        {openSidebar && (
          <div
            className="fixed w-full h-screen top-0 left-0 z-[99999] dark:bg-[unset] bg-[#00000024]"
            onClick={handleClose}
            id="screen"
          >
            <div className="w-[70%] fixed z-[999999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
              <NavItems activeItem={activeItem} isMobile={true} />
              {userData?.user ? (
                <Link href={"/profile"}>
                  <Image
                    src={userData?.user.avatar ? userData.user.avatar.url : avatar}
                    alt=""
                    width={30}
                    height={30}
                    className="w-[30px] h-[30px] rounded-full ml-[20px] cursor-pointer"
                    style={{border: activeItem === 6 ? "2px solid #37a39a" : "none"}}
                  />
                </Link>
              ) : (
                <button
                  className=" 800px:block cursor-pointer text-white bg-gradient py-1 text-xs rounded-3xl px-3 md:py-2 md:px-6 md:text-base"
                  onClick={() => router.push("/login")}
                >Login</button>
              )}
              <br />
              <br />
              <p className="text-[16px] px-2 pl-5 text-black dark:text-white">
                Copyright © 2024 Adroythub
              </p>
            </div>
          </div>
        )}
      </div>
      
    </div>
    )
   }
   </>
  );
};

export default Header;
