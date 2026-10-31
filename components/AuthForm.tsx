
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AuthForm({
  mode,
}: {
  mode: 'login' | 'signup'
}) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const supabase = createClient()

      if (mode === 'signup') {
        const dob = new Date(`${birthDate}T12:00:00Z`)
        const today = new Date()

        const cutoff = new Date(
          Date.UTC(
            today.getUTCFullYear() - 16,
            today.getUTCMonth(),
            today.getUTCDate(),
            12
          )
        )

        if (
          !birthDate ||
          Number.isNaN(dob.getTime()) ||
          dob > cutoff
        ) {
          throw new Error(
            'You must be at least 16 years old to join BIZLINK.'
          )
        }

        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              `${window.location.origin}/auth/callback`,
            data: {
              display_name: name,
              birth_date: birthDate,
            },
          },
        })

        if (error) throw error

        if (data.session) {
          router.push('/onboarding')
          router.refresh()
        } else {
          setMessage(
            'Check your email for the confirmation link before logging in.'
          )
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (error) throw error

        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="glass form" onSubmit={submit}>
      <div className="eyebrow">Welcome to BIZLINK</div>

      <h2>
        {mode === 'signup'
          ? 'Create your space ✦'
          : 'Welcome back ✦'}
      </h2>

      <p className="muted">
        {mode === 'signup'
          ? 'Join the community and start making your mark.'
          : 'Pick up where you left off.'}
      </p>

      {mode === 'signup' && (
        <>
          <label className="field">
            <span>Display name</span>
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>

          <label className="field">
            <span>Date of birth</span>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>

          <p className="muted">
            You must be at least 16 years old to join BIZLINK.
          </p>
        </>
      )}

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={
            mode === 'signup'
              ? 'new-password'
              : 'current-password'
          }
        />
      </label>

      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}

      <button
        className="btn"
        disabled={busy}
        style={{ width: '100%' }}
      >
        {busy
          ? 'Please wait...'
          : mode === 'signup'
          ? 'Create account ↗'
          : 'Log in ↗'}
      </button>

      <p className="muted">
        {mode === 'signup' ? (
          <>
            Already a member?{' '}
            <Link className="accent" href="/login">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link className="accent" href="/signup">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
