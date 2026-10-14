import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase'

const VISIT_KEY = 'smsm-clicks-this-visit'

function readVisitCount() {
  try {
    return Number(sessionStorage.getItem(VISIT_KEY)) || 0
  } catch {
    return 0
  }
}

function saveVisitCount(count) {
  try {
    sessionStorage.setItem(VISIT_KEY, String(count))
  } catch {
    // The counter still works if browser storage is unavailable.
  }
}

export default function App() {
  const [total, setTotal] = useState(null)
  const [visitCount, setVisitCount] = useState(readVisitCount)
  const [loading, setLoading] = useState(true)
  const [clicking, setClicking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadTotal() {
      if (!supabase) {
        setError('Add your Supabase project details to .env.local to connect the counter.')
        setLoading(false)
        return
      }

      const { data, error: requestError } = await supabase.rpc('get_total_clicks')
      if (!active) return
      if (requestError) {
        setError('Could not reach the counter. Please refresh and try again.')
      } else {
        setTotal(Number(data))
      }
      setLoading(false)
    }

    loadTotal()
    return () => { active = false }
  }, [])

  async function handleClick() {
    if (!supabase || clicking) return
    setClicking(true)
    setError('')

    const { data, error: requestError } = await supabase.rpc('increment_total_clicks')
    if (requestError) {
      setError('That click did not go through. Try again?')
    } else {
      const nextVisitCount = visitCount + 1
      setTotal(Number(data))
      setVisitCount(nextVisitCount)
      saveVisitCount(nextVisitCount)
    }
    setClicking(false)
  }

  const unavailable = !isSupabaseConfigured || total === null

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="smsm home">smsm<span>®</span></a>
        <span className="top-note"><i /> A little good goes a long way</span>
      </header>

      <section className="hero" id="home" aria-labelledby="headline">
        <div className="eyebrow"><span>THE INTERNET'S TINIEST GOOD DEED</span><span className="eyebrow-line" /></div>
        <h1 id="headline">Pass a little<br /><span>good</span> along.</h1>
        <p className="intro">One tiny click. A little smsm for the world.<br className="desktop-break" /> That's all there is to it.</p>

        <div className="counter-area">
          <button
            className="smile-button"
            onClick={handleClick}
            disabled={unavailable || clicking}
            aria-label="Send a little smsm"
          >
            <span className="button-spark spark-one">✳</span>
            <span className="button-spark spark-two">✳</span>
            <span className="smile-face" aria-hidden="true">☺</span>
            <span className="button-label">{clicking ? 'SENDING…' : 'GIVE A SMSM'}</span>
          </button>
          <p className="visit-count" aria-live="polite">
            You’ve smsmed <strong>{visitCount}</strong> {visitCount === 1 ? 'time' : 'times'} this visit
          </p>
        </div>

        <div className="total-card" aria-live="polite">
          <span className="total-label"><span className="tiny-spark">✳</span> ALL-TIME SMSMS</span>
          <span className="total-number">{loading ? '···' : total === null ? '—' : total.toLocaleString()}</span>
          <span className="total-caption">and counting</span>
        </div>
        <p className="error-message" role="status">{error}</p>
      </section>

      <footer className="footer">
        <span>MADE OF CLICKS & GOOD INTENTIONS</span>
        <span>✳ &nbsp; ONE CLICK AT A TIME</span>
      </footer>
      <div className="side-note" aria-hidden="true">A SMALL THING, SHARED</div>
    </main>
  )
}
