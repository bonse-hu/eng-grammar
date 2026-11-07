
import { useEffect, useMemo, useState } from 'react'
import examples1 from './data/data1.json'
import examples2 from './data/data2.json'
import examples3 from './data/data3.json'
import examples4 from './data/data4.json'

type Example = {
  大分類: string
  中分類: string
  小分類: string
  英文: string
  和訳: string
}

// 4つのJSONファイルを1つのデータとして統合
const data = [
  ...(examples1 as Example[]),
  ...(examples2 as Example[]),
  ...(examples3 as Example[]),
  ...(examples4 as Example[]),
]

// 分類を識別するためのキー
const keyOf = (
  item: Pick<Example, '大分類' | '中分類' | '小分類'>
) =>
  JSON.stringify([
    item.大分類,
    item.中分類,
    item.小分類,
  ])

function App() {
  // 小分類の一覧を作成
  const leafPaths = useMemo(() => {
    const unique = new Map<
      string,
      Pick<Example, '大分類' | '中分類' | '小分類'>
    >()

    data.forEach((item) =>
      unique.set(keyOf(item), {
        大分類: item.大分類,
        中分類: item.中分類,
        小分類: item.小分類,
      })
    )

    return [...unique.values()]
  }, [])

  // 選択中の小分類
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>(
    () => leafPaths.map(keyOf)
  )

  // 現在の問題
  const [current, setCurrent] = useState<Example | null>(
    () => data[Math.floor(Math.random() * data.length)] ?? null
  )

  // 和訳の表示状態
  const [revealed, setRevealed] = useState(false)

  // 過去に出題した問題
  const [history, setHistory] = useState<Example[]>([])

  // 大分類・中分類・小分類の階層構造を作成
  const tree = useMemo(() => {
    const result = new Map<string, Map<string, string[]>>()

    leafPaths.forEach((item) => {
      if (!result.has(item.大分類)) {
        result.set(item.大分類, new Map())
      }

      const mids = result.get(item.大分類)!

      if (!mids.has(item.中分類)) {
        mids.set(item.中分類, [])
      }

      const subs = mids.get(item.中分類)!

      if (!subs.includes(item.小分類)) {
        subs.push(item.小分類)
      }
    })

    return result
  }, [leafPaths])

  // 選択された分類に該当する問題
  const filtered = useMemo(
    () =>
      data.filter((item) =>
        selectedLeaves.includes(keyOf(item))
      ),
    [selectedLeaves]
  )

  // 出題範囲が変更された場合の処理
  useEffect(() => {
    if (
      filtered.length > 0 &&
      (!current || !filtered.includes(current))
    ) {
      setCurrent(
        filtered[Math.floor(Math.random() * filtered.length)]
      )
      setRevealed(false)
      setHistory([])
    }
  }, [filtered, current])

  // 大分類・中分類のチェック操作
  function setGroup(
    major: string,
    middle?: string,
    checked = true
  ) {
    const keys = leafPaths
      .filter(
        (item) =>
          item.大分類 === major &&
          (middle === undefined || item.中分類 === middle)
      )
      .map(keyOf)

    setSelectedLeaves((old) =>
      checked
        ? [...new Set([...old, ...keys])]
        : old.filter((key) => !keys.includes(key))
    )
  }

  // 小分類のチェック操作
  function setLeaf(
    major: string,
    middle: string,
    small: string,
    checked: boolean
  ) {
    const key = keyOf({
      大分類: major,
      中分類: middle,
      小分類: small,
    })

    setSelectedLeaves((old) =>
      checked
        ? [...new Set([...old, key])]
        : old.filter((item) => item !== key)
    )
  }

  // 次の問題
  function nextQuestion() {
    if (filtered.length === 0) return

    const candidates = filtered.filter(
      (item) => item !== current
    )

    const pool =
      candidates.length > 0 ? candidates : filtered

    if (current) {
      setHistory((items) => [...items, current])
    }

    setCurrent(
      pool[Math.floor(Math.random() * pool.length)]
    )

    setRevealed(false)
  }

  // 前の問題
  function previousQuestion() {
    if (history.length === 0) return

    setCurrent(history[history.length - 1])

    setHistory((items) => items.slice(0, -1))

    setRevealed(false)
  }

  // 現在の問題の分類表示
  const categoryLabel = current
    ? [
        current.大分類,
        current.中分類,
        current.小分類,
      ]
        .filter(Boolean)
        .join(' ＞ ')
    : ''

  // 出題範囲が選択されていない場合
  if (!current || filtered.length === 0) {
    return (
      <main className="app">
        <header className="topbar">
          <div className="brand-mark">英</div>
          <div>
            <p className="eyebrow">ENGLISH GRAMMAR</p>
            <h1>ボンセ流英語文法トレーニング</h1>
          </div>
        </header>

        <section className="filter-card">
          <h2>出題範囲を選ぶ</h2>
          <p>
            出題したい分類にチェックを入れてください。
          </p>

          <button
            className="select-all-button"
            onClick={() =>
              setSelectedLeaves(leafPaths.map(keyOf))
            }
          >
            すべて選択
          </button>

          <CategoryTree
            tree={tree}
            selectedLeaves={selectedLeaves}
            onGroup={setGroup}
            onLeaf={setLeaf}
          />
        </section>

        <section className="study-card">
          <p className="empty-message">
            出題範囲が選択されていません。
            少なくとも1つの小分類にチェックを入れてください。
          </p>
        </section>
      </main>
    )
  }

  // 通常の画面
  return (
    <main className="app">
      <header className="topbar">
        <div className="brand-mark">英</div>
        <div>
          <p className="eyebrow">ENGLISH GRAMMAR</p>
          <h1>英語文法トレーニング</h1>
        </div>
      </header>

      {/* 出題範囲 */}
      <section className="filter-card">
        <div className="filter-heading">
          <div>
            <h2>出題範囲</h2>
            <p>チェックした分類から出題します。</p>
          </div>

          <button
            className="select-all-button"
            onClick={() =>
              setSelectedLeaves(
                selectedLeaves.length === leafPaths.length
                  ? []
                  : leafPaths.map(keyOf)
              )
            }
          >
            {selectedLeaves.length === leafPaths.length
              ? 'すべて解除'
              : 'すべて選択'}
          </button>
        </div>

        <CategoryTree
          tree={tree}
          selectedLeaves={selectedLeaves}
          onGroup={setGroup}
          onLeaf={setLeaf}
        />

        <p className="filter-count">
          選択中：{selectedLeaves.length} / {leafPaths.length} 小分類
        </p>
      </section>

      {/* 問題表示 */}
      <section className="study-card" aria-live="polite">
        <div className="card-meta">
          <span className="question-number">QUESTION</span>

          {/* 和訳を見るまでは文法分類を隠す */}
          {revealed && (
            <span className="category">
              {categoryLabel}
            </span>
          )}
        </div>

        <div className="question-area">
          <p className="prompt">
            次の英文を日本語に訳してください。
          </p>

          <p className="english">
            {current.英文}
          </p>
        </div>

        {/* 和訳 */}
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

        {/* 和訳を見るボタン */}
        <button
          className="reveal-button"
          onClick={() => setRevealed(true)}
          disabled={revealed}
        >
          {revealed
            ? '和訳を表示しています'
            : '和訳を見る'}
        </button>

        {/* 前の問題・次の問題 */}
        <div className="navigation">
          <button
            className="back-button"
            onClick={previousQuestion}
            disabled={history.length === 0}
          >
            前の問題
          </button>

          <button
            className="next-button"
            onClick={nextQuestion}
          >
            次の問題 <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      {/* 件数表示 */}
      <footer>
        <span>
          収録例文：{data.length.toLocaleString('ja-JP')}件
        </span>

        <span>
          出題対象：{filtered.length.toLocaleString('ja-JP')}件
        </span>
      </footer>
    </main>
  )
}

