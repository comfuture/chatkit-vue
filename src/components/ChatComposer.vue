<template>
  <form
    class="relative rounded-2xl border border-border bg-card p-4 shadow-sm"
    @submit.prevent="handleSubmit"
  >
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-if="tools?.length"
        type="button"
        class="btn btn-secondary h-9 px-3 text-xs"
        @click="toolsOpen = !toolsOpen"
      >
        {{ selectedToolLabel }}
      </button>
      <div v-if="toolsOpen" class="w-full">
        <div
          class="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3"
        >
          <button
            v-for="tool in tools"
            :key="tool.id"
            type="button"
            class="btn h-8 px-3 text-xs"
            :class="tool.id === selectedToolId ? 'btn-primary' : 'btn-secondary'"
            @click="selectTool(tool.id)"
          >
            {{ tool.label }}
          </button>
        </div>
      </div>
      <button
        type="button"
        class="btn btn-secondary h-9 px-3 text-xs"
        @click="$emit('pick-attachment')"
      >
        Attach
      </button>
    </div>

    <div
      v-if="attachments?.length"
      class="mt-3 flex flex-wrap items-center gap-2"
    >
      <div
        v-for="attachment in attachments"
        :key="attachment.id ?? attachment.name"
        class="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
      >
        <span class="text-base">
          {{ attachment.type === 'image' ? '🖼️' : '📄' }}
        </span>
        <span class="font-medium text-foreground">
          {{ attachment.name }}
        </span>
        <button
          class="text-muted-foreground transition hover:text-destructive"
          type="button"
          @click="$emit('remove-attachment', attachment)"
        >
          ✕
        </button>
      </div>
    </div>

    <label class="mt-3 block">
      <textarea
        v-model="draft"
        :autofocus="autoFocus"
        :disabled="disabled || busy"
        :placeholder="placeholder"
        class="h-32 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
      />
    </label>

    <div class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
      <slot name="footer" />
      <div class="flex items-center gap-2">
        <button
          type="submit"
          class="btn btn-primary h-9 px-5"
          :disabled="disabled || busy || !draft.trim().length"
        >
          <span v-if="busy" class="mr-2 inline-flex h-2 w-2 animate-ping rounded-full bg-primary-foreground" />
          Send
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ChatAttachment } from '@/types';
import type { ToolOption } from '@openai/chatkit';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  busy?: boolean;
  attachments?: ChatAttachment[];
  tools?: ToolOption[];
  selectedToolId?: string | null;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
  (e: 'pick-attachment'): void;
  (e: 'remove-attachment', attachment: ChatAttachment): void;
  (e: 'select-tool', toolId: string | null): void;
}>();

const toolsOpen = ref(false);
const selectedToolId = computed({
  get: () => props.selectedToolId ?? null,
  set: (value: string | null) => emit('select-tool', value)
});

const draft = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
});

const placeholder = computed(
  () => props.placeholder ?? 'Message the assistant'
);

const selectedToolLabel = computed(() => {
  if (!props.tools?.length) return 'Tools';
  const active =
    props.tools.find((tool) => tool.id === selectedToolId.value) ??
    props.tools[0];
  return active.shortLabel ?? active.label;
});

const autoFocus = computed(() => props.autoFocus ?? false);

const busy = computed(() => props.busy ?? false);
const disabled = computed(() => props.disabled ?? false);
const attachments = computed(() => props.attachments ?? []);
const tools = computed(() => props.tools ?? []);

watch(
  () => props.selectedToolId,
  (value) => {
    if (!value) return;
    const selected = props.tools?.find((tool) => tool.id === value);
    if (selected?.placeholderOverride) {
      emit('update:modelValue', selected.placeholderOverride);
    }
  }
);

function selectTool(id: string) {
  if (selectedToolId.value === id) {
    selectedToolId.value = null;
  } else {
    selectedToolId.value = id;
  }
  toolsOpen.value = false;
}

function handleSubmit() {
  if (disabled.value || busy.value) return;
  if (!draft.value.trim()) return;
  emit('submit');
}
</script>
