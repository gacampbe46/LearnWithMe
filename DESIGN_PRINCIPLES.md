# Design principles

This document describes how we intend to shape the product experience for learnwithme: what we optimize for, what we deliberately avoid, and how that shows up for members (people who both teach and learn). It complements the [README](README.md), [Code of Conduct](CODE_OF_CONDUCT.md), and in-app copy on [/about](https://learnwithme.fyi/about).

It is informed by team direction (including weekly syncs) but is not a substitute for specs, tickets, or legal or policy documents.

---

## 1. Calm over compulsive engagement

### Intent

learnwithme should not feel like a feed built to maximize time on site through constant novelty, streak anxiety, or shallow rewards.

### Guidelines

- We are not optimizing for big, frequent dopamine hits: endless scroll, aggressive notifications, or manipulative “you’re missing out” patterns.
- We are optimizing for attention well spent: a clear program, visible progress, and a sense of finishing what you started.
- Visual and interaction design should favor clarity, restraint, and predictability over spectacle. Marketing materials and a future brand theme should match that tone.

### In practice

Prefer straightforward navigation, honest copy, and interfaces that answer “what do I do next?” without hijacking attention.

---

## 2. Completion first

### Primary job for learners

Make it obvious where you are in a course and what’s left so completing the program feels achievable.

### Guidelines

- Progress tracking per user, per course, is a core expectation—not an optional add-on.
- Surfaces should reinforce momentum through the curriculum (next lesson, time invested, modules done) rather than generic engagement metrics that don’t map to learning outcomes.
- Over time, the homepage and marketing may showcase real teaching moments (photos and video of instructors in context); even then, the product should steer visitors toward structured programs, not infinite browsing.

### In practice

Progress UI, emails, and reminders should tie to course structure, not to abstract “activity” for its own sake.

---

## 3. Milestone recognition, not gamification overload

### Intent

Acknowledge real accomplishment without turning the product into a slot machine.

### Guidelines

- Lightweight recognition (for example badges, patches, or medallions) fits meaningful milestones: completing a course, finishing a major section, or similar—not for every click or daily login.
- Rewards should feel credible and scarce so they still mean something when they appear.
- Avoid systems that train people to chase points, leaderboards, or constant micro-rewards that compete with doing the work.

### In practice

If we add achievements, default to fewer, clearer milestones tied to completion and mastery signals—not streaks and loot-box psychology.

---

## 4. Control and trust

### Privacy and visibility

Members should be able to control how much they share (for example visibility settings similar to “who can see this” toggles on other platforms). Design for informed choice, not hidden defaults.

### Payments and identity (directional)

Long term we expect member-set pricing for courses, with a platform fee as a percentage—reflected honestly in checkout and creator-facing summaries. Tiered pricing may allow learners to pay more for direct access to the instructor (for example office hours or consult-style touchpoints). At each tier, it should be obvious what you are buying.

### Authentication

Prefer approaches that reduce password burden and support mainstream options (for example SSO, Sign in with Apple, wallet-style checkout where appropriate), implemented with security and clarity—not as dark patterns.

---

## 5. Bounded community, not open DMs everywhere

### Intent

Conversation should support learning in context, not a general-purpose social graph.

### Guidelines

- Messaging should be scoped: people you can reach are tied to shared course membership and paying participation where that applies—similar in spirit to a course channel, not a global inbox.
- Discussion spaces should help learners compare notes and encourage each other within the course, not replace the curriculum with chat noise.
- AI-assisted moderation and human processes should support appropriate, safe behavior; reporting and boundaries should be easy to find.

### Reviews

Reviews should come from people with real experience of the course—for example those who have completed it or engaged past a defined threshold—so feedback reflects outcomes, not drive-by ratings. Presentation can echo time in course or completion signals where helpful, without becoming performative.

---

## 6. Safety by design, including for younger users

As an organization we keep children in mind. That affects product decisions beyond the Code of Conduct:

- Screening and moderation for programs and public-facing content reduce harm before it spreads.
- UX should avoid patterns that pressure oversharing or blur lines between public marketing and private learning spaces.
- Features that increase reach (sharing toggles, profiles, media) should be paired with clear defaults and age-appropriate safeguards as the platform matures.

---

## 7. What we will still ship

Design principles are not an excuse to ship a blank page. We still intend solid support and operations experiences—for example clear help paths, team inboxes, and tooling such as Notion for internal alignment or Zendesk-class support when volume warrants it—implemented so they feel helpful, not spammy.

---

## Summary

| Optimize for | De-emphasize |
| ------------ | ------------ |
| Finishing the course | Constant novelty and reward loops |
| Visible, honest progress | Opaque or vanity engagement metrics |
| Rare, meaningful milestones (for example badges) | Streaks and micro-rewards for everything |
| Course-scoped community and trust | Open DMs and unbounded noise |
| Member control (sharing, tiers, pricing clarity) | Hidden defaults and confusion at checkout |
| Safety and moderation by design | “Growth at all costs” patterns |

---

Last updated from team discussion (April 2026). Revise as the product and policies evolve.
