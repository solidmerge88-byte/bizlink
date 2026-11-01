
'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Meetup = {
  id: string
  host_id: string
  title: string
  description: string
  category: string
  meeting_type: 'online' | 'in_person'
  location: string | null
  starts_at: string
  ends_at: string
  max_attendees: number
  status: 'scheduled' | 'cancelled'
}

type Registration = {
  id: string
  meetup_id: string
}

type AttendeeCount = {
  meetup_id: string
  attendee_count: number
}

const categories = [
  'Networking',
  'Entrepreneurship',
  'Technology',
  'Marketing',
  'Career Development',
  'Education',
  'Creative Industry',
  'Other',
]

function localDateTime(date: Date) {
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )

  return local.toISOString().slice(0, 16)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function MeetupsHub() {
  const [supabase] = useState(() => createClient())

  const [userId, setUserId] = useState<string | null>(null)
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [attendeeCounts, setAttendeeCounts] = useState<
    Record<string, number>
  >({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyMeetupId, setBusyMeetupId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Networking')
  const [meetingType, setMeetingType] = useState<
    'online' | 'in_person'
  >('online')
  const [location, setLocation] = useState('')

  const [startsAt, setStartsAt] = useState(
    () => localDateTime(new Date(Date.now() + 86400000))
  )
  const [endsAt, setEndsAt] = useState(
    () => localDateTime(new Date(Date.now() + 90000000))
  )
  const [maxAttendees, setMaxAttendees] = useState(25)

  const loadMeetups = useCallback(async () => {
    setLoading(true)

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      setError('Please sign in to use BIZLINK MEETUPS.')
      setLoading(false)
      return
    }

    const currentUserId = authData.user.id
    setUserId(currentUserId)

    const [meetupsResult, registrationsResult, countsResult] =
      await Promise.all([
        supabase
          .from('meetups')
          .select(
            'id, host_id, title, description, category, meeting_type, location, starts_at, ends_at, max_attendees, status'
          )
          .eq('status', 'scheduled')
          .gte('ends_at', new Date().toISOString())
          .order('starts_at', { ascending: true }),

        supabase
          .from('meetup_attendees')
          .select('id, meetup_id')
          .eq('user_id', currentUserId),

        supabase.rpc('get_meetup_attendee_counts'),
      ])

    let firstError = ''

    if (meetupsResult.error) {
      firstError = meetupsResult.error.message
    } else {
      setMeetups((meetupsResult.data ?? []) as Meetup[])
    }

    if (registrationsResult.error) {
      firstError ||= registrationsResult.error.message
    } else {
      setRegistrations(
        (registrationsResult.data ?? []) as Registration[]
      )
    }

    if (countsResult.error) {
      firstError ||= countsResult.error.message
    } else {
      const counts: Record<string, number> = {}

      for (const item of
        (countsResult.data ?? []) as AttendeeCount[]) {
        counts[item.meetup_id] = Number(item.attendee_count)
      }

      setAttendeeCounts(counts)
    }

    if (firstError) {
      setError(firstError)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void loadMeetups()
  }, [loadMeetups])

  async function createMeetup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!userId || saving) return

    const start = new Date(startsAt)
    const end = new Date(endsAt)

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime())
    ) {
      setError('Please enter valid meeting dates.')
      return
    }

    if (start.getTime() <= Date.now()) {
      setError('The meeting must start in the future.')
      return
    }

    if (end.getTime() <= start.getTime()) {
      setError('The end time must be after the start time.')
      return
    }

    if (
      title.trim().length < 3 ||
      title.trim().length > 120
    ) {
      setError('Meeting titles must be 3 to 120 characters.')
      return
    }

    if (
      meetingType === 'in_person' &&
      !location.trim()
    ) {
      setError('Please enter a meeting location.')
      return
    }

    if (
      !Number.isInteger(maxAttendees) ||
      maxAttendees < 2 ||
      maxAttendees > 500
    ) {
      setError('Maximum attendees must be between 2 and 500.')
      return
    }

    setSaving(true)

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      setError('Please sign in again.')
      setSaving(false)
      return
    }

    const { error: insertError } = await supabase
      .from('meetups')
      .insert({
        host_id: authData.user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        meeting_type: meetingType,
        location:
          meetingType === 'in_person'
            ? location.trim()
            : null,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        max_attendees: maxAttendees,
        status: 'scheduled',
      })

    if (insertError) {
      setError(insertError.message)
    } else {
      setMessage('Your meetup was created successfully!')
      setTitle('')
      setDescription('')
      setLocation('')
      await loadMeetups()
    }

    setSaving(false)
  }

  async function joinMeetup(meetupId: string) {
    if (!userId || busyMeetupId) return

    setBusyMeetupId(meetupId)
    setError('')
    setMessage('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      setError('Please sign in again.')
      setBusyMeetupId(null)
      return
    }

    const { error: joinError } = await supabase
      .from('meetup_attendees')
      .insert({
        meetup_id: meetupId,
        user_id: authData.user.id,
      })

    if (joinError) {
      setError(joinError.message)
    } else {
      await loadMeetups()
      setMessage('You have successfully joined the meetup!')
    }

    setBusyMeetupId(null)
  }

  async function leaveMeetup(meetupId: string) {
    if (!userId || busyMeetupId) return

    setBusyMeetupId(meetupId)
    setError('')
    setMessage('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      setError('Please sign in again.')
      setBusyMeetupId(null)
      return
    }

    const { data, error: leaveError } = await supabase
      .from('meetup_attendees')
      .delete()
      .eq('meetup_id', meetupId)
      .eq('user_id', authData.user.id)
      .select('id')

    if (leaveError) {
      setError(leaveError.message)
    } else if (!data || data.length === 0) {
      setError('Your registration was not found.')
    } else {
      await loadMeetups()
      setMessage('You have left the meetup.')
    }

    setBusyMeetupId(null)
  }

  return (
    <div>
      <div className="eyebrow">
        CONNECT • COLLABORATE • GROW
      </div>

      <h2>
        BIZLINK MEETUPS <span className="accent">✦</span>
      </h2>

      <p className="lead">
        Host business conversations, discover upcoming
        events, and connect with ambitious people.
      </p>

      {message && (
        <div
          className="notice"
          role="status"
          style={{ marginBottom: 20 }}
        >
          ✓ {message}
        </div>
      )}

      {error && (
        <div
          className="notice"
          role="alert"
          style={{ marginBottom: 20 }}
        >
          {error}
        </div>
      )}

      <section
        className="glass"
        style={{ padding: 24, marginBottom: 32 }}
      >
        <div className="eyebrow">HOST AN EVENT</div>
        <h3>Create a Meetup</h3>

        <p className="muted">
          Schedule a meeting for the BIZLINK community.
          Live video rooms and reminders are coming later.
        </p>

        <form
          onSubmit={createMeetup}
          style={{
            display: 'grid',
            gap: 16,
            marginTop: 20,
          }}
        >
          <label>
            <strong>Meeting Title</strong>
            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Entrepreneurs Networking"
              minLength={3}
              maxLength={120}
              required
              style={{
                width: '100%',
                padding: 14,
                marginTop: 8,
              }}
            />
          </label>

          <label>
            <strong>Description</strong>
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What will members discuss?"
              rows={4}
              maxLength={3000}
              style={{
                width: '100%',
                padding: 14,
                marginTop: 8,
              }}
            />
          </label>

          <label>
            <strong>Category</strong>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              style={{
                width: '100%',
                padding: 14,
                marginTop: 8,
              }}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <strong>Meeting Type</strong>
            <select
              value={meetingType}
              onChange={(event) =>
                setMeetingType(
                  event.target.value as
                    'online' | 'in_person'
                )
              }
              style={{
                width: '100%',
                padding: 14,
                marginTop: 8,
              }}
            >
              <option value="online">
                Online
              </option>
              <option value="in_person">
                In Person
              </option>
            </select>
          </label>

          {meetingType === 'in_person' && (
            <label>
              <strong>Meeting Location</strong>
              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="e.g. Gaborone, Botswana"
                required
                style={{
                  width: '100%',
                  padding: 14,
                  marginTop: 8,
                }}
              />
            </label>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            <label>
              <strong>Start Date & Time</strong>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) =>
                  setStartsAt(event.target.value)
                }
                required
                style={{
                  width: '100%',
                  padding: 14,
                  marginTop: 8,
                }}
              />
            </label>

            <label>
              <strong>End Date & Time</strong>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(event) =>
                  setEndsAt(event.target.value)
                }
                required
                style={{
                  width: '100%',
                  padding: 14,
                  marginTop: 8,
                }}
              />
            </label>
          </div>

          <label>
            <strong>Maximum Attendees</strong>
            <input
              type="number"
              min={2}
              max={500}
              step={1}
              value={maxAttendees}
              onChange={(event) =>
                setMaxAttendees(
                  Number(event.target.value)
                )
              }
              required
              style={{
                width: '100%',
                padding: 14,
                marginTop: 8,
              }}
            />
          </label>

          <button
            type="submit"
            className="btn"
            disabled={saving || !userId}
          >
            {saving
              ? 'Creating Meetup...'
              : '+ Create Meetup'}
          </button>
        </form>
      </section>

      <section>
        <div className="eyebrow">
          BIZLINK COMMUNITY
        </div>

        <h3>Upcoming Meetups</h3>

        <p className="muted">
          Discover events and reserve your place.
        </p>

        {loading && (
          <p className="muted">
            Loading meetups...
          </p>
        )}

        {!loading && meetups.length === 0 && (
          <div className="notice">
            No upcoming meetups yet.
            Be the first to create one!
          </div>
        )}

        <div className="dashboard-grid">
          {meetups.map((meetup) => {
            const isHost = meetup.host_id === userId

            const isJoined = registrations.some(
              (registration) =>
                registration.meetup_id === meetup.id
            )

            const attendeeCount =
              attendeeCounts[meetup.id] ?? 1

            const isFull =
              attendeeCount >= meetup.max_attendees

            const registrationClosed =
              new Date(meetup.starts_at).getTime() <=
              Date.now()

            return (
              <article
                className="card"
                key={meetup.id}
              >
                <div className="eyebrow">
                  {meetup.category}
                </div>

                <h3>{meetup.title}</h3>

                <p className="muted">
                  {meetup.meeting_type === 'online'
                    ? '🌐 Online Meetup'
                    : `📍 ${meetup.location || 'In Person'}`}
                </p>

                {meetup.description && (
                  <p>{meetup.description}</p>
                )}

                <p>
                  <strong>Starts:</strong>{' '}
                  {formatDate(meetup.starts_at)}
                </p>

                <p>
                  <strong>Ends:</strong>{' '}
                  {formatDate(meetup.ends_at)}
                </p>

                <p>
                  <strong>Attendees:</strong>{' '}
                  {attendeeCount} / {meetup.max_attendees}
                </p>

                {isHost ? (
                  <div className="notice">
                    ✓ You are hosting this meetup
                  </div>
                ) : isJoined ? (
                  <div
                    style={{
                      display: 'grid',
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    <div className="notice">
                      ✓ You have joined this meetup
                    </div>

                    <button
                      type="button"
                      className="btn alt"
                      disabled={busyMeetupId !== null}
                      onClick={() =>
                        leaveMeetup(meetup.id)
                      }
                    >
                      {busyMeetupId === meetup.id
                        ? 'Processing...'
                        : 'Leave Meetup'}
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn"
                      disabled={
                        busyMeetupId !== null ||
                        isFull ||
                        registrationClosed
                      }
                      onClick={() =>
                        joinMeetup(meetup.id)
                      }
                    >
                      {busyMeetupId === meetup.id
                        ? 'Joining...'
                        : registrationClosed
                        ? 'Registration Closed'
                        : isFull
                        ? 'Meetup Full'
                        : '+ Join Meetup'}
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <div style={{ marginTop: 32 }}>
        <Link
          href="/dashboard"
          className="btn alt"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
