import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  MessageCircle,
  Search,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Menu,
  X,
} from 'lucide-react'
import { Logo } from '../../components/common/Logo'

export const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="topbar">
        <Logo />
        <nav className="toplinks">
          <a href="#how">How it works</a>
          <a href="#subjects">Subjects</a>
          <a href="#parents">For parents</a>
        </nav>
        <div className="top-actions">
          <Link className="login-link" to="/login">
            Log in
          </Link>
          <Link className="button button-primary" to="/login">
            Find a class <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="#subjects" onClick={() => setMobileMenuOpen(false)}>Subjects</a>
          <a href="#parents" onClick={() => setMobileMenuOpen(false)}>For parents</a>
          <div className="mobile-drawer-footer">
            <Link className="button subtle-button" to="/login" onClick={() => setMobileMenuOpen(false)}>
              Log in
            </Link>
            <Link className="button button-primary" to="/login" onClick={() => setMobileMenuOpen(false)}>
              Find a class <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <main className="home">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> PERSONAL LEARNING, REAL PROGRESS
            </div>
            <h1>
              Help them learn.
              <br />
              <span>Watch them grow.</span>
            </h1>
            <p className="hero-text">
              One-to-one online tutoring that meets your child where they are — with trusted teachers, clear goals and progress you can actually see.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary button-lg" to="/login">
                Find the right class <ArrowRight size={17} />
              </Link>
              <a className="text-link" href="#how">
                <span className="play">▶</span> See how Beetorial works
              </a>
            </div>
            <div className="trust-row">
              <div className="avatar-stack">
                <i>A</i>
                <i>R</i>
                <i>M</i>
                <i>+</i>
              </div>
              <div>
                <b>A little more clarity. A lot more confidence.</b>
                <small>Designed for learners and the people who support them.</small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow" />
            <div className="lesson-card glass">
              <div className="lesson-head">
                <span className="live-dot" /> YOUR LEARNING SNAPSHOT <span className="more">•••</span>
              </div>
              <div className="student-row">
                <div className="student-avatar">L</div>
                <div>
                  <b>Learner progress</b>
                  <small>Grade 8 · Mathematics</small>
                </div>
                <span className="trend">
                  <TrendingUp size={14} /> +12%
                </span>
              </div>
              <div className="progress-label">
                <span>Concept confidence</span>
                <b>78%</b>
              </div>
              <div className="progress">
                <span style={{ width: '78%' }} />
              </div>
              <div className="mini-grid">
                <div>
                  <span className="mini-icon blue">
                    <BookOpen size={17} />
                  </span>
                  <b>8</b>
                  <small>Lessons completed</small>
                </div>
                <div>
                  <span className="mini-icon lime">
                    <CircleCheck size={17} />
                  </span>
                  <b>4/5</b>
                  <small>Weekly goals</small>
                </div>
              </div>
              <div className="next-lesson">
                <div className="calendar-tile">
                  <span>OCT</span>
                  <b>14</b>
                </div>
                <div>
                  <b>Next lesson</b>
                  <small>Fractions & ratios · 5:00 PM</small>
                </div>
                <span className="next-arrow">
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
            <div className="floating-note note-one">
              <span className="note-icon">
                <Check size={15} />
              </span>
              <div>
                <b>Goal completed!</b>
                <small>Fractions practice</small>
              </div>
            </div>
            <div className="floating-note note-two">
              <span className="note-icon lime-note">
                <Check size={15} />
              </span>
              <div>
                <b>Small steps add up</b>
                <small>Weekly progress updated</small>
              </div>
            </div>
            <div className="orb orb-a" />
            <div className="orb orb-b" />
          </div>
        </section>

        <section className="trust-strip">
          <div>
            <ShieldCheck />
            <span>
              <b>Parent visibility</b>
              <small>Progress, not guesswork</small>
            </span>
          </div>
          <div>
            <UserRound />
            <span>
              <b>Teacher-led learning</b>
              <small>Human support, every step</small>
            </span>
          </div>
          <div>
            <CalendarDays />
            <span>
              <b>Flexible scheduling</b>
              <small>Fits around your family</small>
            </span>
          </div>
          <div>
            <MessageCircle />
            <span>
              <b>Clear communication</b>
              <small>Stay in the loop</small>
            </span>
          </div>
        </section>

        <section className="section" id="how">
          <div className="section-heading">
            <span className="eyebrow">A CLEARER WAY TO LEARN</span>
            <h2>Good learning is a team effort.</h2>
            <p>One place for the student, the teacher and the parent to stay connected.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon violet">
                <Search />
              </span>
              <h3>Find the right fit</h3>
              <p>Choose a subject and learning plan that matches your child's goals.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon green">
                <BookOpen />
              </span>
              <h3>Learn with a plan</h3>
              <p>Focused lessons, useful practice and a clear next step after each session.</p>
            </article>
            <article className="feature-card" id="parents">
              <span className="feature-icon blue">
                <TrendingUp />
              </span>
              <h3>See the progress</h3>
              <p>Understand attendance, completed work and the skills your child is building.</p>
            </article>
          </div>
        </section>

        <section className="subject-section" id="subjects">
          <div>
            <span className="eyebrow">BUILT AROUND THEIR GOALS</span>
            <h2>
              Support for the subjects
              <br />
              that matter.
            </h2>
            <p>Start with one learning goal. Build confidence from there.</p>
          </div>
          <div className="subject-chips">
            {['Mathematics', 'Science', 'English', 'Coding', 'Exam preparation', 'Homework support'].map((s) => (
              <span key={s}>
                <BookOpen size={15} />
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="bottom-cta">
          <div>
            <span className="eyebrow">LET'S MAKE THE NEXT STEP CLEAR</span>
            <h2>Every learner deserves to feel capable.</h2>
            <p>Tell us what your child needs help with. We'll help you explore the right next step.</p>
          </div>
          <Link className="button button-primary button-lg" to="/login">
            Explore learning <ArrowRight size={16} />
          </Link>
        </section>

        <footer>
          <Logo hideSmall />
          <span>Thoughtful learning. Visible progress.</span>
          <small>© {new Date().getFullYear()} Beetorial. Learn with confidence.</small>
        </footer>
      </main>
    </>
  )
}
