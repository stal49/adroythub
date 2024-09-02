import React, { useRef, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { styles } from "../styles/style";
import { HiMinus, HiPlus } from 'react-icons/hi';
import { redirect } from "next/navigation";
import EnrollmentForm from "../components/EnrollmentForm/EnrollmentForm";

type Testimonial = {
    id: number;
    name: string;
    role: string;
    testimonial: string;
  };

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Pruthvi Terkar",
      role: "Intern",
      testimonial:
        "The Adroythub Internship was a game-changer for me. The hands-on experience and mentorship helped me land a full-time job in software development.",
    },
    {
      id: 2,
      name: "Asavari Nikam",
      role: "Intern",
      testimonial:
        "My internship in digital marketing at Adroythub gave me the skills and confidence I needed to start my career. I&apos;m now working full-time as a Social Media Manager.",
    },
    
  ];

type Question = {
    id: number;
    question: string;
    answer: string;
  };
  
  const questions: Question[] = [
    {
      id: 1,
      question: "What are the working hours?",
      answer: "Expect to work 20-30 hours per week, with flexible scheduling options.",
    },
    {
      id: 2,
      question: "Can I apply if I haven&apos;t completed my Adroythub course yet?",
      answer: "The internship is only available to those who have completed their courses. We encourage you to apply once you have finished.",
    },
    {
      id: 3,
      question: "What support is provided during the internship?",
      answer: "You will receive mentorship, resources, and regular feedback to help you succeed.",
    },
    {
        id: 4,
        question: "How is performance evaluated?",
        answer: "Through regular check-ins, project outcomes, and final presentations or reports. Exceptional interns may receive recommendations or further opportunities.",
      },
    // Add more questions as needed
  ];
  

