import React from "react";
import Image from "next/image";
import { styles } from "../styles/style";

type Props = {};

const Policy = (props: Props) => {
  return (
    <div className="text-black dark:text-white">
       <div className="text-black dark:text-white">
  <br />
  <h1 className={`${styles.title} text-[30px] 800px:text-[45px]`}>
   <span className="text-gradient">Platform Terms and Condition</span>
  </h1>
  <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
    <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
    Adroythub  is dedicated to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
    <br />
      <br />
      <p className="py-2 text-[20px] font-Poppins leading-8 whitespace-pre-line">
      <span className="text-gradient">Information We Collect</span>
         <br/>
 <strong className="text-gradient">Personal Data:</strong> We collect personal information such as your name, email address, phone number, payment information, and any other information you provide to us. <br />
 <strong className="text-gradient">Usage Data:</strong> We collect information on how our services are accessed and used. This may include details like your IP address, browser type, browser version, the pages you visit, the time and date of your visit, and other diagnostic data.
 <br /> <strong className="text-gradient">Cookies: </strong> We use cookies and similar tracking technologies to monitor activity on our website and store certain information.
        </p><br />
    </p>
    <Image 
      src={require('@/public/assests/gradient-ssl-illustration.png')}
      alt=""
      className="h-[481px] w-[626px] mt-10 800px:mt-20 rounded-3xl  p-4"
    />
  </div>
  </div>




  <div className="text-black dark:text-white">

  <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
    <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
  
      <p >
      <span className="text-gradient"> How We Use Your Information</span>
- To provide, operate, and maintain our website and services
- To improve, personalize, and expand our website and services
- To understand and analyze how you use our website and services
- To develop new products, services, features, and functionality
- To process transactions and manage your orders
- To send you emails and other communications
- To find and prevent fraud</p><br />
    </p>
    
  </div>
  </div>










  <div className="w-[95%] 800px:w-[85%] m-auto flex flex-col 800px:flex-row justify-between items-center 800px:items-start">
  <Image 
      src={require('@/public/assests/policy3.png')}
      alt=""
      className="h-[481px] w-[626px] mt-10 800px:mt-20 rounded-3xl  p-4"
    />
    <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
    <br />
      <br />
      <p>
        Disclosure of Your Information
We may share your information with:
<br /><strong className="text-gradient">Service Providers:</strong> Third parties that perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
<br /><strong className="text-gradient">Legal Requirements:</strong> If required by law or to respond to valid requests by public authorities.
<br /><strong className="text-gradient">Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
</p>
        </p>
    
  </div>



  



      <div className={"w-[95%] 800px:w-[92%] m-auto py-2 text-black dark:text-white px-3"}>
        
        
        <br />
        
        <br />
        <p className="text-[16px] 800px:text-[20px] font-Poppins m-5 800px:m-20 pt-5 800px:pt-10">
        Security of Your Information
We use administrative, technical, and physical security measures to protect your personal information. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
        
        <br />
        Your Data Protection Rights
Depending on your location, you may have the following rights regarding your personal data:
- The right to access – You have the right to request copies of your personal data.
- The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe
        </p>
      
      </div>
    </div>
  );
};

export default Policy;
