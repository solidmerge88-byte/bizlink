
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Professional = {
  id: string
  display_name: string | null
  headline: string | null
  bio: string | null
  skills: string | null
  location: string | null
}

export default function ProfessionalDirectory() {
  const [supabase] = useState(() => createClient())
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfessionals() {
      const { data, error } = await supabase.rpc(
        'get_discoverable_profiles'
      )

      if (error) {
        setError(error.message)
      } else {
        setProfessionals((data ?? []) as Professional[])
      }

      setLoading(false)
    }

    void loadProfessionals()
  }, [supabase])

  const filtered = professionals.filter((person) => {
    const searchableText = [
      person.display_name,
      person.headline,
      person.bio,
      person.skills,
      person.location,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(search.toLowerCase())
  })

  return (
    <section style={{ marginTop: 32 }}>
      <div className="eyebrow">BIZLINK NETWORK</div>

      <h2>Discover Professionals</h2>

      <p className="muted">
        Connect with BIZLINK members who have chosen
        to make their professional profiles discoverable.
      </p>

      <input
        type="search"
        aria-label="Search professionals"
        placeholder="Search by name, skills or location..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{
          width: '100%',
          padding: 14,
          marginBottom: 24,
        }}
      />

      {loading && (
        <p className="muted">Loading professionals...</p>
      )}

      {error && (
        <div className="notice" role="alert">
          Unable to load professionals: {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="notice">
          No matching public professional profiles found yet.
        </div>
      )}

      {!loading && !error && (
        <div className="dashboard-grid">
          {filtered.map((person) => (
            <div className="card" key={person.id}>
              <div className="eyebrow">
                PROFESSIONAL PROFILE
              </div>

              <h3>
                {person.display_name || 'BIZLINK Member'}
              </h3>

              <p className="lead">
                {person.headline || 'BIZLINK Professional'}
              </p>

              {person.location && (
                <p className="muted">
                  📍 {person.location}
                </p>
              )}

              {person.skills && (
                <p>
                  <strong>Skills:</strong> {person.skills}
                </p>
              )}

              {person.bio && (
                <p className="muted">{person.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
