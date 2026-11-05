# Writing thoughts

Each post is a Markdown file in this folder. Its filename becomes the URL:
`hello-world.md` → `/thoughts/hello-world`.
Use lowercase letters, numbers, and hyphens in filenames. This README is not a post.

Copy this front matter, then write below it:

```markdown
---
title: Your title here
date: "2026-11-05"
tags: [engineering, ai]
---

Your thought goes here. **Bold**, *italics*, lists, quotes, and code work.

[Link text](https://example.com)

![Describe the image](/thoughts/your-image.jpg)
```

Put images in `public/thoughts/` and reference them as `/thoughts/filename.jpg`.
External image URLs work too. Raw HTML is not rendered.
Keep dates quoted and use YYYY-MM-DD. Posts appear newest first.

Run `npm run dev` and visit the post URL directly. Save edits and refresh to see them.
New posts need a new build when deploying. There is currently no `/thoughts` index;
link to individual posts from the homepage when ready.
