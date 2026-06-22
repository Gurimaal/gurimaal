# 👥 Gurimaal Team Roles

This document defines the roles, responsibilities, and permissions for the Gurimaal development team.

All contributors must read **AGENTS.md** before writing any code.

---

## 🔴 Mentor / Maintainer


### Responsibilities

* Reviews and merges all Pull Requests into `version-16`
* Final authority on architecture decisions and DocType design
* Manages GitHub repository settings, branch protection, and access
* Creates and assigns Issues via GitHub Projects board
* Maintains and updates AGENTS.md and architecture documentation
* Resolves complex merge conflicts

### Rules

* ❌ Must NOT push directly to `version-16`
* ✅ All changes must go through Pull Requests
* ✅ Enforces code quality, structure, and standards
* ✅ Ensures every PR is linked to an Issue

### Key Principle

> The Mentor protects the stability and architecture of the system — not speed.

### Daily Checklist

* Review pending PRs
* Validate code against AGENTS.md
* Ensure tests pass before merge
* Keep documentation updated

---

## 🟡 Developer Team


### Responsibilities

* Work only on assigned Issues
* Create a feature branch per task
* Write clean, testable, and modular code
* Commit frequently using standard format
* Open Pull Requests after completing tasks
* Respond to review feedback within 24 hours

### Workflow

1. Pick Issue from GitHub Projects
2. Create branch: `<name>/<feature>`
3. Develop feature
4. Run migrations and tests
5. Push branch
6. Open PR and assign Mentor

### Rules

* ❌ NEVER push directly to `version-16`
* ❌ NEVER merge your own PR
* ❌ NEVER start work without an Issue
* ✅ Keep PRs small and focused

### Git Routine

```bash
# Start of day
git checkout version-16
git pull origin version-16
git checkout -b <name>/<task>

# During work
git add .
git commit -m "feat(module): description"

# End of day
git push origin <name>/<task>
```

### Commit Format

```
type(module): description

Types:
- feat
- fix
- chore
- test
- refactor
```

### Key Principle

> One Issue = One Branch = One PR

---

## 🟢 Reviewer


### Responsibilities

* Review assigned Pull Requests within 24 hours
* Ensure PR meets Issue acceptance criteria
* Validate compliance with AGENTS.md rules
* Provide clear, actionable feedback

### Review Actions

* ✅ Approve — if everything is correct
* 🔄 Request Changes — if issues exist
* 💬 Comment — for suggestions or clarifications

### What to Check

* Code correctness and logic
* Naming conventions
* Commit message format
* Scope (no unnecessary changes)
* Tests included (if applicable)
* No violation of architecture rules

### Rules

* ❌ Never ignore a review request
* ❌ Never approve without understanding the code
* ✅ Be constructive and respectful
* ✅ Focus on code quality, not personal style

### Key Principle

> Reviews are for protecting the system — not criticizing developer teams.

---

## 📌 Summary Rules (Quick Reference)

* All work must go through **Pull Requests**
* No one can push directly to `version-16`
* Every task must have a **GitHub Issue**
* Keep PRs small and focused
* Follow commit format: `type(module): description`

---
