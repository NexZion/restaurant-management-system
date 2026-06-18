import React, { useState, useEffect } from "react";
import {
  TextField,
  CheckboxField,
  Button,
  ToggleSwitch,
} from "../components/DataFields";
import { useTheme } from "../context/ThemeContext";
import logoImage from "../assets/logo.png";
import CosmicBackground from "../components/CosmicBackground";
import api from "../axiosClient";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [toggle2, setToggle2] = useState(isDarkMode);

  useEffect(() => {
    toggleTheme();
  }, [toggle2]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login API call
    api
      .post("auth/login", { login, password })
      .then((response) => {
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
    
  };

  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900 flex items-center justify-center p-6">
        <CosmicBackground isDark={isDarkMode}/>
      <div className="w-full max-w-[400px] z-20">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900  rounded-xl shadow-lg shadow-gray-200 dark:shadow-gray-800 overflow-hidden">
          <div className="px-10 pb-12 pt-10">
            <ToggleSwitch
              leftLabel="Light"
              rightLabel="Dark"
              checked={toggle2}
              onChange={(e) => setToggle2(e.target.checked)}
              leftIcon={
                <svg
                  className="w-3 h-3 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              rightIcon={
                <svg
                  className="w-3 h-3 text-gray-800"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              }
            />
            {/* Logo */}
            <div className="flex justify-center mt-8 mb-6">
              <div className="flex items-center gap-2">
              <img
                src={logoImage}
                alt="Logo"
                className="h-14 invert dark:invert-0"
              />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-gray-400 text-sm">
                Please enter your details to sign in
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <TextField
                label="Username / Email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />

              {/* Password */}
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Options */}
              <div className="flex items-center justify-between text-sm mx-2">
                <CheckboxField
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                <a
                  href="#"
                  className="text-blue-600 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <Button type="submit" fullWidth>
                Log in
              </Button>
            </form>
          </div>

        </div>

        {/* Subtle footer text */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 NexZion. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
