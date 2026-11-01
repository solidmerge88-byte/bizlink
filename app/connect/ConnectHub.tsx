
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProfileEditor from './ProfileEditor'
import ProfessionalDirectory from './ProfessionalDirectory'

const opportunities = [
  {
    id: 1,
    title: 'Looking for a Web Developer',
    category: 'Collaboration',
    organization: 'Sample Startup',
    location: 'Remote',
    description:
      'A sample startup is looking for someone interested in collaborating on a website.',
  },
  {
    id: 2,
    title: 'Junior Graphic Designer',
    category: 'Jobs',
    organization: 'Example Creative Studio',
    location: 'Remote',
    description:
      'Example opportunity for a junior designer interested in branding and social media graphics.',
  },
  {
    id: 3,
    title: 'Business Partnership Opportunity',
    category: 'Partnerships',
    organization: 'Demo Business Network',
    location: 'Gaborone',
    description:
      'Sample partnership opportunity for entrepreneurs interested in growing small businesses.',
  },
  {
    id: 4,
    title: 'Study Group Organizer',
    category: 'Collaboration',
    organization: 'Example Learning Community',
    location: 'Online',
    description:
      'Example collaboration to organize learning sessions and educational resources.',
  },
]

const storageKey = 'bizlink-connect-saved-v1'

export default function ConnectHub() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [saved, setSaved] = useState<number[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)

      if (stored) {
        const parsed: unknown = JSON.parse(stored)

        if (Array.isArray(parsed)) {
          setSaved(
            parsed.filter(
              (value): value is number =>
                typeof value === 'number' &&
                opportunities.some((item) => item.id === value)
            )
          )
        }
      }
    } catch {
      // Browser storage may be unavailable.
    }
  }, [])

  function toggleSaved(id: number) {
    const updated = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id]

    setSaved(updated)

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // Saved items remain available during this session.
    }
  }

  const filtered = opportunities.filter((item) => {
    const matchesCategory =
      category === 'All' || item.category === category

    const matchesSearch =
      `${item.title} ${item.organization} ${item.location} ${item.description}`
        .toLowerCase()
        .includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div>
      <div className="eyebrow">
        DISCOVER • CONNECT • GROW
      </div>

      <h2>
        BIZLINK CONNECT <span className="accent">✦</span>
      </h2>

      <p className="lead">
        Explore opportunities, discover professionals and
        build meaningful connections.
      </p>

      <div
        className="glass"
        style={{ padding: 20, marginBottom: 24 }}
      >
        <h3>Explore Opportunities</h3>

        <input
          type="search"
          aria-label="Search opportunities"
          placeholder="Search opportunities..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            width: '100%',
            padding: 14,
            marginBottom: 16,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {['All', 'Jobs', 'Collaboration', 'Partnerships'].map(
            (item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item ? 'btn' : 'btn alt'
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      <h3>Opportunity Board</h3>

      <p className="muted">
        Demo listings for testing BIZLINK CONNECT.
        These are not verified real opportunities.
      </p>

      <div className="dashboard-grid">
        {filtered.map((item) => (
          <div className="card" key={item.id}>
            <div className="eyebrow">
              {item.category}
            </div>

            <h3>{item.title}</h3>

            <p className="muted">
              {item.organization} • {item.location}
            </p>

            <p>{item.description}</p>

            <button
              type="button"
              className={
                saved.includes(item.id)
                  ? 'btn'
                  : 'btn alt'
              }
              onClick={() => toggleSaved(item.id)}
            >
              {saved.includes(item.id)
                ? '✓ Saved'
                : '☆ Save opportunity'}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="notice">
          No matching opportunities found.
        </div>
      )}

      <ProfessionalDirectory />

      <ProfileEditor />

      <div style={{ marginTop: 28 }}>
        <Link
          href="/dashboard"
          className="btn alt"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
