import type { SearchResult } from '../../../shared/types/search'
import styles from './CommandPalette.module.css'

const searchResultTypeLabels: Record<SearchResult['type'], string> = {
  task: 'Task',
  project: 'Project',
  user: 'User',
}

type SearchResultItemProps = {
  result: SearchResult
  onSelect: (result: SearchResult) => void
}

function SearchResultItem({ onSelect, result }: SearchResultItemProps) {
  return (
    <button
      className={styles.resultItem}
      type="button"
      onClick={() => onSelect(result)}
    >
      <span className={`${styles.typeBadge} ${styles[result.type]}`}>
        {searchResultTypeLabels[result.type]}
      </span>
      <span className={styles.resultCopy}>
        <strong>{result.title}</strong>
        <span>{result.subtitle}</span>
      </span>
    </button>
  )
}

export default SearchResultItem
