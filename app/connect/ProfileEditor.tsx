
'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  display_name: string | null
  headline: string | null
  bio: string | null
  skills: string | null
  location: string | null
  is_public: boolean
}

export default function ProfileEditor() {
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    headline: '',
    bio: '',
    skills: '',
    location: '',
    is_public: false,
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        setMessage('Please sign in to edit your profile.')
        setLoading(false)
        return
      }

      const id = authData.user.id
      setUserId(id)

      const { data, error } = await supabase
        .from('profiles')
        .select(
          'display_name, headline, bio, skills, location, is_public'
        )
        .eq('id', id)
        .single()

      if (error) {
        setMessage(`Unable to load profile: ${error.message}`)
      } else if (data) {
        setProfile({
          display_name: data.display_name ?? '',
          headline: data.headline ?? '',
          bio: data.bio ?? '',
          skills: data.skills ?? '',
          location: data.location ?? '',
          is_public: data.is_public ?? false,
        })
      }

      setLoading(false)
    }

    void loadProfile()
  }, [supabase])

  function updateField(
    field: 'display_name' | 'headline' | 'bio' | 'skills' | 'location',
    value: string
  ) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!userId || saving) return

    setSaving(true)
    setMessage('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || authData.user?.id !== userId) {
      setMessage('Your session has changed. Please sign in again.')
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills,
        location: profile.location,
        is_public: profile.is_public,
      })
      .eq('id', userId)
      .select('id')
      .single()

    if (error || !data) {
      setMessage(
        `Unable to save profile: ${
          error?.message ?? 'Profile update was not confirmed.'
        }`
      )
    } else {
      setMessage('Profile saved successfully!')
    }

    setSaving(false)
  }

  if (loading) {
    return <p className="muted">Loading your profile...</p>
  }

  if (!userId) {
    return <p className="muted">{message}</p>
  }

  return (
    <section className="glass" style={{ padding: 24, marginTop: 28 }}>
      <div className="eyebrow">MY PROFESSIONAL PROFILE</div>
      <h2>Edit Your Profile</h2>

      <p className="muted">
        Tell the BIZLINK community about your professional interests.
      </p>

      <form onSubmit={saveProfile}>
        <div style={{ display: 'grid', gap: 16 }}>
          <label>
            Display Name
            <input
              type="text"
              value={profile.display_name ?? ''}
              maxLength={80}
              onChange={(event) =>
                updateField('display_name', event.target.value)
              }
              style={{ width: '100%', padding: 12, marginTop: 8 }}
            />
          </label>

          <label>
            Professional Headline
            <input
              type="text"
              value={profile.headline ?? ''}
              maxLength={120}
              placeholder="e.g. Web Developer & Entrepreneur"
              onChange={(event) =>
                updateField('headline', event.target.value)
              }
              style={{ width: '100%', padding: 12, marginTop: 8 }}
            />
          </label>

          <label>
            Biography
            <textarea
              value={profile.bio ?? ''}
              maxLength={1000}
              rows={4}
              placeholder="Tell us about yourself..."
              onChange={(event) =>
                updateField('bio', event.target.value)
              }
              style={{ width: '100%', padding: 12, marginTop: 8 }}
            />
          </label>

          <label>
            Skills
            <input
              type="text"
              value={profile.skills ?? ''}
              maxLength={300}
              placeholder="e.g. Marketing, Coding, Design"
              onChange={(event) =>
                updateField('skills', event.target.value)
              }
              style={{ width: '100%', padding: 12, marginTop: 8 }}
            />
          </label>

          <label>
            Location
            <input
              type="text"
              value={profile.location ?? ''}
              maxLength={120}
              placeholder="e.g. Gaborone, Botswana"
              onChange={(event) =>
                updateField('location', event.target.value)
              }
              style={{ width: '100%', padding: 12, marginTop: 8 }}
            />
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            <input
              type="checkbox"
              checked={profile.is_public}
              onChange={(event) =>
                setProfile((previous) => ({
                  ...previous,
                  is_public: event.target.checked,
                }))
              }
            />
            Show my professional profile in Discover Professionals
          </label>

          <p className="muted" style={{ margin: 0 }}>
            Your profile is private by default. Enable this option
            if you want other BIZLINK members to discover your
            professional profile once the directory is available.
          </p>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={saving}
          style={{ marginTop: 20 }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>

        {message && (
          <p className="notice" role="status" style={{ marginTop: 16 }}>
            {message}
          </p>
        )}
      </form>
    </section>
  )
}
