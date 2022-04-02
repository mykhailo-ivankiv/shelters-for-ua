import * as React from 'react'

type Filters = {
  numberOfPeople: string
  onlyPetFriendly: boolean
  onlyKidsFriendly: boolean
}
type Props = {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

const Filter: React.FC<Props> = ({ filters, onFiltersChange }) => (
  <div style={{ padding: '1em', borderBottom: '1px solid silver' }}>
    <label style={{ display: 'block' }}>
      👨‍👩‍👧 Number of people{' '}
      <input
        placeholder="Empty for all"
        style={{ width: '15ch' }}
        type="number"
        min={1}
        value={filters.numberOfPeople}
        // @ts-ignore
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            numberOfPeople: e.target.value,
          })
        }
      />{' '}
    </label>

    <label style={{ display: 'block' }}>
      <input
        type="checkbox"
        checked={filters.onlyPetFriendly}
        onChange={() =>
          onFiltersChange({
            ...filters,
            onlyPetFriendly: !filters.onlyPetFriendly,
          })
        }
      />{' '}
      <span>🐶 Pet friendly</span>
    </label>

    <label style={{ display: 'block' }}>
      <input
        type="checkbox"
        checked={filters.onlyKidsFriendly}
        onChange={() =>
          onFiltersChange({
            ...filters,
            onlyKidsFriendly: !filters.onlyKidsFriendly,
          })
        }
      />{' '}
      <span>👶 Kids friendly</span>
    </label>
  </div>
)

export default Filter
