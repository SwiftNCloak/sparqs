"use client"

import React, { useState, useEffect } from "react";
import { login, signup } from './actions'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

interface LoginHeaderProps {
  openModal: () => void;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ openModal }) => (
  <div className='h-screen flex flex-col justify-center items-center bg-themeWhite-100'>
    <h2 className='text-5xl font-extrabold text-themeOrange-200 -mb-2'>THINK</h2>
    <h1 className='text-8xl font-black text-themeOrange-200 -mb-2'>OUTSIDE</h1>
    <h1 className='text-5xl font-semibold text-blue-400'>THE BOX</h1>
    <button onClick={openModal} className="mt-8 border-4 border-themeOrange-100 w-32 h-32 p-2 box-border rounded-2xl
                              text-inherit items-center justify-center flex hover:bg-themeOrange-100 transition-colors">
      <h2 className="text-xl text-themeOrange-200 font-bold">LOGIN</h2>
    </button>
  </div>
);

interface InputFieldProps {
  id: string;
  type: string;
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, type, label }) => (
  <div>
    <label htmlFor={id} className="block mb-1 text-themeOrange-600">{label}</label>
    <input id={id} name={id} type={type} required className="w-full px-3 py-2 border border-themeOrange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeOrange-500" />
  </div>
);

const LoginForm: React.FC<{ closeModal: () => void; isLogin: boolean; setIsLogin: (value: boolean) => void }> = ({ closeModal, isLogin, setIsLogin }) => {
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const result = isLogin ? await login(formData) : await signup(formData);
      
      if (result.success) {
        if (isLogin) {
          router.push('/');
        } else {
          setMessage(result.message);
          setIsLogin(true);
        }
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
      {message && <p className={`text-${message.includes('successful') ? 'green' : 'red'}-500`}>{message}</p>}
      {!isLogin && (
        <>
          <InputField id="firstName" type="text" label="First Name:" />
          <InputField id="middleName" type="text" label="Middle Name:" />
          <InputField id="lastName" type="text" label="Last Name:" />
          <InputField id="contactNumber" type="tel" label="Contact Number:" />
          <InputField id="username" type="text" label="Username:" />
        </>
      )}
      <InputField id="email" type="email" label="Email:" />
      <InputField id="password" type="password" label="Password:" />
      <button 
        type="submit"
        className="w-full bg-themeOrange-500 text-white py-2 rounded-md transition-colors hover:bg-themeOrange-600 focus:outline-none focus:ring-2 focus:ring-themeOrange-500 focus:ring-offset-2"
      >
        {isLogin ? "Log in" : "Sign up"}
      </button>
      <p className="text-center">
        {isLogin ? "New to our platform? " : "Already have an account? "}
        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-themeOrange-500 hover:underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </form>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="rounded-lg shadow-xl max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    document.title = 'Login | Sparqs';
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className='flex flex-col justify-center'>
      <LoginHeader openModal={openModal} />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="w-full rounded-lg bg-themeOrange-200 p-8">
          <div className="flex items-center justify-between mb-6 ">
            <h1 className="text-4xl font-bold text-left text-themeOrange-500">
              {isLogin ? "Welcome Back" : "Sign Up"}
            </h1>
            <button type="button" onClick={closeModal} className="text-themeOrange-500 hover:underline">
              <FontAwesomeIcon icon={faClose} className="w-6 h-6" />
            </button>
          </div>
          <LoginForm closeModal={closeModal} isLogin={isLogin} setIsLogin={setIsLogin} />
        </div>
      </Modal>
    </div>
  );
}

export default Login;