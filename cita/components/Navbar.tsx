"use client";
import React from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const user = auth.currentUser;

  const router = useRouter();
  function handleLogout(){
    try {
      signOut(auth);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-row justify-between space-x-28 py-5">
        <button>Home</button>
        <button>Matches</button>
        <button>Messages</button>
        <button>Profile</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
