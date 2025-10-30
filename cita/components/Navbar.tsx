"use client";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Menu, Home, Heart, Send, UserPen, LogOut } from "lucide-react";

const Navbar = () => {
  const router = useRouter();

  const [isMediumOrSmaller, setIsMediumOrSmaller] = useState(false);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = (e: MediaQueryListEvent) =>
      setIsMediumOrSmaller(e.matches);

    // Initial check
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMediumOrSmaller(mediaQuery.matches);

    // Listen for screen size changes
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="flex justify-center items-center p-4 shadow-2l drop-shadow-lg border-b border-gray-500 space-x-20">
      <h1 className="text-pink-700 text-4xl dancing-script-font justify-center ps-25 lg:ps-0">Cita</h1>
      {isMediumOrSmaller ? (
        // Small screen (hamburger)
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setToggle(!toggle)}
            className="p-2 border rounded-md shadow-sm"
          >
            <Menu />
          </button>
          {toggle && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-row space-x-1" onClick={() => router.push('/')}>
                <Home /> <span>Home</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-row space-x-1" onClick={() => router.push('/matches')}>
                <Heart /> <span>Matches</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-row space-x-1" onClick={() => router.push('/messages')}>
                <Send /> <span>Messages</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-row space-x-1" onClick={() => router.push('/profile')}>
                <UserPen />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-row space-x-1"
              >
                <LogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        // Large screen (horizontal nav)
        <div className="flex flex-row justify-between md:space-x-10 lg:space-x-20 py-3">
          <button className="hover:underline underline-offset-4 flex flex-row space-x-1 items-center" onClick={() => router.push('/')}>
            <Home /> <span>Home</span>
          </button>
          <button className="hover:underline underline-offset-4 flex flex-row space-x-1 items-center" onClick={() => router.push('/matches')}>
            <Heart /> <span>Matches</span>
          </button>
          <button className="hover:underline underline-offset-4 flex flex-row space-x-1 items-center" onClick={() => router.push('/messages')}>
            <Send /> <span>Messages</span>
          </button>
          <button className="hover:underline underline-offset-4 flex flex-row space-x-1 items-center" onClick={() => router.push('/profile')}>
            <UserPen />
            <span>Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="hover:underline underline-offset-4 flex flex-row space-x-1 items-center"
          >
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
