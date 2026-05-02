import Ratings from "@/app/utils/Ratings";
import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";

type Props = {
  item: any;
  isProfile?: boolean;
};

const CourseCard: FC<Props> = ({ item, isProfile }) => {
  return (
    <Link
      href={!isProfile ? `/course/${item._id}` : `course-access/${item._id}`}
      className="block w-full h-full"
    >
      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden transition-all duration-300 flex flex-col justify-between">
        <div className="w-full h-[160px] relative overflow-hidden">
          <Image
            src={item.thumbnail?.url || "/placeholder.png"}
            alt={item.name}
            width={500}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <h1 className="font-Poppins font-semibold text-[15px] text-slate-900 dark:text-white leading-snug min-h-[44px] line-clamp-2">
              {item.name}
            </h1>
            <div className="flex items-center gap-1 pt-2 pb-2">
              <Ratings rating={item.ratings} />
              <span className="text-gray-500 dark:text-gray-400 text-[13px] font-medium ml-1">
                ({item.numberOfRatings || 0})
              </span>
            </div>
            <div className="flex items-baseline gap-2 pb-3">
              <span className="text-[16px] font-bold text-slate-900 dark:text-white">
                {item.price === 0 ? "Free" : item.price + "₹"}
              </span>
              {item.estimatedPrice && item.estimatedPrice !== item.price && (
                <span className="text-[14px] font-medium text-gray-400 dark:text-gray-500 line-through">
                  {item.estimatedPrice}₹
                </span>
              )}

            </div>
            <div className="flex flex-wrap items-center gap-2 pb-4">
              <div className="bg-[#f1f5f9] dark:bg-slate-800 px-3 py-1 rounded-full text-[12px] font-medium text-slate-600 dark:text-slate-300">
                {item.purchased || 0} enrolled
              </div>
              <div className="bg-[#f1f5f9] dark:bg-slate-800 px-3 py-1 rounded-full text-[12px] font-medium text-slate-600 dark:text-slate-300">
                {item.courseData?.length || 0} lectures
              </div>
            </div>
          </div>
          <div className="w-full text-center py-3 bg-gradient-to-r from-[#3a52df] to-[#9105cf] hover:from-[#2a3fc4] hover:to-[#7f04b5] text-white text-[14px] font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg mt-auto">
            Enroll Now
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
