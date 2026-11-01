
import AppShell from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  GraduationCap,
  BriefcaseBusiness,
  Video,
  Radio,
  ArrowRight,
} from 'lucide-react'

const modules = [
  {
    title: 'BIZLINK STUDY',
    desc: 'Explore learning resources and build your knowledge.',
    href: '/study',
    icon: GraduationCap,
    status: 'Explore Learning',
  },
  {
    title: 'BIZLINK CONNECT',
    desc: 'Discover opportunities and grow your network.',
    href: '/connect',
    icon: BriefcaseBusiness,
    status: 'Grow Your Network',
  },
  {
    title: 'BIZLINK MEETUPS',
    desc: 'Create business meetups, schedule meetings, and discover upcoming events.',
    href: '/meetups',
    icon: Video,
    status: 'Create or Explore Meetups',
  },
  {
    title: 'BIZLINK LIVE',
    desc: 'A space for creators and talent to shine.',
    href: '/live',
    icon: Radio,
    status: 'Explore Live',
  },
]

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name,roles,onboarding_complete')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarding_complete) {
    redirect('/onboarding')
  }

  return (
    <AppShell>
      <div className="eyebrow">
        WELCOME TO YOUR UNIVERSE
      </div>

      <h2>
        Welcome back, {profile?.display_name || 'Explorer'}
        <span className="accent"> ✦</span>
      </h2>

      <p className="lead">
        Learn. Connect. Collaborate. Create.
        Your journey starts here.
      </p>

      {!profile && (
        <div className="notice">
          Your profile could not be loaded.
          Please check your account setup.
        </div>
      )}

      <div className="dashboard-grid">
        {modules.map(({ title, desc, href, icon: Icon, status }) => (
          <Link
            href={href}
            className="card"
            key={title}
            style={
              href === '/meetups'
                ? {
                    border: '1px solid #a78bfa',
                    boxShadow: '0 0 22px rgba(167,139,250,0.12)',
                  }
                : undefined
            }
          >
            <span className="iconbox">
              <Icon />
            </span>

            <h3>{title}</h3>

            {href === '/meetups' && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: 'rgba(167,139,250,0.15)',
                  color: '#a78bfa',
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                NEW FEATURE
              </span>
            )}

            <p className="muted">{desc}</p>

            <span className="accent">
              {status} <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="eyebrow">YOUR NEXT CHAPTER</div>
        <h3>Make your mark on BIZLINK</h3>

        <p className="muted">
          We're building a platform where ideas,
          opportunities, education, and creativity meet.
        </p>

        <Link className="btn" href="/profile">
          View your profile ↗
        </Link>
      </div>
    </AppShell>
  )
}
