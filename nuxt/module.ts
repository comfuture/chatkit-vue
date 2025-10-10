import { addComponentsDir, addImportsDir, createResolver, defineNuxtModule } from 'nuxt/kit';

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
    const resolver = createResolver(import.meta.url);

    if (options.composables) {
      addImportsDir(resolver.resolve('../src/composables'));
    }

    if (options.components) {
      addComponentsDir({
        path: resolver.resolve('../src/components'),
        pathPrefix: false
      });
    }

    if (options.styles) {
      const stylePath = resolver.resolve('../src/styles/tailwind.css');
      if (!nuxt.options.css.includes(stylePath)) {
        nuxt.options.css.push(stylePath);
      }
    }
  }
});
