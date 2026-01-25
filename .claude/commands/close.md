# /close - Session Close Command

When the user runs `/close`, perform these steps in order:

## 1. Document Changes
Update `CHANGELOG.md` with all changes made this session:
- Read current CHANGELOG.md
- Add all new features under [Unreleased] → Added
- Add all modifications under [Unreleased] → Changed
- Add all bug fixes under [Unreleased] → Fixed
- Add any removals under [Unreleased] → Removed

## 2. Increment Version
Update `VERSION.md`:
- Read current version
- Determine appropriate bump (MAJOR/MINOR/PATCH) based on changes
- Update "Current Version" field
- Add new row to Version History table with date and summary

## 3. Token Logging
Write session summary to `~/Documents/Claude/TOKEN_MASTER_LOG.md`:
```markdown
## [DATE] - BurnOut Session

### Changes Made
- [List all changes]

### Files Modified
- [List all files touched]

### Next Steps
- [What should be done next session]

### Token Usage
- Input: [tokens]
- Output: [tokens]
- Cost: $[amount] (rate: $0.0000225/token for Melt account)
```

## 4. Display Summary
Output to user:
```
═══════════════════════════════════════
  BurnOut Session Complete
  Version: [NEW_VERSION]
═══════════════════════════════════════

Changes This Session:
• [Change 1]
• [Change 2]
• [etc.]

Next Steps:
1. [Next step 1]
2. [Next step 2]

Session logged to TOKEN_MASTER_LOG.md
═══════════════════════════════════════
```

## Notes
- Always create the Claude directory if it doesn't exist
- If TOKEN_MASTER_LOG.md doesn't exist, create it with a header
- Never skip version increment
- Keep summaries concise but complete
