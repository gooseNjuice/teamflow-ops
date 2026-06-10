import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState, ErrorState, LoadingState } from '.'

describe('API state components', () => {
  it('renders a custom loading state', () => {
    render(
      <LoadingState
        title="Loading projects"
        description="Fetching the latest project portfolio."
      />,
    )

    expect(screen.getByText('Loading projects')).toBeTruthy()
    expect(screen.getByText('Fetching the latest project portfolio.')).toBeTruthy()
  })

  it('renders empty state content with an optional action', () => {
    render(
      <EmptyState
        title="No tasks found"
        description="Try changing the filters."
        action={<button type="button">Clear filters</button>}
      />,
    )

    expect(screen.getByText('No tasks found')).toBeTruthy()
    expect(screen.getByText('Try changing the filters.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeTruthy()
  })

  it('renders unauthorized and forbidden error defaults', () => {
    const { rerender } = render(<ErrorState error={{ status: 401 }} />)

    expect(screen.getByText('Session expired')).toBeTruthy()
    expect(screen.getByText('Please sign in again to continue.')).toBeTruthy()

    rerender(<ErrorState error={{ status: 403 }} />)

    expect(screen.getByText('Permission needed')).toBeTruthy()
    expect(
      screen.getByText(
        'You do not have permission to access this data or perform this action.',
      ),
    ).toBeTruthy()
  })
})
