"use client"

import { useCallback, useState } from "react"

/*
 * The demo runs the published wheel of isomorphism in Pyodide (CPython for
 * WebAssembly), so this site does not re-implement the package. Pyodide comes
 * from jsDelivr; the CSP allows that host on /isomorphism/demo only.
 */

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/"
export const WHEEL_URL = "/demos/isomorphism/isomorphism-0.2.0-py3-none-any.whl"

export interface Finding {
  kind: string
  start: number
  end: number
  confidence: number
  detector: string
  checksum_ok: boolean | null
  placeholder: string
}

export interface RunResult {
  text: string
  findings: Finding[]
  mapping: Record<string, string>
}

export interface Runtime {
  version: string
  run(text: string, keep: string): RunResult
  restore(answer: string): string
  /** The answer in pieces of `size` characters: [piece, restored output of that step]. */
  stream(answer: string, size: number): Array<[string, string]>
}

const BRIDGE = `
import json
from dataclasses import asdict
from isomorphism import Restorer, __version__, anonymize, restore

_mapping = {}

def run(text, keep):
    global _mapping
    safe, _mapping = anonymize(text, keep=[k for k in keep.splitlines() if k.strip()])
    return json.dumps({"text": safe, "findings": [asdict(f) for f in _mapping.findings], "mapping": dict(_mapping)})

def back(answer):
    return restore(answer, _mapping)

def stream(answer, size):
    r = Restorer(_mapping)
    steps = [[answer[i:i + size], r.feed(answer[i:i + size])] for i in range(0, len(answer), size)]
    steps.append(["(end)", r.flush()])
    return json.dumps(steps)
`

interface PyodideApi {
  runPython(code: string): unknown
  globals: { get(name: string): (...args: (string | number)[]) => string }
  unpackArchive(buffer: ArrayBuffer, format: string): void
}

export type Status = "idle" | "loading" | "ready" | "failed"

export function useIsomorphism() {
  const [status, setStatus] = useState<Status>("idle")
  const [runtime, setRuntime] = useState<Runtime | null>(null)

  const start = useCallback(async () => {
    setStatus("loading")
    try {
      const { loadPyodide } = (await import(/* webpackIgnore: true */ `${PYODIDE_BASE}pyodide.mjs`)) as {
        loadPyodide(o: { indexURL: string }): Promise<PyodideApi>
      }
      const py = await loadPyodide({ indexURL: PYODIDE_BASE })
      py.unpackArchive(await (await fetch(WHEEL_URL)).arrayBuffer(), "wheel")
      py.runPython(BRIDGE)
      const run = py.globals.get("run")
      const back = py.globals.get("back")
      const stream = py.globals.get("stream")
      setRuntime({
        version: py.runPython("__version__") as string,
        run: (text, keep) => JSON.parse(run(text, keep)) as RunResult,
        restore: (answer) => back(answer),
        stream: (answer, size) => JSON.parse(stream(answer, size)) as Array<[string, string]>,
      })
      setStatus("ready")
    } catch {
      setStatus("failed")
    }
  }, [])

  return { status, runtime, start }
}
