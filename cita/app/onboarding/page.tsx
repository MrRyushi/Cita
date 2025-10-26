"use client";
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const Onboarding = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [into, setInto] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  async function onboard() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          age: Number(age),
          sex,
          into,
          bio,
          interests: interests.split(",").map((i) => i.trim()),
          photoURL,
        },
        { merge: true }
      );

      console.log("User profile updated!");
    } catch (e) {
      console.error("Error updating document:", e);
    }
  }

  return (
    <div>
      <form action={onboard}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            placeholder="What is your name?"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="age">Age</label>
          <input
            type="number"
            placeholder="How old are you?"
            id="age"
            name="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="sex">You are a </label>
          <select
            id="sex"
            name="sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            required
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="man">Man</option>
            <option value="woman">Woman</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label htmlFor="into">Interested In</label>
          <select
            id="into"
            name="into"
            value={into}
            onChange={(e) => setInto(e.target.value)}
            required
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="men"> Men</option>
            <option value="women"> Women </option>
            <option value="everyone"> Everyone </option>
          </select>
        </div>
        <div>
          <label htmlFor="bio">Bio</label>
          <input
            type="text"
            placeholder="Tell us about yourself"
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="interests">Interests</label>
          <input
            type="text"
            placeholder="Enter your interests, separated by commas"
            id="interests"
            name="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            required
          />
        </div>
        {/*<div>
          <label htmlFor="photoURL">Profile Picture</label>
          <input 
            type="file" 
            placeholder="Upload your profile picture"
            id="photoURL"
            name="photoURL"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            required
          />
        </div>*/}
        <div>
          <button onClick={onboard}>Complete Details</button>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
