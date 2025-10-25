"use client";
import React from "react";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  async function registerUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        alert("This email is already registered. Try logging in instead.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Account created:", userCredential.user);
      alert("Account created successfully!");
      router.push("/onboarding");
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please log in instead.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Your password is too weak. Try using at least 6 characters.");
      } else {
        alert("Something went wrong. Please try again later.");
      }
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-linear-to-bl from-pink-900 via-red-400 to-[#FFABAB] ">
      <div className="flex flex-col p-8 bg-white rounded-xl w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 space-y-2">
        <h1 className="font-medium text-2xl text-center">Signup</h1>
        <p className="text-center">Create your account</p>
        <form onSubmit={registerUser} className="flex flex-col space-y-5">
          <div className="flex flex-col space-y-2">
            <label>Email</label>
            <input
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label>Password</label>
            <input
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label>Repeat Password</label>
            <input
              placeholder="Repeat your password"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
              required
            />
          </div>

          <button className="bg-red-400 py-2 rounded-lg">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
