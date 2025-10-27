"use client";
import React from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CircleCheck } from "lucide-react";
import GuestGuard from "@/components/GuestGuard";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAlertTitle("Successfully Logged In!");
      setAlertDescription(
        "All set! Your next match might just be a click away"
      );
      setShowAlert(true);
      setAlertType("success");
      setTimeout(() => {
        router.push("/onboarding");
      }, 1500);
    } catch (err) {
      console.log(err);
      setAlertTitle("Login Failed");
      setAlertType("error");
      let message = "An unexpected error occurred";
      const anyErr = err as any;
      const code =
        anyErr && typeof anyErr === "object" ? anyErr.code : undefined;
      if (typeof code === "string") {
        switch (code) {
          case "auth/invalid-credential":
            message = "Invalid email or password.";
            break;
          case "auth/too-many-requests":
            message = "Too many attempts. Please try again later.";
            break;
          default:
            message = anyErr?.message || message;
        }
      } else {
        message =
          typeof err === "string"
            ? err
            : err instanceof Error
            ? err.message
            : message;
      }
      setAlertDescription(message);
      setShowAlert(true);
    }
  }

  return (
    <GuestGuard>
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-linear-to-bl from-pink-900 via-red-400 to-[#FFABAB]">
        <h1 className="text-3xl text-white mb-5">Welcome to Cita!</h1>
        <div className="flex flex-col p-8 bg-white rounded-xl w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 space-y-2">
          <h1 className="font-medium text-2xl text-center">Login</h1>
          <form onSubmit={signIn} className="flex flex-col space-y-5">
            {showAlert && (
              <Alert
                className={
                  alertType === "success"
                    ? "border-green-500 text-green-700 bg-green-50"
                    : "border-red-500 text-red-700 bg-red-50"
                }
              >
                {alertType === "success" ? <CircleCheck /> : <CircleAlert />}
                <AlertTitle>{alertTitle}</AlertTitle>
                <AlertDescription>{alertDescription}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              <label htmlFor="email">Email</label>
              <input
                placeholder="Enter your email"
                value={email}
                type="email"
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="password">Password</label>
              <input
                placeholder="Your password"
                value={password}
                type="password"
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
                required
              />
            </div>

            <button className="bg-[#4b4b4b] py-2 rounded-lg text-white">
              Login
            </button>
            <Link
              href="/signup"
              className="text-center text-sm text-blue-500 hover:underline"
            >
              {"Don't"} have an account? Sign up
            </Link>
          </form>
        </div>
      </div>
    </GuestGuard>
  );
};

export default Login;
