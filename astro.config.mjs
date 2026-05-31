// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { execFileSync } from 'child_process';
import { readFileSync, mkdtempSync, rmdirSync, mkdirSync, readdirSync, existsSync, copyFileSync, unlinkSync } from 'fs';
import ffmpegPath from 'ffmpeg-static';
import { tmpdir } from 'os';
import { join, basename, extname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

/**
 * Compute the content-based hash + hashed filename for an .m4a file.
 * This must stay in sync between the Vite load hook (URL generation) and
 * the Astro build hook (file transcoding + writing).
 * @param {string} filePath
 */
function audioAssetName(filePath) {
  const raw = readFileSync(filePath);
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 8);
  const name = basename(filePath, '.m4a');
  return `${name}-${hash}.m4a`;
}

/**
 * Vite plugin — handles .m4a imports and returns the correct web URL.
 * Dev:  /@fs/<absolute-path>  (Vite serves the raw file directly)
 * Prod: /audio/<name>-<hash>.m4a  (served from dist/audio/ after build)
 * @returns {import('vite').Plugin}
 */
function audioVitePlugin() {
  let isBuild = false;
  return {
    name: 'audio-url',
    enforce: /** @type {'pre'} */ ('pre'),
    /** @param {{ command: string }} config */
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    /** @param {string} id */
    load(id) {
      const cleanId = id.split('?')[0];
      if (extname(cleanId) !== '.m4a') return null;
      if (!isBuild) {
        return `export default "/@fs${cleanId}"`;
      }
      return `export default "/audio/${audioAssetName(cleanId)}"`;
    },
  };
}

/**
 * Astro integration — after the build, transcode every .m4a in src/content/posts/
 * to AAC 128kbps and write it to dist/audio/<name>-<hash>.m4a.
 * Skips files that are already present (idempotent).
 * @returns {import('astro').AstroIntegration}
 */
function audioAstroIntegration() {
  return {
    name: 'audio-optimize',
    hooks: {
      /** @param {{ dir: URL }} opts */
      'astro:build:done': ({ dir }) => {
        const postsDir = join(process.cwd(), 'src/content/posts');
        if (!existsSync(postsDir)) return;

        const m4aFiles = readdirSync(postsDir).filter(f => f.endsWith('.m4a'));
        if (m4aFiles.length === 0) return;

        const outDir = fileURLToPath(new URL('audio/', dir));
        mkdirSync(outDir, { recursive: true });

        for (const file of m4aFiles) {
          const srcPath = join(postsDir, file);
          const assetName = audioAssetName(srcPath);
          const destPath = join(outDir, assetName);

          if (existsSync(destPath)) {
            console.log(`[audio] already built: ${assetName}`);
            continue;
          }

          const tmpDir = mkdtempSync(join(tmpdir(), 'audio-'));
          const tmpOut = join(tmpDir, 'out.m4a');
          try {
            if (!ffmpegPath) {
              throw new Error('ffmpeg-static does not provide a binary for this platform');
            }
            console.log(`[audio] transcoding ${file} → ${assetName}`);
            execFileSync(ffmpegPath, ['-i', srcPath, '-c:a', 'aac', '-b:a', '128k', '-y', tmpOut], {
              stdio: 'ignore',
            });
            copyFileSync(tmpOut, destPath);
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            throw new Error(`[audio] ffmpeg failed for ${file}: ${message}`);
          } finally {
            if (existsSync(tmpOut)) unlinkSync(tmpOut);
            rmdirSync(tmpDir);
          }
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://kevinpei.com',
  integrations: [mdx(), audioAstroIntegration()],
  vite: {
    plugins: [audioVitePlugin()],
  },
});
