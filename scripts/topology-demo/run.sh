#!/usr/bin/env bash
# Controlled demo environment for the Network Topology page.
#
#   scripts/topology-demo/run.sh up        build, start and configure everything
#   scripts/topology-demo/run.sh traffic   start the traffic generators
#   scripts/topology-demo/run.sh load N    add N long-lived connections (0 stops them)
#   scripts/topology-demo/run.sh flow down|up|both RATE   one steady flow (no argument stops it)
#   scripts/topology-demo/run.sh down      remove all demo containers and the network
#
# Everything runs in rootless Podman on a private network (10.89.77.0/24,
# fd77:89:77::/64); nothing on the host changes and no traffic leaves it.
#
#   core       10.89.77.10  yuhaiin under test (this UI, served with -eweb)
#                           inbounds: SOCKS5 :1080, HTTP :8080, mixed 127.0.0.1:7890, DNS :5353
#                           https://127.0.0.1:50071
#   upstream   10.89.77.20  a second yuhaiin: SOCKS5/HTTP relay and WireGuard server
#   web-a/b/c  10.89.77.31-33 (+ fd77:89:77::33)  HTTP stream/sink and UDP echo servers
#   laptop     10.89.77.50  traffic through the SOCKS5 inbound
#   phone      10.89.77.51  traffic through the HTTP inbound, DNS with FakeIP
#
# Demo domains (*.demo.internal) are answered by a small DNS server on web-a,
# which both cores use as their only resolver.
# Requires podman, go and node. YUHAIIN_SRC points at a yuhaiin checkout
# (default: ../yuhaiin next to this repository).
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)
YUHAIIN_SRC=${YUHAIIN_SRC:-$ROOT/../yuhaiin}
WORK=${TOPOLOGY_DEMO_WORK:-${TMPDIR:-/tmp}/yuhaiin-topology-demo}
IMAGE=localhost/yuhaiin-topology-demo:1
NET=yuhaiin-topology-demo
P=topo

log() { printf '\033[1m==> %s\033[0m\n' "$*"; }

down() {
	podman rm -f -t 2 $P-core $P-upstream $P-web-a $P-web-b $P-web-c $P-laptop $P-phone $P-load $P-flow >/dev/null 2>&1 || true
	podman network rm -f $NET >/dev/null 2>&1 || true
}

build() {
	# Every run starts from empty cores; state.json (codes, password, keys) is kept.
	rm -rf "$WORK/core" "$WORK/upstream"
	mkdir -p "$WORK/bin" "$WORK/core" "$WORK/upstream"
	log "build yuhaiin from $YUHAIIN_SRC"
	local tags
	tags="$(cd "$YUHAIIN_SRC" && go run ./cmd/buildtags/...),stdlibjson,fts5"
	(cd "$YUHAIIN_SRC" && CGO_ENABLED=0 GOOS=linux go build -trimpath -tags="$tags" -o "$WORK/bin/yuhaiin" ./cmd/yuhaiin)
	log "build traffic tool"
	(cd "$HERE" && CGO_ENABLED=0 go build -o "$WORK/bin/topology-demo" .)
	log "build web UI"
	(cd "$ROOT" && npm run -s build -- --outDir "$WORK/web" --emptyOutDir >/dev/null)
	if ! podman image exists $IMAGE; then
		log "prepare image"
		# The core loads SQLite through purego, so it needs glibc and libsqlite3.
		printf 'FROM docker.io/library/debian:trixie-slim\nRUN apt-get update && apt-get install -y --no-install-recommends libsqlite3-0 ca-certificates && rm -rf /var/lib/apt/lists/*\n' |
			podman build -q -t $IMAGE -f - "$WORK" >/dev/null
	fi
}

state() {
	[ -f "$WORK/state.json" ] && return
	local code_core code_upstream password core upstream
	code_core="ys_$(head -c 32 /dev/urandom | base64 | tr '+/' '-_' | tr -d '=\n')"
	code_upstream="ys_$(head -c 32 /dev/urandom | base64 | tr '+/' '-_' | tr -d '=\n')"
	password="$(head -c 18 /dev/urandom | base64 | tr '+/' '-_' | tr -d '=\n')"
	read -r core_priv core_pub < <("$WORK/bin/topology-demo" wgkey)
	read -r up_priv up_pub < <("$WORK/bin/topology-demo" wgkey)
	umask 077
	cat >"$WORK/state.json" <<EOF
{"password":"$password","core":{"code":"$code_core"},"upstream":{"code":"$code_upstream"},
 "wg":{"core":{"private":"$core_priv","public":"$core_pub"},"upstream":{"private":"$up_priv","public":"$up_pub"}}}
EOF
}

code() { node -e "console.log(JSON.parse(require('fs').readFileSync('$WORK/state.json','utf8')).$1.code)"; }

