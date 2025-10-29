/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";

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

const Matches = () => {
  const user = auth.currentUser;
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [matchesIds, setMatchesIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchMatches = async () => {
      const q = query(
        collection(db, "matches"),
        where("users", "array-contains", user?.uid)
      );

      const querySnapshot = await getDocs(q);
      const matchesIds: string[] = [];
      querySnapshot.forEach((doc) => {
        matchesIds.push(
          ...doc.data().users.filter((uid: string) => uid !== user?.uid)
        );
      });
      if (!isMounted) return;
      setMatchesIds(matchesIds);

      const usersData: UserProfile[] = [];
      for (let i = 0; i < matchesIds.length; i += 10) {
        const batch = matchesIds.slice(i, i + 10);
        const usersQuery = query(
          collection(db, "users"),
          where("__name__", "in", batch)
        );
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
      }
      if (isMounted) setMatches(usersData);
    };
    fetchMatches();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="flex flex-row justify-center items-center">
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-4 text-white">Your Matches</h1>
        {matches.length === 0 ? (
          <p>No matches yet. Keep swiping!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {matches.map((match) => (
              <div key={match.id} className="rounded-lg p-4 shadow-lg bg-white">
                <img
                  src={match.photoURL || "/default-profile.png"}
                  alt={match.name}
                  className="w-full md:h-48 lg:h-48 xl:h-55 object-cover rounded-md mb-4"
                />
                <h2 className="text-xl font-semibold">
                  {match.name}, {match.age}
                </h2>
                <p className="">{match.bio}</p>
              </div>
            ))}
          </div>
        )}
        </div>
    </div>
  );
};

export default Matches;
