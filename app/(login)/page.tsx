"use client"
import { login, signup } from './actions'
import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    document.title = 'Login | Sparqs';
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-orange-400">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">SparQs</h1>
        <form className='flex flex-col space-y-4'>
          <div>
            <label htmlFor="email" className="block mb-1">Email:</label>
            <input id="email" name="email" type="email" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1">Password:</label>
            <input id="password" name="password" type="password" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <button formAction={login} className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors">Log in</button>
          <button formAction={signup} className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors">Sign up</button>
        </form>
      </div>
    </div>
  );
}