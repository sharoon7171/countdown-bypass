import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { obfuscator } from 'rollup-obfuscator';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to copy manifest.json to dist folder
const copyManifestPlugin = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const manifestPath = resolve(__dirname, 'manifest.json');
      const distManifestPath = resolve(__dirname, 'dist/manifest.json');

      if (existsSync(manifestPath)) {
        copyFileSync(manifestPath, distManifestPath);
      }
    }
  };
};

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      copyManifestPlugin(),
      // Obfuscate code in production builds only
      // Using minimal obfuscation to avoid variable name conflicts
      ...(isProduction ? [
        obfuscator({
          compact: true,
          // Disable all complex transformations that cause variable conflicts
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: true,
          // Use dictionary-based names to ensure uniqueness across scopes
          identifierNamesGenerator: 'dictionary',
          identifiersDictionary: ['hdhub4u_a', 'hdhub4u_b', 'hdhub4u_c', 'hdhub4u_d', 'hdhub4u_e', 'hdhub4u_f', 'hdhub4u_g', 'hdhub4u_h', 'hdhub4u_i', 'hdhub4u_j', 'hdhub4u_k', 'hdhub4u_l', 'hdhub4u_m', 'hdhub4u_n', 'hdhub4u_o', 'hdhub4u_p', 'hdhub4u_q', 'hdhub4u_r', 'hdhub4u_s', 'hdhub4u_t', 'hdhub4u_u', 'hdhub4u_v', 'hdhub4u_w', 'hdhub4u_x', 'hdhub4u_y', 'hdhub4u_z'],
          log: false,
          numbersToExpressions: false,
          renameGlobals: false,
          selfDefending: false,
          simplify: true,
          splitStrings: false,
          // Minimal string array obfuscation
          stringArray: true,
          stringArrayCallsTransform: false,
          stringArrayEncoding: ['base64'],
          stringArrayIndexShift: false, // Disable to reduce complexity
          stringArrayRotate: false, // Disable to reduce complexity
          stringArrayShuffle: false, // Disable to reduce complexity
          stringArrayWrappersCount: 0, // No wrappers to avoid conflicts
          stringArrayWrappersChainedCalls: false,
          stringArrayWrappersType: 'variable',
          stringArrayThreshold: 0.3, // Lower threshold
          transformObjectKeys: false,
          unicodeEscapeSequence: false,
          reservedNames: ['window', 'document', 'chrome', 'fetch', 'atob', 'location', 'Date', 'JSON']
        })
      ] : [])
    ],
    build: {
      rollupOptions: {
        input: {
          'multiup-content-script': resolve(__dirname, 'src/content-scripts/multiup-content-script.ts'),
          'hubcdn-redirect-content-script': resolve(__dirname, 'src/content-scripts/hubcdn-redirect-content-script.ts'),
          'hdhub4u-timer-bypass-content-script': resolve(__dirname, 'src/content-scripts/hdhub4u-timer-bypass-content-script.ts'),
          'hdhublist-main-domain-content-script': resolve(__dirname, 'src/content-scripts/hdhublist-main-domain-content-script.ts'),
          'hdhub4u-main-domain-instant-redirect-content-script': resolve(__dirname, 'src/content-scripts/hdhub4u-main-domain-instant-redirect-content-script.ts'),
          'shrtfly-redirect-content-script': resolve(__dirname, 'src/content-scripts/shrtfly-redirect-content-script.ts'),
          'fc-lc-redirect-content-script': resolve(__dirname, 'src/content-scripts/fc-lc-redirect-content-script.ts')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      },
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser', // Enable minification with terser
      target: 'es2020',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
          drop_debugger: true
        }
      }
    }
  };
});