const Internship = () => {
    const { theme } = useTheme();

    const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const toggleQuestion = (id: number) => {
    setActiveQuestion((prevId) => (prevId === id ? null : id));
  };

  const targetSectionRef = useRef<HTMLDivElement>(null);
  const scrollToSection = () => {
    if (targetSectionRef.current) {
        targetSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
};

const [isFormVisible, setFormVisible] = useState(false);

    const toggleFormVisibility = () => {
        setFormVisible((prev) => !prev);
    };
    const closeForm = () => {
      setFormVisible(false);
  };


    return(
        <div className="text-black dark:text-white">
            <br />
            <h1 className={`${styles.title} text-[30px] 800px:text-[45px]`}>
                <span className="text-gradient">Adroythub </span>Internship Programme
            </h1>
            <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
                  <p className="text-[14px] sm:text-[16px] md:text-[18px] 800px:text-[20px] font-Poppins m-4 sm:m-5 800px:m-20 pt-4 sm:pt-5 800px:pt-10">
                    Join Adroythub&apos;s exclusive internship program for graduates of our offline courses. Gain hands-on experience in IT, programming, marketing, and business communication. Apply now to boost your career with real-world projects and expert mentorship.
                    <br />
                    <br />
                    <button
                      className="text-xs sm:text-sm md:text-base bg-purple-500 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl text-white dark:text-white mt-4"
                      onClick={scrollToSection}
                    >
                      Learn More
                    </button>
                  </p>
                  <Image
                    src={require("../../public/assests/internship-job-training-illustration.png")}
                    alt="about us!"
                    className="w-full sm:w-[400px] md:w-[500px] 800px:w-[626px] mt-6 sm:mt-10 800px:mt-20 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4"
                  />
            </div>


            <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
              <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
                <h1 className="text-[24px] 800px:text-[45px] font-bold">
                  <span className="text-gradient">Empower Your Future with Practical Experience</span>
                </h1>
                <br />
                At Adroythub, a subsidiary of Adsium Innovation Private Limited, we believe that real-world experience is key to unlocking your full potential. That&apos;s why we&apos;ve created an exclusive internship program for graduates of our offline batches. This program is designed to bridge the gap between academic learning and industry application, offering you the opportunity to work on meaningful projects in IT, programming, marketing, and business communication.
                <br />
                <br />
                <div ref={targetSectionRef} className="flex justify-center mt-7 p-4 800px:p-8">
                  <h2 className="text-2xl 800px:text-3xl text-gradient">Who Can Apply?</h2>
                </div>
                <p className="text-[16px] 800px:text-[20px] font-Poppins">
                  This internship is open to students who have successfully completed any of our offline courses at Adroythub. If you&apos;ve taken courses in IT, programming languages, business communication, or marketing, this program is your next step towards a successful career.
                </p>
              </p>
            </div>


            <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
              <Image
                src={require("../../public/assests/illustrated-woman-being-intern-company.png")} 
                alt="about us!"
                className="h-auto w-full 800px:w-[50%] mt-10 800px:mt-0 rounded-3xl p-4"
              /> 
              <div className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
                <h1 className={`${styles.title} text-[24px] 800px:text-[45px] text-center 800px:text-left`}>
                  <span className="text-gradient">Not yet enrolled in our offline courses?</span>
                </h1>
                <p className="mt-4">
                  Visit <span className="text-gradient">http://www.adroythub.com</span> or contact us at <span className="text-gradient">Official@adroythub.com</span> to learn more about our offerings and how you can become eligible for this opportunity.
                </p>
                <button className="text-sm bg-purple-500 p-4 rounded-2xl text-white dark:text-white mt-5"
                  onClick={toggleFormVisibility}
                >
                  Enroll Now!
                </button>
                {isFormVisible && <EnrollmentForm onClose={closeForm} />}  
              </div>
            </div>


                <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
                  <div className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20">
                    <h2 className={`${styles.title} text-[28px] 800px:text-[40px] text-center 800px:text-left`}>
                      <span className="text-gradient">Why Choose the Adroythub Internship?</span>
                    </h2>
                    <p className="mt-4">
                      <span className="text-gradient">1. Real-World Experience:</span> Gain hands-on experience that complements your coursework. Work on industry-relevant projects that allow you to apply your knowledge in a professional setting. This is your chance to turn theoretical learning into practical skills.
                    </p>
                    <p className="mt-4">
                      <span className="text-gradient">2. Diverse Roles:</span> Our program offers a range of roles tailored to your area of expertise:
                    </p>
                    <ul className="list-disc list-inside ml-5 mt-4">
                      <li className="text-gradient">IT-Related Roles:</li>
                      <ul className="ml-5">
                        <li>Software Development: Engage in full-cycle software development, from coding to deployment.</li>
                        <li>Web Development: Design and optimize responsive websites using cutting-edge technologies.</li>
                        <li>App Testing: Ensure the quality and functionality of mobile and web applications.</li>
                        <li>Cybersecurity: Learn to identify and mitigate security threats in real-world scenarios.</li>
                      </ul>
                      <li className="text-gradient mt-4">Programming Languages:</li>
                      <ul className="ml-5">
                        <li>Java, Python, JavaScript, C++ Development - Work on projects involving backend systems, automation, and tool creation.</li>
                        <li>Database Management - Organize, secure, and analyze data using SQL and other database systems.</li>
                        <li>Full Stack Development - Contribute to both front-end and back-end development of comprehensive solutions.</li>
                      </ul>
                      <li className="text-gradient mt-4">Marketing Roles:</li>
                      <ul className="ml-5">
                        <li>Digital Marketing: Create and execute strategies that drive online traffic and sales.</li>
                        <li>Social Media Management: Develop campaigns that increase brand engagement and visibility.</li>
                        <li>Content Marketing: Write and distribute content that attracts and retains customers.</li>
                      </ul>
                      <li className="text-gradient mt-4">Business Communication:</li>
                      <ul className="ml-5">
                        <li>Content Creation: Develop persuasive content for blogs, websites, and marketing materials.</li>
                        <li>Client Interaction: Learn effective client communication and relationship management.</li>
                        <li>Marketing Communication: Assist in creating promotional materials, emails, and press releases.</li>
                        <li>Report Writing: Document project outcomes and provide insights through professional reports.</li>
                      </ul>
                    </ul>
                    <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-center items-center 800px:items-center">
                        <Image
                          src={require("../../public/assests/internship1.png")} 
                          alt="about us!"
                          className="h-auto w-full 800px:w-[50%] mt-10 800px:mt-0 rounded-3xl p-4"
                        /> 
                    </div>
                    
                    <p className="mt-4">
                               <span className="text-gradient">3. Mentorship and Networking:</span> Work closely with experienced mentors who will guide you through your projects and help you navigate the professional world. In addition, you&apos;ll have the opportunity to network with industry professionals, opening doors to future career opportunities.
                             </p>
                    <p className="mt-4">
                      <span className="text-gradient">4. Career Advancement:</span> Many of our interns have gone on to secure full-time positions within Adsium Innovation or other leading companies. The experience and skills you gain here will give you a competitive edge in the job market.
                    </p>
                    <p className="mt-4">
                      <span className="text-gradient">5. Portfolio Development:</span> Build a strong portfolio showcasing your skills and accomplishments. This portfolio will be a powerful tool in your job search, demonstrating your ability to deliver real-world results.
                    </p>
                  </div>
                </div>

                <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
                  <div className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20">
                    <h1 className={`${styles.title} text-[28px] 800px:text-[45px] text-center 800px:text-left`}>
                      <span className="text-gradient2">Internship Program Details</span>
                    </h1>
                    <p className="mt-4">
                      <span className="text-gradient text-2xl">Duration:</span>
                      <br />
                      Internships typically last 3 to 6 months, giving you ample time to immerse yourself in projects and gain substantial experience.
                    </p>
                    <p className="mt-4">
                      <span className="text-gradient text-2xl">Location:</span>
                    </p>
                    <ul className="ml-5 mt-2">
                      <li>Remote: Work from anywhere with virtual collaboration tools.</li>
                      <li>On-Site: Join us at our headquarters for a traditional office experience.</li>
                      <li>Hybrid: Combine remote work with occasional on-site sessions.</li>
                    </ul>
                    <p className="mt-4">
                      <span className="text-gradient text-[24px]">Eligibility Criteria:</span>
                      <br />
                      To be eligible for the Adroythub Internship Program, you must have completed at least one of the following offline courses:
                    </p>
                    <ul className="list-disc list-inside ml-5 mt-2">
                      <li>IT Courses: Full Stack Development, Mobile App Development, Cybersecurity Essentials, etc.</li>
                      <li>Programming Languages: Java, Python, JavaScript, C++, HTML/CSS, SQL, etc.</li>
                      <li>Business Communication: Professional Writing, Effective Communication, etc.</li>
                      <li>Marketing Courses: Digital Marketing Strategies, Social Media Marketing, Content Marketing, etc.</li>
                    </ul>
                  </div>
                </div>

                <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
                  <div className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20">
                    <h1 className={`${styles.title} text-[28px] 800px:text-[45px] text-center 800px:text-left`}>
                      <span className="text-gradient">How To Apply?</span>
                    </h1>
                    <p className="mt-4">
                      <span className="text-gradient2 text-[20px] 800px:text-[24px]">Application Process</span>
                    </p>
                    <ul className="list-disc list-inside ml-5 mt-2">
                      <li>1. Fill Out the Online Application: Provide your details and course information. [Click on Enroll Now!]</li>
                      <li>2. Submit Your Resume and Portfolio: Highlight your skills, projects, and achievements.</li>
                      <li>3. Complete an Online Assessment: Depending on the role, you may be asked to complete a short assessment or submit a project.</li>
                      <li>4. Attend a Virtual Interview: If shortlisted, you&apos;ll be invited to discuss your suitability for the role.</li>
                    </ul>
                    <button className="text-sm bg-purple-500 p-4 rounded-2xl text-white dark:text-white mt-4"
                      onClick={toggleFormVisibility}
                    >
                      Enroll Now!
                    </button>
                    {isFormVisible && <EnrollmentForm onClose={closeForm} />}
                  </div>

                  <Image
                    src={require("../../public/assests/job-interview-process-hiring-new-employees-hr-specialist-cartoon-character-talking-new-candidatee-recruitment-employment-headhunting-concept-illustration.png")}
                    alt="about us!"
                    className="h-auto w-full 800px:w-[50%] mt-10 800px:mt-0 rounded-3xl p-4"
                  />
                </div>



                

                <div className="py-12">
                  <div className="text-center mb-12">
                    <h1 className={`${styles.title} text-[28px] sm:text-[35px] lg:text-[45px]`}>
                      <span className="text-gradient">Success Stories</span>
                      <br />
                      <span className="text-gradient2 text-xl sm:text-2xl lg:text-3xl">
                        Alumni Testimonials
                      </span>
                    </h1>
                  </div>

                  <div className="max-w-6xl mx-auto px-4">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                      {testimonials.map((testimonial) => (
                        <div
                          key={testimonial.id}
                          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                        >
                          <blockquote className="text-gray-700 dark:text-gray-300 mb-4">
                            {testimonial.testimonial}
                          </blockquote>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {testimonial.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


                <div className="py-12">
                  <div className="w-[95%] sm:w-[85%] m-auto">
                    <h1 className={`${styles.title} text-[28px] sm:text-[35px] lg:text-[45px] text-center mb-8`}>
                      <span className="text-gradient">Case Studies</span>
                    </h1>

                    <div className="text-[16px] sm:text-[18px] lg:text-[20px] font-Poppins mx-4 sm:mx-8 lg:mx-20">
                      <ul className="list-disc list-inside space-y-4">
                        <li>
                          IT Project: An intern developed an e-commerce platform that’s now driving significant sales for a local business.
                        </li>
                        <li>
                          Programming Project: An intern built a Python-based data analytics tool that’s improving decision-making for a client.
                        </li>
                        <li>
                          Marketing Project: An intern managed a social media campaign that increased a startup’s followers by 50% and boosted engagement by 30%.
                        </li>
                        <li>
                          Business Communication Project: An intern created client presentations that secured a major client for the company.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

        

                <div className="w-[90%] sm:w-[80%] m-auto">
                    <h1 className={`${styles.title} text-[28px] sm:text-[35px] lg:text-[40px]`}>
                      Frequently Asked Questions
                    </h1>

                    <div className="mt-12">
                    <dl className="space-y-8">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className={`${q.id !== questions[0]?.id && "border-t"} border-gray-200 pt-6`}
                        >
                          <dt className="text-lg">
                            <button
                              className="flex items-start justify-between w-full text-left focus:outline-none"
                              onClick={() => toggleQuestion(q.id)}
                            >
                              <span className="font-medium text-black dark:text-white">
                                {q.question}
                              </span>
                              <span className="ml-6 flex-shrink-0">
                                {activeQuestion === q.id ? (
                                  <HiMinus className="h-6 w-6 text-black dark:text-white" />
                                ) : (
                                  <HiPlus className="h-6 w-6 text-black dark:text-white" />
                                )}
                              </span>
                            </button>
                          </dt>
                          {activeQuestion === q.id && (
                            <dd className="mt-2 pr-12">
                              <p className="text-base font-Poppins text-black dark:text-white">
                                {q.answer}
                              </p>
                            </dd>
                          )}
                        </div>
                      ))}
                    </dl>
                  </div>
                    
                  <div className="mt-12 mb-10 text-[18px] sm:text-[20px] lg:text-[22px] font-Poppins mx-4 sm:mx-8 lg:mx-12">
                    Ready to take the next step in your career?{' '}
                    <span className="text-gradient2">Apply Now</span> to join the Adroythub Internship Program.{' '}
                    <br />
                    Gain real-world experience, build your portfolio, and start your professional journey with us.
                  </div>
                </div>
                    
        </div>
    );
};

export default Internship;