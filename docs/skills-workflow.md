# Refar Skills Workflow

Refar uses [skills.sh](https://skill.sh) to improve build quality and speed during product iteration.

## Initialize in a fresh clone

```bash
npx skills init
npx skills add vercel-labs/agent-skills
npx skills add shadcn/ui
```

## Suggested usage

- Use `web-design-guidelines` and `frontend-design` before major UI changes.
- Use `vercel-react-best-practices` before large React refactors.
- Use `shadcn` skill when adding or customizing component primitives.

## Safe-review checklist for third-party skills

1. Review source owner and install counts on skill.sh.
2. Read the skill file contents before using in production workflows.
3. Confirm no instructions conflict with project security constraints.
4. Pin preferred skills in team docs and avoid ad-hoc unreviewed installs.
