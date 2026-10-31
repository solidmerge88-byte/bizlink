
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Question = {
  question: string
  answers: string[]
  correct: number
  explanation: string
}

type Lesson = {
  id: string
  subject: string
  title: string
  notes: string[]
  questions: Question[]
}

const lessons: Lesson[] = [
  {
    id: 'bio-cells',
    subject: 'Biology',
    title: 'Cells and Their Functions',
    notes: [
      'The nucleus contains genetic material and controls cell activities.',
      'The cell membrane controls the movement of substances into and out of the cell.',
      'Mitochondria are the main site of aerobic respiration.',
      'Ribosomes are the site of protein synthesis.',
    ],
    questions: [
      {
        question: 'Which organelle is the main site of aerobic respiration?',
        answers: ['Nucleus', 'Mitochondrion', 'Ribosome'],
        correct: 1,
        explanation: 'Mitochondria release energy through aerobic respiration.',
      },
      {
        question: 'Where are proteins synthesized?',
        answers: ['Ribosomes', 'Vacuoles', 'Cell walls'],
        correct: 0,
        explanation: 'Ribosomes are the site of protein synthesis.',
      },
      {
        question: 'What controls movement into and out of a cell?',
        answers: ['Cytoplasm', 'Cell membrane', 'Nucleus'],
        correct: 1,
        explanation: 'The cell membrane is selectively permeable.',
      },
    ],
  },
  {
    id: 'bio-osmosis',
    subject: 'Biology',
    title: 'Osmosis and Diffusion',
    notes: [
      'Diffusion is the net movement of particles down a concentration gradient.',
      'Osmosis is the net movement of water molecules from higher to lower water potential through a partially permeable membrane.',
      'Root hair cells absorb water from the soil by osmosis.',
    ],
    questions: [
      {
        question: 'What moves during osmosis?',
        answers: ['Glucose', 'Water molecules', 'Proteins'],
        correct: 1,
        explanation: 'Osmosis involves water molecules.',
      },
      {
        question: 'What type of membrane is needed for osmosis?',
        answers: ['Impermeable', 'Partially permeable', 'Metal'],
        correct: 1,
        explanation: 'A partially permeable membrane allows water to pass.',
      },
    ],
  },
  {
    id: 'bio-blood',
    subject: 'Biology',
    title: 'Blood and Transport',
    notes: [
      'Red blood cells contain haemoglobin for oxygen transport.',
      'White blood cells help defend against pathogens.',
      'Platelets help blood clot.',
      'Plasma transports dissolved substances around the body.',
    ],
    questions: [
      {
        question: 'Which substance carries oxygen in red blood cells?',
        answers: ['Insulin', 'Haemoglobin', 'Urea'],
        correct: 1,
        explanation: 'Haemoglobin binds oxygen for transport.',
      },
      {
        question: 'Which blood component helps clotting?',
        answers: ['Platelets', 'Plasma', 'Red blood cells'],
        correct: 0,
        explanation: 'Platelets participate in blood clotting.',
      },
    ],
  },
  {
    id: 'chem-acids',
    subject: 'Chemistry',
    title: 'Acids, Bases and pH',
    notes: [
      'At 25°C, acidic solutions have pH below 7.',
      'Neutral solutions have pH 7.',
      'Alkaline solutions have pH above 7.',
      'Neutralisation is the reaction between an acid and a base.',
    ],
    questions: [
      {
        question: 'Which pH indicates an acidic solution?',
        answers: ['3', '7', '10'],
        correct: 0,
        explanation: 'Acidic solutions have pH below 7.',
      },
      {
        question: 'What is the pH of neutral water at 25°C?',
        answers: ['1', '7', '14'],
        correct: 1,
        explanation: 'Neutral water has pH 7 at 25°C.',
      },
    ],
  },
  {
    id: 'chem-atoms',
    subject: 'Chemistry',
    title: 'Atomic Structure',
    notes: [
      'Atoms contain protons, neutrons and electrons.',
      'Protons have positive charge, electrons negative charge and neutrons no charge.',
      'Atomic number equals the number of protons.',
    ],
    questions: [
      {
        question: 'Which particle has a negative charge?',
        answers: ['Proton', 'Neutron', 'Electron'],
        correct: 2,
        explanation: 'Electrons have negative charge.',
      },
      {
        question: 'What does atomic number represent?',
        answers: ['Number of protons', 'Number of neutrons', 'Mass number'],
        correct: 0,
        explanation: 'Atomic number is the proton number.',
      },
    ],
  },
  {
    id: 'math-equations',
    subject: 'Mathematics',
    title: 'Linear Equations',
    notes: [
      'An equation must remain balanced on both sides.',
      'Use inverse operations to isolate the unknown.',
      'Example: 2x + 4 = 10 gives x = 3.',
    ],
    questions: [
      {
        question: 'Solve 3x + 2 = 11.',
        answers: ['x = 2', 'x = 3', 'x = 4'],
        correct: 1,
        explanation: '3x = 9, so x = 3.',
      },
      {
        question: 'Solve 5x = 20.',
        answers: ['x = 4', 'x = 5', 'x = 10'],
        correct: 0,
        explanation: 'Divide both sides by 5.',
      },
    ],
  },
  {
    id: 'physics-forces',
    subject: 'Physics',
    title: 'Forces and Motion',
    notes: [
      'A force is a push or pull.',
      'Newton’s second law states that resultant force equals mass multiplied by acceleration.',
      'The SI unit of force is the newton (N).',
    ],
    questions: [
      {
        question: 'What is the SI unit of force?',
        answers: ['Joule', 'Newton', 'Watt'],
        correct: 1,
        explanation: 'Force is measured in newtons.',
      },
      {
        question: 'A 2 kg object accelerates at 3 m/s². What is the resultant force?',
        answers: ['5 N', '6 N', '9 N'],
        correct: 1,
        explanation: 'F = ma = 2 × 3 = 6 N.',
      },
    ],
  },
]

