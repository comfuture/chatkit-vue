<template>
  <section class="flex h-full flex-col">
    <div ref="container" class="flex-1 overflow-y-auto px-6 py-6">
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <slot v-if="!messages.length" name="empty">
          <div
            class="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground"
          >
            Start a conversation to see it here.
          </div>
        </slot>
        <ChatMessageBubble
          v-for="message in visibleMessages"
          :key="message.id"
          :message="message"
          @message-action="$emit('message-action', $event)"
          @select-attachment="$emit('select-attachment', $event)"
          @widget-action="$emit('widget-action', $event)"
        />
        <div v-if="isStreaming" class="flex items-center gap-3 text-sm text-muted-foreground">
          <span class="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
          Assistant is typing…
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import ChatMessageBubble from './ChatMessageBubble.vue';
import type {
  ActionConfig,
  ChatAttachment,
  ChatMessage,
  MessageAction,
  WidgetInstance
} from '@/types';

const props = defineProps<{
  messages: ChatMessage[];
  isStreaming?: boolean;
  showSystemMessages?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select-attachment', attachment: ChatAttachment): void;
  (e: 'widget-action', payload: {
    action: ActionConfig;
    widget: WidgetInstance;
    message: ChatMessage;
  }): void;
  (e: 'message-action', payload: {
    action: MessageAction;
    message: ChatMessage;
  }): void;
}>();

const container = ref<HTMLElement | null>(null);

const visibleMessages = computed(() => {
  if (props.showSystemMessages) return props.messages;
  return props.messages.filter((message) => message.role !== 'system');
});

watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    if (!container.value) return;
    container.value.scrollTop = container.value.scrollHeight;
  }
);

defineExpose({
  scrollToTop: () => {
    container.value?.scrollTo({ top: 0, behavior: 'smooth' });
  },
  scrollToBottom: () => {
    container.value?.scrollTo({ top: container.value.scrollHeight, behavior: 'smooth' });
  }
});
</script>
