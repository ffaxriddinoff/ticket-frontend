<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useLocale } from '../lib/i18n'
import type { StationOption } from '../types/station'

const props = defineProps<{
  id: string
  modelValue: string
  label: string
  stations: readonly StationOption[]
  loading?: boolean
  disabled?: boolean
  error?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { t } = useLocale()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const selected = computed(() => props.stations.find((item) => item.code === props.modelValue))
const blocked = computed(() => props.disabled || props.loading || !props.stations.length)
const visibleValue = computed(() => open.value ? query.value : selected.value?.name ?? '')
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f‘’ʻʼ`']/g, '').toLowerCase()
const filtered = computed(() => {
  const value = normalize(query.value.trim())
  return props.stations.filter((station) => station.searchNames.some((name) => normalize(name).includes(value)))
})

function close() {
  open.value = false
  query.value = ''
  activeIndex.value = -1
}

function show() {
  if (blocked.value || open.value) return
  query.value = ''
  open.value = true
  activeIndex.value = -1
}

function search(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  open.value = true
  activeIndex.value = -1
  emit('update:modelValue', '')
}

function choose(station: StationOption) {
  emit('update:modelValue', station.code)
  close()
}

async function onKeydown(event: KeyboardEvent) {
  if (blocked.value) return
  if (event.key === 'Escape') {
    if (open.value) event.preventDefault()
    close()
  } else if (event.key === 'Tab') {
    close()
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    show()
    if (!filtered.value.length) return
    const direction = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = activeIndex.value < 0
      ? direction > 0 ? 0 : filtered.value.length - 1
      : (activeIndex.value + direction + filtered.value.length) % filtered.value.length
    await nextTick()
    document.getElementById(`${props.id}-option-${activeIndex.value}`)?.scrollIntoView({ block: 'nearest' })
  } else if (event.key === 'Enter' && open.value) {
    event.preventDefault()
    const station = filtered.value[activeIndex.value >= 0 ? activeIndex.value : 0]
    if (station) choose(station)
  }
}

function outside(event: PointerEvent) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) close()
}

watch(() => props.stations, close)
watch(blocked, (value) => { if (value) close() })
onMounted(() => document.addEventListener('pointerdown', outside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))
</script>

<template>
  <div ref="root" class="field station-select">
    <label :for="id">{{ label }}</label>
    <div class="station-select-control">
      <input :id="id" :value="visibleValue" type="text" role="combobox" autocomplete="off" :spellcheck="false"
        :placeholder="t(loading ? 'Bekatlar yuklanmoqda…' : 'Bekatni qidiring')" :disabled="blocked"
        :aria-expanded="open" :aria-controls="open ? `${id}-listbox` : undefined" aria-autocomplete="list"
        :aria-activedescendant="open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined"
        :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : undefined"
        @focus="show" @click="show" @input="search" @keydown="onKeydown" @blur="close" />
      <span class="station-select-indicator"><span v-if="loading" class="loading-spinner"></span><AppIcon v-else name="chevron" :size="15" /></span>
      <div v-if="open" class="station-select-dropdown">
        <ul :id="`${id}-listbox`" role="listbox" :aria-label="label">
          <li v-for="(station, index) in filtered" :id="`${id}-option-${index}`" :key="station.code" role="option"
            :aria-selected="modelValue === station.code" :class="{ 'is-active': activeIndex === index, 'is-selected': modelValue === station.code }"
            @pointerdown.prevent @click="choose(station)" @pointermove="activeIndex = index">
            <AppIcon name="pin" :size="16" /><span>{{ station.name }}</span><AppIcon v-if="modelValue === station.code" name="check" :size="16" />
          </li>
        </ul>
        <p v-if="!filtered.length" class="station-select-empty" role="status">{{ t('Bekat topilmadi') }}</p>
      </div>
    </div>
    <span v-if="error" :id="`${id}-error`" class="field-error">{{ t(error) }}</span>
  </div>
</template>
