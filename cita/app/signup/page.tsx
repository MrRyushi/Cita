"use client";
import React from "react";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../../firebase/firebase";
import { setDoc, doc } from "firebase/firestore"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

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

      //alert("Account created:" + userCredential.user.uid);
      alert("Account created successfully!");

      // create user in firestore
      try {
        const docRef = await setDoc(doc(db, "users", userCredential.user.uid), {
          name: "",
          age: null,
          sex: "",
          into:  "",
          bio: "",
          interests: [],
          photoURL: "",
          likedUsers: [],
          passes: [],
        });
        console.log("Document written with ID: ", userCredential.user.uid);
      } catch (e) {
        console.error("Error adding document: ", e);
      }

      router.push("/login");
    } catch (error: unknown) {
      console.error("Registration error:", error);
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          alert("This email is already registered. Please log in instead.");
        } else if (error.code === "auth/invalid-email") {
          alert("Please enter a valid email address.");
        } else if (error.code === "auth/weak-password") {
          alert("Your password is too weak. Try using at least 6 characters.");
        } else {
          alert("Something went wrong. Please try again later.");
        }
      } else {
        alert("Something went wrong. Please try again later.");
      }
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-linear-to-bl from-pink-900 via-red-400 to-[#FFABAB]">
      <div className="flex flex-col p-8 bg-white rounded-xl w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 space-y-2">
        <h1 className="font-medium text-2xl text-center">Signup</h1>
        <p className="text-center">Create your account</p>
        <form onSubmit={registerUser} className="flex flex-col space-y-5">
          <div className="flex flex-col space-y-2">
            <label htmlFor="email">Email</label>
            <input
              placeholder="Enter your email"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="password">Password</label>
            <input
              placeholder="Enter your password"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="repeat_password">Repeat Password</label>
            <input
              placeholder="Repeat your password"
              type="password"
              id="repeat_password"
              name="repeat_password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="bg-[#f3f5f9] ps-3 py-2 rounded-lg text-black"
              required
            />
          </div>

          <button className="bg-[#4b4b4b] py-2 rounded-lg text-white">
            Register
          </button>
          <Link
            href="/login"
            className="text-center text-sm text-red-400 hover:underline"
          >
            Already have an account? Login here.
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Signup;
