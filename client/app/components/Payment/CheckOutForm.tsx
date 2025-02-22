import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/features/store";

const CheckOutForm: React.FC<{courseId:string, amount:number, userId:string}> = ({ courseId, amount,userId }) => {

  const { token } = useSelector((state: RootState) => state.auth);
   const {user} = useSelector((state:any) => state.auth);
  const razorpayKey = process.env.VITE_RAZORPAY_KEY;
  const [paymentType, setPaymentType] = useState<"razorpay" | "phonepe" | null>(null);

  const checkServiceStatus = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URI}check`);
      if (data.message) {
        toast.success("Welcome! We are ready to go.");
      } else {
        toast.error("Service unavailable. Don't make payment");
      }
    } catch (error) {
      toast.error("Service is not working now. Make your payment later.");
    }
  };

  useEffect(() => {
    // Call the service status check when the page loads
    checkServiceStatus();
  }, []);

  

  const handlePaymentTypeSelection = (type: "razorpay" | "phonepe") => {
    if (type === "phonepe") {
      toast.info("PhonePe is not available right now.");
    } else {
      setPaymentType("razorpay");
    }
  };

  const handlePayment = async () => {
    if (!token) {
      toast.warn("Please login first.");
      return;
    }

    try {
      // Step 1: Create an order
      const { data: order } = await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URI}adroyt/create-order`,
        { amount: 100, currency: "INR", path:`/courses/${courseId}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 2: Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Adsium Innovation",
        description: "Payment for courses",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Step 3: Verify the payment
            const verification = await axios.post(
              `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URI}adroyt/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(verification.data.message);
          } catch (error: any) {
            toast.error(`Payment verification failed: ${error.response?.data?.error || error.message}`);
          }
        },
        prefill: {
          name: user.name,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen px-4 py-6 bg-gray-50">
      <div className="max-w-md space-y-6">
          
            <h1 className="text-2xl font-medium text-gray-700 text-center">Make a Payment</h1>
            <div className="space-y-4">
              <button
                className="w-full p-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
                onClick={() => handlePaymentTypeSelection("phonepe")}
              >
                PhonePe (Not Available Now)
              </button>
              <button
                className="w-full p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                onClick={() => handlePaymentTypeSelection("razorpay")}
              >
                Razorpay
              </button>
            </div>
            {paymentType === "razorpay" && (
              <div className="mt-4">
                <button
                  className="w-full p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  onClick={handlePayment}
                >
                  Proceed with Payment (₹1)
                </button>
              </div>
            )}
        <div className="mt-8 text-center text-sm text-gray-500">
          <h2 className="font-semibold">Refund Policy</h2>
          <p className="mt-2">
            At Adroythub, we strive to deliver the best learning experience. Refunds are applicable only under exceptional circumstances, such as duplicate payments or technical issues preventing course access. Refund requests must be submitted within 7 days of payment, along with valid proof of the issue.
          </p>
          <p className="mt-2">
            All approved refunds will be processed within 7–10 working days. For further assistance, email us at official@adroythub.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckOutForm;