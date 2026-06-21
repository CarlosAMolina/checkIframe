---
name: conventional-commit
description: Create Conventional Commit messages from staged git changes. Activate when the user asks to create a commit, write a commit message, commit staged changes, generate a semantic commit, generate a conventional commit, or summarize staged changes for a commit.
allowed-tools: Bash(git diff:*)
---

# Git Commit Message Skill

When asked to create a Git commit message, follow these rules.

## 1. Analyze only staged changes

* Use `git diff --cached` to inspect the changes.
* Do not consider unstaged or untracked files.
* If there are no staged changes, report that no commit message can be generated.

## 2. Gather context

Use the following command:

```bash
git diff --cached
```

Inspect only the staged changes.

## 3. Use Conventional Commits

Format:

```text
<type>(<scope>): <summary>
```

Examples:

```text
feat(logs): change logs format
fix(auth): handle empty response
refactor(api): simplify payload mapping
```

## 4. Allowed commit types

Choose the most appropriate type:

| Type     | Description                                  |
| -------- | -------------------------------------------- |
| feat     | New functionality                            |
| fix      | Bug fix                                      |
| refactor | Internal code change without behavior change |
| perf     | Performance improvement                      |
| test     | Tests added or updated                       |
| docs     | Documentation changes                        |
| style    | Formatting only, no logic changes            |
| build    | Build system or dependency changes           |
| ci       | CI/CD changes                                |
| chore    | Maintenance work                             |

Prefer:

* feat only when user-visible behavior or functionality is added.
* fix only when correcting incorrect behavior.
* refactor when behavior remains unchanged.
* chore for configuration, dependency, or maintenance changes.

## 5. Determine the scope

Infer the scope from the functionality affected by the staged changes.

Possible examples:

* logs
* auth
* api
* config
* validation
* notifications
* payments
* database
* monitoring
* metrics

Rules:

* Use a short, meaningful scope that represents the area of the application being modified.
* Infer the scope from the staged changes.
* Do not use file names unless they clearly represent a functional area.
* Omit the scope if no clear scope can be identified.

Examples:

```text
feat(logs): change logs format
fix(validation): handle missing required field
refactor(api): simplify payload mapping
chore(config): update environment variables
```

## 6. Generate the summary

The summary must:

* Be written in English.
* Use lowercase except for acronyms or proper names.
* Be concise and descriptive.
* Use present tense.
* Not end with a period.
* Prefer a single line.
* Describe the primary purpose of the staged changes.

Good examples:

```text
change logs format
add retry mechanism for api calls
handle empty response from provider
simplify payload mapping
update validation rules
```

Bad examples:

```text
changes
fix stuff
update code
various improvements
```

## 7. Commit body

Prefer a single-line commit message.

Only add a body when:

* The change is complex.
* Multiple related modifications were made.
* Additional context is necessary.

Example:

```text
feat(api): add retry mechanism for provider calls

- add exponential backoff strategy
- retry transient network failures
- improve logging for failed attempts
```

## 8. Output format

Return only the commit message.

Do not include:

* Explanations
* Analysis
* Markdown formatting
* Code fences
* Alternative suggestions

Output exactly the final commit message.

## IMPORTANT

- NEVER add this text to the commit message: Co-authored-by: Copilot...
