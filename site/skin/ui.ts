// The example skin's classes: one map for the whole app, passed to createVueKit({ ui }).
// Copy it and change any string. Colours come from the CSS variables in skin.css.
import type { VueKitUi } from '../../src/ui'

const label = 'mb-1.5 block text-sm font-medium text-vk-fg'
const hint = 'mt-1.5 text-xs text-vk-muted'
const errors = 'mt-1.5 grid gap-0.5 text-xs text-vk-danger'
const panel = 'rounded-lg border border-vk-line bg-vk-surface shadow-lg'
// The bordered box around a control and its leading / trailing items (see vk-box in skin.css).
const box = 'vk-box'
const bare =
  'h-full min-w-0 flex-1 bg-transparent text-sm text-vk-fg outline-none placeholder:text-vk-muted'
const side = 'flex shrink-0 items-center gap-1 text-vk-muted'

export const ui: VueKitUi = {
  // Every button the kit draws (confirm, cancel, show password, copy, clear, close, toast
  // actions) and every <AppButton variant="…"> uses these, so the whole app matches.
  button: {
    default: 'vk-button vk-button-outline',
    primary: 'vk-button',
    secondary: 'vk-button vk-button-outline',
    danger: 'vk-button vk-button-danger',
    ghost:
      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-vk-muted hover:bg-vk-subtle hover:text-vk-fg aria-pressed:bg-vk-accent aria-pressed:text-vk-accent-fg',
  },
  input: {
    root: 'w-full',
    label,
    control: `${box} has-[textarea]:h-auto has-[textarea]:items-start has-[textarea]:py-2`,
    input: `${bare} [&:is(textarea)]:min-h-20 [&:is(textarea)]:resize-none`,
    leading: side,
    trailing: side,
    // A spinner drawn from the "Loading" text (the text stays for screen readers).
    loading:
      'size-4 shrink-0 animate-spin overflow-hidden rounded-full border-2 border-vk-line border-t-vk-accent text-[0px]',
    counter: 'mt-1 text-end text-xs text-vk-muted',
    // type="tel": "+964 ▾" inside the field, then a searchable list of countries.
    country:
      "flex shrink-0 items-center gap-1 border-e border-vk-line pe-2 after:size-1.5 after:rotate-45 after:border-r-2 after:border-b-2 after:border-vk-muted after:transition-transform after:content-[''] data-open:after:rotate-[225deg]",
    countryTrigger:
      'w-12 cursor-pointer bg-transparent text-sm text-vk-fg outline-none placeholder:text-vk-fg focus:cursor-text',
    countryMenu: `z-50 overflow-hidden ${panel}`,
    countryOption:
      'grid cursor-pointer grid-cols-[2rem_3.5rem_1fr] items-center gap-2 px-3 py-2 text-sm text-vk-fg data-active:bg-vk-subtle data-selected:font-semibold [&_small]:truncate [&_small]:text-xs [&_small]:text-vk-muted',
    hint,
    errors,
  },
  select: {
    root: 'group w-full',
    label,
    chips: 'mb-2 flex flex-wrap gap-1.5',
    chip: 'flex h-7 items-center gap-1 rounded-md bg-vk-subtle ps-2 pe-1 text-xs text-vk-fg',
    chipRemove: 'px-1! py-0!',
    chipMore: 'flex h-7 items-center rounded-md bg-vk-accent px-2 text-xs text-vk-accent-fg',
    // The chevron is the box's last item; physical borders so it points down in RTL too.
    control: `${box} after:ms-1 after:size-2 after:shrink-0 after:rotate-45 after:border-r-2 after:border-b-2 after:border-vk-muted after:transition-transform after:content-[''] group-data-open:after:rotate-[225deg]`,
    trigger: `${bare} flex items-center`,
    leading: side,
    trailing: side,
    content: `z-50 overflow-hidden ${panel}`,
    option:
      "flex cursor-pointer items-center gap-2 px-3 text-sm text-vk-fg data-active:bg-vk-subtle data-disabled:cursor-not-allowed data-disabled:opacity-40 data-selected:after:ms-auto data-selected:after:text-vk-accent data-selected:after:content-['✓']",
    optionDescription: 'text-xs text-vk-muted',
    empty: 'p-3 text-sm text-vk-muted',
    hint,
    errors,
  },
  // Code / PIN: the boxes; [data-active] is the next box to fill.
  pinInput: {
    label,
    control: 'flex gap-2',
    cell: 'grid size-11 place-items-center rounded-lg border border-vk-line bg-vk-surface text-lg font-semibold text-vk-fg transition-colors data-active:border-vk-accent data-active:ring-3 data-active:ring-vk-accent/20 in-data-invalid:border-vk-danger',
    hint,
    errors,
  },
  checkbox: {
    label: 'flex cursor-pointer items-center gap-2 text-sm text-vk-fg',
    input: 'size-4 accent-vk-accent',
    description: 'ms-6 mt-0.5 text-xs text-vk-muted',
    hint,
    errors,
  },
  switch: {
    label: 'flex w-max cursor-pointer items-center gap-3 text-sm text-vk-fg',
    // A native checkbox drawn as a switch: track = the input, thumb = its ::before.
    input:
      "relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-vk-line transition-colors outline-none checked:bg-vk-accent focus-visible:ring-3 focus-visible:ring-vk-accent/30 disabled:opacity-50 before:absolute before:start-0.5 before:top-0.5 before:size-5 before:rounded-full before:bg-white before:shadow before:transition-transform before:content-[''] checked:before:translate-x-5 rtl:checked:before:-translate-x-5",
    errors,
  },
  radioGroup: {
    label,
    group: 'flex flex-wrap gap-2',
    // Selectable cards: the whole <label> is clickable and styled from data-state.
    item: 'flex cursor-pointer items-center gap-2 rounded-lg border border-vk-line bg-vk-surface px-4 py-2.5 text-sm text-vk-fg transition-colors hover:bg-vk-subtle has-focus-visible:ring-3 has-focus-visible:ring-vk-accent/30 data-[state=checked]:border-vk-accent data-[state=checked]:bg-vk-accent/5 data-disabled:cursor-not-allowed data-disabled:opacity-50',
    itemInput: 'size-4 accent-vk-accent',
    itemDescription: 'text-xs text-vk-muted',
    hint,
    errors,
  },
  checkboxGroup: {
    label,
    group: 'grid gap-2',
    item: 'flex cursor-pointer items-center gap-2 text-sm text-vk-fg data-disabled:cursor-not-allowed data-disabled:opacity-50',
    itemInput: 'size-4 accent-vk-accent',
    itemDescription: 'text-xs text-vk-muted',
    hint,
    errors,
  },
  dateInput: {
    root: 'w-full',
    label,
    control: box,
    trigger: `${bare} cursor-pointer text-start`,
    leading: side,
    trailing: side,
    hint,
    errors,
  },
  timeInput: {
    root: 'relative w-full',
    label,
    control: box,
    trigger: `${bare} cursor-pointer text-start`,
    leading: side,
    trailing: side,
    panel: `absolute start-0 z-50 mt-1.5 grid w-max grid-cols-[repeat(3,auto)] gap-1 p-3 ${panel}`,
    presets: 'col-span-full mb-2 flex flex-wrap gap-1.5',
    column: 'flex h-44 flex-col overflow-y-auto rounded-md bg-vk-subtle p-1 [scrollbar-width:none]',
    option:
      'h-8 w-12 shrink-0 rounded text-sm text-vk-fg hover:bg-vk-surface disabled:opacity-30 aria-checked:bg-vk-accent aria-checked:text-vk-accent-fg',
    now: 'col-start-1 mt-2 justify-self-start text-vk-accent!',
    ok: 'col-start-3 mt-2 h-8! justify-self-end px-3! text-xs!',
    hint,
    errors,
  },
  dialog: {
    // The <dialog> is a full-screen transparent box (a click on it = backdrop); the panel is the look.
    root: 'm-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/40 open:flex data-[position=center]:p-4',
    panel:
      'flex flex-col bg-vk-surface shadow-xl in-data-[position=center]:m-auto in-data-[position=center]:max-h-[85dvh] in-data-[position=center]:w-full in-data-[position=center]:max-w-lg in-data-[position=center]:rounded-lg in-data-[position=end]:fixed in-data-[position=end]:inset-y-0 in-data-[position=end]:end-0 in-data-[position=end]:w-full in-data-[position=end]:max-w-md in-data-[position=start]:fixed in-data-[position=start]:inset-y-0 in-data-[position=start]:start-0 in-data-[position=start]:w-full in-data-[position=start]:max-w-md',
    header: 'flex items-center gap-3 border-b border-vk-line px-5 py-4',
    title: 'me-auto text-base font-semibold text-vk-fg',
    body: 'flex-1 overflow-y-auto p-5 text-sm text-vk-fg',
    footer: 'flex justify-end gap-2 border-t border-vk-line px-5 py-3',
  },
  toasts: {
    root: 'fixed inset-x-0 top-4 z-[1000] mx-auto flex w-full max-w-md flex-col gap-2 px-4',
    toast:
      'grid grid-cols-[1fr_auto] gap-x-3 rounded-lg border border-s-4 border-vk-line bg-vk-surface p-4 text-sm text-vk-fg shadow-lg data-[type=error]:border-s-vk-danger data-[type=info]:border-s-vk-info data-[type=success]:border-s-vk-success data-[type=warning]:border-s-vk-warning',
    // A list of errors gets red bullets (::marker), so each problem stands out.
    message:
      'whitespace-pre-line [&:is(ul)]:list-disc [&:is(ul)]:ps-4 in-data-[type=error]:marker:text-vk-danger',
    actions: 'col-start-1 mt-2 flex gap-1',
    close: 'col-start-2 row-start-1 self-start',
  },
  confirm: {
    root: 'm-auto grid w-full max-w-sm gap-4 rounded-lg bg-vk-surface p-6 text-vk-fg shadow-xl backdrop:bg-black/40',
    title: 'text-lg font-semibold',
    message: '-mt-3 text-sm text-vk-muted',
    actions: 'mt-2 flex justify-end gap-2',
  },
}
