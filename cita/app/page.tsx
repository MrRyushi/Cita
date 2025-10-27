"use client";
import AuthGuard from "@/components/AuthGuard";
import { auth, db } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Home() {
  const user = auth.currentUser;
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

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
      const usersData: any[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user?.uid) {
          usersData.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(usersData);
    };

    fetchUsers();
  }, [user?.uid]);

  return (
    <AuthGuard>
      <div className="">
        <button onClick={() => userLogout()}>Logout</button>
        <div>
          {users.map((user, key) => (
            <div key={key}>
              <p>{user.name}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