type Progress = Record<string, number>

const storageKey = 'bizlink-study-progress-v2'

export default function StudyLibrary() {
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [progress, setProgress] = useState<Progress>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const valid: Progress = {}
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === 'number' && Number.isFinite(value)) {
              valid[key] = Math.max(0, Math.min(100, value))
            }
          }
          setProgress(valid)
        }
      }
    } catch {
      // Storage may be unavailable.
    }
    setLoaded(true)
  }, [])

  const active = lessons.find((lesson) => lesson.id === selected)
  const filtered = lessons.filter((lesson) => {
    const matchesSubject =
      subject === 'All' || lesson.subject === subject
    const matchesSearch =
      `${lesson.subject} ${lesson.title} ${lesson.notes.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase())
    return matchesSubject && matchesSearch
  })

  const completed = lessons.filter(
    (lesson) => progress[lesson.id] !== undefined
  ).length

  const currentQuestion = active?.questions[questionIndex]
  const currentAnswer = answers[questionIndex]

  function openLesson(id: string) {
    setSelected(id)
    setQuestionIndex(0)
    setAnswers({})
  }

  function selectAnswer(index: number) {
    if (!active || currentAnswer !== undefined) return
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: index,
    }))
  }

  function finishQuiz() {
    if (!active) return

    const correct = active.questions.filter(
      (question, index) => answers[index] === question.correct
    ).length

    const score = Math.round(
      (correct / active.questions.length) * 100
    )

    const updated = {
      ...progress,
      [active.id]: Math.max(progress[active.id] ?? 0, score),
    }

    setProgress(updated)

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // Progress remains available during this session.
    }

    setSelected(null)
    setAnswers({})
    setQuestionIndex(0)
  }

  return (
    <div>
      <div className="eyebrow">LEARN • PRACTISE • GROW</div>
      <h2>
        BIZLINK STUDY <span className="accent">✦</span>
      </h2>
      <p className="lead">
        Explore lessons, complete quizzes and track your progress.
      </p>

      <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
        <h3>Your Learning Progress</h3>
        <p className="lead">
          {loaded ? completed : '—'} / {lessons.length} lessons completed
        </p>
        <div
          style={{
            height: 12,
            borderRadius: 12,
            background: 'rgba(150,150,150,0.25)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(completed / lessons.length) * 100}%`,
              height: '100%',
              background: '#a3e635',
            }}
          />
        </div>
        <p className="muted">
          Your best quiz score is saved on this browser.
        </p>
      </div>

      <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
        <h3>Find a lesson</h3>
        <input
          type="search"
          aria-label="Search lessons"
          placeholder="Search subjects or topics..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ width: '100%', padding: 14, marginBottom: 16 }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['All', 'Biology', 'Chemistry', 'Mathematics', 'Physics'].map(
            (item) => (
              <button
                type="button"
                key={item}
                className={subject === item ? 'btn' : 'btn alt'}
                onClick={() => {
                  setSubject(item)
                  setSelected(null)
                }}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      <h3>Revision Library</h3>

      <div className="dashboard-grid">
        {filtered.map((lesson) => (
          <button
            type="button"
            key={lesson.id}
            className="card"
            onClick={() => openLesson(lesson.id)}
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
              {lesson.questions.length} practice questions
            </p>
            <span className="accent">
              {progress[lesson.id] !== undefined
                ? `Best score: ${progress[lesson.id]}%`
                : 'Start studying ↗'}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="notice">No matching lessons found.</div>
      )}

      {active && currentQuestion && (
        <section className="glass" style={{ padding: 24, marginTop: 28 }}>
          <div className="eyebrow">{active.subject}</div>
          <h2>{active.title}</h2>

          <h3>Revision Notes</h3>
          {active.notes.map((note) => (
            <p key={note} className="muted">{note}</p>
          ))}

          <h3>
            Question {questionIndex + 1} of {active.questions.length}
          </h3>
          <p className="lead">{currentQuestion.question}</p>

          <div style={{ display: 'grid', gap: 10 }}>
            {currentQuestion.answers.map((option, index) => (
              <button
                key={index}
                type="button"
                className="btn alt"
                disabled={currentAnswer !== undefined}
                onClick={() => selectAnswer(index)}
                style={{ textAlign: 'left' }}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>

          {currentAnswer !== undefined && (
            <div className="notice" role="status" style={{ marginTop: 16 }}>
              <strong>
                {currentAnswer === currentQuestion.correct
                  ? 'Correct! 🎉'
                  : 'Incorrect'}
              </strong>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {currentAnswer !== undefined && (
            <button
              type="button"
              className="btn"
              style={{ marginTop: 18 }}
              onClick={() => {
                if (questionIndex < active.questions.length - 1) {
                  setQuestionIndex(questionIndex + 1)
                } else {
                  finishQuiz()
                }
              }}
            >
              {questionIndex < active.questions.length - 1
                ? 'Next question →'
                : 'Finish quiz and save score ✓'}
            </button>
          )}

          <button
            type="button"
            className="btn alt"
            style={{ marginTop: 18, marginLeft: 8 }}
            onClick={() => setSelected(null)}
          >
            Close lesson
          </button>
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
