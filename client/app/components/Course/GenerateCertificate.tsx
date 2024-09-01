"use client";
import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import { styles } from "@/app/styles/style";
import { useSelector } from "react-redux";

interface GenerateCertificateProps {
  id : any;
  courseName: string | "Usercourse" ; 
}

const GenerateCertificate: React.FC<GenerateCertificateProps> = ({ courseName }) => {
  const { user } = useSelector((state: any) => state.auth);
  const userName = user.name;

  const certificateRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    const input = certificateRef.current;
    if (input) {
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        allowTaint: true, // Allow cross-origin images
        logging: true, // Enable logging to console for debugging
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 842, 595); // A4 size in points (pt)
      pdf.save(`${courseName}_Certificate.pdf`);
    }
  };

  const previewCertificate = async () => {
    const input = certificateRef.current;
    if (input) {
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 842, 595);
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write('<iframe width="100%" height="100%" src="' + pdf.output('bloburl') + '"></iframe>');
      }
    }
  };

  return (
    <div className="relative w-full h-auto p-4 md:p-20">
      <div
        ref={certificateRef}
        id="certificate"
        className="absolute -left-[10000px] w-[842px] h-[595px] bg-white"
      >
        <div className="relative w-full h-full">
          <Image
            src="/assests/New signature Certificate.png"
            alt="Certificate Background"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 mb-[110px]">
            <h1 className="text-[30px] font-serif text-blue-500">{courseName}</h1>
            <p className="text-[25px] font-serif text-blue-500">
              PROFESSIONAL CERTIFICATION COURSE
            </p>
            <p className="text-[16px] text-black">
              Date: {new Date().toLocaleDateString('en-GB')}
            </p>
            <div className="text-4xl font-serif text-black mt-[100px]">{userName}</div>
          </div>
        </div>
      </div>


      <div>
      <h1 className={`${styles.title} text-gradient2 800px:text-[40px]`}>
      Congratulations on completing the course! <br />Your dedication and hard work have paid off-well done!
                     </h1>
      </div>
      <div className="flex justify-center p-4 pb-7">
        <button
          onClick={previewCertificate}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Preview Certificate
        </button>
        <button
          onClick={generatePDF}
          className="mt-4 px-6 py-2 ml-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Download Certificate
        </button>
      </div>
      <div className="flex justify-center text-black dark:text-white">Note: Please preview certificate before downloading.</div>
    </div>
  );
};

export default GenerateCertificate;
