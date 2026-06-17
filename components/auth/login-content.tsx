"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Chrome } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: "google") => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="w-full max-w-md bg-[#fdfbf7] border border-gray-200 rounded-2xl shadow-xl p-8">
      <h1 className="text-3xl font-bold mb-2 text-center text-emerald-600">Welcome Back</h1>
      <p className="text-gray-500 text-center mb-8">Sign in to your cleaning account</p>

      {registered && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
          <span className="text-lg">✓</span> Account created! Please sign in.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <Input
            label="Email Address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="you@example.com"
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 rounded-xl"
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/10 rounded-xl"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="px-4 bg-white text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-8">
        <Button
          type="button"
          variant="outline"
          className="w-full py-6 gap-3 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all rounded-xl shadow-sm"
          onClick={() => handleOAuthSignIn("google")}
        >
          <Chrome className="w-5 h-5 text-gray-600" />
          Google
        </Button>
      </div>
    </div>
  );
}
