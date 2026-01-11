import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Lupa Password - ChainAid",
  description: "Reset password akun ChainAid Anda",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-blue-600">ChainAid</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lupa Password?</h2>
          <p className="text-slate-600">Masukkan email Anda untuk reset password</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <ForgotPasswordForm />

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
