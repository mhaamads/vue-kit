import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import {
  AppConfirmDialog,
  AppToasts,
  createVueKit,
  dismissToast,
  feedbackState,
  useConfirm,
  useToast,
} from '@mhaamads/vue-kit/ui'

const withKit = (messages = {}) => ({
  global: { plugins: [createVueKit({ locales: { en: { messages } } })] },
  attachTo: document.body,
})

afterEach(() => {
  feedbackState.toasts.forEach((t) => dismissToast(t.id))
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('useToast queue rules', () => {
  beforeEach(() => vi.useFakeTimers())

  it('works outside components and returns the toast id', () => {
    const id = useToast({ type: 'success', message: 'Saved' })
    expect(feedbackState.toasts.map((t) => t.id)).toEqual([id])
  })

  it('keeps only the newest two toasts', () => {
    useToast({ type: 'info', message: '1' })
    useToast({ type: 'info', message: '2' })
    useToast({ type: 'info', message: '3' })
    expect(feedbackState.toasts.map((t) => t.message)).toEqual(['2', '3'])
  })

  it('closes after 3 s by default, errors after at least 10 s, persistent never', () => {
    useToast({ type: 'success', message: 'ok' })
    useToast({ type: 'error', message: 'bad', duration: 2000 })
    vi.advanceTimersByTime(3000)
    expect(feedbackState.toasts.map((t) => t.message)).toEqual(['bad'])
    vi.advanceTimersByTime(7000)
    expect(feedbackState.toasts).toEqual([])

    useToast({ type: 'info', message: 'stay', persistent: true })
    vi.advanceTimersByTime(60_000)
    expect(feedbackState.toasts).toHaveLength(1)
  })
})

describe('AppToasts', () => {
  it('is a labelled polite live region; error toasts are alerts', async () => {
    const wrapper = mount(AppToasts, withKit({ notifications: 'Notices' }))
    useToast({ type: 'error', message: 'Failed' })
    await nextTick()
    const region = wrapper.find('section')
    expect(region.attributes('aria-live')).toBe('polite')
    expect(region.attributes('aria-label')).toBe('Notices')
    expect(wrapper.find('[role="alert"]').text()).toContain('Failed')
  })

  it('renders HTML-looking text as text and runs nothing (no v-html)', async () => {
    const wrapper = mount(AppToasts, withKit())
    useToast({ type: 'error', message: '<img src=x onerror="window.__xss=1">' })
    await nextTick()
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('<img src=x onerror="window.__xss=1">')
    expect((window as { __xss?: number }).__xss).toBeUndefined()
  })

  it('renders an array message as a list', async () => {
    const wrapper = mount(AppToasts, withKit())
    useToast({ type: 'error', message: ['Name is required.', 'Email is invalid.'] })
    await nextTick()
    expect(wrapper.findAll('li').map((li) => li.text())).toEqual([
      'Name is required.',
      'Email is invalid.',
    ])
  })

  it('dismisses with a keyboard-reachable button labelled from messages', async () => {
    const wrapper = mount(AppToasts, withKit({ dismiss: 'Close' }))
    useToast({ type: 'info', message: 'Hi', persistent: true })
    await nextTick()
    const button = wrapper.find('button[data-toast-close]')
    expect(button.text()).toBe('Close')
    expect(button.attributes('type')).toBe('button')
    expect(wrapper.find('[data-toast]').attributes('data-type')).toBe('info')
    await button.trigger('click')
    expect(feedbackState.toasts).toEqual([])
  })

  it('runs the action from its button, then closes', async () => {
    const action = vi.fn()
    const wrapper = mount(AppToasts, withKit())
    useToast({ type: 'info', message: 'Updated', action, actionLabel: 'Open', persistent: true })
    await nextTick()
    const open = wrapper.findAll('button').find((b) => b.text() === 'Open')!
    await open.trigger('click')
    await nextTick()
    expect(action).toHaveBeenCalledTimes(1)
    expect(feedbackState.toasts).toEqual([])
  })

  it('offers a keyboard button for an action toast without actionLabel', async () => {
    const action = vi.fn()
    const wrapper = mount(AppToasts, withKit())
    useToast({ type: 'info', message: 'Task updated', action, persistent: true })
    await nextTick()
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Open')!
      .trigger('click')
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('creates toasts without crypto.randomUUID (missing outside HTTPS)', () => {
    vi.stubGlobal('crypto', {})
    const a = useToast({ type: 'info', message: 'a', persistent: true })
    const b = useToast({ type: 'info', message: 'b', persistent: true })
    expect(a).not.toBe(b)
    vi.unstubAllGlobals()
  })

  it('copies an error message and shows "Copied"', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(AppToasts, withKit())
    useToast({ type: 'error', message: ['a', 'b'], persistent: true })
    await nextTick()
    const copy = wrapper.findAll('button').find((b) => b.text() === 'Copy')!
    await copy.trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('a\nb')
    expect(wrapper.text()).toContain('Copied')
    vi.unstubAllGlobals()
  })
})

describe('feedback uses the kit’s own components, so it matches the app', () => {
  it('confirm buttons are AppButtons (secondary / primary, danger for errors) and the input is AppInput', async () => {
    const wrapper = mount(AppConfirmDialog, {
      attachTo: document.body,
      global: {
        plugins: [
          createVueKit({
            ui: {
              button: { secondary: 'btn-2', primary: 'btn-1', danger: 'btn-x' },
              input: { input: 'field' },
            },
          }),
        ],
      },
    })
    void useConfirm('Sure?')
    await nextTick()
    expect(wrapper.find('[data-confirm-cancel]').classes()).toEqual(['btn-2'])
    expect(wrapper.find('[data-confirm-action]').classes()).toEqual(['btn-1'])
    void useConfirm({ type: 'error', message: 'Delete?', confirmText: 'delete' })
    await nextTick()
    expect(wrapper.find('[data-confirm-action]').classes()).toEqual(['btn-x'])
    expect(wrapper.find('input').classes()).toEqual(['field'])
  })

  it('toasts draw their buttons with AppButton and let the close button be replaced', async () => {
    const wrapper = mount(AppToasts, {
      attachTo: document.body,
      slots: { close: ({ dismiss }: any) => h('button', { class: 'x', onClick: dismiss }, '✕') },
      global: { plugins: [createVueKit({ ui: { button: { ghost: 'btn-ghost' } } })] },
    })
    useToast({ type: 'error', message: 'Failed', persistent: true })
    await nextTick()
    expect(wrapper.find('button.btn-ghost').text()).toBe('Copy')
    await wrapper.find('button.x').trigger('click')
    expect(feedbackState.toasts).toEqual([])
  })
})

describe('useConfirm + AppConfirmDialog', () => {
  const open = async () => {
    const wrapper = mount(AppConfirmDialog, withKit())
    await nextTick()
    return wrapper
  }
  const buttons = (wrapper: Awaited<ReturnType<typeof open>>) => {
    const all = wrapper.findAll('button')
    return { cancel: all[0]!, confirm: all[1]! }
  }

  it('opens a modal dialog with title and message, focusing Cancel', async () => {
    const wrapper = await open()
    void useConfirm('Delete this task?', { title: 'Delete' })
    await nextTick()
    await nextTick()
    const dialog = wrapper.find('dialog').element as HTMLDialogElement
    expect(dialog.open).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Delete')
    expect(dialog.getAttribute('aria-labelledby')).toBe(wrapper.find('h2').attributes('id'))
    expect(document.activeElement?.textContent).toContain('Cancel')
  })

  it('resolves true on confirm and false on cancel, then closes', async () => {
    const wrapper = await open()
    const yes = useConfirm('Sure?')
    await nextTick()
    await buttons(wrapper).confirm.trigger('click')
    await expect(yes).resolves.toBe(true)

    const no = useConfirm('Sure?')
    await nextTick()
    await buttons(wrapper).cancel.trigger('click')
    await expect(no).resolves.toBe(false)
    await nextTick()
    expect((wrapper.find('dialog').element as HTMLDialogElement).open).toBe(false)
  })

  it('resolves false on Escape (native cancel event)', async () => {
    const wrapper = await open()
    const answer = useConfirm('Sure?')
    await nextTick()
    await wrapper.find('dialog').trigger('cancel')
    await expect(answer).resolves.toBe(false)
  })

  it('requires the confirmation text before Confirm is enabled', async () => {
    const wrapper = await open()
    void useConfirm({ message: 'Delete project?', confirmText: 'delete' })
    await nextTick()
    expect(wrapper.find('label').text()).toBe('Type "delete" to proceed')
    expect(buttons(wrapper).confirm.attributes('disabled')).toBeDefined()
    await wrapper.find('input').setValue('delete')
    expect(buttons(wrapper).confirm.attributes('disabled')).toBeUndefined()
  })

  it('cancels a still-open request when a new one arrives', async () => {
    await open()
    const first = useConfirm('First?')
    void useConfirm('Second?')
    await expect(first).resolves.toBe(false)
  })

  it('takes default labels from messages', async () => {
    const wrapper = mount(AppConfirmDialog, withKit({ confirm: 'Yes', cancel: 'No' }))
    void useConfirm('Sure?')
    await nextTick()
    const { cancel, confirm } = buttons(wrapper)
    expect([cancel.text(), confirm.text()]).toEqual(['No', 'Yes'])
  })
})
