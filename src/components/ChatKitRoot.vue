<template>
  <div class="flex h-full w-full overflow-hidden rounded-3xl border border-border bg-background shadow-xl">
    <ChatHistory
      v-if="showHistory"
      :active-thread-id="activeThreadId ?? null"
      :threads="threads"
      class="hidden lg:flex"
      @delete-thread="$emit('delete-thread', $event)"
      @new-thread="$emit('new-thread')"
      @rename-thread="$emit('rename-thread', $event)"
      @select-thread="$emit('select-thread', $event)"
      @search="$emit('search', $event)"
    />

    <main class="flex min-w-0 flex-1 flex-col">
      <header class="flex items-center justify-between border-b border-border/80 px-6 py-4">
        <div>
          <h1 class="text-lg font-semibold text-foreground">
            {{ activeThread?.title ?? 'New conversation' }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ subtitle }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="showHistory"
            type="button"
            class="btn btn-secondary h-9 px-3 text-xs lg:hidden"
            @click="$emit('toggle-history')"
          >
            History
          </button>
          <slot name="header-actions" />
        </div>
      </header>

      <ChatMessageList
        ref="messageList"
        :is-streaming="streaming"
        :messages="messages"
        :show-system-messages="showSystemMessages"
        class="flex-1"
        @message-action="$emit('message-action', $event)"
        @select-attachment="$emit('select-attachment', $event)"
        @widget-action="$emit('widget-action', $event)"
      >
        <template #empty>
          <slot name="empty">
            <div class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <h2 class="text-lg font-semibold text-foreground">
                How can I help you today?
              </h2>
              <p class="max-w-sm text-sm text-muted-foreground">
                Share context or ask a question to kick off the conversation.
              </p>
            </div>
          </slot>
        </template>
      </ChatMessageList>

      <footer class="border-t border-border/60 bg-card/60 p-6">
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-3">
          <slot name="composer-top" />
          <ChatComposer
            :attachments="attachments"
            :busy="busy"
            :disabled="disabled"
            :model-value="composerValue"
            :placeholder="composerPlaceholder"
            :selected-tool-id="selectedToolId"
            :tools="tools"
            @pick-attachment="$emit('pick-attachment')"
            @remove-attachment="$emit('remove-attachment', $event)"
            @select-tool="$emit('select-tool', $event)"
            @submit="$emit('submit')"
            @update:model-value="$emit('update:composerValue', $event)"
          >
            <template #footer>
              <slot name="composer-footer" />
            </template>
          </ChatComposer>
          <slot name="composer-bottom" />
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ChatComposer from './ChatComposer.vue';
import ChatHistory from './ChatHistory.vue';
import ChatMessageList from './ChatMessageList.vue';
import type {
  ActionConfig,
  ChatAttachment,
  ChatMessage,
  ChatThread,
  MessageAction,
  ToolOption,
  WidgetInstance
} from '@/types';

const props = defineProps<{
  threads: ChatThread[];
  messages: ChatMessage[];
  composerValue: string;
  activeThreadId?: string | null;
  showHistory?: boolean;
  showSystemMessages?: boolean;
  composerPlaceholder?: string;
  attachments?: ChatAttachment[];
  tools?: ToolOption[];
  selectedToolId?: string | null;
  busy?: boolean;
  disabled?: boolean;
  streaming?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:composerValue', value: string): void;
  (e: 'submit'): void;
  (e: 'select-thread', id: string): void;
  (e: 'new-thread'): void;
  (e: 'delete-thread', thread: ChatThread): void;
  (e: 'rename-thread', thread: ChatThread): void;
  (e: 'pick-attachment'): void;
  (e: 'remove-attachment', attachment: ChatAttachment): void;
  (e: 'select-attachment', attachment: ChatAttachment): void;
  (e: 'widget-action', payload: { action: ActionConfig; widget: WidgetInstance; message: ChatMessage }): void;
  (e: 'message-action', payload: { action: MessageAction; message: ChatMessage }): void;
  (e: 'select-tool', toolId: string | null): void;
  (e: 'search', query: string): void;
  (e: 'toggle-history'): void;
}>();

const messageList = ref<InstanceType<typeof ChatMessageList> | null>(null);

const showHistory = computed(() => props.showHistory ?? true);
const showSystemMessages = computed(() => props.showSystemMessages ?? false);
const attachments = computed(() => props.attachments ?? []);
const tools = computed(() => props.tools ?? []);
const busy = computed(() => props.busy ?? false);
const disabled = computed(() => props.disabled ?? false);
const selectedToolId = computed(() => props.selectedToolId ?? null);
const composerPlaceholder = computed(
  () => props.composerPlaceholder ?? 'Ask a question or describe a task'
);
const streaming = computed(() => props.streaming ?? false);

const activeThread = computed(() => {
  const targetId = props.activeThreadId ?? null;
  if (!targetId) return null;
  return props.threads.find((thread) => thread.id === targetId) ?? null;
});

const subtitle = computed(() => {
  if (!props.messages.length) {
    return 'Waiting for your first message';
  }
  const lastMessage = props.messages[props.messages.length - 1];
  return `${lastMessage.role === 'user' ? 'You' : 'Assistant'} replied ${relativeTime(
    lastMessage.createdAt
  )}`;
});

function relativeTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

defineExpose({
  scrollToBottom: () => messageList.value?.scrollToBottom(),
  scrollToTop: () => messageList.value?.scrollToTop()
});
</script>
