"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { styles } from "@/app/styles/style";
import {
  useForgotPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
} from "@/redux/features/auth/authApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Spinner from "../Loader/Spinner";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { VscWorkspaceTrusted } from "react-icons/vsc";

type Step = "email" | "otp" | "password";

const emailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format!")
    .required("Please enter your registered email!"),
});

const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("Please enter your new password!")
    .min(6, "Password must be at least 6 characters!"),
  confirmPassword: Yup.string()
    .required("Please confirm your new password!")
    .oneOf([Yup.ref("newPassword")], "Passwords must match!"),
});

const ForgotPassword: FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [editEmailValue, setEditEmailValue] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [forgotPasswordToken, setForgotPasswordToken] = useState("");
  const [resetPasswordToken, setResetPasswordToken] = useState("");

  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [invalidOtpError, setInvalidOtpError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timers: Resend cooldown (30s) and OTP validity (5m = 300s)
  const [resendCooldown, setResendCooldown] = useState(30);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(300);

  const [forgotPasswordApi, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [verifyOtpApi, { isLoading: isVerifyingOtp }] = useVerifyForgotPasswordOtpMutation();
  const [resetPasswordApi, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timers effect when on OTP step
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === "otp") {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  // Email form handler (Step 1)
  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async ({ email: inputEmail }) => {
      try {
        const cleanEmail = inputEmail.trim().toLowerCase();
        const res: any = await forgotPasswordApi({ email: cleanEmail }).unwrap();
        setForgotPasswordToken(res.forgotPasswordToken);
        setEmail(cleanEmail);
        setEditEmailValue(cleanEmail);
        setStep("otp");
        setResendCooldown(30);
        setOtpExpiryTimer(300);
        setOtpValues(["", "", "", "", "", ""]);
        toast.success(res.message || "6-digit OTP sent to your email!");
      } catch (err: any) {
        const msg = err?.data?.message || "Failed to send OTP. Please check your email.";
        toast.error(msg);
      }
    },
  });

  // Re-send OTP to existing or edited email
  const handleSendOtp = async (targetEmail: string) => {
    if (!targetEmail) return;
    try {
      const cleanEmail = targetEmail.trim().toLowerCase();
      const res: any = await forgotPasswordApi({ email: cleanEmail }).unwrap();
      setForgotPasswordToken(res.forgotPasswordToken);
      setEmail(cleanEmail);
      setEditEmailValue(cleanEmail);
      setIsEditingEmail(false);
      setResendCooldown(30);
      setOtpExpiryTimer(300);
      setOtpValues(["", "", "", "", "", ""]);
      setInvalidOtpError(false);
      toast.success(res.message || "New 6-digit OTP sent to your email!");
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(msg);
    }
  };

  // OTP inputs change & navigation
  const handleOtpChange = (index: number, value: string) => {
    setInvalidOtpError(false);
    const digit = value.slice(-1);
    if (value && !/^\d$/.test(digit)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value ? digit : "";
    setOtpValues(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyOtp();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = [...otpValues];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtpValues(newOtp);
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs[nextIdx].current?.focus();
    }
  };

  // Verify OTP handler (Step 2)
  const handleVerifyOtp = async () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setInvalidOtpError(true);
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    if (otpExpiryTimer === 0) {
      toast.error("OTP has expired. Please resend a new OTP.");
      return;
    }
    try {
      const res: any = await verifyOtpApi({
        forgotPasswordToken,
        otp,
      }).unwrap();
      setResetPasswordToken(res.resetPasswordToken);
      setStep("password");
      toast.success(res.message || "OTP verified successfully!");
    } catch (err: any) {
      setInvalidOtpError(true);
      const msg = err?.data?.message || "Invalid or expired OTP. Please try again.";
      toast.error(msg);
    }
  };

  // Reset password form handler (Step 3)
  const passwordFormik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async ({ newPassword }) => {
      try {
        const res: any = await resetPasswordApi({
          resetPasswordToken,
          newPassword,
        }).unwrap();
        toast.success(res.message || "Password changed successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      } catch (err: any) {
        const msg = err?.data?.message || "Failed to reset password. Please try again.";
        toast.error(msg);
      }
    },
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full">
      {/* STEP 1: Enter Email */}
      {step === "email" && (
        <div>
          <h1 className={`${styles.title}`}>Forgot Password</h1>
          <p className="text-center text-[14px] font-Poppins text-gray-600 dark:text-gray-300 mb-4">
            Enter your registered email address to receive a 6-digit verification code.
          </p>
          <form onSubmit={emailFormik.handleSubmit}>
            <label className={`${styles.label}`} htmlFor="email">
              Enter your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              placeholder="user@example.com"
              className={`${
                emailFormik.errors.email && emailFormik.touched.email && "border-red-500"
              } ${styles.input}`}
            />
            {emailFormik.errors.email && emailFormik.touched.email && (
              <span className="text-red-500 pt-1 text-[13px] block">
                {emailFormik.errors.email}
              </span>
            )}
            <div className="w-full mt-6">
              <button
                type="submit"
                disabled={isSendingOtp}
                className={`${styles.button} ${
                  isSendingOtp ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSendingOtp ? <Spinner /> : "Send OTP"}
              </button>
            </div>
            <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
              Remember your password?{" "}
              <span
                className="text-[#2190ff] pl-1 cursor-pointer hover:underline"
                onClick={() => router.push("/login")}
              >
                Sign in
              </span>
            </h5>
          </form>
        </div>
      )}

      {/* STEP 2: Verify 6-digit OTP */}
      {step === "otp" && (
        <div>
          <h1 className={`${styles.title}`}>Verify OTP</h1>
          <div className="w-full flex items-center justify-center my-3">
            <div className="w-[64px] h-[64px] rounded-full bg-[#2190ff] text-white flex items-center justify-center shadow-lg">
              <VscWorkspaceTrusted size={32} />
            </div>
          </div>

          {/* Email display and Edit email option */}
          <div className="bg-[#f0f7ff] dark:bg-slate-800 p-3 rounded-lg mb-4 text-center">
            {!isEditingEmail ? (
              <div className="flex items-center justify-center gap-2 text-[14px] font-Poppins text-gray-700 dark:text-gray-200">
                <span>Code sent to:</span>
                <span className="font-semibold text-black dark:text-white">{email}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-[#2190ff] hover:text-blue-700 p-1 flex items-center gap-1 text-[12px] font-medium ml-1"
                  title="Edit email"
                >
                  <FiEdit2 size={14} />
                  <span>Edit</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={editEmailValue}
                  onChange={(e) => setEditEmailValue(e.target.value)}
                  placeholder="Enter updated email"
                  className={`${styles.input} text-center h-[36px] mt-0`}
                />
                <div className="flex justify-center gap-2 mt-1">
                  <button
                    type="button"
                    disabled={isSendingOtp || !editEmailValue.trim()}
                    onClick={() => handleSendOtp(editEmailValue)}
                    className="text-xs bg-[#2190ff] text-white px-3 py-1 rounded hover:bg-blue-600 font-Poppins"
                  >
                    {isSendingOtp ? "Sending..." : "Update & Send OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditEmailValue(email);
                      setIsEditingEmail(false);
                    }}
                    className="text-xs bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded font-Poppins"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6-digit OTP Inputs */}
          <div className="flex items-center justify-between gap-2 max-w-[360px] mx-auto my-4">
            {otpValues.map((val, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`w-[48px] h-[52px] md:w-[52px] md:h-[56px] text-center text-[20px] font-Poppins font-bold rounded-lg border-2 bg-transparent text-black dark:text-white outline-none transition-all ${
                  invalidOtpError
                    ? "border-red-500 shake"
                    : "border-gray-300 dark:border-gray-600 focus:border-[#2190ff]"
                }`}
              />
            ))}
          </div>

          {/* Timer and Expiration info */}
          <div className="flex justify-between items-center text-[13px] font-Poppins my-3 px-1">
            <span
              className={`${
                otpExpiryTimer < 60
                  ? "text-red-500 font-semibold"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {otpExpiryTimer > 0
                ? `Expires in: ${formatTime(otpExpiryTimer)}`
                : "OTP expired! Please resend."}
            </span>

            {/* Resend OTP button with 30s cooldown */}
            {resendCooldown > 0 ? (
              <span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                disabled={isSendingOtp}
                onClick={() => handleSendOtp(email)}
                className="text-[#2190ff] font-semibold hover:underline"
              >
                {isSendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          <div className="w-full mt-5">
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              className={`${styles.button} ${
                isVerifyingOtp ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isVerifyingOtp ? <Spinner /> : "Confirm OTP"}
            </button>
          </div>

          <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
            Go back to{" "}
            <span
              className="text-[#2190ff] pl-1 cursor-pointer hover:underline"
              onClick={() => router.push("/login")}
            >
              Sign in
            </span>
          </h5>
        </div>
      )}

      {/* STEP 3: Enter New Password */}
      {step === "password" && (
        <div>
          <h1 className={`${styles.title}`}>Set New Password</h1>
          <p className="text-center text-[14px] font-Poppins text-gray-600 dark:text-gray-300 mb-4">
            Your OTP has been confirmed. Please enter your new password below.
          </p>
          <form onSubmit={passwordFormik.handleSubmit}>
            <div className="w-full relative mb-4">
              <label className={`${styles.label}`} htmlFor="newPassword">
                New Password
              </label>
              <input
                type={!showPassword ? "password" : "text"}
                id="newPassword"
                name="newPassword"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                placeholder="At least 6 characters"
                className={`${
                  passwordFormik.errors.newPassword &&
                  passwordFormik.touched.newPassword &&
                  "border-red-500"
                } ${styles.input}`}
              />
              {!showPassword ? (
                <AiOutlineEyeInvisible
                  className="absolute bottom-3 right-3 cursor-pointer text-gray-500"
                  size={20}
                  onClick={() => setShowPassword(true)}
                />
              ) : (
                <AiOutlineEye
                  className="absolute bottom-3 right-3 cursor-pointer text-gray-500"
                  size={20}
                  onClick={() => setShowPassword(false)}
                />
              )}
              {passwordFormik.errors.newPassword &&
                passwordFormik.touched.newPassword && (
                  <span className="text-red-500 pt-1 text-[13px] block">
                    {passwordFormik.errors.newPassword}
                  </span>
                )}
            </div>

            <div className="w-full relative mb-4">
              <label className={`${styles.label}`} htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                type={!showConfirmPassword ? "password" : "text"}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                placeholder="Re-enter password"
                className={`${
                  passwordFormik.errors.confirmPassword &&
                  passwordFormik.touched.confirmPassword &&
                  "border-red-500"
                } ${styles.input}`}
              />
              {!showConfirmPassword ? (
                <AiOutlineEyeInvisible
                  className="absolute bottom-3 right-3 cursor-pointer text-gray-500"
                  size={20}
                  onClick={() => setShowConfirmPassword(true)}
                />
              ) : (
                <AiOutlineEye
                  className="absolute bottom-3 right-3 cursor-pointer text-gray-500"
                  size={20}
                  onClick={() => setShowConfirmPassword(false)}
                />
              )}
              {passwordFormik.errors.confirmPassword &&
                passwordFormik.touched.confirmPassword && (
                  <span className="text-red-500 pt-1 text-[13px] block">
                    {passwordFormik.errors.confirmPassword}
                  </span>
                )}
            </div>

            <div className="w-full mt-6">
              <button
                type="submit"
                disabled={isResettingPassword}
                className={`${styles.button} ${
                  isResettingPassword ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isResettingPassword ? <Spinner /> : "Change Password"}
              </button>
            </div>

            <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
              Cancel and return to{" "}
              <span
                className="text-[#2190ff] pl-1 cursor-pointer hover:underline"
                onClick={() => router.push("/login")}
              >
                Sign in
              </span>
            </h5>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
