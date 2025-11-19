import { glob } from 'glob'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import path from 'path'

const plugins = [
  webWorkerLoader(),
  typescript({ declaration: false, declarationDir: null }),
  terser({ format: { comments: false } }),
]

const pluginPlugins = [
  webWorkerLoader(),
  typescript({
    declaration: false,
    declarationDir: null,
    outDir: null,
    noEmit: false
  }),
  terser({ format: { comments: false } }),
]

// Suppress the 'fs' option warning from rollup-plugin-web-worker-loader
const onwarn = (warning, warn) => {
  // Suppress the 'fs' option warning from rollup-plugin-web-worker-loader
  // The plugin tries to use an 'fs' option that's not recognized by Rollup 4
  const message = warning.message || String(warning)
  if (
    message.includes('Unknown input options: fs') ||
    (message.includes('unrecognized option') && message.includes('fs'))
  ) {
    return
  }
  warn(warning)
}

export default [
  // ES module
  {
    input: 'src/wavesurfer.ts',
    output: {
      file: 'dist/wavesurfer.esm.js',
      format: 'esm',
    },
    plugins,
    onwarn,
  },
  // CommonJS module (Node.js)
  {
    input: 'src/wavesurfer.ts',
    output: {
      file: 'dist/wavesurfer.cjs',
      format: 'cjs',
      exports: 'default',
    },
    plugins,
    onwarn,
  },
  // UMD (browser script tag)
  {
    input: 'src/wavesurfer.ts',
    output: {
      name: 'WaveSurfer',
      file: 'dist/wavesurfer.min.js',
      format: 'umd',
      exports: 'default',
    },
    plugins,
    onwarn,
  },

  // Compiled type definitions
  {
    input: './dist/wavesurfer.d.ts',
    output: [{ file: 'dist/types.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  // Wavesurfer plugins (exclude worker files)
  ...glob
    .sync('src/plugins/*.ts')
    .filter((plugin) => !plugin.includes('worker'))
    .map((plugin) => [
      // ES module
      {
        input: plugin,
        output: {
          file: path.join('dist', path.basename(plugin, '.ts') + '.js'),
          format: 'esm',
        },
        plugins: pluginPlugins,
        onwarn,
      },
      // ES module again but with an .esm.js extension
      {
        input: plugin,
        output: {
          file: path.join('dist', path.basename(plugin, '.ts') + '.esm.js'),
          format: 'esm',
        },
        plugins: pluginPlugins,
        onwarn,
      },
      // CommonJS module (Node.js)
      {
        input: plugin,
        output: {
          name: path.basename(plugin, '.ts'),
          file: path.join('dist', path.basename(plugin, '.ts') + '.cjs'),
          format: 'cjs',
          exports: 'default',
        },
        plugins: pluginPlugins,
        onwarn,
      },
      // UMD (browser script tag)
      {
        input: plugin,
        output: {
          name: 'WaveSurfer.' + path.basename(plugin, '.ts').replace(/^./, (c) => c.toUpperCase()),
          file: path.join('dist', path.basename(plugin, '.ts') + '.min.js'),
          format: 'umd',
          extend: true,
          globals: {
            WaveSurfer: 'WaveSurfer',
          },
          exports: 'default',
        },
        external: ['WaveSurfer'],
        plugins: pluginPlugins,
        onwarn,
      },
    ])
    .flat(),
]
