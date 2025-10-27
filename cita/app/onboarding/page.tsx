"use client";
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import AuthGuard from "@/components/AuthGuard";
import { uploadToImgbb } from "@/utils/uploadToImgbb";
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { useRouter } from "next/navigation";

const Onboarding = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [into, setInto] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoFilename, setPhotoFilename] = useState("No image")

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
      setPreview(imageUrl);
      const fileName = imageUrl.split("/").pop();
      setPhotoFilename(fileName || "");
    }

    setLoading(false);
  }

  async function onboard() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      if(!name || !age || !sex || !into || !bio || !photoURL) {
        toast.error("Please fill in all fields");
        return;
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          age: Number(age),
          sex,
          into,
          bio,
          photoURL,
        },
        { merge: true }
      );

      toast.success("Profile updated successfully!");
      setTimeout(() => {
         router.push("/")
      }, 1500)
     
    } catch (e) {
      console.error("Error updating document:", e);
    }
  }

  return (
    <AuthGuard>
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-linear-to-bl from-pink-900 via-red-400 to-[#FFABAB] px-4">
        <form className="bg-white p-8 rounded-xl w-full xs:w-5/6 sm:w-2/3 md:w-1/2 lg:w-1/3 overflow-y-auto" action={onboard}>
        <FieldSet>
          <FieldTitle className="text-xl">Complete your profile</FieldTitle>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              type="text"
              placeholder="What is your name?"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="age">Age</FieldLabel>
            <Input
              type="number"
              placeholder="How old are you?"
              id="age"
              name="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sex">You are a?</FieldLabel>
            <Select required onValueChange={(value) => setSex(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sex" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="man">Man</SelectItem>
                <SelectItem value="woman">Woman</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="into">Interested In</FieldLabel>
            <Select required onValueChange={(value) => setInto(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="You are into?" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="everyone">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <Input
              type="text"
              placeholder="Tell us about yourself"
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </Field>
          {
            <Field className="">
              <FieldLabel className="cursor-pointer">
                Upload Profile Picture
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  required
                />
                <div className="rounded-lg border px-4 py-2">
                  {loading ? "Uploading..." : photoFilename}
                </div>
              </FieldLabel>

              {/*preview && (
                <Image
                  src={preview}
                  alt="Profile Preview"
                  width={128}
                  height={128}
                  sizes="128px"
                  className=""
                  unoptimized
                />
              )*/}
            </Field>
          }
          <Field>
            <Button
              onClick={onboard}
              className="bg-pink-700 hover:bg-pink-600 text-white rounded-lg pt-2"
            >
              Complete Details
            </Button>
          </Field>
        </FieldSet>
        </form>
      </div>
    </AuthGuard>
  );
};

export default Onboarding;
