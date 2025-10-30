"use client";
import { auth, db } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  doc,
  where,
  updateDoc,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { ArrowLeft, Send } from "lucide-react";
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
  lastSent: Timestamp;
  lastMessage: string;
};

type Message = {
  senderId: string;
  text: string;
  createdAt: Timestamp;
};

const Messages = () => {
  const user = auth.currentUser;
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  // stores the uid of the opened chat
  const [chatOpened, setChatOpened] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  // state variables for mobile compatibility / responsiveness
  const [isChatOpened, setIsChatOpened] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  // for auto scroll purposes
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Make sure user is authenticated
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setMatches([]);
        return;
      }

      // Fetch all matches for the authenticated user
      const q = query(
        collection(db, "matches"),
        where("users", "array-contains", user.uid)
      );

      const unsubscribeMatches = onSnapshot(q, async (querySnapshot) => {
        const matchIds: {
          userId: string;
          matchId: string;
          lastSent: Timestamp;
          lastMessage: string;
        }[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const otherUserId = data.users.find(
            (uid: string) => uid !== user.uid
          );
          if (otherUserId) {
            matchIds.push({
              userId: otherUserId,
              matchId: doc.id,
              lastSent: data.lastSent || null,
              lastMessage: data.lastMessage || "",
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
              lastSent: matchObj?.lastSent,
              lastMessage: matchObj?.lastMessage,
              ...doc.data(),
            } as UserProfile);
          });
        }

        // Sort matches by latest message (descending)
        const sorted = [...usersData].sort((a, b) => {
          const aTime = a.lastSent?.toMillis?.() ?? 0;
          const bTime = b.lastSent?.toMillis?.() ?? 0;
          return bTime - aTime;
        });

        setMatches(sorted);
        setLoading(false);
      });
      return () => unsubscribeMatches();
    });

    return () => unsubscribeAuth();
  }, []);

  // auto scroll purposes when sending a message
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight - 50;
    }
  }, [messages]);

  // This sets the boolean state isMobileView when screen size changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileView(e.matches);
    };

    setIsMobileView(mediaQuery.matches);

    // Add listener (using correct API depending on browser support)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // For older Safari versions
      mediaQuery.addListener(handleChange);
    }

    // Cleanup listener
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  function fetchMessages(matchId: string) {
    if (!user) return;

    // Fetch messages for the selected match
    const q = query(
      collection(db, "chats", matchId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({
          senderId: doc.data().senderId,
          text: doc.data().text,
          createdAt: doc.data().createdAt,
        });
      });

      setMessages(messagesData);
    });
    setChatOpened(matchId);

    return unsubscribe;
  }

  function handleSendMessage(matchId: string) {
    if (!user) return;

    const sendMessage = async () => {
      const messageData = {
        senderId: user.uid,
        text: messageInput,
        createdAt: Timestamp.now(),
      };

      try {
        await addDoc(collection(db, "chats", matchId, "messages"), messageData);

        // Update the match with last message info
        const matchRef = doc(db, "matches", matchId);
        await updateDoc(matchRef, {
          lastMessage: messageInput,
          lastSent: Timestamp.now(),
        });

        setMessageInput("");
      } catch (e) {
        console.error("Error sending message: ", e);
      }
    };
    sendMessage();
  }

  // Display loading state
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen pb-20">
        <p className="text-white text-center text-xl">Loading messages...</p>
      </div>
    );

  return (
    <div className={`md:grid md:grid-cols-10`}>
      {/* Matches List */}
      {/* If mobile view, only show matches list when chat is not opened */}
      {(!isMobileView || !isChatOpened) && (
        <div className={`md:col-span-4 lg:col-span-3 bg-white p-2`}>
          <h1 className="text-black text-2xl font-bold">Chats</h1>
          {matches.length === 0 && (
            <div className="h-screen flex pb-30 justify-center items-center">
              <h1>Your first match is one swipe away!</h1>
            </div>
          )}
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={(e) => {
                e.preventDefault();
                fetchMessages(match.matchId);
                setIsChatOpened(true);
              }}
              className={`p-2 flex flex-row space-x-4 items-center hover:bg-slate-100 ${
                chatOpened === match.matchId ? "bg-slate-100" : ""
              }`}
            >
              <img
                src={match.photoURL}
                className="w-10 h-10 rounded-full"
                alt="User Photo"
              />
              <div>
                <p className="text-black text-xl font-medium">{match.name}</p>
                <p className="text-black">{match.lastMessage}</p>
              </div>
              <hr className="my-2 border-gray-300" />
            </div>
          ))}
        </div>
      )}
      {/* Chat Window */}
      {/* If mobile view, only show chat window when a chat is opened */}
      {(!isMobileView || isChatOpened) && (
        <div className="col-span-6 lg:col-span-7 h-screen flex flex-col">
          {/* Chat Header */}
          {chatOpened && (
            <div className="flex flex-row bg-white shadow-2xl px-4 py-2 items-center">
              {isMobileView && (
                <button
                  className="w-12"
                  onClick={() => {
                    setIsChatOpened(false);
                  }}
                >
                  <ArrowLeft />
                </button>
              )}
              <img
                src={
                  matches.find((match) => match.matchId === chatOpened)
                    ?.photoURL
                }
                className="w-10 h-10 rounded-full me-3"
                alt="User Photo"
              />
              <h2 className="text-black text-2xl font-bold">
                {matches.find((match) => match.matchId === chatOpened)?.name}
              </h2>
            </div>
          )}
          {chatOpened ? (
            <>
              {/* Messages List */}
              <div
                className="flex-1 overflow-y-auto p-4 md:pb-22"
                ref={messagesContainerRef}
              >
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
                  <div className="h-screen flex flex-col justify-center items-center pb-40">
                    <p className="text-white text-xl">
                      No messages yet. Say hi!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 block border-t border-gray-300 sticky bottom-0 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(chatOpened);
                  }}
                  className="flex space-x-2"
                >
                  <input
                    type="text"
                    name="message"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    required
                  />
                  <button type="submit">
                    <Send />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white text-xl pb-20">
              Select a chat to start messaging.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;
