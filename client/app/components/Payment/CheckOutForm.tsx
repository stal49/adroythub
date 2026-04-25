import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/features/store";
import { updateUserCourses } from "@/redux/features/auth/authSlice";


interface CheckOutFormProps {
  courseId: string;
  amount: number;
  userId: string;
  setOpen: (open: boolean) => void; // Accept setOpen prop
  onPaymentSuccess: () => void;
}

const CheckOutForm: React.FC<CheckOutFormProps> = ({ courseId, amount, userId, setOpen, onPaymentSuccess }) => {

  const dispatch = useDispatch()
  const { token } = useSelector((state: RootState) => state.auth);
  const { user } = useSelector((state: any) => state.auth);
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const [paymentType, setPaymentType] = useState<"razorpay" | "phonepe" | null>(null);

  const checkServiceStatus = async () => {
    try {
      const serverUri = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:8000";
      const { data } = await axios.get(`${serverUri}/check`);
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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!token) {
      toast.warn("Please login first.");
      return;
    }

    // Check if user already owns this course
    if (user?.courses?.includes(courseId)) {
      console.warn("User already owns this course:", courseId);
      toast.warning("⚠️ You have already purchased this course!");
      setOpen(false);
      return;
    }

    const isRazorpayLoaded = await loadRazorpay();
    if (!isRazorpayLoaded) {
      toast.error("Failed to load Razorpay. Please try again.");
      return;
    }

    try {
      const serverUri = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:8000";
      const { data: order } = await axios.post(
        `${serverUri}/adroyt/create-order`,
        { amount: Math.round(amount * 100), currency: "INR", courseId: courseId, path: `/courses/${courseId}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RwCeSpA3JNX9E0",
        amount: order.amount,
        currency: order.currency,
        name: "Adroythub",
        description: "Payment for courses",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            console.log("=== CLIENT: PAYMENT SUCCESSFUL FROM RAZORPAY ===");
            console.log("Razorpay response:", response);

            const serverUri = process.env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8000/api";
            console.log("Creating order on server:", serverUri);

            const response2 = await axios.post(
              `${serverUri}/create-order`,
              {
                courseId: courseId,
                amount: amount,
                currency: "INR"
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Create order response:", response2.data);

            if (!response2.data.success) {
              console.error("Order creation failed:", response2.data);
              toast.error(response2.data.message || "Failed to create order");
              return;
            }
            dispatch(updateUserCourses(courseId));
            const socketUri = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:8000";

            console.log("=== CLIENT: VERIFY PAYMENT REQUEST ===");
            console.log("Socket URI:", socketUri);
            console.log("Payment response from Razorpay:", response);
            console.log("Verification payload:", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verification = await axios.post(
              `${socketUri}/adroyt/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Verification response:", verification.data);
            toast.success(verification.data.message);
            onPaymentSuccess()
            setOpen(false);
            console.log('hello', user, courseId)
          } catch (error: any) {
            console.error("=== CLIENT: PAYMENT VERIFICATION ERROR ===");
            console.error("Error object:", error);
            console.error("Error response:", error.response);
            console.error("Error response data:", error.response?.data);
            console.error("Error message:", error.message);

            // Check if it's an "already purchased" error
            if (error.response?.status === 400 && error.response?.data?.message?.includes("already purchased")) {
              console.warn("Course already purchased by user");
              toast.warning("⚠️ You have already purchased this course!");
              setOpen(false); // Close the payment modal
            } else if (error.response?.data?.message) {
              // Show the actual error message from the server
              toast.error(error.response.data.message);
            } else {
              toast.error(`Error: ${error.response?.data?.error || error.message}`);
            }
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
      console.error("DEBUG - Order creation failed:", error);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      const errorDetails = error.response?.data?.details || "";
      toast.error(`Order Error: ${errorMsg} ${errorDetails}`);

      if (error.response?.data) {
        console.log("DEBUG - Server error response data:", error.response.data);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-full px-6 py-12">

        {/* Close icon */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
          aria-label="Close"
        >
          &times;
        </button>

        <h1 className="text-2xl font-medium text-gray-700 text-center">Make a Payment</h1>
        <div className="space-y-4 mt-6">
          {/* <button
            className="w-full p-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
            onClick={() => handlePaymentTypeSelection("phonepe")}
          >
            PhonePe (Not Available Now)
          </button> */}
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