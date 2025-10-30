/* eslint-disable @next/next/no-img-element */
"use client";
import AuthGuard from "@/components/AuthGuard";
import { auth, db } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Venus, Mars, X, Check } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { ModeToggle } from "@/components/ModeToggle";

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

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [swipedUsers, setSwipedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Retrieves the current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setQueue([]);
        setSwipedUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetches all swiped users to filter later
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setSwipedUsers([...data.likedUsers, ...data.passes]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Set the queue that filters the swiped users
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users"), where("newUser", "==", false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: UserProfile[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid && !swipedUsers.includes(doc.id)) {
          usersData.push({ id: doc.id, ...doc.data() } as UserProfile);
        }
      });
      setQueue(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, swipedUsers]);

  async function handlePass() {
    if (!user?.uid) return;

    if (queue.length > 0) {
      const [first, ...rest] = queue;
      setQueue(rest);

      // Add person X to the passes of the current user
      try {
        await updateDoc(doc(db, "users", user.uid), {
          passes: arrayUnion(first.id),
        });
        toast.info(`Passed on ${first.name}`);
      } catch (e) {
        console.error(e);
        toast.error("Failed to record pass");
      }
    }
  }

  async function handleLike() {
    if (!user?.uid) return;

    if (queue.length > 0) {
      const [first, ...rest] = queue;
      setQueue(rest);

      try {
        // Add person X to the likes of current user
        await updateDoc(doc(db, "users", user.uid), {
          likedUsers: arrayUnion(first.id),
        });

        // If it's a match
        if (first.likedUsers.includes(user.uid)) {
          toast.success(`It's a match with ${first.name}!`);

          // Create a match document
          await addDoc(collection(db, "matches"), {
            users: [user.uid, first.id],
            createdAt: new Date(),
          });
        } else {
          toast.info(`Liked ${first.name}`);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to record like");
      }
    }
  }

  return (
    <AuthGuard>
      <div className="w-full h-screen pb-10 flex flex-col justify-center items-center">
        <div className="absolute top-3 left-3">
          <ModeToggle/>
        </div>
        <div className="space-y-3 flex justify-center items-center flex-col">
          {loading ? (
            <p className="text-xl">Loading Profiles...</p>
          ) : queue.length === 0 ? (
            <div className="rounded-xl mx-10 sm:mx-0 p-10 flex flex-col justify-center items-center">
              <p className="text-xl sm:text-2xl font-bold mb-4 text-center">
                No more users available
              </p>
              <p className="text-base text-center">
                Check back later or adjust your preferences to find more
                matches!
              </p>
            </div>
          ) : (
            <div className="bg-rose-900 md:grid grid-cols-2 rounded-xl w-85/100 md:w-70/100 lg:w-80/100 justify-center items-center">
              <div className="">
                {queue.length > 0 && (
                  <img
                    src={queue[0].photoURL}
                    alt={queue[0].name}
                    className="ltr rounded-tl-xl rounded-tr-xl md:rounded-tr-none md:rounded-s-xl w-full h-100 md:h-120 xl:h-150 object-cover"
                  />
                )}
              </div>
              <div className=" p-5 flex flex-col justify-center ">
                {queue.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white">
                      {queue[0].name}, {queue[0].age}
                    </p>
                    <Badge className="uppercase ps-2 pe-3 py-1 bg-pink-600 text-white">
                      {queue[0].sex === "man" ? <Mars /> : <Venus />}
                      {queue[0].sex}
                    </Badge>
                    <p className="text-white">{queue[0].bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {queue.length > 0 ? (
            <div className="flex flex-row justify-center items-center space-x-10">
              <button
                onClick={handlePass}
                className="bg-red-800 hover:bg-red-700 w-15 h-15 md:w-20 md:h-20 rounded-full py-2 text-white flex justify-center items-center"
              >
                <X size={30} />
              </button>
              <button
                onClick={handleLike}
                className="bg-pink-800 hover:bg-pink-700 w-15 h-15 md:w-20 md:h-20 rounded-full py-2 text-white flex justify-center items-center"
              >
                <Check size={30} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </AuthGuard>
  );
}
