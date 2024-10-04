import React, {  useState } from "react";
import { Toaster, toast } from 'react-hot-toast';
import {  loginUserNew } from "../services/Auth";


export default function LoginPage() {

  // Login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };
  const loginHandler = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing...");

    try {
      // const res = await login(loginData);
      const headers ={};
      const res = await loginUserNew(loginData, headers)
      if (res.status === 200) {
        console.log(res);
        let token = JSON.stringify(res.data.user.token);
        token = JSON.parse(token);

        localStorage.setItem("jwtToken", token);
        localStorage.setItem("name", res.data.user.name);
        localStorage.setItem("id", res.data.user._id);
        
        toast.success("Login Successfully");

        window.location.href = `/list`;

      }
      else {
        console.log("first")
        toast.error('Email or Password is Wrong');

      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred during login');
    }
    finally {
      toast.dismiss(loadingToast);
    }
  };


  return (
    <>
      <Toaster position="top-center" />

      <div className="flex h-screen bg-orange-100 gap-6 p-3 overflow-y-hidden">
      
        {/* Login */}
        <div className="m-auto p-6 bg-white rounded-lg shadow-lg w-96">
          <h2 className="text-2xl text-center font-semibold mb-4">Sign in</h2>
          <form onSubmit={(e) => loginHandler(e)}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Your email"
                autoComplete="email"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Your password"
                  autoComplete="password"
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 rounded-lg"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
}