# A Tale of Thorns, Astro Edition

This Astro project is a rebuild of the current PHP powered site for *A Tale of Thorns*, a serial narrative by Terra Macdonald exploring the nature of death, the afterlife, and the narratives we tell ourselves.

## What you need to know

This build uses a dynamic database to handle routing server-side for pages in the story. Once a book has been added, its chapters are automatically added to the database on the next read.

New chapters should be Obsidian-flavoured Markdown with extension `.md`, and their frontmatter should include the following fields, in any order:

| name | type | format | description |
| ---- | ---- | ------ | ----------- |
| `title` | `string` | | chapter title as displayed within the page content |
| `arc` | `string` | | arc title as displayed within the page content |
| `book` | `string` | | book title as displayed within the page content |
| `date_published` | `string` | `YYYY-mm-dd` | date the chapter is meant to be published. may be in the future |
| `description` | `string` | | SEO-friendly meta description for the chapter |
| `summary` | `string` | | OpenGraph-friendly page description for the chapter |
| `chapter_number` | `int` | | chapter number within the context of the current book |
| `global_part` | `int` | | chapter number within the global context. also the URL slug |

Other fields may be present. In the current Astro build they are ignored. In the PHP build, they are ignored.

In order for the Archive to work, /src/lib/db.ts must be updated to include new arcs and their constituent books **before** their chapters are live. Specifically, they must be added to the `db.arcs` array within the function `rebuildDB`.

```typescript
  db = {
    validation: {
      length: 0,
      date_time: new Date().toISOString()
    },
    arcs: [
      { title: 'Of Leafs and Thorns', books: ['The Blue and Silver Rose','The Tower of Snow and Wind','The Heroine, Haunted and Holy'] },
      { title: 'Of Root and Branch', books: ['The Source','The Fork','The Merge'] }
    ],
    files: []
  };
```

Eventually, I'd like to update this so that it can be managed automatically, but I don't have books and arcs labelled in numeric order currently, and they'd wind up alphabetised instead of in narrative order. That said, a clever technique exists thanks to the `global_part` metadata.

The PHP build used custom scripts and styles stored in appropriate locations to make the narrative pages more dynamic. As of this build, those are disabled until such time as I have a clean path to manage them.

I'll remove the Astro starter info below here later ...

# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
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
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
