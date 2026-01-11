import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Daftar - ChainAid",
  description: "Buat akun ChainAid baru",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-blue-600">ChainAid</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Buat Akun Baru</h2>
          <p className="text-slate-600">Bergabunglah dengan platform donasi transparan</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <RegisterForm />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Atau</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Syarat &amp; Ketentuan
          </Link>{" "}
          dan{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Kebijakan Privasi
          </Link>{" "}
          kami
        </div>
      </div>
    </div>
  )
}
