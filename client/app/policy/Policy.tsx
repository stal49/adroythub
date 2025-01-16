import React from "react";
import Image from "next/image";
import { styles } from "../styles/style";

type Props = {};

const Policy = (props: Props) => {
  return (
    <div className="text-black dark:text-white">
  <br />
  <h1 className={`${styles.title} text-[30px] 800px:text-[45px]`}>
    <span className="text-gradient">Platform Terms and Conditions</span>
  </h1>
  <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
    <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
      Adroythub is dedicated to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
      <br /><br />
      <span className="text-gradient text-[20px]">Information We Collect</span>
      <br /><br />
      <strong className="text-gradient">Personal Data:</strong> We collect personal information such as your name, email address, phone number, payment information, and any other information you provide to us. <br />
      <strong className="text-gradient">Usage Data:</strong> We collect information on how our services are accessed and used. This may include details like your IP address, browser type, browser version, the pages you visit, the time and date of your visit, and other diagnostic data.<br />
      <strong className="text-gradient">Cookies:</strong> We use cookies and similar tracking technologies to monitor activity on our website and store certain information.
    </p>
    <Image 
      src={require('@/public/assests/gradient-ssl-illustration.png')}
      alt="SSL Illustration"
      className="h-[481px] w-[626px] mt-10 800px:mt-20 rounded-3xl p-4"
    />
  </div>

  <div className="w-[95%] lg:w-[85%] mx-auto flex flex-col-reverse lg:flex-row justify-between items-center lg:items-start">
  <Image 
      src={require('@/public/assests/policy7.png')}
      alt="Policy Illustration"
      className="h-[481px] w-[626px] mt-10 800px:mt-20 rounded-lg p-4"
    />
  <p className="text-[16px] lg:text-[20px] font-Poppins m-5 lg:m-20 pt-5 lg:pt-10">
    <span className="text-gradient text-[20px] lg:text-[24px]">How We Use Your Information</span>
    <br /><br />
    <span className="block">
      - To provide, operate, and maintain our website and services<br />
      - To improve, personalize, and expand our website and services<br />
      - To understand and analyze how you use our website and services<br />
      - To develop new products, services, features, and functionality<br />
      - To process transactions and manage your orders<br />
      - To send you emails and other communications<br />
      - To find and prevent fraud
    </span>
  </p>
</div>


  <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
    <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
      <span className="text-gradient text-[20px]">Disclosure of Your Information</span>
      <br /><br />
      We may share your information with:<br />
      <strong className="text-gradient">Service Providers:</strong> Third parties that perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.<br />
      <strong className="text-gradient">Legal Requirements:</strong> If required by law or to respond to valid requests by public authorities.<br />
      <strong className="text-gradient">Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
    </p>
    <Image 
      src={require('@/public/assests/policy3.png')}
      alt="Policy Illustration"
      className="h-[481px] w-[626px] mt-10 800px:mt-20 rounded-3xl p-4"
    />
  </div>

  <div className="w-[95%] 800px:w-[92%] m-auto py-2 text-black dark:text-white px-3">
    <br /><br />
    <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
      <span className="text-gradient text-[20px]">Security of Your Information</span>
      <br /><br />
      We use administrative, technical, and physical security measures to protect your personal information. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.<br /><br />
      <span className="text-gradient text-[20px]">Your Data Protection Rights</span>
      <br /><br />
      Depending on your location, you may have the following rights regarding your personal data:<br />
      - The right to access : You have the right to request copies of your personal data.<br />
      - The right to rectification : You have the right to request that we correct any information you believe is inaccurate or complete information you believe is missing.
    </p>
  </div>

  <div className="w-[95%] 800px:w-[92%] m-auto py-2 text-black dark:text-white px-3">
    <br /><br />
    <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
      <span className="text-gradient text-[20px]">Refund Policy</span>
      <br /><br />
      At Adroythub, we strive to deliver the best learning experience. Refunds are applicable only under exceptional circumstances, such as duplicate payments or technical issues preventing course access. Refund requests must be submitted within 7 days of payment, along with valid proof of the issue.
<br />
All approved refunds will be processed within 7–10 working days. For further assistance, email us at official@adroythub.com. 
<br /><br />
 <span className="text-gradient text-[20px]">Terms and Conditions</span>
      <br /><br />
      1. Acceptance of Terms: By enrolling in any course on Adroythub, you agree to comply with these terms and conditions.


2. Course Access: Access to courses is non-transferable and intended for personal use only. Sharing login credentials is prohibited.


3. Payment and Fees: All fees are non-refundable unless stated in the refund policy. Full payment is required to access the course.


4. Content Ownership: All course content, including videos, materials, and resources, is the intellectual property of Adroythub and cannot be copied, distributed, or reproduced without permission.


5. Code of Conduct: Learners must adhere to ethical behavior. Harassment, abuse, or inappropriate conduct towards instructors, staff, or fellow learners will result in termination of access.


6. Platform Updates: Adroythub reserves the right to update course content, pricing, and policies without prior notice.


7. Liability: Adroythub is not liable for any direct or indirect damages resulting from the use of our platform or courses.


8. Contact Us: For queries or support, reach us at official@adroythub.com.



By using Adroythub, you confirm your understanding and agreement with these terms.</p>
  </div>
</div>

  );
};

export default Policy;
