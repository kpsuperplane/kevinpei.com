---
title: Notes on Fast Software
date: 2026-03-12
readTime: 5
description: Speed is a feature. Latency is a tax. Some thoughts on why fast software feels different.
---

Fast software feels different. Not just *better* — actually different, like a different category of experience.

There's a threshold somewhere around 100ms where software stops feeling like it's responding to you and starts feeling like it's part of you. Below that threshold, the interface disappears. Above it, you're always waiting — a little, just enough to remind you that the computer is doing something and you are not.

## The tax on thought

Latency is a tax on thought. Every time you wait for a response, your train of thought has the opportunity to derail. You're reminded that you're using a tool, that the tool is separate from you, that this whole thing is mediated.

The best software erases that mediation. The worst software makes you feel it constantly.

## Why fast software is rare

Making software fast requires caring about it at every level of the stack. The database query, the API call, the render path, the bundle size, the parse time — all of it. You can't outsource this to a framework or a CDO network and call it done.

Most software is slow because making it fast is expensive and the people paying for it don't feel the cost. They use the software occasionally, on fast machines, with fast connections. The user feels the slowness; the builder rarely does.

## Static sites

One of the reasons I like static sites is that they're fast by default. There's no database query, no server render, no API call between the user and the content. It's just files.

This site is a static site. It builds in seconds and loads in milliseconds. This is not a technical achievement — it's a consequence of keeping the thing simple.

Simple is fast. Fast is kind.
