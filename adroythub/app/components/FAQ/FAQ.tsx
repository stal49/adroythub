import { styles } from '@/app/styles/style';
import React, { useState } from 'react';
import { HiMinus, HiPlus } from 'react-icons/hi';

type Props = {};

const FAQ = (props: Props) => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const questions = [
    {
      id: 1,
      question: "What types of courses does Adroythub offer?",
      answer: "Adroythub offers a wide range of courses, including IT-related subjects, business, marketing, design, and more. Our courses are designed to cater to both beginners and advanced learners."
    },
    {
      id: 2,
      question: "How can I enroll in a course?",
      answer: "To enroll in a course, simply visit our website, browse through our course catalog, and select the course you are interested in. Click on the 'Enroll Now' button and follow the instructions to complete your registration."
    },
    {
      id: 3,
      question: "Are the courses self-paced?",
      answer: "Yes, most of our courses are self-paced, allowing you to learn at your own convenience. You can access the course materials anytime, anywhere, and progress through the lessons at your own speed."
    },
    {
      id: 4,
      question: "What is the cost of the courses?",
      answer: "Course costs vary depending on the subject and level of the course. Please check the individual course pages for specific pricing information. We also offer discounts and promotions periodically."
    },
    {
      id: 5,
      question: "Do you offer any free courses?",
      answer: "Our instructors are industry experts with extensive experience in their respective fields. They are passionate about teaching and are dedicated to helping students succeed."
    },
    {
      id: 6,
      question: "What qualifications do the instructors have?",
      answer: "Our instructors are industry experts with extensive experience in their respective fields. They are passionate about teaching and are dedicated to helping students succeed."
    },
    {
      id: 7,
      question: "Is there a certificate awarded after completing a course?",
      answer: "Yes, upon successful completion of a course, you will receive a certificate of completion. This certificate can be shared with employers or added to your resume and LinkedIn profile."
    },
    {
      id: 8,
      question: "How can I get support if I have questions during the course?",
      answer: "If you have any questions or need assistance during your course, you can reach out to our support team via email or through the contact form on our website. Our instructors and support staff are here to help you succeed."
    },
    {
      id: 9,
      question: "Can I access the courses on my mobile device?",
      answer: "Yes, our courses are accessible on both desktop and mobile devices. You can learn on the go using your smartphone or tablet."
    },
    {
      id: 10,
      question: "How do I track my progress in a course?",
      answer: "Our platform includes tools to help you track your progress. You can see which lessons you have completed and what you still need to work on. Your progress is saved automatically, so you can pick up right where you left off."
    },
    {
      id: 11,
      question: "Are there any prerequisites for enrolling in a course?",
      answer: "Some courses may have prerequisites, which will be listed on the course page. Generally, our courses are designed to be accessible to learners of all levels, from beginners to advanced students."
    }
  ];

  const toggleQuestion = (id: number) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <div>
      <div className="w-[90%] 800px:w-[80%] m-auto">
        <h1 className={`${styles.title} 800px:text-[40px]`}>
          Frequently Asked Questions
        </h1>
        <div className="mt-12">
          <dl className="space-y-8">
            {questions.map((q) => (
              <div key={q.id} className={`border-t border-gray-200 pt-6`}>
                <dt className="text-lg">
                  <button
                    className="flex items-start justify-between w-full text-left focus:outline-none"
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <span className="font-medium text-black dark:text-white">{q.question}</span>
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
                    <p className="text-base font-Poppins text-black dark:text-white">{q.answer}</p>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
        <br />
        <br />
        <br />
      </div> 
    </div>
  );
};

export default FAQ;
