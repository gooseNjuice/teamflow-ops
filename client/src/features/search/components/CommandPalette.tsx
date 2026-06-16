import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  emptySearchToken,
  useSearchWorkspaceQuery,
} from '../../../shared/api/searchApi'
import type { SearchResult, SearchResultType } from '../../../shared/types/search'
import SearchResultItem from './SearchResultItem'
import styles from './CommandPalette.module.css'

type CommandPaletteProps = {
  isOpen: boolean
  onClose: () => void
}

const resultGroupLabels: Record<SearchResultType, string> = {
  task: 'Tasks',
  project: 'Projects',
  user: 'Users',
}

const resultGroupOrder: SearchResultType[] = ['task', 'project', 'user']

function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const normalizedQuery = query.trim()
  const shouldSearch = normalizedQuery.length >= 2
  const {
    data: results = [],
    error,
    isError,
    isFetching,
  } = useSearchWorkspaceQuery(shouldSearch ? normalizedQuery : emptySearchToken)
  const groupedResults = useMemo(
    () =>
      resultGroupOrder
        .map((type) => ({
          type,
          results: results.filter((result) => result.type === type),
        }))
        .filter((group) => group.results.length > 0),
    [results],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setQuery('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function handleSelectResult(result: SearchResult) {
    if (result.type === 'project') {
      navigate(`/projects/${result.targetId}`)
    } else if (result.type === 'user') {
      navigate('/team')
    } else {
      // TODO: Open the matched task details once the Tasks page supports deep links.
      navigate('/tasks')
    }

    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="command-palette-title"
        aria-modal="true"
        className={styles.palette}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Search</p>
            <h2 id="command-palette-title">Command palette</h2>
          </div>
          <button className={styles.closeButton} type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <label className={styles.searchField} htmlFor="command-palette-search">
          Search workspace
          <input
            ref={inputRef}
            id="command-palette-search"
            type="search"
            placeholder="Search tasks, projects, or users"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className={styles.results} aria-live="polite">
          {!shouldSearch ? (
            <p className={styles.stateMessage}>Type at least 2 characters to search.</p>
          ) : null}

          {shouldSearch && isFetching ? (
            <p className={styles.stateMessage}>Searching workspace...</p>
          ) : null}

          {shouldSearch && isError ? (
            <p className={styles.errorMessage}>
              {error && typeof error === 'object' && 'status' in error
                ? 'Could not search workspace. Please try again.'
                : 'Search is unavailable right now.'}
            </p>
          ) : null}

          {shouldSearch && !isFetching && !isError && results.length === 0 ? (
            <p className={styles.stateMessage}>No results found.</p>
          ) : null}

          {shouldSearch && !isError && groupedResults.length > 0 ? (
            <div className={styles.resultGroups}>
              {groupedResults.map((group) => (
                <section key={group.type} className={styles.resultGroup}>
                  <h3>{resultGroupLabels[group.type]}</h3>
                  <div className={styles.resultList}>
                    {group.results.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onSelect={handleSelectResult}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default CommandPalette
