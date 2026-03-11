'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push(redirect)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Error de autenticacion')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm text-gray-400 mb-2">
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introduce la contrasena"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-brand-orange transition"
          autoFocus
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-brand-orange-light disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-5xl">📡</span>
            <h1 className="text-3xl font-bold text-brand-orange mt-3">TechPulse</h1>
            <p className="text-sm text-gray-400 mt-2">Monitorizacion de tendencias tech</p>
          </div>

          {/* Form wrapped in Suspense for useSearchParams */}
          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
