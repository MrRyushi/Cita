"use client";
import React from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      signInWithEmailAndPassword(auth, email, password);
      alert("Successfully Logged In");
      router.push("/onboarding");
    } catch (e) {
      console.log(e);
      alert(e);
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-linear-to-bl from-pink-900 via-red-400 to-[#FFABAB]">
      <h1 className="text-3xl text-white mb-5">Welcome to Cita!</h1>
      <div className="flex flex-col p-8 bg-white rounded-xl w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 space-y-2">
        <h1 className="font-medium text-2xl text-center">Login</h1>
        <form onSubmit={signIn} className="flex flex-col space-y-5">
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

          <button className="bg-[#4b4b4b] py-2 rounded-lg text-white">Login</button>
          <Link href="/signup" className="text-center text-sm text-red-500 hover:underline">
            {"Don't"} have an account? Sign up
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
