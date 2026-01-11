import type { Metadata } from "next"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password - ChainAid",
  description: "Buat password baru untuk akun ChainAid Anda",
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-blue-600">ChainAid</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
          <p className="text-slate-600">Masukkan password baru Anda</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
