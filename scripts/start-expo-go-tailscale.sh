#!/usr/bin/env sh
set -eu

PORT="${EXPO_GO_PORT:-8081}"
TAILSCALE_HOSTNAME="${TAILSCALE_HOSTNAME:-openclaw.tail8c3304.ts.net}"
TAILSCALE_IP="${REACT_NATIVE_PACKAGER_HOSTNAME:-}"

if [ -z "$TAILSCALE_IP" ]; then
  if command -v tailscale >/dev/null 2>&1; then
    TAILSCALE_IP="$(tailscale ip -4 2>/dev/null | head -n 1 || true)"
  fi
fi

if [ -z "$TAILSCALE_IP" ]; then
  echo "Could not detect Tailscale IPv4 address. Set REACT_NATIVE_PACKAGER_HOSTNAME manually." >&2
  exit 1
fi

export NODE_ENV=development
export REACT_NATIVE_PACKAGER_HOSTNAME="$TAILSCALE_IP"
export EXPO_PUBLIC_API_ORIGIN="${EXPO_PUBLIC_API_ORIGIN:-https://$TAILSCALE_HOSTNAME}"
export EXPO_PUBLIC_API_BASE_PATH="${EXPO_PUBLIC_API_BASE_PATH:-/api/garden-roof-deck/}"
export EXPO_PUBLIC_BASE_PATH="${EXPO_PUBLIC_BASE_PATH:-/apps/garden-roof-deck/}"

printf 'Garden Roof Deck Expo Go: exp://%s:%s\n' "$TAILSCALE_IP" "$PORT"
printf 'Garden API health: %s%shealth\n' "$EXPO_PUBLIC_API_ORIGIN" "$EXPO_PUBLIC_API_BASE_PATH"
printf 'Native API origin: %s\n' "$EXPO_PUBLIC_API_ORIGIN"

exec npx expo start --lan --go --port "$PORT" --clear
