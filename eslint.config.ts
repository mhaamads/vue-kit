import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from 'eslint-config-prettier/flat'
import pkg from './package.json' with { type: 'json' }

// Library code may import only relative files and its declared runtime deps (ADR-0011).
const runtimeDeps = Object.keys({ ...pkg.peerDependencies, ...pkg.dependencies })
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const allowedImport = `^(?!\\.{1,2}/)(?!(${runtimeDeps.map(escape).join('|')})(/|$)).+`

export default defineConfigWithVueTs(
  {
    name: 'kit/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/coverage/**', 'smoke/fixture/**', 'site/.vitepress/cache/**', 'site/.vitepress/dist/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    // Same component rules as portal-iq-vue.
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase', 'UPPER_CASE'] },
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'] },
      ],
      'vue/multi-word-component-names': 'off',
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/enforce-style-attribute': ['error', { allow: ['scoped'] }],
      'vue/component-api-style': ['error', ['script-setup', 'composition']],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: true },
      ],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/html-button-has-type': ['error', { button: true, submit: true, reset: true }],
      'vue/match-component-file-name': ['error', { extensions: ['vue'], shouldMatchCase: true }],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/max-lines-per-block': ['error', { style: 60, skipBlankLines: true }],
      'vue/no-duplicate-attr-inheritance': ['error', { checkMultiRootNodes: false }],
      'vue/no-empty-component-block': 'error',
      'vue/no-multiple-objects-in-class': 'error',
      'vue/no-ref-object-reactivity-loss': 'error',
      'vue/no-static-inline-styles': ['error', { allowBinding: true }],
      'vue/no-undef-properties': 'error',
      'vue/no-unsupported-features': ['error', { version: '^3.5.0' }],
      'vue/no-useless-mustaches': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-use-template-ref': 'error',
      'vue/require-macro-variable-name': [
        'error',
        {
          defineProps: 'props',
          defineEmits: 'emit',
          defineSlots: 'slots',
          useSlots: 'slots',
          useAttrs: 'attrs',
        },
      ],
      'vue/require-typed-ref': 'warn',
      'vue/slot-name-casing': ['error', 'kebab-case'],
    },
  },

  {
    name: 'kit/library-boundary',
    files: ['src/**/*.{vue,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/portal-iq-vue/**', 'portal-iq-vue'],
              message: 'portal-iq-vue is read-only reference code (ADR-0001).',
            },
            {
              regex: allowedImport,
              message:
                'Library code may import only relative files and package.json runtime deps (ADR-0011).',
            },
          ],
        },
      ],
    },
  },

  skipFormatting,
)
