import {
  shallowRef,
  watchEffect,
  type MaybeRef,
  type ShallowRef
} from 'vue';
import type {
  OpenAIChatKit,
  ChatKitOptions,
  ChatKitEvents
} from '@openai/chatkit';

import { useStableOptions } from './useStableOptions';

type DotToCamelCase<S extends string> = S extends `${infer Head}.${infer Tail}`
  ? `${Head}${Capitalize<DotToCamelCase<Tail>>}`
  : S;

const CHATKIT_METHOD_NAMES = Object.freeze([
  'focusComposer',
  'setThreadId',
  'sendUserMessage',
  'setComposerValue',
  'fetchUpdates',
  'sendCustomAction'
] as const);

type ChatKitMethod = (typeof CHATKIT_METHOD_NAMES)[number];

type ChatKitMethods = {
  [K in ChatKitMethod]: OpenAIChatKit[K];
};

export type ToEventHandlerKey<K extends keyof ChatKitEvents> =
  DotToCamelCase<K> extends `chatkit${infer EventName}`
    ? `on${Capitalize<EventName>}`
    : never;

export type ChatKitEventHandlers = Partial<{
  [K in keyof ChatKitEvents as ToEventHandlerKey<K>]: ChatKitEvents[K] extends CustomEvent<
    infer Detail
  >
    ? Detail extends undefined
      ? () => void
      : (event: Detail) => void
    : never;
}>;

export type UseChatKitOptions = ChatKitOptions & ChatKitEventHandlers;

export type ChatKitControl = {
  setInstance: (instance: OpenAIChatKit | null) => void;
  options: ChatKitOptions;
  handlers: ChatKitEventHandlers;
};

export type UseChatKitReturn = ChatKitMethods & {
  control: ChatKitControl;
  ref: ShallowRef<OpenAIChatKit | null>;
};

export function useChatKit(
  options: MaybeRef<UseChatKitOptions>
): UseChatKitReturn {
  const elementRef = shallowRef<OpenAIChatKit | null>(null);
  const stableOptions = useStableOptions(options);
  const handlersRef = shallowRef<ChatKitEventHandlers>({}) as ShallowRef<ChatKitEventHandlers>;
  const optionsRef = shallowRef<ChatKitOptions>(
    (stableOptions.value as ChatKitOptions) ?? ({} as ChatKitOptions)
  );

  const methods: ChatKitMethods = CHATKIT_METHOD_NAMES.reduce(
    (acc, key) => {
      acc[key] = (...args: any[]) => {
        if (!elementRef.value) {
          console.warn('ChatKit element is not mounted');
          return;
        }
        return (elementRef.value as any)[key](...args);
      };
      return acc;
    },
    {} as ChatKitMethods
  );

  const setInstance = (instance: OpenAIChatKit | null): void => {
    elementRef.value = instance;
  };

  const control: ChatKitControl = {
    setInstance,
    get options() {
      return optionsRef.value;
    },
    set options(value: ChatKitOptions) {
      optionsRef.value = value;
    },
    get handlers() {
      return handlersRef.value;
    },
    set handlers(value: ChatKitEventHandlers) {
      handlersRef.value = value;
    }
  };

  watchEffect(() => {
    const resolved = stableOptions.value as UseChatKitOptions;
    const nextOptions: Partial<ChatKitOptions> = {};
    const nextHandlers: ChatKitEventHandlers = {};

    for (const [key, value] of Object.entries(resolved)) {
      if (/^on[A-Z]/.test(key) && key !== 'onClientTool') {
        (nextHandlers as Record<string, unknown>)[key] = value;
      } else {
        (nextOptions as Record<string, unknown>)[key] = value;
      }
    }

    optionsRef.value = nextOptions as ChatKitOptions;
    handlersRef.value = nextHandlers;
  });

  return {
    ...methods,
    control,
    ref: elementRef
  };
}
