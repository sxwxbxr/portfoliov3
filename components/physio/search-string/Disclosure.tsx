"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { cn } from "@/lib/utils"
import { useGuideOptional } from "@/components/physio/guide/GuideProvider"

/**
 * Collapsible areas of the tool. The open state of every area lives in one place (in memory only),
 * so it survives the area being re-rendered or the case being analysed again. The content stays
 * mounted while closed (`hidden`), so typed text and counts are not lost when someone folds an area.
 */
interface Store {
  open: Record<string, boolean>
  set: (id: string, open: boolean) => void
}

const SectionsContext = createContext<Store | null>(null)

export function SectionsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const set = useCallback((id: string, value: boolean) => setOpen((o) => (o[id] === value ? o : { ...o, [id]: value })), [])
  const store = useMemo(() => ({ open, set }), [open, set])
  return <SectionsContext.Provider value={store}>{children}</SectionsContext.Provider>
}

/** Open state of one area. Without a provider it falls back to local state. */
function useOpen(id: string): [boolean, (v: boolean) => void] {
  const store = useContext(SectionsContext)
  const [local, setLocal] = useState(false)
  if (store) return [!!store.open[id], (v) => store.set(id, v)]
  return [local, setLocal]
}

interface Props {
  /** Stable id, also the base of the element ids. */
  id: string
  title: string
  /** Short state of the area, so people can tell whether they need to open it ("4 Komponenten, 1 ohne Schlagwort"). */
  status?: ReactNode
  /** `data-guide` id: the guided mode highlights the area, and opens it while its step is current. */
  guide?: string
  /** Heading level of the title. */
  level?: 3 | 4
  /** Quieter frame for areas nested in another area. */
  nested?: boolean
  children: ReactNode
}

export function Disclosure({ id, title, status, guide, level = 3, nested = false, children }: Props) {
  const [open, setOpen] = useOpen(id)
  const g = useGuideOptional()
  const current = !!g && g.on && !!guide && g.anchors.includes(guide)

  // The guided mode points at this area: show it, so the student does not have to hunt for it.
  // It folds again when the guide moves on, unless the student opened or closed it by hand meanwhile.
  const openedByGuide = useRef(false)
  const touched = useRef(false)
  useEffect(() => {
    if (current) {
      touched.current = false
      if (!open) {
        openedByGuide.current = true
        setOpen(true)
      }
    } else if (openedByGuide.current) {
      openedByGuide.current = false
      if (!touched.current) setOpen(false)
    }
    // setOpen changes identity with the store, open is read once per step change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const Heading = level === 3 ? "h3" : "h4"
  const btnId = `${id}-trigger`
  const panelId = `${id}-panel`

  return (
    <section data-guide={guide} className={cn(nested ? "rounded-lg border border-edge-soft bg-plate" : "well")}>
      <Heading className="text-base">
        <button
          type="button"
          id={btnId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            touched.current = true
            setOpen(!open)
          }}
          className="flex min-h-14 w-full items-center gap-3 rounded-[inherit] px-4 py-2.5 text-left hover:bg-plate-hi md:px-5"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-x-4">
            <span className="text-fg [overflow-wrap:anywhere]">{title}</span>
            {(status || current) && (
              <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm font-normal text-fg-muted">
                {current && <span className="tab px-2 py-px text-xs">{ssCopy.sections.current}</span>}
                {status && <span className="[overflow-wrap:anywhere]">{status}</span>}
              </span>
            )}
          </span>
          <ChevronDown aria-hidden="true" className={cn("size-5 shrink-0 text-fg-muted transition-transform", open && "rotate-180")} />
        </button>
      </Heading>
      <div id={panelId} role="region" aria-labelledby={btnId} hidden={!open} className="border-t border-edge-soft px-4 py-5 md:px-5 md:py-6">
        {children}
      </div>
    </section>
  )
}

/** Open state of a small area that is not a full Disclosure (the hints line, the draft note), kept in the same store. */
export function useSectionOpen(id: string): [boolean, (v: boolean) => void] {
  return useOpen(id)
}