// 分類ツリーの型
type TreeProps = {
  tree: Map<string, Map<string, string[]>>
  selectedLeaves: string[]
  onGroup: (
    major: string,
    middle?: string,
    checked?: boolean
  ) => void
  onLeaf: (
    major: string,
    middle: string,
    small: string,
    checked: boolean
  ) => void
}

// 分類チェックボックス
function CategoryTree({
  tree,
  selectedLeaves,
  onGroup,
  onLeaf,
}: TreeProps) {
  // 大分類・中分類に属する小分類のキーを取得
  const allKeys = (major: string, middle?: string) => {
    const keys: string[] = []

    tree.get(major)?.forEach((smalls, mid) => {
      if (middle === undefined || middle === mid) {
        smalls.forEach((small) =>
          keys.push(
            keyOf({
              大分類: major,
              中分類: mid,
              小分類: small,
            })
          )
        )
      }
    })

    return keys
  }

  return (
    <div className="category-tree">
      {[...tree.entries()].map(([major, middles]) => {
        const majorKeys = allKeys(major)

        return (
          // open属性を付けないことで初期状態を折りたたむ
          <details
            className="major-group"
            key={major}
          >
            <summary>
              <label
                className="check-label"
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={
                    majorKeys.length > 0 &&
                    majorKeys.every((key) =>
                      selectedLeaves.includes(key)
                    )
                  }
                  onChange={(event) =>
                    onGroup(
                      major,
                      undefined,
                      event.target.checked
                    )
                  }
                />

                <strong>{major}</strong>
              </label>
            </summary>

            {[...middles.entries()].map(
              ([middle, smalls]) => {
                const middleKeys = allKeys(major, middle)

                return (
                  // 中分類も初期状態は折りたたむ
                  <details
                    className="middle-group"
                    key={middle}
                  >
                    <summary>
                      <label
                        className="check-label"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            middleKeys.length > 0 &&
                            middleKeys.every((key) =>
                              selectedLeaves.includes(key)
                            )
                          }
                          onChange={(event) =>
                            onGroup(
                              major,
                              middle,
                              event.target.checked
                            )
                          }
                        />

                        {middle}
                      </label>
                    </summary>

                    <div className="small-list">
                      {smalls.map((small) => {
                        const key = keyOf({
                          大分類: major,
                          中分類: middle,
                          小分類: small,
                        })

                        return (
                          <label
                            className="check-label small-label"
                            key={key}
                          >
                            <input
                              type="checkbox"
                              checked={selectedLeaves.includes(key)}
                              onChange={(event) =>
                                onLeaf(
                                  major,
                                  middle,
                                  small,
                                  event.target.checked
                                )
                              }
                            />

                            {small}
                          </label>
                        )
                      })}
                    </div>
                  </details>
                )
              }
            )}
          </details>
        )
      })}
    </div>
  )
}

export default App
