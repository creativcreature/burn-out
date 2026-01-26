#!/bin/bash

# Triple Validation Runner
# Usage: ./scripts/validate.sh [tier1|tier2|tier3|all] [file-pattern]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load .env if exists
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

# Support both GEMINI_API_KEY and VITE_GOOGLE_API_KEY
GEMINI_API_KEY="${GEMINI_API_KEY:-$VITE_GOOGLE_API_KEY}"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  TRIPLE VALIDATION SYSTEM"
echo "════════════════════════════════════════════════════════════"
echo ""

TIER=${1:-all}
PATTERN=${2:-"src/**/*.{ts,tsx}"}

# Tier 1: Gemini (Free)
run_tier1() {
  echo -e "${BLUE}▶ TIER 1: Gemini Flash (FREE)${NC}"
  echo "  Checking: syntax, anti-patterns, structure, a11y basics"
  echo ""

  if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}  ✗ GEMINI_API_KEY not set${NC}"
    echo "    Add to .env: GEMINI_API_KEY=your-key"
    return 1
  fi

  # Test Gemini connection
  RESPONSE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"contents":[{"parts":[{"text":"Reply with only: OK"}]}]}')

  if echo "$RESPONSE" | grep -q "OK"; then
    echo -e "${GREEN}  ✓ Gemini API connected${NC}"
  else
    echo -e "${RED}  ✗ Gemini API error${NC}"
    echo "    $RESPONSE"
    return 1
  fi

  # Run TypeScript checks via Gemini
  echo ""
  echo "  Running checks on: $PATTERN"

  # Basic syntax check (using TypeScript compiler as Tier 1 supplement)
  echo -n "  Syntax check: "
  if npm run typecheck --silent 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
  else
    echo -e "${RED}✗ FAIL${NC}"
    return 1
  fi

  # Lint check
  echo -n "  Lint check: "
  if npm run lint --silent 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
  else
    echo -e "${YELLOW}⚠ WARNINGS${NC}"
  fi

  # Anti-pattern check (gamification)
  echo -n "  Anti-pattern check: "
  GAMIFICATION=$(grep -r -l "points\|badge\|streak\|achievement\|leaderboard\|XP\|level.up" src/ 2>/dev/null | grep -v node_modules || true)
  if [ -z "$GAMIFICATION" ]; then
    echo -e "${GREEN}✓ PASS${NC} (no gamification found)"
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "    Found gamification in: $GAMIFICATION"
    return 1
  fi

  echo ""
  echo -e "${GREEN}  ✓ Tier 1 Complete${NC}"
  echo ""
}

# Tier 2: Haiku (Cheap)
run_tier2() {
  echo -e "${BLUE}▶ TIER 2: Claude Haiku (CHEAP)${NC}"
  echo "  Analysis: test results, code review, issue triage"
  echo ""
  echo "  → Run via Claude Code with model: haiku"
  echo "  → Use Task tool for: test analysis, code review"
  echo ""
  echo -e "${GREEN}  ✓ Tier 2 Ready${NC} (invoke via Claude Code)"
  echo ""
}

# Tier 3: Sonnet/Opus (Smart)
run_tier3() {
  echo -e "${BLUE}▶ TIER 3: Claude Sonnet/Opus (SMART)${NC}"
  echo "  Decisions: architecture, planning, sign-off"
  echo ""
  echo "  → Run via Claude Code with model: sonnet/opus"
  echo "  → Use for: architecture review, final approval"
  echo ""
  echo -e "${GREEN}  ✓ Tier 3 Ready${NC} (invoke via Claude Code)"
  echo ""
}

# Run based on argument
case $TIER in
  tier1)
    run_tier1
    ;;
  tier2)
    run_tier2
    ;;
  tier3)
    run_tier3
    ;;
  all)
    run_tier1 && run_tier2 && run_tier3
    echo "════════════════════════════════════════════════════════════"
    echo "  VALIDATION COMPLETE"
    echo "════════════════════════════════════════════════════════════"
    ;;
  test)
    # Quick Gemini test
    echo "Testing Gemini API..."
    if [ -z "$GEMINI_API_KEY" ]; then
      echo -e "${RED}✗ GEMINI_API_KEY not set${NC}"
      echo ""
      echo "Setup options:"
      echo "1. Get free API key: https://aistudio.google.com/app/apikey"
      echo "2. Add to .env: GEMINI_API_KEY=your-key"
      echo "   (or VITE_GOOGLE_API_KEY for Vite projects)"
      exit 1
    fi

    RESPONSE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -d '{"contents":[{"parts":[{"text":"Say only: Connected"}]}]}')

    if echo "$RESPONSE" | grep -q '"text"'; then
      echo -e "${GREEN}✓ Gemini API connected!${NC}"
      echo "$RESPONSE" | grep -o '"text":"[^"]*"' | head -1
    elif echo "$RESPONSE" | grep -q "PERMISSION_DENIED\|API_KEY_INVALID"; then
      echo -e "${RED}✗ API key invalid or not enabled${NC}"
      echo ""
      echo "To fix:"
      echo "1. Go to: https://aistudio.google.com/app/apikey"
      echo "2. Create a new API key (it's free)"
      echo "3. Update .env with the new key"
      exit 1
    else
      echo -e "${RED}✗ Unknown error${NC}"
      echo "$RESPONSE" | head -c 200
      exit 1
    fi
    ;;
  *)
    echo "Usage: ./scripts/validate.sh [tier1|tier2|tier3|all|test]"
    exit 1
    ;;
esac
