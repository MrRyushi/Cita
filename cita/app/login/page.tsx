"use client";
import React from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      signInWithEmailAndPassword(auth, email, password);
      alert('successfully logged in')
    } catch (e) {
      console.log(e)
      alert(e)
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={signIn}>
        <label htmlFor="email">Email</label>
        <input
          placeholder="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          placeholder="Password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button>Login</button>
      </form>
    </div>
  );
};

export default Login;
