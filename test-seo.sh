#!/bin/bash
# SEO Testing Script
# Tests your VPS prerender setup

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOMAIN=${1:-"yourdomain.com"}

echo "=========================================="
echo "SEO Prerender Test Suite"
echo "Testing: $DOMAIN"
echo "=========================================="
echo ""

# Test counter
PASS=0
FAIL=0

# Test function
test() {
  local name=$1
  local cmd=$2
  local expected=$3

  echo -n "Testing: $name... "

  result=$(eval "$cmd" 2>&1)

  if echo "$result" | grep -q "$expected"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Expected: $expected"
    echo "  Got: $result"
    ((FAIL++))
  fi
}

# 1. Test SSL
echo -e "${YELLOW}[SSL Tests]${NC}"
test "HTTPS accessible" "curl -sI https://$DOMAIN | head -1" "200"
test "SSL certificate valid" "curl -sI https://$DOMAIN | grep -i server" "server"

echo ""

# 2. Test Bot Prerendering
echo -e "${YELLOW}[Bot Prerendering Tests]${NC}"
test "Bot request succeeds" "curl -s -o /dev/null -w '%{http_code}' -A 'Googlebot' https://$DOMAIN/" "200"
test "Bot gets HTML" "curl -s -A 'Googlebot' https://$DOMAIN/ | grep -c '<html'" "1"
test "Bot gets title tag" "curl -s -A 'Googlebot' https://$DOMAIN/ | grep -c '<title>'" "1"
test "Bot gets meta description" "curl -s -A 'Googlebot' https://$DOMAIN/ | grep -c 'name=\"description\"'" "1"

echo ""

# 3. Test User SPA (should get index.html)
echo -e "${YELLOW}[User SPA Tests]${NC}"
test "User request succeeds" "curl -s -o /dev/null -w '%{http_code}' -A 'Mozilla' https://$DOMAIN/" "200"
test "User gets SPA HTML" "curl -s -A 'Mozilla' https://$DOMAIN/ | grep -c '<div id=\"root\"'" "1"

echo ""

# 4. Test Static Files
echo -e "${YELLOW}[Static File Tests]${NC}"
test "robots.txt accessible" "curl -s -o /dev/null -w '%{http_code}' https://$DOMAIN/robots.txt" "200"
test "sitemap.xml accessible" "curl -s -o /dev/null -w '%{http_code}' https://$DOMAIN/sitemap.xml" "200"
test "robots.txt has content" "curl -s https://$DOMAIN/robots.txt | grep -c 'User-agent'" "1"
test "sitemap.xml has URLs" "curl -s https://$DOMAIN/sitemap.xml | grep -c '<loc>'" "1"

echo ""

# 5. Test Headers
echo -e "${YELLOW}[Header Tests]${NC}"
test "X-Frame-Options header" "curl -sI https://$DOMAIN/ | grep -i 'x-frame-options'" "SAMEORIGIN"
test "X-Content-Type-Options header" "curl -sI https://$DOMAIN/ | grep -i 'x-content-type-options'" "nosniff"

echo ""

# 6. Compare Bot vs User HTML (should have same core content)
echo -e "${YELLOW}[Content Consistency Tests]${NC}"

BOT_HTML=$(curl -s -A 'Googlebot' https://$DOMAIN/)
USER_HTML=$(curl -s -A 'Mozilla' https://$DOMAIN/)

BOT_TITLE=$(echo "$BOT_HTML" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')
USER_TITLE=$(echo "$USER_HTML" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')

if [ "$BOT_TITLE" == "$USER_TITLE" ]; then
  echo -e "Testing: Bot and user have same title... ${GREEN}✓ PASS${NC}"
  ((PASS++))
else
  echo -e "Testing: Bot and user have same title... ${RED}✗ FAIL${NC}"
  echo "  Bot title: $BOT_TITLE"
  echo "  User title: $USER_TITLE"
  ((FAIL++))
fi

echo ""

# 7. Test Cache Headers
echo -e "${YELLOW}[Cache Header Tests]${NC}"
test "Sitemap has cache header" "curl -sI https://$DOMAIN/sitemap.xml | grep -i 'cache-control'" "Cache-Control"
test "robots.txt has cache header" "curl -sI https://$DOMAIN/robots.txt | grep -i 'cache-control'" "Cache-Control"

echo ""

# Summary
echo "=========================================="
echo -e "${YELLOW}Test Summary${NC}"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Please review the output above.${NC}"
  exit 1
fi
