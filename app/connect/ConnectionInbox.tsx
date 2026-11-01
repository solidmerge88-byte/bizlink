
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ConnectionRequest = {
  id: string
  requester_id: string
  status: string
  created_at: string
}

type Member = {
  id: string
  display_name: string | null
  headline: string | null
}

export default function ConnectionInbox() {
  const [supabase] = useState(() => createClient())
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadRequests() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        setError('Please sign in to view connection requests.')
        setLoading(false)
        return
      }

      const userId = authData.user.id

      const [requestsResult, membersResult] = await Promise.all([
        supabase
          .from('connections')
          .select('id, requester_id, status, created_at')
          .eq('receiver_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),

        supabase.rpc('get_discoverable_profiles'),
      ])

      if (requestsResult.error) {
        setError(requestsResult.error.message)
      } else {
        setRequests(
          (requestsResult.data ?? []) as ConnectionRequest[]
        )
      }

      if (membersResult.error) {
        setError((previous) =>
          previous || membersResult.error.message
        )
      } else {
        setMembers((membersResult.data ?? []) as Member[])
      }

      setLoading(false)
    }

    void loadRequests()
  }, [supabase])

  async function respond(
    requestId: string,
    decision: 'accepted' | 'declined'
  ) {
    if (busyId) return

    setBusyId(requestId)
    setMessage('')
    setError('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      setError('Please sign in again.')
      setBusyId(null)
      return
    }

    const { data, error } = await supabase
      .from('connections')
      .update({ status: decision })
      .eq('id', requestId)
      .eq('receiver_id', authData.user.id)
      .eq('status', 'pending')
      .select('id')
      .single()

    if (error || !data) {
      setError(
        error?.message ?? 'Unable to update connection request.'
      )
    } else {
      setRequests((previous) =>
        previous.filter((request) => request.id !== requestId)
      )
      setMessage(
        decision === 'accepted'
          ? 'Connection request accepted!'
          : 'Connection request declined.'
      )
    }

    setBusyId(null)
  }

  return (
    <section
      className="glass"
      style={{ padding: 24, marginTop: 32 }}
    >
      <div className="eyebrow">BIZLINK NETWORK</div>
      <h2>Connection Requests</h2>

      <p className="muted">
        Review requests from members who want to connect with you.
      </p>

      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <p className="muted">Loading connection requests...</p>
      )}

      {!loading && !error && requests.length === 0 && (
        <p className="muted">
          You have no pending connection requests.
        </p>
      )}

      {!loading && !error && requests.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {requests.map((request) => {
            const member = members.find(
              (person) => person.id === request.requester_id
            )

            return (
              <div className="card" key={request.id}>
                <div className="eyebrow">
                  NEW CONNECTION REQUEST
                </div>

                <h3>
                  {member?.display_name || 'BIZLINK Member'}
                </h3>

                <p className="muted">
                  {member?.headline ||
                    'This member wants to connect with you.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    disabled={busyId !== null}
                    onClick={() =>
                      respond(request.id, 'accepted')
                    }
                  >
                    {busyId === request.id
                      ? 'Processing...'
                      : '✓ Accept'}
                  </button>

                  <button
                    type="button"
                    className="btn alt"
                    disabled={busyId !== null}
                    onClick={() =>
                      respond(request.id, 'declined')
                    }
                  >
                    Decline
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
