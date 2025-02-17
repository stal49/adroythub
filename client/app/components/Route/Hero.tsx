'use client'
import Image from "next/image";
import Link from "next/link";
import React, { FC, useState } from "react";
import { BiSearch } from "react-icons/bi";
import Loader from "../Loader/Loader";
import { useRouter } from "next/navigation";

type Props = {};

const Hero: FC<Props> = (props) => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (search === "") {
      return;
    } else {
      router.push(`/courses?title=${search}`);
    }
  };

  const title = "Advance your career in every Industry & Domain!";
  const subTitle = "Join our community where continuous learning, skill enhancement, and knowledge expansion are highly valued and appreciated. Embrace the adventure of growth with us!";

  return (
    <>
      <div className="w-full 1000px:flex items-center justify-center">
        <div className="1000px:ml-[40px] items-center justify-center">
          <Image
            src={require('../../../public/assests/1.png')}
            width={1000}
            height={1000}
            alt="Hero Image"
            className="w-[800px] h-auto flex justify-center transform transition-transform duration-1000 ease-in-out hover:scale-105"
          />
        </div>
        <div className="1000px:w-[60%] flex flex-col items-center 1000px:mt-[0px] text-center 1000px:text-center ">
          <h2 className="dark:text-white text-[#000000c7] text-[30px] px-3 w-full 1000px:text-[70px] font-[600] font-Josefin py-2 1000px:leading-[75px] 1500px:w-[60%] 1100px:w-[78%] text-gradient mt-10">
            {title}
          </h2>
          <br />
          <p className="dark:text-[#edfff4] text-[#000000ac] font-Josefin font-[600] text-[18px] 1500px:!w-[55%] 1100px:!w-[78%]">
            {subTitle}
          </p>
          <br />
          <div className="1500px:w-[55%] 1100px:w-[78%] w-[90%] h-[50px] bg-transparent relative">
            <input
              type="search"
              placeholder="Search Courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border dark:border-none dark:bg-[#575757] dark:placeholder:text-[#ffffffdd] rounded-[5px] p-2 w-full h-full outline-none text-[#0000004e] dark:text-[#ffffffe6] text-[20px] font-[500] font-Josefin"
            />
            <div
              className="absolute flex items-center justify-center w-[50px] cursor-pointer h-[50px] right-0 top-0 bg-[#39c1f3] rounded-r-[5px]"
              onClick={handleSearch}
            >
              <BiSearch className="text-white" size={30} />
            </div>
          </div>
          <br />
          <div className="1500px:w-[55%] 1100px:w-[78%] w-[90%] flex items-center">
            <Image
              src={require("../../../public/assests/client-1.jpg")}
              alt="Client 1"
              className="rounded-full"
            />
            <Image
              src={require("../../../public/assests/client-2.jpg")}
              alt="Client 2"
              className="rounded-full ml-[-20px]"
            />
            <Image
              src={require("../../../public/assests/client-3.jpg")}
              alt="Client 3"
              className="rounded-full ml-[-20px]"
            />
            <p className="font-Josefin dark:text-[#edfff4] text-[#000000b3] 1000px:pl-3 text-[18px] font-[600]">
              150K+ People already trusted us. {" "}
              <Link href="/courses" className="dark:text-[#46e256] text-[crimson]">
                View Courses
              </Link>{" "}
            </p>
          </div>
          <br />
        </div>
      </div>
    </>
  );
};

export default Hero;
