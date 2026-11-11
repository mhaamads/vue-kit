import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, effectScope, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import {
  broadcastEvent,
  copyToClipboard,
  deepClone,
  formatTime,
  globalEvents,
  invertObject,
  ordinalSuffix,
  parseTimeString,
  toNumber,
  useGlobalEvent,
  useGlobalEventRef,
  waitForEvent,
} from '@moonlinetravel/vue-kit/utils'

afterEach(() => globalEvents.clear())

describe('event bus', () => {
  it('delivers broadcasts to listeners and removes them when the component unmounts', () => {
    const seen: unknown[] = []
    const Listener = defineComponent({
      setup() {
        useGlobalEvent('refresh', (p) => seen.push(p))
        return () => h('div')
      },
    })
    const wrapper = mount(Listener)
    broadcastEvent('refresh', { type: 'tasks' })
    expect(seen).toEqual([{ type: 'tasks' }])
    expect(globalEvents.listenerCount('refresh')).toBe(1)

    wrapper.unmount()
    expect(globalEvents.listenerCount('refresh')).toBe(0)
  })

  it('also cleans up inside a plain effect scope, and returns an unsubscribe outside one', () => {
    const scope = effectScope()
    scope.run(() => useGlobalEvent('a', () => {}))
    expect(globalEvents.listenerCount('a')).toBe(1)
    scope.stop()
    expect(globalEvents.listenerCount('a')).toBe(0)

    const off = useGlobalEvent('b', () => {})
    expect(globalEvents.listenerCount('b')).toBe(1)
    off()
    expect(globalEvents.listenerCount('b')).toBe(0)
  })

  it('replays the last payload with { immediate: true }', () => {
    broadcastEvent('theme', { theme: 'dark' })
    const seen: unknown[] = []
    const off = useGlobalEvent('theme', (p) => seen.push(p), { immediate: true })
    expect(seen).toEqual([{ theme: 'dark' }])
    off()
  })

  it('keeps a ref in sync and stops tracking when its scope ends (portal leaked this listener)', async () => {
    broadcastEvent('user', { name: 'A' })
    const scope = effectScope()
    const user = scope.run(() => useGlobalEventRef('user', { name: '' }))!
    expect(user.value).toEqual({ name: 'A' })
    broadcastEvent('user', { name: 'B' })
    await nextTick()
    expect(user.value).toEqual({ name: 'B' })
    scope.stop()
    expect(globalEvents.listenerCount('user')).toBe(0)
  })

  it('consumeLastPayload hands a payload over once (portal TaskForm prefill pattern)', () => {
    broadcastEvent('prefill', { draft: 'x' })
    expect(globalEvents.consumeLastPayload('prefill')).toEqual({ draft: 'x' })
    expect(globalEvents.consumeLastPayload('prefill')).toBeUndefined()
  })

  it('resolves waitForEvent with the next payload, once', async () => {
    const next = waitForEvent<{ id: number }>('saved')
    broadcastEvent('saved', { id: 7 })
    await expect(next).resolves.toEqual({ id: 7 })
    expect(globalEvents.listenerCount('saved')).toBe(0)
  })

  it('keeps notifying other listeners when one throws', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const seen: string[] = []
    const off1 = useGlobalEvent('x', () => {
      throw new Error('boom')
    })
    const off2 = useGlobalEvent('x', () => seen.push('ok'))
    broadcastEvent('x', {})
    expect(seen).toEqual(['ok'])
    expect(error).toHaveBeenCalled()
    off1()
    off2()
    error.mockRestore()
  })
})

describe('helpers', () => {
  it('deepClone copies plain data, including reactive proxies (unlike structuredClone)', async () => {
    const { reactive } = await import('vue')
    const source = reactive({ a: { b: [1, 2] } })
    const copy = deepClone(source)
    copy.a.b.push(3)
    expect(source.a.b).toEqual([1, 2])
    expect(deepClone(undefined)).toBeUndefined()
  })

  it.each([
    [1, 'st'],
    [2, 'nd'],
    [3, 'rd'],
    [4, 'th'],
    [11, 'th'],
    [12, 'th'],
    [13, 'th'],
    [21, 'st'],
    [22, 'nd'],
    [101, 'st'],
  ])('ordinalSuffix(%i) is %s (portal said "th" for 21+)', (n, suffix) => {
    expect(ordinalSuffix(n)).toBe(suffix)
  })

  it('copyToClipboard writes strings, numbers and joined arrays', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    await copyToClipboard('a')
    await copyToClipboard(5)
    await copyToClipboard(['x', 1])
    expect(writeText.mock.calls).toEqual([['a'], ['5'], ['x, 1']])
    vi.unstubAllGlobals()
  })

  it.each([
    ['0930', { hours: 9, minutes: 30 }],
    ['930', { hours: 9, minutes: 30 }],
    ['09:30', { hours: 9, minutes: 30 }],
    ['', { hours: 0, minutes: 0 }],
    [null, { hours: 0, minutes: 0 }],
  ])('parseTimeString(%o) (portal "HHmm"; "HH:mm" was NaN in portal)', (input, expected) => {
    expect(parseTimeString(input)).toEqual(expected)
  })

  it('formatTime pads to HH:mm', () => {
    expect(formatTime('930')).toBe('09:30')
    expect(formatTime({ hours: 14, minutes: 5 })).toBe('14:05')
    expect(formatTime(null)).toBe('')
  })

  it('invertObject swaps keys and values', () => {
    expect(invertObject({ Active: 'A', Closed: 2 })).toEqual({ A: 'Active', 2: 'Closed' })
  })

  it.each([
    ['12.5', 12.5],
    [7, 7],
    [0, 0],
    ['0', 0],
    ['', undefined],
    [undefined, undefined],
    ['abc', undefined],
  ])('toNumber(%o) is %o (portal returned undefined for 0)', (input, expected) => {
    expect(toNumber(input)).toBe(expected)
  })
})
