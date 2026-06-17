import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginContent from "@/components/auth/login-content";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <Suspense fallback={<div className="text-center text-green-600">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
