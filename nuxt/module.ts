import { addComponent, addImports, defineNuxtModule } from 'nuxt/kit';

export interface ModuleOptions {
  /**
   * Automatically register ChatKit Vue components.
   */
  components: boolean;
  /**
   * Automatically register ChatKit Vue composables.
   */
  composables: boolean;
  /**
   * Automatically include ChatKit Vue base styles.
   */
  styles: boolean;
}

const COMPONENTS = [
  'ChatKitRoot',
  'ChatKit',
  'ChatHistory',
  'ChatMessageList',
  'ChatMessageBubble',
  'ChatComposer',
  'WidgetRenderer'
] as const;

const COMPOSABLES = ['useChatKit', 'useStableOptions'] as const;

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'chatkit-vue-module',
    configKey: 'chatkitVue',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0'
    }
  },
  defaults: {
    components: true,
    composables: true,
    styles: true
  },
  setup(options, nuxt) {
    if (options.composables) {
      addImports(
        COMPOSABLES.map((name) => ({
          name,
          from: 'chatkit-vue'
        }))
      );
    }

    if (options.components) {
      COMPONENTS.forEach((name) => {
        addComponent({
          name,
          export: name,
          filePath: 'chatkit-vue'
        });
      });
    }

    if (options.styles) {
      const stylePath = 'chatkit-vue/styles.css';
      if (!nuxt.options.css.includes(stylePath)) {
        nuxt.options.css.push(stylePath);
      }
    }
  }
});
