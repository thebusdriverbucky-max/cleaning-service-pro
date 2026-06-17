"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Chrome } from "lucide-react";
import { signIn } from "next-auth/react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: "google") => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-green-600">Create Account</h1>
        <p className="text-gray-500 text-center mb-8">Join our professional cleaning service</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            {...register("name")}
            error={errors.name?.message}
            placeholder="John Doe"
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 rounded-xl"
          />

          <Input
            label="Email Address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="you@example.com"
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 rounded-xl"
          />

          <Input
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            placeholder="••••••••"
            helperText="At least 8 characters"
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 rounded-xl"
          />

          <Input
            label="Confirm Password"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 rounded-xl"
          />

          <Button
            type="submit"
            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-green-600/10 rounded-xl"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              Sign In
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
    </div>
  );
}
