<template>
  <openai-chatkit ref="chatKitEl" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ChatKitControl } from '@/composables/useChatKit';
import type {
  ChatKitEvents,
  ChatKitOptions,
  OpenAIChatKit
} from '@openai/chatkit';

const props = defineProps<{
  control: ChatKitControl;
}>();

const chatKitEl = ref<OpenAIChatKit | null>(null);

const listenerCleanup: Array<() => void> = [];
const definitionCleanup: Array<() => void> = [];
let pendingOptions: ChatKitOptions | null = null;

const EVENTS: Record<keyof ChatKitEvents, keyof ChatKitControl['handlers']> = {
  'chatkit.error': 'onError',
  'chatkit.response.start': 'onResponseStart',
  'chatkit.response.end': 'onResponseEnd',
  'chatkit.thread.change': 'onThreadChange',
  'chatkit.thread.load.start': 'onThreadLoadStart',
  'chatkit.thread.load.end': 'onThreadLoadEnd',
  'chatkit.log': 'onLog'
};

function applyOptions(options: ChatKitOptions) {
  const el = chatKitEl.value as any;
  if (!el) {
    pendingOptions = options;
    return;
  }

  const run = () => {
    try {
      el.setOptions(options);
    } catch (error) {
      console.error('Failed to apply ChatKit options:', error);
    }
  };

  if (typeof window !== 'undefined') {
    if (customElements.get('openai-chatkit')) {
      run();
    } else {
      let active = true;
      const cancel = () => {
        active = false;
      };
      definitionCleanup.push(cancel);
      customElements.whenDefined('openai-chatkit').then(() => {
        if (active) {
          run();
        }
      });
    }
  } else {
    run();
  }
}

watch(
  () => props.control.options,
  (options) => {
    if (!options) return;
    applyOptions(options);
  },
  { immediate: true }
);

onMounted(() => {
  const el = chatKitEl.value as any;
  if (!el) return;

  props.control.setInstance(el);

  if (pendingOptions) {
    applyOptions(pendingOptions);
    pendingOptions = null;
  }

  for (const [eventName, handlerKey] of Object.entries(EVENTS) as [
    keyof ChatKitEvents,
    keyof ChatKitControl['handlers']
  ][]) {
    const listener = (event: CustomEvent) => {
      const handler = props.control.handlers[handlerKey];
      if (typeof handler === 'function') {
        handler(event.detail);
      }
    };
    el.addEventListener(eventName, listener as EventListener);
    listenerCleanup.push(() => {
      el.removeEventListener(eventName, listener as EventListener);
    });
  }
});

onBeforeUnmount(() => {
  listenerCleanup.forEach((dispose) => dispose());
  definitionCleanup.forEach((dispose) => dispose());
  props.control.setInstance(null);
});

defineExpose({
  element: chatKitEl
});
</script>
