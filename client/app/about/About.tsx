import React, { useState } from "react";
import Image from "next/image";
import { styles } from "../styles/style";
import { useTheme } from "next-themes";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { ThemeSwitcher } from "../utils/ThemeSwitcher";




const testimonials = [
  {
    id: '1',
    name: 'Shankarlal Khandelwal College of Arts Science & Commerce, Akola',
    image: require("@/public/assests/ws1.jpg"),
    review: 'The workshop at Shankarlal Khandelwal College was an absolute success! The hands-on approach allowed participants to dive deep into practical learning, and the response from the students was overwhelmingly positive. Our expert trainers delivered content that was both engaging and informative, covering the latest industry trends and techniques. The interactive sessions provided students with invaluable insights, and many expressed how the workshop has significantly boosted their confidence and skills. We are thrilled to have made such a positive impact on the participants.',
},
  {
    id: '2',
    name: 'Shankarlal Khandelwal College of Arts Science & Commerce, Akola',
    image: require('@/public/assests/ws4.jpg'),
    review: 'The workshop at Shankarlal Khandelwal College was an absolute success! The hands-on approach allowed participants to dive deep into practical learning, and the response from the students was overwhelmingly positive. Our expert trainers delivered content that was both engaging and informative, covering the latest industry trends and techniques. The interactive sessions provided students with invaluable insights, and many expressed how the workshop has significantly boosted their confidence and skills. We are thrilled to have made such a positive impact on the participants.',
},
  {
    id: '3',
    name: 'RLT College Of Science, Akola',
    image: require('@/public/assests/ws2.jpg'),
    review: 'The workshop at RLT College Of Science, Akola was a remarkable experience for all involved. The carefully curated content ensured that every participant walked away with a deep understanding of the subject matter. Our trainers were praised for their ability to simplify complex topics, making the learning process enjoyable and effective. The real-world applications discussed during the sessions left students inspired and eager to apply their new knowledge. This workshop has set a new standard for educational events, and the feedback from both students and faculty has been overwhelmingly positive.',
  },
  {
    id: '4',
    name: 'RLT College Of Science, Akola',
    image: require('@/public/assests/ws3.jpg'),
    review: 'The workshop at RLT College Of Science, Akola was a remarkable experience for all involved. The carefully curated content ensured that every participant walked away with a deep understanding of the subject matter. Our trainers were praised for their ability to simplify complex topics, making the learning process enjoyable and effective. The real-world applications discussed during the sessions left students inspired and eager to apply their new knowledge. This workshop has set a new standard for educational events, and the feedback from both students and faculty has been overwhelmingly positive.',
  },
  {
    id: '5',
    name: 'Shri Chhatrapati Shivaji Maharaj College Of Engineering, Ahmednagar',
    image: require('@/public/assests/ws12 (1).jpeg'),
    review: 'Our workshop at Shri Chhatrapati Shivaji Maharaj College Of Engineering, Ahmednagar, was a remarkable experience for everyone involved. The students showed immense interest in the topics covered, and the interactive sessions were particularly well-received. Our team of experts delivered comprehensive content on cutting-edge technologies, ensuring that participants gained practical knowledge applicable to their future careers. The colleges supportive environment made the workshop smooth and successful. We are grateful for the opportunity to collaborate with such a prestigious institution and are excited about the positive impact this workshop has had on the students educational journey.`'
},
  {
    id: '6',
    name: 'Shri Chhatrapati Shivaji Maharaj College Of Engineering, Ahmednagar',
    image: require('@/public/assests/ws13.jpeg'),
    review: 'Our workshop at Shri Chhatrapati Shivaji Maharaj College Of Engineering, Ahmednagar, was a remarkable experience for everyone involved. The students showed immense interest in the topics covered, and the interactive sessions were particularly well-received. Our team of experts delivered comprehensive content on cutting-edge technologies, ensuring that participants gained practical knowledge applicable to their future careers. The colleges supportive environment made the workshop smooth and successful. We are grateful for the opportunity to collaborate with such a prestigious institution and are excited about the positive impact this workshop has had on the students educational journey.',
},
{
  id: '7',
  name: 'SPIT Polytechnic college Kurund, Shirur',
  image: require('@/public/assests/ws7.jpg'),
  review: 'The workshop at SPIT Polytechnic College, Kurund, Shirur, was an inspiring event that left a lasting impact on both students and faculty. Our team introduced a variety of practical sessions that aligned perfectly with the students academic curriculum and future career aspirations. The enthusiasm and eagerness to learn demonstrated by the participants made the workshop particularly rewarding. The colleges commitment to providing quality education was evident in their support and organization, which contributed significantly to the workshops success. We are proud to have been part of this enriching experience and look forward to more such collaborations in the future.',
},
{
  id: '8',
  name: 'SPIT Polytechnic college Kurund, Shirur',
  image: require('@/public/assests/ws6.jpg'),
  review: 'The workshop at SPIT Polytechnic College, Kurund, Shirur, was an inspiring event that left a lasting impact on both students and faculty. Our team introduced a variety of practical sessions that aligned perfectly with the students academic curriculum and future career aspirations. The enthusiasm and eagerness to learn demonstrated by the participants made the workshop particularly rewarding. The colleges commitment to providing quality education was evident in their support and organization, which contributed significantly to the workshops success. We are proud to have been part of this enriching experience and look forward to more such collaborations in the future.',
},
{
  id: '9',
  name: 'Radha Devi Goenka College for Women Akola',
  image: require('@/public/assests/ws14.jpeg'),
  review: 'The workshop at Radha Devi Goenka College for Women Akola, was an inspiring event that left a lasting impact on both students and faculty. Our team introduced a variety of practical sessions that aligned perfectly with the students academic curriculum and future career aspirations. The enthusiasm and eagerness to learn demonstrated by the participants made the workshop particularly rewarding. The colleges commitment to providing quality education was evident in their support and organization, which contributed significantly to the workshops success. We are proud to have been part of this enriching experience and look forward to more such collaborations in the future.',
},

];


