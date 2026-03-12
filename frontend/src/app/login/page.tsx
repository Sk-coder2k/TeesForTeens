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
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Link
          href="/"
          className="inline-flex items-center text-white/80 hover:text-white mb-6 font-bold transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <div className="bg-white/95 backdrop-blur-xl py-10 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 sm:text-sm transition-colors text-black"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-gray-900">
                  Password
                </label>
                <a
                  href="#"
                  className="font-medium text-sm text-mint-600 hover:text-mint-500"
                >
                  Forgot password?
                </a>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 sm:text-sm transition-colors text-black"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-mint-600 focus:ring-mint-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoginLoading || isGoogleLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-mint-600 hover:bg-mint-500 transition-all hover-lift disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoginLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center flex-col items-center gap-2">
              {isGoogleLoading && (
                <span className="text-sm font-bold text-gray-500 mb-2">
                  Connecting to Google...{" "}
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

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              href="/register"
              className="font-bold text-mint-600 hover:text-mint-500 transition-colors"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
