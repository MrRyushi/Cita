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
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Venus, Mars, X, Check} from "lucide-react"

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

  function userLogout() {
    try {
      signOut(auth);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const q = query(collection(db, "users"), where("newUser", "==", false));

    const fetchUsers = async () => {
      const querySnapshot = await getDocs(q);
      const usersData: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user?.uid) {
          usersData.push({ id: doc.id, ...doc.data() } as UserProfile);
        }
      });
      setQueue(usersData);
    };

    fetchUsers();
  }, [user?.uid]);

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

        

        toast.info(`Liked ${first.name}`);
      } catch (e) {
        console.error(e);
        toast.error("Failed to record like");
      }
    }
  }

  return (
    <AuthGuard>
      <div className="w-full px-52 3xl:w-screen h-screen pb-10 flex flex-col justify-center items-center bg-linear-to-bl from-pink-900 via-red-400 to-[#FFABAB]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 bg-white rounded-xl">
            <div className="">
              {queue.length > 0 ? (
                <img src={queue[0].photoURL} alt={queue[0].name} width={500} height={500} className="ltr rounded-s-xl"/>
              ) : (
                <p>No users available</p>
              )}
              
            </div>
            <div className=" p-5 flex flex-col justify-center ">
              {queue.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{queue[0].name}, {queue[0].age}</p>
                  <Badge className="uppercase bg-black text-white ps-2 pe-3 py-1">
                    {queue[0].sex === "man" ? <Mars /> : <Venus />}
                    {queue[0].sex}
                  </Badge>
                  <p>{queue[0].bio}</p>
                </div>
              ) : (
                <p>No users available</p>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-center items-center space-x-10">
            <button onClick={handlePass} className="bg-[#FCC8D1] hover:bg-pink-200 w-20 h-20 rounded-full py-2 flex justify-center items-center"><X size={40}/></button>
            <button onClick={handleLike} className="bg-red-900 hover:bg-red-800 w-20 h-20 rounded-full py-2 text-white flex justify-center items-center"><Check size={40}/></button>
          </div>
        </div>
      </div>  
    </AuthGuard>
  );
}
