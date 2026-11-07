import { useMemo, useState } from 'react'
import examples from './data.json'

type Example = {
  大分類: string
  中分類: string
  小分類: string
  英文: string
  和訳: string
}

const data = examples as Example[]

function App() {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * data.length))
  const [revealed, setRevealed] = useState(false)
  const [history, setHistory] = useState<number[]>([])

  const current = data[currentIndex]
  const categoryLabel = useMemo(
    () => [current.大分類, current.中分類, current.小分類].filter(Boolean).join(' ＞ '),
    [current]
  )

  function nextQuestion() {
    if (data.length <= 1) return
    const candidates = data.map((_, i) => i).filter((i) => i !== currentIndex)
    const nextIndex = candidates[Math.floor(Math.random() * candidates.length)]
    setHistory((items) => [...items, currentIndex])
    setCurrentIndex(nextIndex)
    setRevealed(false)
  }

  function previousQuestion() {
    if (history.length === 0) return
    const previous = history[history.length - 1]
    setHistory((items) => items.slice(0, -1))
    setCurrentIndex(previous)
    setRevealed(false)
  }

  if (!current) {
    return <main className="app"><p>データがありません。src/data.json を確認してください。</p></main>
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand-mark">英</div>
        <div>
          <p className="eyebrow">ENGLISH GRAMMAR</p>
          <h1>英語文法トレーニング</h1>
        </div>
      </header>

      <section className="study-card" aria-live="polite">
        <div className="card-meta">
          <span className="question-number">QUESTION</span>
          <span className="category">{categoryLabel}</span>
        </div>

        <div className="question-area">
          <p className="prompt">次の英文を日本語に訳してください。</p>
          <p className="english">{current.英文}</p>
        </div>

        {revealed ? (
          <div className="answer" role="status">
            <span className="answer-label">和訳</span>
            <p>{current.和訳}</p>
          </div>
        ) : (
          <div className="answer-placeholder">
            頭の中で訳してから、答えを確認しましょう。
          </div>
        )}

        <button className="reveal-button" onClick={() => setRevealed(true)} disabled={revealed}>
          {revealed ? '和訳を表示しています' : '和訳を見る'}
        </button>

        <div className="navigation">
          <button className="back-button" onClick={previousQuestion} disabled={history.length === 0}>
            前の問題
          </button>
          <button className="next-button" onClick={nextQuestion}>
            次の問題 <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <footer>
        <span>収録例文：{data.length.toLocaleString('ja-JP')}件</span>
        <span>問題はランダムに出題されます</span>
      </footer>
    </main>
  )
}

export default App