"use client";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const [isMediumOrSmaller, setIsMediumOrSmaller] = useState(false);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = (e: MediaQueryListEvent) => setIsMediumOrSmaller(e.matches);

    // Initial check
    setIsMediumOrSmaller(mediaQuery.matches);

    // Listen for screen size changes
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/"); // optional: redirect to login/home
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="flex justify-end lg:justify-center items-center p-4">
      {isMediumOrSmaller ? (
        // Small screen (hamburger)
        <div className="relative">
          <button
            onClick={() => setToggle(!toggle)}
            className="p-2 border rounded-md bg-white shadow-sm"
          >
            <Menu />
          </button>
          {toggle && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Home</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Matches</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Messages</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        // Large screen (horizontal nav)
        <div className="flex flex-row justify-between space-x-20 py-3">
          <button className="hover:underline underline-offset-4">Home</button>
          <button className="hover:underline underline-offset-4">Matches</button>
          <button className="hover:underline underline-offset-4">Messages</button>
          <button className="hover:underline underline-offset-4">Profile</button>
          <button
            onClick={handleLogout}
            className="hover:underline underline-offset-4"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
