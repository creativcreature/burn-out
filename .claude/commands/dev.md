# /dev - Start Development Server

Start the development server and prepare the development environment.

## Steps

1. **Check Dependencies**
   ```bash
   npm install
   ```
   Only run if node_modules is missing or package.json changed.

2. **Start Dev Server**
   ```bash
   npm run dev
   ```
   This starts Vite on port 3000.

3. **Report Status**
   Output to user:
   ```
   ✓ Dev server running at http://localhost:3000
   ✓ Hot reload enabled
   ✓ TypeScript checking enabled

   Press Ctrl+C to stop
   ```

4. **Watch for Errors**
   If any TypeScript or build errors appear, report them immediately.

## Common Issues

| Error | Solution |
|-------|----------|
| Port 3000 in use | Kill existing process or use different port |
| Module not found | Run `npm install` |
| Type errors | Run `npm run typecheck` for details |

## Notes
- Dev server runs in foreground
- Changes auto-reload in browser
- Console errors are displayed in terminal
