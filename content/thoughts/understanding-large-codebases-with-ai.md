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

When I'm reviewing someone else's changes, I want to recreate them piece by piece. I ask the agent to start from the original base in a temporary workspace and actually write the code, building our own series of small commits that reconstructs the change under review.

I can open that workspace in my editor and study each diff as we go. We pause so I can ask questions, trace the surrounding code, and understand why each piece exists. Writing the change again gives me a way to learn it actively instead of trying to absorb the whole diff at once.

The reconstruction should arrive at the same changes as the original. It's a throwaway learning tool; the author's branch stays untouched. If I spot a problem, we leave a review comment on the original change, with the location and context the author needs to address it. Unresolved findings still block merging.

When we're done studying the changes, the agent deletes the temporary code and commits it created. The understanding and review comments are what we keep.

## The instructions I use

I put this in `AGENTS.md` to make that workflow explicit. The pauses are intentional: they give me a chance to build context and make decisions as each piece of code arrives.

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

- Create a disposable workspace from the original change's base revision.
- Write real code there to recreate the changes as small, logical commits.
- Share the workspace path so I can open it in my editor.
- Show one diff at a time; explain the behavior and relevant context.
- Pause for questions and wait until I'm ready before writing the next piece.
- Keep the reconstruction faithful; verify the final diff matches the original.
- Leave the author's branch untouched. Don't mix fixes into the reconstruction.
- Discuss findings with me; post comments on the original change when I ask.
- Comments should identify the original file and lines, impact, and resolution needed.
- Block merging on unresolved findings; re-review the author's fixes.
- Don't merge without my explicit instruction.
- Once I say we're done studying, delete the temporary workspace and its commits.
- Delete only artifacts created for this review; preserve my files and review comments.

```

I don't need to know every line in the repository. I do need a reliable understanding of the change in front of me. Keeping that change small makes AI's speed useful without letting my ability to evaluate the work fall behind.
