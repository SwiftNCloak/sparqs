"use client"

import React, { useState, useEffect } from "react";
import { login, signup } from './actions'

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

const LoginForm: React.FC<{ closeModal: () => void }> = ({ closeModal }) => (
  <form className='flex flex-col space-y-4'>
    <InputField id="email" type="email" label="Email:" />
    <InputField id="password" type="password" label="Password:" />
    <ButtonMain formAction={login}>Log in</ButtonMain>
    <ButtonMain formAction={signup}>Sign up</ButtonMain>
    <button type="button" onClick={closeModal} className="text-themeOrange-500 hover:underline">
      Cancel
    </button>
  </form>
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

interface ButtonMainProps {
  formAction: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
}

const ButtonMain: React.FC<ButtonMainProps> = ({ children, formAction }) => (
  <button 
    formAction={formAction} 
    className="w-full bg-themeOrange-500 text-white py-2 rounded-md transition-colors hover:bg-themeOrange-600 focus:outline-none focus:ring-2 focus:ring-themeOrange-500 focus:ring-offset-2"
  >
    {children}
  </button>
);

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
          <h1 className="text-4xl font-bold mb-6 text-left text-themeOrange-500">Welcome</h1>
          <LoginForm closeModal={closeModal} />
        </div>
      </Modal>
    </div>
  );
}

export default Login;