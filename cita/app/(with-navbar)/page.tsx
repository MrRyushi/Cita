"use client";
import AuthGuard from "@/components/AuthGuard";
import { auth, db } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
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
} from "firebase/firestore";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Venus, Mars, X, Check } from "lucide-react";

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
  const user = auth.currentUser;
  const router = useRouter();
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [swipedUsers, setSwipedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSwipedUsers = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setSwipedUsers([...data.likedUsers, ...data.passes]);
      }
    };
    fetchSwipedUsers();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("newUser", "==", false));

    const fetchUsers = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(q);
      const usersData: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user?.uid && !swipedUsers.includes(doc.id)) {
          usersData.push({ id: doc.id, ...doc.data() } as UserProfile);
        }
      });
      setQueue(usersData);
      setLoading(false);
    };

    fetchUsers();
  }, [user?.uid, swipedUsers]);

  function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  async function handlePass() {
    if (!user?.uid) return;

    if (queue.length > 0) {
      const [first, ...rest] = queue;
      setQueue(rest);

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
        await updateDoc(doc(db, "users", user.uid), {
          likedUsers: arrayUnion(first.id),
        });

        if(first.likedUsers.includes(user.uid)) {
          // It's a match!
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
        <div className="space-y-3 flex justify-center items-center flex-col">
          {loading ? (
            <p className="text-xl">Loading Profiles...</p>
          ) : queue.length === 0 ? (
            <div className="bg-white rounded-xl mx-10 sm:mx-0 p-10 flex flex-col justify-center items-center">
              <p className="text-xl sm:text-2xl font-bold mb-4 text-center">No more users available</p>
              <p className="text-base text-center">
                Check back later or adjust your preferences to find more
                matches!
              </p>
            </div>
          ) : (
            <div className="md:grid grid-cols-2 bg-white rounded-xl w-80/100 xs:w-80 sm:w-80 md:w-80/100 lg:w-70/100 2xl:w-55/100 justify-center items-center">
              <div className="">
                {queue.length > 0 ? (
                  <img
                    src={queue[0].photoURL}
                    alt={queue[0].name}
                    className="ltr rounded-tl-xl rounded-tr-xl md:rounded-tr-none md:rounded-s-xl w-full"
                  />
                ) : (
                  <p className="text-xl p-5">No users available</p>
                )}
              </div>
              <div className=" p-5 flex flex-col justify-center ">
                {queue.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {queue[0].name}, {queue[0].age}
                    </p>
                    <Badge className="uppercase bg-black text-white ps-2 pe-3 py-1">
                      {queue[0].sex === "man" ? <Mars /> : <Venus />}
                      {queue[0].sex}
                    </Badge>
                    <p>{queue[0].bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-row justify-center items-center space-x-10">
            <button
              onClick={handlePass}
              className="bg-[#FCC8D1] hover:bg-pink-200 w-15 h-15 md:w-20 md:h-20 rounded-full py-2 flex justify-center items-center"
            >
              <X size={30} />
            </button>
            <button
              onClick={handleLike}
              className="bg-red-900 hover:bg-red-800 w-15 h-15 md:w-20 md:h-20 rounded-full py-2 text-white flex justify-center items-center"
            >
              <Check size={30} />
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
