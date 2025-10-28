"use client";
import React, { use, useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";

type UserProfile = {
  name: string;
  age: number;
  sex: string;
  into: string;
  bio: string;
  photoURL: string;
  likedUsers: string[];
  passes: string[];
  newUser: boolean;
  id: string;
};

const Profile = () => {
  const user = auth.currentUser;
  const [userData, setUserData] = useState<UserProfile>();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Fetch user data from Firestore or any other source
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const fetchUserData = async () => {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserProfile);
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }
      };
      fetchUserData();
    }
  }, [user]);

  return (
    <AuthGuard>
      <div className="flex justify-center items-center h-screen pb-20">
        <div className="p-10 rounded-lg bg-white shadow-lg">
          {userData && !editing ? (
            <div className="sm:p-6">
              <div className="flex flex-col items-center">
                <img
                  src={userData.photoURL}
                  alt="Profile Picture"
                  className="w-32 h-32 rounded-full mb-4"
                />
                <h2 className="text-2xl font-bold mb-2">
                  {userData.name}, {userData.age}
                </h2>
                <p className="text-slate-900 mb-4">{userData.bio}</p>
                <div className="flex space-x-4">
                  <span className="px-3 py-1 bg-blue-200 rounded-full capitalize font-medium">
                    {userData.sex}
                  </span>
                  <span className="px-3 py-1 bg-green-200 rounded-full capitalize font-medium">
                    Interested in {userData.into}
                  </span>
                </div>
              </div>
            </div>
          ) : userData && editing ? (
            <div>
              <h2>Edit Profile (Coming Soon)</h2>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;
