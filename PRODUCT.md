# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: React 18, TypeScript, Vite 6, Tailwind CSS 4 (utilities only), react-router-dom 7, PWA with offline service worker, deployed on Cloudflare Workers. Fonts are bundled (Atkinson Hyperlegible) so the app stays readable offline.

## Users

- **Primary: secondary-school physics-chemistry teachers** in francophone West Africa (Benin first). They project an exercise in a classroom with a video projector, often in a lit room, on a modest computer, with fragile or no internet. Their job: make students compute, then run the experiment in front of the class so everyone sees whether the result holds.
- **Secondary: students**, often on a phone, using the free lab to pour, dose and plot their own curve.
- **Contributors: teachers who propose exercises** without writing JSON, and developers who contribute code.

## Product Purpose

Wamon turns a syllabus exercise into a projected experiment where equipment is missing: the class calculates, the teacher enters the answer, the simulation shows whether it holds. Success is a teacher who runs a whole session from one screen with one obvious next action, and a class that sees the verdict.

## Positioning

A free, open, offline-capable "lab in the classroom" that checks the class's own answer against a simulated experiment (indicator colour change, solution tint against a witness tube, titration curve), instead of a generic simulator or a video.

## Operating Context

- Session in four steps: pose the problem (projected like a student's copy), enter the class answer (and group answers), run the experiment with the class value, compare (verdict, gap per group, position on the curve, correction shown only on demand).
- Exercises today: dissolution, dilution (seconde); pH of a strong acid, a strong base and a weak acid; strong acid / strong base, weak acid and weak base (ammonia) titrations (première, terminale). Terminale content follows the Benin Terminale D programme guide (SA2, chimie des solutions aqueuses).
- A free lab for students (acid strong/weak, base, concentrations, indicator, drop-by-drop pouring, measurement table, student-built curve). A 3D lab is in progress on branch feature/labo-3d.
- Projection mode enlarges the whole interface and hides settings. Each screen has its own URL; browser back returns to the previous step without losing state.
- Equipment catalogue (one sheet per instrument: correct gesture, frequent mistakes), a classroom guide, and a contact e-mail (vianneyhoueho@gmail.com) for teachers who want to propose an exercise. The in-app proposal form was removed on 2026-10-08.

## Capabilities and Constraints

- Must be legible from the back of a classroom on a projector and usable on a phone.
- Tailwind utility classes only; `src/styles/app.css` holds the Tailwind import, `@theme` tokens and the `projection:` variant. No new stylesheets.
- Light background with dark text is required (projector in a lit room).
- All UI copy is in French.
- Existing routes, simulation models and the exercise registry must keep working.

## Brand Commitments

- Name: Wamon. Tagline in use: "Le labo dans la classe." / "Vos élèves calculent. L'expérience tranche."
- Visual direction decided on 2026-10-08: simple and plain (light background, white cards with thin borders, blue for action). The user rejected a dense, high-contrast "lab manual" attempt (black outlines, monospace figures, orange accent, graduated rulers) as looking too Japanese; keep ornament to a minimum.
- Avoid what the `frontend-design` skill flagged in the earlier look: cream background, all-caps eyebrows, arrows on buttons.

## Evidence on Hand

Screenshots of the current app in `docs/images/`. No testimonials, usage numbers or school partners to cite; do not invent any.

## Product Principles

1. The teacher role is explicit and every screen answers "what do I do now?" with one primary action.
2. Projector first, phone second: nothing important depends on small text, low contrast or hover.
3. The experiment is the proof: show the simulation doing its job rather than describing it.
4. Works where the connection and the equipment don't: offline, light, no account.
5. Teachers can propose exercises in their own words, by e-mail, never in code.

## Accessibility & Inclusion

Low-vision and distance reading are product requirements (Atkinson Hyperlegible was chosen for that). Keep contrast strong, tap targets at least 44px, text in rem so projection mode scales everything, and respect reduced motion.