wait_api() {
	for _ in $(seq 1 60); do
		curl -ksf "$1/api/v2/management" >/dev/null && return 0
		sleep 0.5
	done
	echo "controller $1 did not start" >&2
	return 1
}

up() {
	down
	build
	state
	log "start containers"
	podman network create --subnet 10.89.77.0/24 --ipv6 --subnet fd77:89:77::/64 $NET >/dev/null
	local run=(podman run -d --network $NET -v "$WORK/bin:/demo:ro,z")
	local zone=api.demo.internal=10.89.77.31,files.demo.internal=10.89.77.31,cdn.demo.internal=10.89.77.32
	zone+=,metrics.demo.internal=10.89.77.32,media.demo.internal=10.89.77.33,ads.demo.internal=10.89.77.33,v6.demo.internal=fd77:89:77::33
	zone+=,*.load.demo.internal=10.89.77.32
	for site in a:31 b:32 c:33; do
		local dns=()
		[ "${site%%:*}" = a ] && dns=(-dns :53 -zone "$zone")
		"${run[@]}" --name $P-web-${site%%:*} --ip 10.89.77.${site##*:} --ip6 fd77:89:77::${site##*:} $IMAGE \
			/demo/topology-demo serve -http :80 -udp :9000 "${dns[@]}" >/dev/null
	done
	"${run[@]}" --name $P-upstream --ip 10.89.77.20 -p 127.0.0.1:50072:50051 -v "$WORK/upstream:/data:z" \
		-e YUHAIIN_INITIALIZATION_CODE="$(code upstream)" $IMAGE /demo/yuhaiin -path /data -host 0.0.0.0:50051 >/dev/null
	"${run[@]}" --name $P-core --ip 10.89.77.10 --ip6 fd77:89:77::10 -p 127.0.0.1:50071:50051 -v "$WORK/core:/data:z" -v "$WORK/web:/web:ro,z" \
		-e YUHAIIN_INITIALIZATION_CODE="$(code core)" $IMAGE /demo/yuhaiin -path /data -host 0.0.0.0:50051 -eweb /web >/dev/null
	wait_api https://127.0.0.1:50072
	wait_api https://127.0.0.1:50071
	log "configure"
	node "$HERE/configure.mjs" upstream https://127.0.0.1:50072 "$WORK/state.json"
	node "$HERE/configure.mjs" core https://127.0.0.1:50071 "$WORK/state.json"
	log "ready: https://127.0.0.1:50071  (login demo-admin, password in $WORK/state.json)"
}

traffic() {
	podman rm -f $P-laptop $P-phone >/dev/null 2>&1 || true
	podman run -d --network $NET --name $P-laptop --ip 10.89.77.50 -v "$WORK/bin:/demo:ro,z" $IMAGE \
		/demo/topology-demo traffic -profile laptop -socks 10.89.77.10:1080 >/dev/null
	podman run -d --network $NET --name $P-phone --ip 10.89.77.51 -v "$WORK/bin:/demo:ro,z" $IMAGE \
		/demo/topology-demo traffic -profile phone -http 10.89.77.10:8080 -mixed 10.89.77.10:1080 -dns 10.89.77.10:5353 >/dev/null
	podman exec -d $P-core /demo/topology-demo traffic -profile local -mixed 127.0.0.1:7890
	log "traffic running (podman logs -f $P-laptop | $P-phone)"
}

# load N: N extra long-lived connections from a third client, for performance runs.
load() {
	podman rm -f $P-load >/dev/null 2>&1 || true
	[ "${1:-0}" -gt 0 ] || return 0
	podman run -d --network $NET --name $P-load --ip 10.89.77.60 -v "$WORK/bin:/demo:ro,z" $IMAGE \
		/demo/topology-demo traffic -profile load -count "$1" -socks 10.89.77.10:1080 -http 10.89.77.10:8080 >/dev/null
	log "load: $1 connections from 10.89.77.60"
}

# flow down|up|both RATE: one steady flow from 10.89.77.70 to cdn (direct), for fixed scenes.
flow() {
	podman rm -f $P-flow >/dev/null 2>&1 || true
	[ -n "${1:-}" ] || return 0
	podman run -d --network $NET --name $P-flow --ip 10.89.77.70 -v "$WORK/bin:/demo:ro,z" $IMAGE \
		/demo/topology-demo traffic -profile flow -direction "$1" -rate "${2:-4194304}" -socks 10.89.77.10:1080 >/dev/null
	log "flow: $1 ${2:-4194304} B/s from 10.89.77.70"
}

case "${1:-up}" in
	up) up ;;
	traffic) traffic ;;
	load) load "${2:-0}" ;;
	flow) flow "${2:-}" "${3:-}" ;;
	down) down ;;
	*) echo "usage: $0 up|traffic|load N|flow DIR RATE|down" >&2; exit 2 ;;
esac
