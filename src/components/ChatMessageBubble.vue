<template>
  <article
    class="flex w-full flex-col gap-2"
    :class="message.role === 'user' ? 'items-end' : 'items-start'"
  >
    <header class="flex items-center gap-2 text-xs text-muted-foreground">
      <span v-if="message.author?.name">{{ message.author?.name }}</span>
      <span v-else>{{ roleLabel }}</span>
      <span>·</span>
      <time :datetime="timestampISO">{{ formattedTimestamp }}</time>
      <span v-if="message.pending" class="inline-flex items-center gap-1">
        <span class="h-2 w-2 animate-pulse rounded-full bg-primary" />
        typing…
      </span>
    </header>

    <div
      class="max-w-full rounded-2xl border border-transparent px-4 py-3 text-sm shadow-sm transition"
      :class="bubbleClasses"
    >
      <div v-if="message.format === 'markdown'" v-html="markdownHtml" class="prose prose-sm dark:prose-invert max-w-none" />
      <p v-else class="whitespace-pre-wrap leading-relaxed">
        {{ message.content }}
      </p>

      <ul
        v-if="message.attachments?.length"
        class="mt-3 flex flex-wrap items-center gap-2"
      >
        <li
          v-for="attachment in message.attachments"
          :key="attachment.id ?? attachment.name"
        >
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-sm transition hover:bg-background"
            @click="$emit('select-attachment', attachment)"
          >
            <span class="text-base">
              {{ attachment.type === 'image' ? '🖼️' : '📄' }}
            </span>
            <span class="font-medium text-foreground">
              {{ attachment.name }}
            </span>
          </button>
        </li>
      </ul>

      <div v-if="message.widgets?.length" class="mt-4 space-y-3">
        <WidgetRenderer
          v-for="widget in message.widgets"
          :key="widget.id"
          :root="widget.widget"
          :widget-id="widget.id"
          @action="(action) => $emit('widget-action', { action, widget, message })"
        />
      </div>

      <div
        v-if="message.actions?.length"
        class="mt-4 flex flex-wrap items-center gap-2"
      >
        <button
          v-for="action in message.actions"
          :key="action.label"
          class="btn btn-secondary h-8 px-3 text-xs"
          type="button"
          @click="$emit('message-action', { action, message })"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import WidgetRenderer from './WidgetRenderer.vue';
import type { ChatMessage, ChatAttachment, WidgetInstance, ActionConfig, MessageAction } from '@/types';

const props = defineProps<{
  message: ChatMessage;
}>();

const emit = defineEmits<{
  (e: 'select-attachment', attachment: ChatAttachment): void;
  (e: 'widget-action', payload: { action: ActionConfig; widget: WidgetInstance; message: ChatMessage }): void;
  (e: 'message-action', payload: { action: MessageAction; message: ChatMessage }): void;
}>();

const markdown = new MarkdownIt({
  linkify: true,
  breaks: true,
  html: false
});

const roleLabel = computed(() => {
  switch (props.message.role) {
    case 'assistant':
      return 'Assistant';
    case 'system':
      return 'System';
    case 'tool':
      return 'Tool';
    default:
      return 'You';
  }
});

const timestampISO = computed(() =>
  new Date(props.message.createdAt).toISOString()
);

const formattedTimestamp = computed(() => {
  const date = new Date(props.message.createdAt);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
});

const bubbleClasses = computed(() => {
  if (props.message.role === 'user') {
    return 'bg-primary text-primary-foreground rounded-br-sm';
  }
  if (props.message.role === 'assistant') {
    return 'bg-muted/60 text-foreground rounded-bl-sm';
  }
  return 'bg-muted text-muted-foreground';
});

const markdownHtml = computed(() =>
  markdown.render(props.message.content ?? '')
);
</script>
