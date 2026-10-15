<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale, type Locale } from '../lib/i18n'

const { locale, setLocale, t } = useLocale()
const languages = [
  { code: 'uz', name: 'O‘zbekcha' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
] as const
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const open = ref(false)
const activeIndex = ref(0)
const listboxId = `language-options-${useId()}`
const selectedIndex = computed(() => languages.findIndex((language) => language.code === locale.value))
const selectedLanguage = computed(() => languages[selectedIndex.value] ?? languages[0])

function close() {
  open.value = false
}

function show(index = selectedIndex.value) {
  activeIndex.value = index
  open.value = true
}

function choose(value: Locale) {
  setLocale(value)
  close()
  trigger.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      show()
    } else {
      const direction = event.key === 'ArrowDown' ? 1 : -1
      activeIndex.value = (activeIndex.value + direction + languages.length) % languages.length
    }
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    show(event.key === 'Home' ? 0 : languages.length - 1)
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const language = languages[activeIndex.value]
    if (open.value && language) choose(language.code)
    else show()
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    event.stopPropagation()
    close()
  } else if (event.key === 'Tab') {
    close()
  } else if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key.length === 1) {
    const key = event.key.toLocaleLowerCase()
    const index = languages.findIndex((language) => language.name.toLocaleLowerCase().startsWith(key) || language.code.startsWith(key))
    if (index >= 0) {
      event.preventDefault()
      show(index)
    }
  }
}

function outside(event: PointerEvent) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) close()
}

function onFocusout(event: FocusEvent) {
  if (!(event.relatedTarget instanceof Node) || !root.value?.contains(event.relatedTarget)) close()
}

watch(locale, close)
onMounted(() => document.addEventListener('pointerdown', outside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))
</script>

<template>
  <div ref="root" class="language-select" @focusout="onFocusout">
    <button ref="trigger" type="button" class="language-select-trigger" :class="{ 'is-open': open }"
      role="combobox" aria-haspopup="listbox" :aria-expanded="open"
      :aria-label="`${t('Tilni tanlash')}: ${selectedLanguage.name}`"
      :aria-controls="open ? listboxId : undefined"
      :aria-activedescendant="open ? `${listboxId}-${activeIndex}` : undefined"
      @click="open ? close() : show()" @keydown="onKeydown">
      <AppIcon name="globe" :size="16" />
      <span>{{ locale.toUpperCase() }}</span>
      <AppIcon name="chevron" :size="12" class="language-select-chevron" />
    </button>

    <div v-if="open" class="language-select-dropdown">
      <p class="language-select-heading">{{ t('Tilni tanlash') }}</p>
      <ul :id="listboxId" role="listbox" :aria-label="t('Tilni tanlash')">
        <li v-for="(language, index) in languages" :id="`${listboxId}-${index}`" :key="language.code"
          role="option" :lang="language.code" :aria-selected="locale === language.code"
          :class="{ 'is-selected': locale === language.code, 'is-active': activeIndex === index }"
          @pointerdown.prevent @pointermove="activeIndex = index" @click="choose(language.code)">
          <span class="language-select-code" aria-hidden="true">{{ language.code.toUpperCase() }}</span>
          <span class="language-select-name">{{ language.name }}</span>
          <span v-if="locale === language.code" class="language-select-check"><AppIcon name="check" :size="13" /></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.language-select { position: relative; display: inline-flex; flex-shrink: 0; }
.language-select-trigger { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 78px; min-height: 36px; padding: 8px; border: 1px solid #dce6d6; border-radius: 10px; color: var(--accent); background: #f6f9f2; font-size: 11px; font-weight: 750; transition: background .15s, border-color .15s; }
.language-select-trigger:hover, .language-select-trigger.is-open { background: var(--soft-green); border-color: #bfd0b5; }
.language-select-trigger:focus-visible { outline-offset: 3px; }
.language-select-chevron { transform: rotate(90deg); transition: transform .15s; }
.is-open .language-select-chevron { transform: rotate(-90deg); }
.language-select-dropdown { position: absolute; top: calc(100% + 10px); right: 0; z-index: 20; width: 220px; max-width: calc(100vw - 36px); padding: 7px; border: 1px solid #e0e8da; border-radius: 16px; background: #fff; box-shadow: 0 14px 40px #23372e16, 0 3px 10px #23372e08; animation: language-menu-in .15s ease-out; }
.language-select-heading { padding: 7px 9px 9px; color: var(--muted); font-size: 10px; font-weight: 650; }
.language-select-dropdown ul { display: grid; gap: 3px; margin: 0; padding: 0; list-style: none; }
.language-select-dropdown li { display: flex; align-items: center; gap: 11px; min-height: 52px; padding: 8px 10px; border: 1px solid transparent; border-radius: 10px; color: #526258; cursor: pointer; transition: background .12s, border-color .12s; }
.language-select-dropdown li.is-active { background: #f5f8f2; }
.language-select-dropdown li.is-selected { color: var(--accent); background: var(--soft-green); border-color: #dce8d4; }
.language-select-code { display: grid; place-items: center; flex-shrink: 0; width: 32px; height: 32px; border: 1px solid #e5ebe0; border-radius: 9px; background: #f8faf6; color: #809374; font-size: 10px; font-weight: 800; letter-spacing: .3px; }
.is-selected .language-select-code { color: var(--accent); background: #fff; border-color: #d7e5cf; }
.language-select-name { font-size: 12px; font-weight: 650; }
.is-selected .language-select-name { font-weight: 750; }
.language-select-check { display: grid; place-items: center; flex-shrink: 0; width: 21px; height: 21px; margin-left: auto; border-radius: 50%; color: #fff; background: var(--accent); }
@keyframes language-menu-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 540px) { .language-select-trigger { min-width: 72px; gap: 5px; } }
@media (prefers-reduced-motion: reduce) { .language-select-dropdown { animation: none; } .language-select-trigger, .language-select-chevron, .language-select-dropdown li { transition: none; } }
</style>
