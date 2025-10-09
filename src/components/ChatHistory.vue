<template>
  <aside
    class="flex h-full w-72 flex-col border-r border-border bg-card/40 backdrop-blur-sm"
  >
    <header class="flex items-center justify-between px-4 py-3">
      <div>
        <p class="text-sm font-semibold text-foreground">Chat History</p>
        <p class="text-xs text-muted-foreground">
          {{ threads.length }} thread<span v-if="threads.length !== 1">s</span>
        </p>
      </div>
      <button class="btn btn-primary h-9 px-3" type="button" @click="$emit('new-thread')">
        New
      </button>
    </header>

    <div class="px-4 pb-3">
      <slot name="search">
        <label class="relative block">
          <span
            class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
          >
            🔍
          </span>
          <input
            v-model="query"
            class="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Search threads"
            type="search"
          />
        </label>
      </slot>
    </div>

    <div class="flex-1 overflow-y-auto px-2 pb-4">
      <ul class="grid gap-2">
        <li v-if="!filteredThreads.length" class="px-2">
          <div
            class="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground"
          >
            {{ emptyMessage }}
          </div>
        </li>
        <li v-for="thread in filteredThreads" :key="thread.id">
          <button
            type="button"
            class="w-full rounded-lg border border-transparent bg-background/60 px-4 py-3 text-left transition hover:border-border hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :class="{
              'border-primary bg-primary/5 text-primary shadow-sm':
                thread.id === activeThreadId,
            }"
            @click="$emit('select-thread', thread.id)"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="truncate text-sm font-semibold">
                {{ thread.title }}
              </p>
              <span class="text-xs text-muted-foreground">
                {{ formatRelative(thread.updatedAt ?? thread.createdAt) }}
              </span>
            </div>
            <p
              v-if="thread.preview"
              class="mt-1 line-clamp-2 text-xs text-muted-foreground"
            >
              {{ thread.preview }}
            </p>

            <div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span v-if="thread.unreadCount && thread.unreadCount > 0"
                class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-primary"
              >
                {{ thread.unreadCount }} new
              </span>
              <span v-if="thread.isPinned" class="inline-flex items-center gap-1">
                📌 Pinned
              </span>
            </div>

            <div
              v-if="showRename || showDelete"
              class="mt-3 flex items-center gap-2"
            >
              <button
                v-if="showRename"
                type="button"
                class="btn btn-secondary h-8 px-2 text-xs"
                @click.stop="$emit('rename-thread', thread)"
              >
                Rename
              </button>
              <button
                v-if="showDelete"
                type="button"
                class="btn h-8 bg-destructive/10 px-2 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                @click.stop="$emit('delete-thread', thread)"
              >
                Delete
              </button>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ChatThread } from '@/types';

const props = defineProps<{
  threads: ChatThread[];
  activeThreadId?: string | null;
  showDelete?: boolean;
  showRename?: boolean;
  emptyMessage?: string;
}>();

const emit = defineEmits<{
  (e: 'select-thread', id: string): void;
  (e: 'new-thread'): void;
  (e: 'delete-thread', thread: ChatThread): void;
  (e: 'rename-thread', thread: ChatThread): void;
  (e: 'search', query: string): void;
}>();

const query = ref('');

watch(query, (value) => {
  emit('search', value);
});

const emptyMessage = computed(
  () => props.emptyMessage ?? 'No conversations yet.'
);

const filteredThreads = computed(() => {
  if (!query.value) return props.threads;
  const normalized = query.value.toLowerCase();
  return props.threads.filter((thread) => {
    const haystack = [
      thread.title,
      thread.preview,
      thread.metadata ? JSON.stringify(thread.metadata) : ''
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
});

function formatRelative(value: string | Date | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(date);
}
</script>
