"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";
import { Pencil } from "lucide-react";
import { uploadToImgbb } from "@/utils/uploadToImgbb";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";

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
  const [userData, setUserData] = useState<UserProfile>();
  const [editing, setEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoFilename, setPhotoFilename] = useState("No image");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Fetch the current user's profile
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserProfile);
      } else {
        console.log("No such document!");
      }
    });
    return () => unsubscribeAuth();
  });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const user = auth.currentUser;
    if (!file || !user) return;

    setLoading(true);

    // Upload to imgbb
    const imageUrl = await uploadToImgbb(file);

    if (imageUrl) {
      // Save image URL to Firestore
      setPhotoURL(imageUrl);
      const fileName = imageUrl.split("/").pop();
      setPhotoFilename(fileName || "");
    }

    setLoading(false);
  }

  async function saveProfileChanges() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // check first if there's updated input, or get the existing details
      const updatedName = name || userData?.name || "";
      const updatedBio = bio || userData?.bio || "";
      const updatedPhotoURL = photoURL || userData?.photoURL || "";

      // update details on firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: updatedName,
          bio: updatedBio,
          photoURL: updatedPhotoURL,
        },
        { merge: true }
      );
      setEditing(false);
      clearValues();
      toast.success("Profile updated successfully!");

    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  }

  function clearValues() {
    setName("");
    setBio("");
    setPhotoURL("");
    setPhotoFilename("No image");
  }

  return (
    <AuthGuard>
      <div className="flex justify-center items-center h-screen pb-20 px-2">
        <div className="p-10 rounded-lg bg-white shadow-lg">
          {!editing && <Pencil className="" onClick={() => setEditing(true)} />}

          {/* Front page / Profile */}
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
              {/* Back page / Edit Form */}
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfileChanges();
                }}
              >
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="What is your name?"
                    id="name"
                    name="name"
                    value={userData.name || name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <Textarea
                    placeholder="Tell us about yourself"
                    id="bio"
                    name="bio"
                    value={userData.bio || bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel className="cursor-pointer">
                    Upload Profile Picture
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="rounded-lg border px-4 py-2">
                      {loading ? "Uploading..." : photoFilename}
                    </div>
                  </FieldLabel>
                </Field>
                <div className="flex justify-end gap-4">
                  <Button
                    className="bg-red-400 hover:bg-red-500 text-white rounded-lg pt-2"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-pink-700 hover:bg-pink-800 text-white rounded-lg pt-2"
                    type="submit"
                  >
                    Save
                  </Button>
                </div>
              </form>
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
