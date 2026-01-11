import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login - ChainAid",
  description: "Login ke akun ChainAid Anda",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-blue-600">ChainAid</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang Kembali</h2>
          <p className="text-slate-600">Login untuk melanjutkan ke dashboard Anda</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <LoginForm />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Atau</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/forgot-password" className="hover:text-blue-600 transition-colors">
            Lupa Password?
          </Link>
        </div>
      </div>
    </div>
  )
}
