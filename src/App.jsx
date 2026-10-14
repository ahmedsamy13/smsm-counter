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
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#111110] px-[7.2vw] text-[#f4f0e9] selection:bg-[#ff684f] selection:text-white max-sm:px-[22px]">
      <header className="z-10 flex min-h-[91px] items-center justify-between border-b border-white/10 max-sm:min-h-[70px]">
        <a className="text-[25px] font-extrabold tracking-[-1.7px] text-[#f4f0e9] no-underline" href="#home" aria-label="smsm home">smsm</a>
        <span className="flex items-center gap-[9px] font-mono text-[10px] text-[#97938b] max-sm:text-[8px]"><i className="size-[7px] rounded-full bg-[#ff684f]" /> A little good goes a long way</span>
      </header>

      <section className="relative flex flex-1 flex-col items-center justify-center py-[66px] text-center max-sm:py-[53px]" id="home" aria-labelledby="headline">
        <div className="flex items-center gap-[13px] font-mono text-[9px] tracking-[1.35px] text-[#99958d]"><span>THE INTERNET'S TINIEST GOOD DEED</span><span className="h-px w-[30px] bg-[#ff684f]" /></div>
        <h1 className="mt-[25px] mb-[14px] text-[clamp(56px,8vw,98px)] leading-[.98] font-semibold tracking-[-7px] max-sm:mt-[23px] max-sm:text-[clamp(57px,16vw,78px)] max-sm:tracking-[-4.5px]">Pass a little<br /><span className="font-medium text-[#ff684f] italic">good</span> along.</h1>
        <p className="mt-[9px] text-[14px] leading-[1.9] text-[#aaa69f] max-sm:text-[13px]">One tiny click. A little smsm for the world.<br className="max-sm:hidden" /> That's all there is to it.</p>

        <div className="mt-[35px] flex flex-col items-center">
          <button
            className="group relative flex size-[148px] flex-col items-center justify-center gap-[2px] rounded-full border-0 bg-[#ff684f] text-white shadow-[0_10px_0_#c94431,0_17px_32px_#ff684f2b] transition duration-200 hover:-translate-y-1 hover:-rotate-3 hover:shadow-[0_14px_0_#c94431,0_24px_36px_#ff684f32] active:translate-y-1 active:shadow-[0_5px_0_#c94431,0_9px_20px_#ff684f26] focus-visible:outline-2 focus-visible:outline-offset-[7px] focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50 max-sm:size-[139px]"
            onClick={handleClick}
            disabled={unavailable || clicking}
            aria-label="Send a little smsm"
          >
            <span className="absolute top-[21px] right-[24px] text-[19px] text-[#ffd4c9]">✳</span>
            <span className="absolute bottom-[23px] left-[21px] text-xs text-[#ffd4c9]">✳</span>
            <span className="-mt-[9px] text-[67px] leading-none" aria-hidden="true">☺</span>
            <span className="mt-[3px] font-mono text-[8px] tracking-[1.2px]">{clicking ? 'SENDING…' : 'GIVE A SMSM'}</span>
          </button>
          <p className="mt-[23px] text-xs text-[#aaa69f]" aria-live="polite">You’ve smsmed <strong className="font-extrabold text-white">{visitCount}</strong> {visitCount === 1 ? 'time' : 'times'} this visit</p>
        </div>

        <div className="mt-[38px] flex min-w-[232px] flex-col items-center rounded-[3px] border border-white/10 bg-white/[.035] px-[25px] pt-[15px] pb-[17px]" aria-live="polite">
          <span className="font-mono text-[8px] tracking-[1.15px] text-[#99958d]"><span className="text-xs text-[#ff684f]">✳</span> ALL-TIME SMSMS</span>
          <span className="mt-[6px] text-[27px] font-bold tracking-[-1px] tabular-nums">{loading ? '···' : total === null ? '—' : total.toLocaleString()}</span>
          <span className="-mt-px text-[10px] text-[#99958d]">and counting</span>
        </div>
        <p className="mt-[11px] -mb-[27px] min-h-4 text-[11px] text-[#ff927e]" role="status">{error}</p>
        <div className="absolute top-[48%] right-[-4.8vw] font-mono text-[8px] tracking-[1.2px] text-[#706c66] [writing-mode:vertical-rl] max-sm:hidden" aria-hidden="true">A SMALL THING, SHARED</div>
      </section>

      <footer className="flex min-h-[61px] items-center justify-between border-t border-white/10 font-mono text-[8px] tracking-[.7px] text-[#79756e] max-sm:gap-[14px] max-sm:text-[7px]">
        <span>MADE OF CLICKS & GOOD INTENTIONS</span>
        <span>✳ &nbsp; ONE CLICK AT A TIME</span>
      </footer>
    </main>
  )
}
