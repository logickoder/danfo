import { memo } from 'react'

import type { Target } from '@/writers/target'

interface AppButtonProps {
  target: Target
  onPick: (targetId: string) => void
  /** Set for a toggle (the picker). Left out for a plain action (download again). */
  selected?: boolean
  className: string
}

// Memoised: typing in the More apps search re-renders the picker, and every other tile keeps
// the same props. Holds only while the parent passes a stable onPick (hero.tsx uses useCallback).
export const AppButton = memo(function AppButton({ target, onPick, selected, className }: AppButtonProps) {
  return (
    <button type="button" aria-pressed={selected} onClick={() => onPick(target.id)} className={className}>
      {target.name}
    </button>
  )
})
