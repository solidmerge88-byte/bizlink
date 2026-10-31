
'use client'

import Link from 'next/link'

export default function ConnectHub() {
  return (
    <div>
      <div className="eyebrow">DISCOVER • CONNECT • GROW</div>

      <h2>
        BIZLINK CONNECT <span className="accent">✦</span>
      </h2>

      <div className="glass" style={{ padding: 24 }}>
        <p className="lead">
          Discover collaborators, founders, opportunities
          and business communities.
        </p>

        <p className="muted">
          Your networking hub is being developed.
        </p>

        <Link href="/dashboard" className="btn alt">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
