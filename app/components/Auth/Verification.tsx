import { styles } from "@/app/styles/style";
import { useActivationMutation } from "@/redux/features/auth/authApi";
import { clearActivationToken } from "@/redux/features/auth/authSlice";
import { RootState } from "@/redux/features/store";
import React, { FC, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Spinner from "../Loader/Spinner";

type VerifyNumber = {
  "0": string;
  "1": string;
  "2": string;
  "3": string;
};

const Verification: FC = () => {
  const dispatch = useDispatch();
  const { activationToken } = useSelector((state: RootState) => state.auth);
  const [activation, { isSuccess, isLoading, error }] = useActivationMutation();
  const [invalidError, setInvalidError] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // No activation token in state means this page was opened directly,
    // refreshed after the short-lived token expired, or activation already
    // completed - there's nothing to verify, so send the user back.
    if (!activationToken) {
      toast.error("Your verification session has expired. Please sign up again.");
      router.replace("/signup");
    }
  }, [activationToken, router]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Account activated successfully");
      dispatch(clearActivationToken());
      router.push("/login");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        const message: string = errorData?.data?.message || "";
        if (message.toLowerCase().includes("jwt")) {
          toast.error("Your verification session has expired. Please sign up again.");
          dispatch(clearActivationToken());
          router.replace("/signup");
        } else {
          toast.error(message || "Please enter valid OTP");
          setInvalidError(true);
        }
      } else {
        console.log("An error occured:", error);
      }
    }
  }, [isSuccess, error]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
    0: "",
    1: "",
    2: "",
    3: "",
  });

  const verificationHandler = async () => {
    if (!activationToken || isLoading) return;
    const verificationNumber = Object.values(verifyNumber).join("");
    if (verificationNumber.length !== 4) {
      setInvalidError(true);
      return;
    }
    await activation({
      activation_token: activationToken,
      activation_code: verificationNumber,
    });
  };

  const handleInputChange = (index: number, value: string) => {
    setInvalidError(false);
    const newVerifyNumber = { ...verifyNumber, [index]: value };
    setVerifyNumber(newVerifyNumber);

    if (value === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  return (
    <div>
      <h1 className={`${styles.title}`}>Verify Your Account</h1>
      <br />
      <div className="w-full flex items-center justify-center mt-2">
        <div className="w-[80px] h-[80px] rounded-full bg-[#497DF2] flex items-center justify-center">
          <VscWorkspaceTrusted size={40} />
        </div>
      </div>
      <br />
      <br />
      <div className="m-auto flex items-center justify-around">
        {Object.keys(verifyNumber).map((key, index) => (
          <input
            type="number"
            key={key}
            ref={inputRefs[index]}
            className={`w-[65px] h-[65px] bg-transparent border-[3px] rounded-[10px] flex items-center text-black dark:text-white justify-center text-[18px] font-Poppins outline-none text-center ${
              invalidError
                ? "shake border-red-500"
                : "dark:border-white border-[#0000004a]"
            }`}
            placeholder=""
            maxLength={1}
            value={verifyNumber[key as keyof VerifyNumber]}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        ))}
      </div>
      <br />
      <br />
      <div className="w-full flex justify-center">
        <button
          className={`${styles.button} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          onClick={verificationHandler}
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Verify OTP"}
        </button>
      </div>
      <br />
      <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
        Go back to sign in?{" "}
        <span
          className="text-[#2190ff] pl-1 cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Sign in
        </span>
      </h5>
    </div>
  );
};

export default Verification;
