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

When I'm reviewing someone else's changes, I ask the agent to recreate them in a temporary workspace, one small change at a time. It starts from the original base and actually writes the first piece of code. I open the Codex diff viewer to study just that latest change.

Then we stop and talk about what was applied. I can ask questions, trace the surrounding code, and leave review comments for the original GitHub change. The agent waits until I say to advance before applying the next piece.

Each new piece gets its own turn in the diff viewer. I want to see only what the agent just added or changed, without the earlier reconstruction accumulating in the diff. We repeat that loop—apply, study, discuss, comment, advance—until we've recreated the original change.

The temporary workspace is a learning tool; the author's branch stays untouched. Comments are mapped back to the original files and lines and posted to GitHub when I ask. Unresolved findings block merging. When we're done studying, the agent deletes the reconstruction; the review comments are what we keep.

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

1. Prepare
- Create a disposable workspace from the original change's base revision.
- Share its path so I can open it in Codex and my editor.
- Leave the author's branch untouched; don't mix fixes into the reconstruction.

2. Apply, study, and discuss
- Write one small, logical piece of the original change in the temporary workspace.
- Present only that latest change in the Codex diff viewer.
- Explain what was applied and the relevant context; pause for questions.
- Discuss any review comments I want to leave.
- Map comments to the original GitHub files and lines, not the temporary code.
- Post comments to GitHub when I ask; include impact and resolution needed.
- Wait until I explicitly say to advance. Don't apply the next piece yet.
- When I advance, checkpoint the studied change locally so it leaves the active diff.
- Apply the next piece, showing only its new changes, and repeat this loop.

3. Finish the review
- Verify the full reconstruction matches the original change.
- Block merging on unresolved findings; re-review the author's fixes.
- Don't push the reconstruction or merge without my explicit instruction.

4. Clean up
- Once I say we're done studying, delete the temporary workspace and its checkpoints.
- Delete only artifacts created for this review; preserve my files and GitHub comments.

```

I don't need to know every line in the repository. I do need a reliable understanding of the change in front of me. Keeping that change small makes AI's speed useful without letting my ability to evaluate the work fall behind.
