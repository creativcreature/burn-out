# /commit-push-pr - Commit, Push, and Create PR

Stage changes, create a commit, push to remote, and open a pull request.

## Steps

1. **Pre-flight Checks**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```
   Abort if any check fails.

2. **Stage Changes**
   ```bash
   git add -A
   ```
   Or stage specific files if requested.

3. **Create Commit**
   Use conventional commit format:
   ```
   <type>(<scope>): <description>

   [optional body]

   [optional footer]
   ```

   Types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation
   - `style`: Formatting
   - `refactor`: Code restructure
   - `test`: Tests
   - `chore`: Maintenance

4. **Push to Remote**
   ```bash
   git push origin <branch>
   ```

5. **Create Pull Request**
   ```bash
   gh pr create --title "<title>" --body "<body>"
   ```

6. **Report**
   ```
   ═══════════════════════════════════════
     PR Created Successfully
   ═══════════════════════════════════════

   Branch:  <branch>
   Commit:  <hash>
   PR:      <url>

   ═══════════════════════════════════════
   ```

## Notes
- Always run checks before committing
- Use descriptive commit messages
- Reference issues in commit body when applicable
- Keep PRs focused and small
