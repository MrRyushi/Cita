"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

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
  matchId: string;
};
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ModeToggle } from "@/components/ModeToggle";

const Matches = () => {
  const user = auth.currentUser;
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setMatches([]);
        return;
      }

      const q = query(
        collection(db, "matches"),
        where("users", "array-contains", user.uid)
      );

      const unsubscribeMatches = onSnapshot(q, async (querySnapshot) => {
        const matchIds: { userId: string; matchId: string }[] = [];
        // Get all the matches first of the current user
        querySnapshot.forEach((doc) => {
          const otherUserId = doc
            .data()
            .users.find((uid: string) => uid !== user.uid);
          if (otherUserId) {
            matchIds.push({
              userId: otherUserId, // the matched user’s UID
              matchId: doc.id, // the match document ID
            });
          }
        });

        // Batch fetch matched users' profiles
        const usersData: UserProfile[] = [];
        for (let i = 0; i < matchIds.length; i += 10) {
          const batch = matchIds.slice(i, i + 10);
          const batchUserIds = batch.map((b) => b.userId);

          const usersQuery = query(
            collection(db, "users"),
            where("__name__", "in", batchUserIds)
          );
          const usersSnapshot = await getDocs(usersQuery);

          usersSnapshot.forEach((doc) => {
            const matchObj = matchIds.find((m) => m.userId === doc.id);
            usersData.push({
              id: doc.id,
              matchId: matchObj?.matchId,
              ...doc.data(),
            } as UserProfile);
          });
        }

        setMatches(usersData);
        setLoading(false);
      });
      return () => unsubscribeMatches();
    });
    return () => unsubscribeAuth();
  }, []);

  function handleUnmatch(matchId: string, name: string) {
    if (!user) return;

    // delete document from matches collection
    const unmatch = async () => {
      await deleteDoc(doc(db, "matches", matchId));

      // remove match from state
      setMatches((prevMatches) =>
        prevMatches.filter((match) => match.matchId !== matchId)
      );

      // remove matched user from likedUsers array in user's document (to do)

      // remove document from messages collection between the two users (to do)

      toast.info("Unmatched with " + name);
    };

    unmatch();
  }

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen pb-20">
        <p className="text-white text-center text-xl">Loading matches...</p>
      </div>
    );

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="absolute top-3 left-3">
        <ModeToggle/>
      </div>
      <div className="p-10">
        {/* Display if no user has no matches yet */}
        {matches.length === 0 ? (
          <div className="flex flex-row h-screen items-center justify-center pb-30">
            <p className="text-white">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-pink-600">Your Matches</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {matches.map((match) => (
                <Popover key={match.id}>
                  <PopoverTrigger
                    key={match.id}
                    className="rounded-lg p-4 shadow-xl border border-pink-600"
                  >
                    <img
                      src={match.photoURL || "/default-profile.png"}
                      alt={match.name}
                      className="w-full md:h-48 lg:h-48 xl:h-55 object-cover rounded-md mb-4"
                    />
                    <h2 className="text-xl font-semibold">
                      {match.name}, {match.age}
                    </h2>
                    <p className="">{match.bio}</p>
                  </PopoverTrigger>

                  <PopoverContent className="lex flex-row space-x-2 rounded-lg shadow-lg justify-center items-center">
                    <label className="font-bold">Unmatch {match.name}?</label>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleUnmatch(match.matchId, match.name);
                      }}
                      variant="destructive"
                      className="text-white bg-red-500 hover:bg-red-600"
                    >
                      Yes
                    </Button>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
