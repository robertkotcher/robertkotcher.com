---
title: How I code with AI
date: "2026-11-05"
tags: [ai, engineering]
---
I spend most of my time as a developer doing two things: **writing code** and **reading code**.

Before AI, I had less code to review and much more context about it. Writing and reading code were intertwined throughout my day: writing helped me understand the system, and that understanding made reviewing the next change easier. I could be productive at both.

I'd estimate that AI lets me write 20x more code, but it doesn't natively give me 20x the capacity to understand and review it. The balance between those two activities has changed.

If I tried to read and understand every AI-generated change the way I used to, I'd face two bad options. I could keep writing code and watch the review backlog grow indefinitely, or become a full-time reviewer and stop writing altogether. Even then, I might struggle to keep up with the output. I need to change how I approach both activities.

## Working with an incomplete map

I can't maintain a line-by-line mental map of an entire repository as it grows at that pace. There will be files I haven't read, conventions I haven't noticed, and interactions I don't yet understand. My output lives in a codebase with unknowns, whether I'm the person writing the change or the person reviewing it.

That changes what I ask of the AI. Getting a large implementation back quickly isn't enough. I need to understand the part of the system it touches and be able to judge each change.

My approach is to **shrink the unit of work until I can reason about it**.

## Writing code

Before changing anything, I ask the agent to explain the relevant code and concepts in a few sentences. If I need more context, we zoom in on short, real snippets and trace the flow together. I want enough understanding to make a decision as a developer.

Then we agree on a small set of changes, each scoped like an independent commit. The agent implements one step, I look at it, and we either adjust it or move on. That keeps my understanding close to the code as it's written.

## Reviewing code

When I'm reviewing someone else's changes, I'm not rewriting their code or reorganizing their commits. I'm asking the agent to present the existing diff as smaller, logical units so I can understand one behavior change at a time.

For each unit, I want a short explanation of what changed, the relevant context, and the files involved. We can zoom into the code together before I decide whether there's an issue. That makes a large review manageable without changing the work under review.

If we find a problem, the output is a review comment explaining the issue and what needs to be resolved. The author makes the changes. Unresolved findings block merging; once they're addressed, we review the updated code and check that the pieces still work together.

## The instructions I use

I put this in `AGENTS.md` to make that workflow explicit. The pauses are intentional: they give me a chance to build context and make decisions before more code arrives.

```text
# AGENTS.md

For every code change or review, follow the relevant workflow below.

## Setup
- Confirm we're in a Git repository.
- If not, explain that this workflow doesn't apply; handle the request normally.

## Making code changes

1. Learning
- Summarize the relevant code and concepts in at most 3 sentences.
- Ask: "would you like me to zoom into any of the code or explain relevant concepts?"
- If yes, assume no prior knowledge. Use short, real snippets with filenames.
- Trace relevant callers and callees; omit unrelated code.
- Continue when I ask you to implement.

2. Planning
- Describe the change in 1 sentence.
- Propose the fewest steps, each a logical, independent commit.
- Wait for approval before coding.

3. Coding
- Implement one approved step at a time.
- Write clear, readable code with short, useful comments.
- Wait for my review: approval advances; feedback revises the current step.
- Get approval before any rollback.
- Finish when all steps are approved.

4. GitHub review
- Ask whether to push. If no, stop.
- If yes, push and write a merge request description with:
  - A 1-sentence summary of the change.
  - A paragraph of context from our learning discussion.
  - Links to individual commits, each with a 1-sentence description.

## Reviewing code

1. Learning
- Summarize the relevant code and concepts in at most 3 sentences.
- Ask: "would you like me to zoom into any of the code or explain relevant concepts?"
- If yes, teach with short, real snippets and filenames; assume no prior knowledge.
- Continue when I ask you to proceed with the review.

2. Planning
- Present the existing diff as small, logical review units.
- Outline those units and wait for approval.
- Don't edit code, rewrite commits, or implement fixes.

3. Reviewing
- Explain each unit's behavior changes, context, and file locations.
- Show short snippets when useful.
- Check correctness, regressions, and relevant tests.
- Discuss findings with me before posting comments.
- Each comment should identify the location, impact, and resolution needed.
- Wait for my approval before advancing to the next unit.

4. Resolution
- Block merging while findings remain unresolved.
- After the author updates the code, re-review affected units and combined behavior.
- Recommend approval only when all blocking findings are resolved.
- Don't merge without my explicit instruction.

```

I don't need to know every line in the repository. I do need a reliable understanding of the change in front of me. Keeping that change small makes AI's speed useful without letting my ability to evaluate the work fall behind.
