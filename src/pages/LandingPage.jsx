import { Clock, BarChart3, CheckSquare, Award, ArrowRight, Zap, Shield, Star } from 'lucide-react'

const FEATURES = [
  {
    icon: Clock,
    title: 'Time Tracking',
    desc: 'Log your daily OJT hours with time-in, time-out, breaks, and mood tracking. Never miss a day.',
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    desc: 'Organize your internship tasks with priorities, due dates, and status tracking.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    desc: 'Visual charts, heatmaps, and weekly insights to monitor your progress over time.',
  },
  {
    icon: Award,
    title: 'Certificate Generation',
    desc: 'Auto-generate your OJT completion certificate once you hit your required hours.',
  },
]

const HIGHLIGHTS = [
  { icon: Zap, text: 'Real-time progress tracking' },
  { icon: Shield, text: 'Secure cloud backup' },
  { icon: Star, text: 'Mobile friendly' },
]

const STEPS = [
  { step: '01', title: 'Create Account', desc: 'Sign up for free in seconds with your email.' },
  { step: '02', title: 'Log Your Hours', desc: 'Track time-in, time-out, and breaks daily.' },
  { step: '03', title: 'Get Certified', desc: 'Earn your OJT completion certificate automatically.' },
]

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing">
      {/* Decorative elements */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
      <div className="landing-grid-pattern" />

      {/* Nav */}
      <header className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-logo">
            <Clock size={20} color="#d4a017" strokeWidth={2.5} />
          </div>
          <span className="landing-logo-text">OJT Tracker</span>
        </div>
        <nav className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
        </nav>
        <button className="landing-signin-btn" onClick={onGetStarted}>
          Sign In <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-badge">
          <Zap size={12} /> Internship Management System
        </div>
        <h1 className="landing-title">
          Track Your <span className="landing-gradient-text">OJT Hours</span><br />With Confidence
        </h1>
        <p className="landing-subtitle">
          The all-in-one platform for interns to log hours, manage tasks, generate reports, and earn your completion certificate — built for excellence.
        </p>
        <div className="landing-cta-group">
          <button className="landing-cta-primary" onClick={onGetStarted}>
            Get Started Free <ArrowRight size={16} />
          </button>
          <a href="#features" className="landing-cta-secondary">
            Learn More
          </a>
        </div>

        {/* Highlights */}
        <div className="landing-highlights">
          {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
            <div key={i} className="landing-highlight">
              <div className="landing-highlight-icon"><Icon size={14} /></div>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-section-badge">Features</div>
        <h2 className="landing-section-title">Everything You Need</h2>
        <p className="landing-section-sub">Powerful features designed specifically for OJT interns and supervisors.</p>
        <div className="landing-feature-grid">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="landing-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-feature-icon">
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <h3 className="landing-feature-title">{title}</h3>
              <p className="landing-feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-steps" id="how-it-works">
        <div className="landing-section-badge">How It Works</div>
        <h2 className="landing-section-title">Get Started in 3 Steps</h2>
        <p className="landing-section-sub">Simple, fast, and designed for your internship workflow.</p>
        <div className="landing-steps-grid">
          {STEPS.map(({ step, title, desc }, i) => (
            <div key={i} className="landing-step-card">
              <div className="landing-step-num">{step}</div>
              <h3 className="landing-step-title">{title}</h3>
              <p className="landing-step-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta">
        <div className="landing-final-glow" />
        <h2 className="landing-final-title">Ready to Start Tracking?</h2>
        <p className="landing-final-sub">Join now and take control of your internship journey.</p>
        <button className="landing-cta-primary" onClick={onGetStarted}>
          Create Your Account <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <Clock size={16} color="#d4a017" /> OJT Tracker
        </div>
        <span>© 2026 OJT Tracker · Built for interns, by interns</span>
      </footer>
    </div>
  )
}
