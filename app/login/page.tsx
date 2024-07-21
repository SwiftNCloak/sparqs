"use client"
import { login, signup } from './actions'

import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    document.title = 'Login | Sparqs';
  }, []);

  return (
    <div>
      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <button formAction={login}>Log in</button>
        <button formAction={signup}>Sign up</button>
      </form>
    </div>
  );
}
