"use client";
import { auth, db } from "@/firebase/firebase";
import { match } from "assert";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";

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

type Message = {
  senderId: string;
  text: string;
  createdAt: Timestamp;
};

const Messages = () => {
  const user = auth.currentUser;
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [matchesIds, setMatchesIds] = useState<
    { userId: string; matchId: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [chatOpened, setChatOpened] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

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

      const querySnapshot = await getDocs(q);
      const matchIds: { userId: string; matchId: string }[] = [];
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

      setMatchesIds(matchIds);

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

    return () => unsubscribeAuth();
  }, []);

  function fetchMessages(matchId: string) {
    if (!user) return;
    
    const getMessages = async () => {
      const q = query(collection(db, "chats", matchId, "messages"));

      const querySnapshot = await getDocs(q);
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        if(!doc.exists()) return;
        messagesData.push({
          senderId: doc.data().senderId,
          text: doc.data().text,
          createdAt: doc.data().createdAt,
        });
      });
      alert(messagesData[0].text);
      messagesData.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      setMessages(messagesData);
    };
    getMessages();
    setChatOpened(matchId);
  }

  function handleSendMessage(matchId: string, text: string) {
    if (!user) return;
  }

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen pb-20">
        <p className="text-white text-center text-xl">Loading messages...</p>
      </div>
    );

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1 bg-white hover:bg-slate-100">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(match.matchId);
            }}
            className="p-2 flex flex-row space-x-4 items-center"
          >
            <img src={match.photoURL} className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-black text-xl font-medium">{match.name}</p>
              <p className="text-black">
                This is the latest message!{/*latest message*/}
              </p>
            </div>
            <hr className="my-2 border-gray-300" />
          </div>
        ))}
      </div>
      <div className="col-span-3">
        {chatOpened ? (
          <div className="flex flex-col h-screen">
            <div className="flex-grow p-4 overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 flex ${
                      message.senderId === user?.uid
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg max-w-xs ${
                        message.senderId === user?.uid
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-xl">
                  No messages yet. Say hi!
                </p>
              )}
            </div>
            <div className="p-4 border-t border-gray-300">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem(
                    "message"
                  ) as HTMLInputElement;
                  handleSendMessage(
                    matches.find((m) => m.id === chatOpened)?.matchId || "",
                    input.value
                  );
                  input.value = "";
                }}
              >
                <input
                  type="text"
                  name="message"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Type your message..."
                  required
                />
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-screen">
            <p className="text-white text-xl">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
