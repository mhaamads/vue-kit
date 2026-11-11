// Ported from portal-iq-vue global-events. Changes: listeners clean up in any effect scope
// (components included) via onScopeDispose, useGlobalEventRef no longer leaks its listener,
// and useGlobalEvent always returns its unsubscribe function (no `manual` option needed).
import { getCurrentScope, onScopeDispose, ref, type Ref } from 'vue'

export type EventPayload = Record<string, unknown>
type Listener<T extends EventPayload = EventPayload> = (payload: T) => void

const listeners = new Map<string, Set<Listener>>()
// Latest payload per event, for late subscribers (`immediate`, `useGlobalEventRef`).
const lastPayloads = new Map<string, EventPayload>()

const subscribe = <T extends EventPayload>(name: string, listener: Listener<T>) => {
  const set = listeners.get(name) ?? new Set()
  listeners.set(name, set.add(listener as Listener))
  const off = () => void set.delete(listener as Listener)
  if (getCurrentScope()) onScopeDispose(off)
  return off
}

/** Stored payloads and low-level access. */
export const globalEvents = {
  listenerCount: (name: string) => listeners.get(name)?.size ?? 0,
  lastPayload: <T extends EventPayload>(name: string) => lastPayloads.get(name) as T | undefined,
  /** Returns the last payload and forgets it: a one-time hand-off to a component that mounts later. */
  consumeLastPayload: <T extends EventPayload>(name: string) => {
    const payload = lastPayloads.get(name) as T | undefined
    lastPayloads.delete(name)
    return payload
  },
  /** Clears listeners and stored payloads for one event, or for all. */
  clear: (name?: string) => {
    if (name === undefined) {
      listeners.clear()
      lastPayloads.clear()
    } else {
      listeners.delete(name)
      lastPayloads.delete(name)
    }
  },
}

/** Sends `payload` to every listener of `name`. A throwing listener doesn't stop the others. */
export const broadcastEvent = <T extends EventPayload>(name: string, payload: T) => {
  lastPayloads.set(name, payload)
  for (const listener of [...(listeners.get(name) ?? [])]) {
    try {
      listener(payload)
    } catch (error) {
      console.error(`Error in listener for "${name}":`, error)
    }
  }
}

/**
 * Listens to `name`. Inside a component or effect scope the listener is removed automatically
 * when the scope ends. Returns an unsubscribe function either way.
 */
export const useGlobalEvent = <T extends EventPayload>(
  name: string,
  listener: Listener<T>,
  options: { immediate?: boolean } = {},
): (() => void) => {
  const last = lastPayloads.get(name) as T | undefined
  if (options.immediate && last) listener(last)
  return subscribe(name, listener)
}

/** A ref holding the latest payload of `name`. */
export const useGlobalEventRef = <T extends EventPayload>(name: string, initial: T): Ref<T> => {
  const state = ref((lastPayloads.get(name) as T | undefined) ?? initial) as Ref<T>
  subscribe<T>(name, (payload) => (state.value = payload))
  return state
}

/** Resolves with the next payload of `name`. */
export const waitForEvent = <T extends EventPayload>(name: string): Promise<T> =>
  new Promise((resolve) => {
    const off = subscribe<T>(name, (payload) => {
      off()
      resolve(payload)
    })
  })
