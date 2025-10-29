"use client";
import React from "react";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../../firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CircleCheck } from "lucide-react";
import GuestGuard from "@/components/GuestGuard";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("error");

  async function registerUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== repeatPassword) {
      setAlertTitle("Passwords Mismatch");
      setAlertDescription("The passwords you entered do not match.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        setAlertTitle("Email Already Registered");
        setAlertDescription(
          "This email is already registered. Please log in instead."
        );
        setShowAlert(true);
        setAlertType("error");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await auth.signOut();

      //alert("Account created:" + userCredential.user.uid);
      setAlertTitle("Account Created");
      setAlertDescription("Your account has been successfully created.");
      setShowAlert(true);
      setAlertType("success");

      // create user in firestore
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: "",
          age: null,
          sex: "",
          into: "",
          bio: "",
          photoURL: "",
          likedUsers: [],
          passes: [],
          newUser: true
        });
        console.log("Document written with ID: ", userCredential.user.uid);
      } catch (e) {
        console.error("Error adding document: ", e);
      }

      setTimeout(() => {
        router.push("/login");
      }, 3000)
      
    } catch (error: unknown) {
      console.error("Registration error:", error);
      setAlertType("error");
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          setAlertTitle("Email Already Registered");
          setAlertDescription(
            "This email is already registered. Please log in instead."
          );
          setShowAlert(true);
        } else if (error.code === "auth/invalid-email") {
          setAlertTitle("Invalid Email");
          setAlertDescription("Please enter a valid email address.");
          setShowAlert(true);
        } else if (error.code === "auth/weak-password") {
          setAlertTitle("Weak Password");
          setAlertDescription("Your password should be at least 6 characters.");
          setShowAlert(true);
        } else {
          setAlertTitle("Registration Error");
          setAlertDescription("An error occurred during registration.");
          setShowAlert(true);
        }
      } else {
        setAlertTitle("Registration Error");
        setAlertDescription("An error occurred during registration.");
        setShowAlert(true);
      }
    }
  }

  return (
    <GuestGuard>
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col p-8 bg-white rounded-xl w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 space-y-2">
          <h1 className="font-medium text-2xl text-center">Signup</h1>
          <p className="text-center">Create your account</p>
          <form onSubmit={registerUser} className="flex flex-col space-y-5">
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
              <label htmlFor="repeat_password">Confirm Password</label>
              <input
                placeholder="Confirm password"
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
              className="text-center text-sm text-blue-500 hover:underline"
            >
              Already have an account? Login here.
            </Link>
          </form>
        </div>
      </div>
    </GuestGuard>
  );
};

export default Signup;
