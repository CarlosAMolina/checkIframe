---
name: changelog
description: Create or update the CHANGELOG.md file. Activate when the user asks to create or update the changelog.
allowed-tools:
  - Bash(git fetch:*)
  - Bash(git log:*)
---

# Skill: Update CHANGELOG

## Goal

Update the project's `CHANGELOG.md` while preserving its existing structure, formatting, section names, ordering, and style.

## Rules

### 1. Preserve the existing format

- Analyze the current `CHANGELOG.md`.
- Reuse exactly the same version header format already used in the file.
- Reuse the same section names (for example: `Added`, `Changed`, `Fixed`, `Removed`, `Security`, etc.).
- Maintain the same ordering of sections and entries.
- Do not reformat previous versions.
- Do not change existing content unless explicitly requested.

### 2. Determine the target version

Inspect the most recent version entry (the first version in the changelog).

#### Case A: Latest version date is `TODO`

Example:

```markdown
## [1.5.0] - TODO
```

Then:

- Add the new changelog entries to that existing version.
- Do not create a new version.
- Merge the new items into the appropriate sections.
- Create missing sections only if required by the new changes and consistent with the existing format.

#### Case B: Latest version already has a real date

Example:

```markdown
## [1.5.0] - 2026-06-21
```

Then:

- Create a new version above it.
- Use the next version number if provided; otherwise infer it from the requested changes.
- Set the date to:

```text
TODO
```

Example:

```markdown
## [1.6.0] - TODO
```

- Add the new entries under this newly created version.

### 3. Writing entries

- Use concise, user-facing descriptions.
- Group entries into the appropriate sections.
- Avoid implementation details unless the changelog style already includes them.
- Follow the wording style used by previous versions.

### 4. Deduplication

- Do not add duplicate entries.
- If a similar item already exists in the target `TODO` version, update or merge it instead of creating a duplicate.

### 5. Output

Return only the updated changelog content or the exact patch requested by the user.

### 6. Collect changes from Git history

When the user asks to update the changelog and does not provide the changelog entries explicitly:

1. Identify the latest commit that already exists in the `main` branch.
2. Read all commits from the current branch that are newer than that point.
3. Review both the commit subject and body.
4. Extract user-visible changes from those commits.
5. Group related commits into a single changelog entry when appropriate.
6. Ignore commits that do not represent meaningful changes for users.
7. Ignore merge commits unless they contain relevant release information.
8. Ignore metadata such as:
   - Co-authored-by
   - Signed-off-by
   - Reviewed-by

Preferred commands:

```bash
git fetch origin main
git log origin/main..HEAD --pretty=format:"%s%n%b%n---END-COMMIT---"
```

### 7. Important

Never:

- Modify historical release dates.
- Move entries between released versions.
- Create a new version when the latest version already has `TODO`.
- Replace `TODO` with a real date.
- Change the changelog format or section names.

## Algorithm

1. Read the current changelog.
2. Identify the most recent version.
3. Check its date value.
4. If date == `TODO`:
   - Update that version.
5. Otherwise:
   - Create a new version with date `TODO`.
6. Insert changes into the correct sections.
7. Preserve all existing formatting and ordering.
8. Return the updated changelog.
