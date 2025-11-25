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
      ...(isProduction ? [
        obfuscator({
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: false, // Disable for Chrome extensions
          debugProtectionInterval: 0,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false, // Keep global names for Chrome extension APIs
          selfDefending: true,
          simplify: true,
          splitStrings: true,
          splitStringsChunkLength: 10,
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayEncoding: ['base64'],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 2,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 4,
          stringArrayWrappersType: 'function',
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
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
