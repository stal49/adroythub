import { styles } from "@/app/styles/style";
import Image from "next/image";
import React from "react";
import ReviewCard from "../Review/ReviewCard";

type Props = {};

export const reviews = [
  {
    name: "Ravi Sharma",
    avatar: require('@/public/assests/user4.jpg'),
    profession: "Student | Pune university",
    comment:
    "I had the pleasure of exploring Adroythub, a website that provides an extensive range of courses on various tech-related topics. I was thoroughly impressed with my experience, as the website offers a comprehensive selection of courses that cater to different skill levels and interests. If you're looking to enhance your knowledge and skills in the tech industry, I highly recommend checking out Becodemy!",
},
  {
    name: "Priya Desai",
    avatar: require('@/public/assests/user2.jpg'),
    profession: "Full stack developer | Quarter ltd.",
    comment:
    "Thanks for your amazing programming tutorial channel! Your teaching style is outstanding, and the quality of your tutorials is top-notch. Your ability to break down complex topics into manageable parts, and cover diverse programming languages and topics is truly impressive. The practical applications and real-world examples you incorporate reinforce the theoretical knowledge and provide valuable insights. Your engagement with the audience fosters a supportive learning environment. Thank you for your dedication, expertise, and passion for teaching programming, and keep up the fantastic work!",
},
  {
    name: "Vikram Rao",
    avatar: require('@/public/assests/user6.jpg'),
    profession: "computer systems engineering student | India",
    comment:
    "Thanks for your amazing programming tutorial channel! Your teaching style is outstanding, and the quality of your tutorials is top-notch. Your ability to break down complex topics into manageable parts, and cover diverse programming languages and topics is truly impressive. The practical applications and real-world examples you incorporate reinforce the theoretical knowledge and provide valuable insights. Your engagement with the audience fosters a supportive learning environment. Thank you for your dedication, expertise, and passion for teaching programming, and keep up the fantastic work!"},
  {
    name: "Aditi Singh",
    avatar: require('@/public/assests/user1.jpg'),
    profession: "Junior Web Developer | Pune",
    comment:
    "I had the pleasure of exploring Adroythub, a website that provides an extensive range of courses on various tech-related topics. I was thoroughly impressed with my experience",
},
  {
    name: "Sneha Patil",
    avatar: require('@/public/assests/user3.jpg'),
    profession: "Full stack web developer | Mumbai",
    comment:
    "Your content is very special. The thing I liked the most is that the videos are so long, which means they cover everything in details. for that any person had beginner-level can complete an integrated project when he watches the videos. Thank you very much. Im very excited for the next videos Keep doing this amazing work",
},
  {
    name: "Neha Verma",
    avatar: require('@/public/assests/user7.jpg'),
    profession: "Full stack web developer | Jaipur",
    comment:
    "Join Adroythub! Adroythub focuses on practical applications rather than just teaching the theory behind programming languages or frameworks. I took a lesson on creating a web marketplace using React JS, and it was very helpful in teaching me the different stages involved in creating a project from start to finish. Overall, I highly recommend Adroythub to anyone looking to improve their programming skills and build practical projects. Adroythub is a great resource that will help you take your skills to the next level.",
},
];

const Reviews = (props: Props) => {
  return (
  <div className="w-[90%] 800px:w-[85%] m-auto">
      <div className="w-full 800px:flex items-center">
      <div className="800px:w-[50%] w-full">
        <Image
        src={require("../../../public/assests/business-img.png")}
        alt="business"
        width={700}
        height={700}
        />
        </div>
        <div className="800px:w-[50%] w-full">
          <h3 className={`${styles.title} 800px:!text-[40px]`}>
            Our Students Are <span className="text-gradient">Our Strength</span>{" "}
            <br /> See What They Say About Us
          </h3>
          <br />
          <p className={styles.label}>
          Our students are our strength, and their success stories are a testament to our commitment to quality education. At Adroythub, we provide an enriching online learning experience tailored to each student&apos;s needs. Our interactive sessions and comprehensive courses empower students to achieve their goals and excel in their fields. See what our students have to say about their journey with us and how Adroythub has made a difference in their lives.
          </p>
        </div>
        <br />
        <br />
       </div>
       <div className="grid grid-cols-1 gap-[25px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-2 lg:gap-[25px] xl:grid-cols-2 xl:gap-[35px] mb-12 border-0 md:[&>*:nth-child(3)]:!mt-[-60px] md:[&>*:nth-child(6)]:!mt-[-20px]">
        {reviews &&
            reviews.map((i, index) => <ReviewCard item={i} key={index} />)}
        </div>
  </div>
  );
};

export default Reviews;
