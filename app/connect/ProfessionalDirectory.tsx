
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

type Connection = {
  id: string
  requester_id: string
  receiver_id: string
  status: string
}

export default function ProfessionalDirectory() {
  const [supabase] = useState(() => createClient())
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadDirectory() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        setError('Please sign in to discover professionals.')
        setLoading(false)
        return
      }

      const id = authData.user.id
      setUserId(id)

      const [profilesResult, connectionsResult] = await Promise.all([
        supabase.rpc('get_discoverable_profiles'),
        supabase
          .from('connections')
          .select('id, requester_id, receiver_id, status'),
      ])

      if (profilesResult.error) {
        setError(profilesResult.error.message)
      } else {
        setProfessionals(
          (profilesResult.data ?? []) as Professional[]
        )
      }

      if (connectionsResult.error) {
        setError(
          (previous) =>
            previous ||
            `Unable to load connections: ${connectionsResult.error?.message}`
        )
      } else {
        setConnections(
          (connectionsResult.data ?? []) as Connection[]
        )
      }

      setLoading(false)
    }

    void loadDirectory()
  }, [supabase])

  async function sendConnection(receiverId: string) {
    if (!userId || sendingId) return

    if (receiverId === userId) {
      setMessage('You cannot connect with yourself.')
      return
    }

    setSendingId(receiverId)
    setMessage('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || authData.user?.id !== userId) {
      setMessage('Please sign in again.')
      setSendingId(null)
      return
    }

    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id: userId,
        receiver_id: receiverId,
        status: 'pending',
      })
      .select('id, requester_id, receiver_id, status')
      .single()

    if (error) {
      setMessage(`Unable to send request: ${error.message}`)
    } else if (data) {
      setConnections((previous) => [...previous, data as Connection])
      setMessage('Connection request sent successfully!')
    }

    setSendingId(null)
  }

  function getConnection(personId: string) {
    return connections.find(
      (connection) =>
        (connection.requester_id === userId &&
          connection.receiver_id === personId) ||
        (connection.receiver_id === userId &&
          connection.requester_id === personId)
    )
  }

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
        Discover BIZLINK members who have chosen to make
        their professional profiles visible.
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

      {message && (
        <div
          className="notice"
          role="status"
          style={{ marginBottom: 20 }}
        >
          {message}
        </div>
      )}

      {loading && (
        <p className="muted">Loading professionals...</p>
      )}

      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="notice">
          No matching public professional profiles found yet.
        </div>
      )}

      {!loading && !error && (
        <div className="dashboard-grid">
          {filtered.map((person) => {
            const connection = getConnection(person.id)
            const isOwnProfile = person.id === userId

            return (
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

                <div style={{ marginTop: 20 }}>
                  {isOwnProfile ? (
                    <span className="muted">
                      ✓ Your Profile
                    </span>
                  ) : connection ? (
                    <span className="muted">
                      {connection.status === 'accepted'
                        ? '✓ Connected'
                        : connection.status === 'pending'
                          ? connection.requester_id === userId
                            ? '⏳ Request Sent'
                            : '📩 Request Received'
                          : 'Request Declined'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      disabled={sendingId !== null}
                      onClick={() => sendConnection(person.id)}
                    >
                      {sendingId === person.id
                        ? 'Sending...'
                        : '+ Connect'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