const About = () => {
  const { theme } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  

  return (
    <div className="text-black dark:text-white">
    <div className="py-12">
      <h1 className={`${styles.title} text-[30px] sm:text-[35px] lg:text-[45px]`}>
        What is <span className="text-gradient">Adroythub?</span>
      </h1>
      <div className="w-[95%] sm:w-[85%] m-auto flex flex-col sm:flex-row justify-between items-center sm:items-start">
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-Poppins m-5 sm:m-10 lg:m-20 pt-5 sm:pt-10">
          Welcome to Adroythub, your ultimate destination for educational excellence and career advancement. We specialize in providing top-notch IT courses and a diverse range of career-boosting programs designed to propel students into successful careers across various sectors.
          <br />
          <br />
          At Adroythub, we believe that education is the key to unlocking your potential. Our platform offers a comprehensive selection of online learning courses tailored to meet the evolving demands of the job market. From programming courses and cybersecurity training to digital marketing and business management, our expertly crafted curriculum ensures you gain the skills and knowledge needed to excel in your chosen field.
        </p>
        <Image
          src={require("../../public/assests/about1.jpg")}
          alt="about us!"
          className="h-60 w-60 sm:h-80 sm:w-80 lg:h-96 lg:w-96 mt-10 sm:mt-16 lg:mt-20 rounded-3xl border-4 border-gray-400 p-4"
        />
      </div>
  
      <div className="w-[95%] sm:w-[85%] m-auto flex flex-col sm:flex-row justify-between items-center">
        <p className="text-[20px] sm:text-[22px] lg:text-[24px] font-Poppins m-5 sm:m-10 lg:m-20 pt-10">
          <h1 className={`${styles.title} text-[30px] sm:text-[35px] lg:text-[45px]`}>
            Why Choose <span className="text-gradient">Adroythub?</span>
          </h1>
          <br />
          Our team of industry experts is dedicated to delivering high-quality, interactive learning experiences. With flexible, self-paced courses, you can learn at your own convenience, making it easier than ever to balance education with your busy lifestyle.
          <div className="p-4 sm:p-6 lg:p-8 rounded-lg">
  <ul className="space-y-4 sm:space-y-6">
    <li className="flex flex-col sm:flex-row items-start">
      <span className="text-gradient font-bold mr-0 sm:mr-2 whitespace-nowrap text-base sm:text-lg lg:text-xl">Expert-Led Courses:</span>
      <span className="text-sm sm:text-base lg:text-lg">Learn from seasoned professionals with real-world experience.</span>
    </li>
    <li className="flex flex-col sm:flex-row items-start">
      <span className="text-gradient font-bold mr-0 sm:mr-2 whitespace-nowrap text-base sm:text-lg lg:text-xl">Flexible Learning:</span>
      <span className="text-sm sm:text-base lg:text-lg">Access course materials anytime, anywhere, and study at your own pace.</span>
    </li>
    <li className="flex flex-col sm:flex-row items-start">
      <span className="text-gradient font-bold mr-0 sm:mr-2 whitespace-nowrap text-base sm:text-lg lg:text-xl">Comprehensive Curriculum:</span>
      <span className="text-sm sm:text-base lg:text-lg">Stay ahead with courses designed to keep you competitive in the job market.</span>
    </li>
    <li className="flex flex-col sm:flex-row items-start">
      <span className="text-gradient font-bold mr-0 sm:mr-2 whitespace-nowrap text-base sm:text-lg lg:text-xl">Career Support:</span>
      <span className="text-sm sm:text-base lg:text-lg">Benefit from our resources and guidance to enhance your career prospects.</span>
    </li>
    <li className="flex flex-col sm:flex-row items-start">
      <span className="text-gradient font-bold mr-0 sm:mr-2 whitespace-nowrap text-base sm:text-lg lg:text-xl">Certification:</span>
      <span className="text-sm sm:text-base lg:text-lg">Earn certificates recommended by high-profile industry leaders and personalities, enhancing your professional credibility.</span>
    </li>
  </ul>
</div>

        </p>
      </div>
      <div className="flex justify-center mb-10 sm:mb-0">
  {theme === "dark" ? (
    <Image
      src={require("../../public/assests/adsium-logo.png")}
      alt="logo"
      className="max-w-full h-auto"
      width={300}
      height={300}
      sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
    />
  ) : (
    <Image
      src={require("../../public/assests/adsium-white.png")}
      alt="logo"
      className="max-w-full h-auto"
      width={300}
      height={300}
      sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
    />
  )}
</div>

      <div className="w-[95%] sm:w-[85%] m-auto flex flex-col sm:flex-row justify-between items-center mt-12">
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-Poppins m-5 sm:m-10 lg:m-20 pt-5 sm:pt-10">
          Adroythub is proudly managed by Adsium Innovation Private Limited, a company dedicated to fostering innovation and excellence in education. With the expertise and support of Adsium Innovation, we strive to deliver the highest quality learning experiences and resources to help you succeed.
          <br />
          <br />
          Join the Adroythub community today and take the first step towards a brighter future. Whether you are looking to upgrade your skills, change careers, or advance in your current role, Adroythub is here to help you achieve your goals.
        </p>
      </div>
  
      <div className="flex justify-center m-8">
        <h1 className={`${styles.title} text-[30px] sm:text-[35px] lg:text-[45px]`}>
          Spotlights Of <span className="text-gradient">Workshop!</span>
        </h1>
      </div>
  
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={handlePrev}
          aria-label="Previous"
          className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next"
          className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
  
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex-none w-full flex-shrink-0 px-4 py-8 md:py-16 md:px-8"
            >
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    height={100}
                    width={300}
                    className="w-[auto] h-[auto] md:w-full md:h-auto rounded-lg shadow-lg object-cover"
                  />
                </div>
                <div className="w-full md:w-2/3 text-center md:text-left md:pl-8">
                  <p className="text-lg text-black dark:text-white mb-4">{testimonial.review}</p>
                  <p className="text-xl font-semibold text-gradient">{testimonial.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  
      <div className="mt-12 text-gradient2 text-[16px] sm:text-[18px] lg:text-[20px] font-Poppins mx-4 sm:mx-8 lg:mx-12">
        At Adroythub, we believe in the power of collaboration to deliver high-quality education to our learners. We proudly partner with a diverse group of experienced course-selling teachers who bring their unique expertise and insights to our platform. By working together, we ensure that our students have access to a wide array of courses that are both relevant and impactful. Our partnerships allow us to continually expand our offerings, providing learners with the tools and knowledge they need to succeed in today&apos;s competitive environment.
      </div>
    </div>
  </div>
  );
};

export default About;
