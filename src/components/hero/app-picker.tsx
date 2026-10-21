'use client'

import { useState } from 'react'

import { FEATURED_TARGETS, MORE_TARGETS, searchMoreTargets } from '@/lib/targets'
import type { Target } from '@/writers/target'

import { AppButton } from './app-button'

const TILE = 'min-h-[52px] rounded-lg border-2 border-ink px-3 text-left font-display text-xs transition-colors duration-150 sm:text-sm'
const TILE_SELECTED = 'bg-yellow text-ink shadow-hard-3'

/** Featured apps as tiles, the rest behind "More apps" with a search (DESIGN.md, Scaling). */
export function AppPicker({ selected, onChoose }: { selected: Target | undefined; onChoose: (targetId: string) => void }) {
  const selectedId = selected?.id ?? null
  const selectedIsMore = selected ? !selected.featured : false
  const [open, setOpen] = useState(selectedIsMore)
  const [query, setQuery] = useState('')
  const matches = searchMoreTargets(query)

  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 font-display text-base sm:text-lg">Where you dey budget?</legend>
      <div className="grid grid-cols-3 gap-2.5">
        {FEATURED_TARGETS.map((t) => {
          const isSelected = t.id === selectedId
          return (
            <AppButton
              key={t.id}
              target={t}
              onPick={onChoose}
              selected={isSelected}
              className={`${TILE} ${isSelected ? TILE_SELECTED : 'bg-card hover:bg-paper'}`}
            />
          )
        })}
        {MORE_TARGETS.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls="more-apps"
            onClick={() => setOpen((o) => !o)}
            className={`${TILE} ${selectedIsMore ? TILE_SELECTED : 'bg-ink text-yellow'}`}
          >
            {selectedIsMore ? selected?.name : `More apps +${MORE_TARGETS.length}`}
          </button>
        )}
      </div>
      {open && (
        <div id="more-apps" className="flex flex-col gap-2 rounded-lg border-2 border-ink bg-paper p-3">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Find your app
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type an app name"
              className="min-h-11 rounded-md border-2 border-ink bg-card px-3 text-[15px] font-normal"
            />
          </label>
          <ul className="flex max-h-48 flex-col overflow-y-auto">
            {matches.map((t) => {
              const isSelected = t.id === selectedId
              return (
                <li key={t.id}>
                  <AppButton
                    target={t}
                    onPick={onChoose}
                    selected={isSelected}
                    className={`flex min-h-11 w-full items-center rounded px-2 text-left text-sm font-medium ${isSelected ? 'bg-yellow' : 'hover:bg-card'}`}
                  />
                </li>
              )
            })}
            {matches.length === 0 && <li className="px-2 py-2 text-sm text-ink-soft">No app by that name yet. Tell us which one you use.</li>}
          </ul>
        </div>
      )}
    </fieldset>
  )
}
