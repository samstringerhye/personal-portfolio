#!/bin/bash
# Run PageSpeed Insights on all live pages (mobile + desktop)
# Usage: ./scripts/pagespeed.sh
# Optional: PSI_KEY=your-api-key ./scripts/pagespeed.sh (for higher rate limits)

BASE="https://samstringerhye.com"
PAGES=(
  "/"
  "/work/bespoke-design-studio"
  "/work/cvs-redesign"
  "/work/myfrontier-app"
  "/work/samsung-redesign"
  "/work/amica-design-system"
  "/about"
  "/colophon"
)

API="https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
KEY_PARAM=""
[[ -n "$PSI_KEY" ]] && KEY_PARAM="&key=$PSI_KEY"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

color_score() {
  local score=$1
  if (( score >= 90 )); then echo -e "${GREEN}${score}${NC}"
  elif (( score >= 50 )); then echo -e "${YELLOW}${score}${NC}"
  else echo -e "${RED}${score}${NC}"; fi
}

printf "\n%-42s %8s %8s %8s %8s %8s %8s\n" "PAGE" "PERF" "FCP" "LCP" "TBT" "CLS" "SI"
printf '%.0s─' {1..90}; echo

for strategy in mobile desktop; do
  label=$(echo "$strategy" | tr '[:lower:]' '[:upper:]')
  echo -e "\n  ── ${label} ──"
  total=0; count=0

  for path in "${PAGES[@]}"; do
    url="${BASE}${path}"
    json=$(curl -s "${API}?url=${url}&strategy=${strategy}${KEY_PARAM}")

    perf=$(echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(int(d['lighthouseResult']['categories']['performance']['score']*100))" 2>/dev/null)

    if [[ -z "$perf" ]]; then
      printf "%-42s %8s\n" "$path" "ERROR"
      continue
    fi

    fcp=$(echo "$json" | python3 -c "import sys,json; a=json.load(sys.stdin)['lighthouseResult']['audits']; print(a['first-contentful-paint']['displayValue'])" 2>/dev/null)
    lcp=$(echo "$json" | python3 -c "import sys,json; a=json.load(sys.stdin)['lighthouseResult']['audits']; print(a['largest-contentful-paint']['displayValue'])" 2>/dev/null)
    tbt=$(echo "$json" | python3 -c "import sys,json; a=json.load(sys.stdin)['lighthouseResult']['audits']; print(a['total-blocking-time']['displayValue'])" 2>/dev/null)
    cls=$(echo "$json" | python3 -c "import sys,json; a=json.load(sys.stdin)['lighthouseResult']['audits']; print(a['cumulative-layout-shift']['displayValue'])" 2>/dev/null)
    si=$(echo "$json" | python3 -c "import sys,json; a=json.load(sys.stdin)['lighthouseResult']['audits']; print(a['speed-index']['displayValue'])" 2>/dev/null)

    printf "%-42s %8s %8s %8s %8s %8s %8s\n" "$path" "$(color_score $perf)" "$fcp" "$lcp" "$tbt" "$cls" "$si"
    total=$((total + perf)); count=$((count + 1))
  done

  if (( count > 0 )); then
    avg=$((total / count))
    echo ""
    printf "%-42s %8s\n" "  Average ($strategy)" "$(color_score $avg)"
  fi
done

echo ""
