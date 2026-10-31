
'use client'

import { useState } from 'react'
import Link from 'next/link'

const lessons = [
  {
    subject: 'Biology',
    title: 'Cells and Their Functions',
    notes: 'The nucleus controls cell activities. The cell membrane controls movement of substances. Mitochondria release energy through aerobic respiration.',
    question: 'Which organelle releases energy during aerobic respiration?',
    answers: ['Nucleus', 'Mitochondrion', 'Ribosome'],
    correct: 1,
    explanation: 'Mitochondria are the main site of aerobic respiration.',
  },
  {
    subject: 'Biology',
    title: 'Osmosis',
    notes: 'Osmosis is the net movement of water molecules from higher water potential to lower water potential through a partially permeable membrane.',
    question: 'What moves during osmosis?',
    answers: ['Water molecules', 'Glucose molecules', 'Oxygen molecules'],
    correct: 0,
    explanation: 'Osmosis involves water molecules.',
  },
  {
    subject: 'Chemistry',
    title: 'Acids and Alkalis',
    notes: 'Acids have a pH below 7. Alkalis have a pH above 7. Neutral solutions have a pH of 7 at 25°C.',
    question: 'Which pH indicates an acidic solution?',
    answers: ['9', '7', '3'],
    correct: 2,
    explanation: 'A pH below 7 indicates an acidic solution.',
  },
  {
    subject: 'Mathematics',
    title: 'Solving Linear Equations',
    notes: 'Perform the same operation on both sides of an equation. Example: 2x + 4 = 10 gives x = 3.',
    question: 'Solve 3x + 2 = 11.',
    answers: ['x = 2', 'x = 3', 'x = 4'],
    correct: 1,
    explanation: 'Subtract 2, then divide by 3.',
  },
]

export default function StudyLibrary() {
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('All')
  const [selected, setSelected] = useState<number | null>(null)
  const [answer, setAnswer] = useState<number | null>(null)

  const filtered = lessons
    .map((lesson, index) => ({ ...lesson, index }))
    .filter((lesson) => {
      const matchesSubject =
        subject === 'All' || lesson.subject === subject

      const matchesSearch =
        `${lesson.title} ${lesson.subject} ${lesson.notes}`
          .toLowerCase()
          .includes(search.toLowerCase())

      return matchesSubject && matchesSearch
    })

  const active = selected === null ? null : lessons[selected]

  return (
    <div>
      <div className="eyebrow">LEARN • PRACTISE • GROW</div>

      <h2>
        BIZLINK STUDY <span className="accent">✦</span>
      </h2>

      <p className="lead">
        Explore revision notes and test your knowledge.
      </p>

      <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
        <h3>Find something to study</h3>

        <input
          type="search"
          placeholder="Search subjects or topics..."
          aria-label="Search study topics"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: 14,
            marginBottom: 16,
          }}
        />

        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          {['All', 'Biology', 'Chemistry', 'Mathematics'].map((item) => (
            <button
              key={item}
              type="button"
              className={subject === item ? 'btn' : 'btn alt'}
              onClick={() => {
                setSubject(item)
                setSelected(null)
                setAnswer(null)
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <h3>Revision Library</h3>

      <div className="dashboard-grid">
        {filtered.map((lesson) => (
          <button
            key={lesson.index}
            type="button"
            className="card"
            onClick={() => {
              setSelected(lesson.index)
              setAnswer(null)
            }}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              color: 'inherit',
              font: 'inherit',
            }}
          >
            <div className="eyebrow">{lesson.subject}</div>
            <h3>{lesson.title}</h3>
            <p className="muted">
              Read notes and answer a practice question.
            </p>
            <span className="accent">Start studying ↗</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="notice">
          No matching lessons found. Try another search.
        </div>
      )}

      {active && (
        <section
          className="glass"
          style={{ padding: 24, marginTop: 28 }}
        >
          <div className="eyebrow">{active.subject}</div>
          <h2>{active.title}</h2>

          <h3>Revision Notes</h3>
          <p className="lead">{active.notes}</p>

          <h3>Quick Quiz</h3>
          <p>{active.question}</p>

          <div style={{
            display: 'grid',
            gap: 12,
            marginTop: 16,
          }}>
            {active.answers.map((option, index) => (
              <button
                key={option}
                type="button"
                className="btn alt"
                onClick={() => setAnswer(index)}
                style={{ textAlign: 'left' }}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>

          {answer !== null && (
            <div
              className="notice"
              role="status"
              style={{ marginTop: 20 }}
            >
              <strong>
                {answer === active.correct
                  ? 'Correct! 🎉'
                  : 'Not quite. Try again!'}
              </strong>
              <p>{active.explanation}</p>
            </div>
          )}
        </section>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/dashboard" className="btn alt">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
