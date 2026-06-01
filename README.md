# Astro Starter Kit: Minimal

```sh
bun create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |
| `bun run align -- <slug> --force` | Generate `src/content/posts/<slug>.json` timing data from `scripts/whisper-out/<slug>.json` |

## Audio timing

Audio timing files are manually generated and committed next to their content
and audio files. Raw Whisper transcripts are cached in ignored
`scripts/whisper-out/` files. The site only imports `<slug>.json` when that
file exists, which keeps hand-tuned timings out of the build pipeline.

```sh
bun run transcribe -- src/content/about.m4a
bun run align -- --post src/content/about.mdx --whisper scripts/whisper-out/about.json --out src/content/about.json --force
```

The align script refuses to overwrite an existing timing file unless `--force`
is passed, so manually adjusted JSON is protected by default.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
