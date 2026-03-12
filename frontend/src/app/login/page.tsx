"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email && password) {
      setIsLoginLoading(true);
      const res = await login(email, password);
      setIsLoginLoading(false);
      if (res.success) {
        success("You are successfully logged in!");
        router.push("/");
      } else {
        setError(res.message || "Invalid email or password.");
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setIsGoogleLoading(true);
      setError("");
      const res = await loginWithGoogle(credentialResponse.credential);
      setIsGoogleLoading(false);
      if (res.success) {
        success("You are successfully logged in with Google!");
        router.push("/");
      } else {
        setError(res.message || "Google sign in failed.");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a1612 0%, #112318 40%, #1a3d2b 75%, #29bc89 150%)",
      }}
    >
      {/* Glowing orbs */}
      <div
        className="absolute top-[-120px] right-[-120px] w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(41,188,137,0.22) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-100px] left-[-100px] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(41,188,137,0.14) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(41,188,137,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating label */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border border-[#29bc89]/30 bg-[#29bc89]/10 text-[#29bc89] text-xs font-bold tracking-widest uppercase pointer-events-none">
        TeesforTeens
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Link
          href="/"
          className="inline-flex items-center text-white/80 hover:text-white mb-6 font-bold transition-colors bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="bg-white/95 backdrop-blur-xl py-10 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          {/* Logo + title */}
          <div className="text-center mb-8">
            <img
              src="/logo.svg"
              alt="TeesforTeens"
              className="h-12 mx-auto mb-4"
            />
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your TeesforTeens account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29bc89] focus:border-[#29bc89] text-sm text-black transition-colors"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-gray-900">
                  Password
                </label>
                <a
                  href="#"
                  className="font-medium text-sm text-[#29bc89] hover:text-[#23a172]"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29bc89] focus:border-[#29bc89] text-sm text-black transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#29bc89] focus:ring-[#29bc89] border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoginLoading || isGoogleLoading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #29bc89, #1e9e72)",
              }}
            >
              {isLoginLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center flex-col items-center gap-2">
              {isGoogleLoading && (
                <span className="text-sm font-bold text-gray-500 mb-2">
                  Connecting to Google...
                  <div className="inline-block relative top-1 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin ml-2" />
                </span>
              )}
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google widget initialization failed")}
                theme="outline"
                shape="rectangular"
                width="100%"
                text="signin_with"
              />
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link
              href="/register"
              className="font-bold text-[#29bc89] hover:text-[#23a172] transition-colors"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
