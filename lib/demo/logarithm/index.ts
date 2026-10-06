// Vendored copy of the browser-side part of @sweberdev/logarithm 0.3 (src/{types,id,diff,query,
// log,memory,describe}.ts, unchanged), so the demo runs the same code as the npm package. The
// Postgres, MySQL and SQLite stores are left out: the demo keeps events in memory.
export type {
  AuditActor,
  AuditChange,
  AuditContext,
  AuditEvent,
  AuditEventInput,
  AuditGroupCount,
  AuditGroupBy,
  AuditPage,
  AuditQuery,
  AuditStore,
  AuditTarget,
} from "./types"
export { createAuditLog, type AuditLog } from "./log"
export { diff } from "./diff"
export { memoryStore } from "./memory"
export { describeAction } from "./describe"
