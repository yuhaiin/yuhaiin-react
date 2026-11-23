// Command topology-demo generates controlled, labelled test traffic for the
// Network Topology page. It only talks to the hosts it is given (the demo
// containers started by run.sh) and never to the internet.
//
//	topology-demo serve   -http :80 -udp :9000         destination server
//	topology-demo traffic -profile laptop ...          traffic through yuhaiin inbounds
//	topology-demo wgkey                                WireGuard key pair
package main

import (
	"bufio"
	"context"
	"crypto/ecdh"
	"crypto/rand"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: topology-demo serve|traffic|wgkey [flags]")
		os.Exit(2)
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	var err error
	switch os.Args[1] {
	case "serve":
		err = serve(ctx, os.Args[2:])
	case "traffic":
		err = traffic(ctx, os.Args[2:])
	case "wgkey":
		err = wgkey()
	default:
		err = fmt.Errorf("unknown command %q", os.Args[1])
	}
	if err != nil && !errors.Is(err, context.Canceled) {
		log.Fatal(err)
	}
}

func wgkey() error {
	key, err := ecdh.X25519().GenerateKey(rand.Reader)
	if err != nil {
		return err
	}
	fmt.Printf("%s %s\n", base64.StdEncoding.EncodeToString(key.Bytes()), base64.StdEncoding.EncodeToString(key.PublicKey().Bytes()))
	return nil
}

// ---- destination server -------------------------------------------------

var payload = func() []byte {
	b := make([]byte, 64*1024)
	_, _ = rand.Read(b)
	return b
}()

// pace sleeps so that `done` bytes since `start` do not exceed `rate` bytes/s.
func pace(start time.Time, done, rate int64) {
	if rate <= 0 {
		return
	}
	due := start.Add(time.Duration(float64(done) / float64(rate) * float64(time.Second)))
	if wait := time.Until(due); wait > 0 {
		time.Sleep(wait)
	}
}

func serve(ctx context.Context, args []string) error {
	fs := flag.NewFlagSet("serve", flag.ExitOnError)
	httpAddr := fs.String("http", ":80", "HTTP listen address")
	udpAddr := fs.String("udp", ":9000", "UDP echo listen address")
	dnsAddr := fs.String("dns", "", "authoritative DNS listen address (optional)")
	zone := fs.String("zone", "", "DNS records: name=address,... (A or AAAA by address family)")
	_ = fs.Parse(args)
	if *dnsAddr != "" {
		records, err := parseZone(*zone)
		if err != nil {
			return err
		}
		dns, err := net.ListenPacket("udp", *dnsAddr)
		if err != nil {
			return err
		}
		go answerDNS(dns, records)
		go func() { <-ctx.Done(); _ = dns.Close() }()
	}

	mux := http.NewServeMux()
	// GET /stream?rate=BYTES_PER_SECOND&seconds=N: paced download.
	mux.HandleFunc("/stream", func(w http.ResponseWriter, r *http.Request) {
		rate, _ := strconv.ParseInt(r.URL.Query().Get("rate"), 10, 64)
		seconds, _ := strconv.ParseFloat(r.URL.Query().Get("seconds"), 64)
		w.Header().Set("Content-Type", "application/octet-stream")
		start := time.Now()
		var sent int64
		for time.Since(start).Seconds() < seconds {
			chunk := payload[:min(int64(len(payload)), max(1024, rate/20))]
			n, err := w.Write(chunk)
			if err != nil {
				return
			}
			sent += int64(n)
			pace(start, sent, rate)
		}
	})
	// POST /sink: reads the body (the client paces the upload).
	mux.HandleFunc("/sink", func(w http.ResponseWriter, r *http.Request) {
		n, _ := io.Copy(io.Discard, r.Body)
		fmt.Fprintf(w, "%d\n", n)
	})
	// GET /small: a short API-like response.
	mux.HandleFunc("/small", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"host":%q,"ok":true,"padding":%q}`+"\n", r.Host, strings.Repeat("x", 2048))
	})
	server := &http.Server{Addr: *httpAddr, Handler: mux, ReadHeaderTimeout: 10 * time.Second}

	udp, err := net.ListenPacket("udp", *udpAddr)
	if err != nil {
		return err
	}
	go func() {
		buf := make([]byte, 65535)
		for {
			n, addr, err := udp.ReadFrom(buf)
			if err != nil {
				return
			}
			_, _ = udp.WriteTo(buf[:n], addr)
		}
	}()
	go func() {
		<-ctx.Done()
		_ = server.Close()
		_ = udp.Close()
	}()
	log.Printf("serving http %s udp %s", *httpAddr, *udpAddr)
	err = server.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		return ctx.Err()
	}
	return err
}

// ---- authoritative DNS for *.demo.internal --------------------------------

func parseZone(text string) (map[string][]net.IP, error) {
	records := map[string][]net.IP{}
	for _, entry := range strings.Split(text, ",") {
		if entry == "" {
			continue
		}
		name, address, ok := strings.Cut(entry, "=")
		ip := net.ParseIP(address)
		if !ok || ip == nil {
			return nil, fmt.Errorf("bad zone entry %q", entry)
		}
		key := strings.ToLower(strings.TrimSuffix(name, "."))
		records[key] = append(records[key], ip)
	}
	return records, nil
}

// answerDNS answers A/AAAA questions for the zone and NXDOMAIN for anything else.
func answerDNS(conn net.PacketConn, records map[string][]net.IP) {
	buf := make([]byte, 1500)
	for {
		n, addr, err := conn.ReadFrom(buf)
		if err != nil {
			return
		}
		if n < 12 {
			continue
		}
		query := buf[:n]
		var labels []string
		offset := 12
		for offset < n && query[offset] != 0 {
			size := int(query[offset])
			if offset+1+size > n {
				break
			}
			labels = append(labels, string(query[offset+1:offset+1+size]))
			offset += size + 1
		}
		offset++
		if offset+4 > n {
			continue
		}
		qtype := binary.BigEndian.Uint16(query[offset : offset+2])
		question := query[12 : offset+4]
		name := strings.ToLower(strings.Join(labels, "."))
		ips, known := records[name]
		if !known {
			if _, parent, ok := strings.Cut(name, "."); ok {
				ips, known = records["*."+parent]
			}
		}
		var answers [][]byte
		for _, ip := range ips {
			if v4 := ip.To4(); v4 != nil && qtype == 1 {
				answers = append(answers, v4)
			} else if v4 == nil && qtype == 28 {
				answers = append(answers, ip.To16())
			}
		}
		flags := uint16(0x8400) // response, authoritative
		if !known {
			flags |= 3 // NXDOMAIN
		}
		reply := append([]byte{}, query[0:2]...)
		reply = binary.BigEndian.AppendUint16(reply, flags|uint16(query[2]&1)<<8)
		reply = append(reply, 0, 1)
		reply = binary.BigEndian.AppendUint16(reply, uint16(len(answers)))
		reply = append(reply, 0, 0, 0, 0)
		reply = append(reply, question...)
		for _, data := range answers {
			reply = append(reply, 0xc0, 12)
			reply = binary.BigEndian.AppendUint16(reply, qtype)
			reply = append(reply, 0, 1, 0, 0, 0, 30)
			reply = binary.BigEndian.AppendUint16(reply, uint16(len(data)))
			reply = append(reply, data...)
		}
		_, _ = conn.WriteTo(reply, addr)
	}
}

// ---- proxy clients --------------------------------------------------------

type dialer interface {
	Dial(ctx context.Context, target string) (net.Conn, error)
}

type socks5 struct{ server string }

func (s socks5) handshake(ctx context.Context) (net.Conn, error) {
	conn, err := (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, "tcp", s.server)
	if err != nil {
		return nil, err
	}
	if _, err = conn.Write([]byte{5, 1, 0}); err == nil {
		reply := make([]byte, 2)
		if _, err = io.ReadFull(conn, reply); err == nil && reply[1] != 0 {
			err = fmt.Errorf("socks5 auth method %d", reply[1])
		}
	}
	if err != nil {
		conn.Close()
		return nil, err
	}
	return conn, nil
}

func socksAddress(target string) ([]byte, error) {
	host, portText, err := net.SplitHostPort(target)
	if err != nil {
		return nil, err
	}
	port, err := strconv.Atoi(portText)
	if err != nil {
		return nil, err
	}
	var out []byte
	if ip := net.ParseIP(host); ip != nil && ip.To4() != nil {
		out = append([]byte{1}, ip.To4()...)
	} else if ip != nil {
		out = append([]byte{4}, ip.To16()...)
	} else {
		out = append([]byte{3, byte(len(host))}, host...)
	}
	return binary.BigEndian.AppendUint16(out, uint16(port)), nil
}

func readSocksReply(conn net.Conn) (net.Addr, error) {
	head := make([]byte, 4)
	if _, err := io.ReadFull(conn, head); err != nil {
		return nil, err
	}
	if head[1] != 0 {
		return nil, fmt.Errorf("socks5 reply %d", head[1])
	}
	var host []byte
	switch head[3] {
	case 1:
		host = make([]byte, 4)
	case 4:
		host = make([]byte, 16)
	case 3:
		size := make([]byte, 1)
		if _, err := io.ReadFull(conn, size); err != nil {
			return nil, err
		}
		host = make([]byte, size[0])
	}
	port := make([]byte, 2)
	if _, err := io.ReadFull(conn, host); err != nil {
		return nil, err
	}
	if _, err := io.ReadFull(conn, port); err != nil {
		return nil, err
	}
	return &net.UDPAddr{IP: net.IP(host), Port: int(binary.BigEndian.Uint16(port))}, nil
}

func (s socks5) Dial(ctx context.Context, target string) (net.Conn, error) {
	conn, err := s.handshake(ctx)
	if err != nil {
		return nil, err
	}
	address, err := socksAddress(target)
	if err == nil {
		_, err = conn.Write(append([]byte{5, 1, 0}, address...))
	}
	if err == nil {
		_, err = readSocksReply(conn)
	}
	if err != nil {
		conn.Close()
		return nil, err
	}
	return conn, nil
}

// associate opens a UDP ASSOCIATE session; packets go to the relay with a SOCKS header.
func (s socks5) associate(ctx context.Context) (control net.Conn, relay *net.UDPConn, relayAddr *net.UDPAddr, err error) {
	control, err = s.handshake(ctx)
	if err != nil {
		return nil, nil, nil, err
	}
	if _, err = control.Write([]byte{5, 3, 0, 1, 0, 0, 0, 0, 0, 0}); err != nil {
		control.Close()
		return nil, nil, nil, err
	}
	bound, err := readSocksReply(control)
	if err != nil {
		control.Close()
		return nil, nil, nil, err
	}
	relayAddr = bound.(*net.UDPAddr)
	if relayAddr.IP.IsUnspecified() {
		host, _, _ := net.SplitHostPort(s.server)
		relayAddr.IP = net.ParseIP(host)
	}
	relay, err = net.ListenUDP("udp", nil)
	if err != nil {
		control.Close()
		return nil, nil, nil, err
	}
	return control, relay, relayAddr, nil
}

type httpProxy struct{ server string }

func (h httpProxy) Dial(ctx context.Context, target string) (net.Conn, error) {
	conn, err := (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, "tcp", h.server)
	if err != nil {
		return nil, err
	}
	fmt.Fprintf(conn, "CONNECT %s HTTP/1.1\r\nHost: %s\r\n\r\n", target, target)
	reader := bufio.NewReader(conn)
	response, err := http.ReadResponse(reader, &http.Request{Method: http.MethodConnect})
	if err == nil && response.StatusCode != http.StatusOK {
		err = fmt.Errorf("CONNECT %s: %s", target, response.Status)
	}
	if err != nil {
		conn.Close()
		return nil, err
	}
	return conn, nil
}

// ---- traffic primitives ---------------------------------------------------

func request(ctx context.Context, d dialer, target, path string, body io.Reader, length int64) (int64, error) {
	conn, err := d.Dial(ctx, target)
	if err != nil {
		return 0, err
	}
	defer conn.Close()
	stop := context.AfterFunc(ctx, func() { conn.Close() })
	defer stop()
	host, _, _ := net.SplitHostPort(target)
	method := "GET"
	if body != nil {
		method = "POST"
	}
	fmt.Fprintf(conn, "%s %s HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n", method, path, host)
	if body != nil {
		fmt.Fprintf(conn, "Content-Length: %d\r\n\r\n", length)
		if _, err := io.Copy(conn, body); err != nil {
			return 0, err
		}
	} else {
		fmt.Fprint(conn, "\r\n")
	}
	return io.Copy(io.Discard, conn)
}

// pacedReader yields `total` bytes no faster than `rate` bytes/s.
type pacedReader struct {
	start       time.Time
	rate, total int64
	done        int64
}

func (p *pacedReader) Read(b []byte) (int, error) {
	if p.done >= p.total {
		return 0, io.EOF
	}
	n := min(int64(len(b)), p.total-p.done, max(1024, p.rate/20))
	copy(b[:n], payload)
	p.done += n
	pace(p.start, p.done, p.rate)
	return int(n), nil
}

func download(ctx context.Context, d dialer, target string, rate int64, seconds int) {
	_, err := request(ctx, d, target, fmt.Sprintf("/stream?rate=%d&seconds=%d", rate, seconds), nil, 0)
	report("download", target, err)
}

func upload(ctx context.Context, d dialer, target string, rate int64, seconds int) {
	total := rate * int64(seconds)
	_, err := request(ctx, d, target, "/sink", &pacedReader{start: time.Now(), rate: rate, total: total}, total)
	report("upload", target, err)
}

func small(ctx context.Context, d dialer, target string) {
	_, err := request(ctx, d, target, "/small", nil, 0)
	report("request", target, err)
}

func report(kind, target string, err error) {
	if err != nil && !errors.Is(err, context.Canceled) && !errors.Is(err, net.ErrClosed) {
		log.Printf("%s %s: %v", kind, target, err)
	}
}

// udpTelemetry sends `pps` datagrams of `size` bytes per second through SOCKS5 UDP.
func udpTelemetry(ctx context.Context, s socks5, target string, pps, size int, seconds int) {
	control, relay, relayAddr, err := s.associate(ctx)
	if err != nil {
		report("udp", target, err)
		return
	}
	defer control.Close()
	defer relay.Close()
	address, err := socksAddress(target)
	if err != nil {
		report("udp", target, err)
		return
	}
	packet := append(append([]byte{0, 0, 0}, address...), payload[:size]...)
	go func() {
		buf := make([]byte, 65535)
		for {
			if _, err := relay.Read(buf); err != nil {
				return
			}
		}
	}()
	ticker := time.NewTicker(time.Second / time.Duration(pps))
	defer ticker.Stop()
	deadline := time.After(time.Duration(seconds) * time.Second)
	for {
		select {
		case <-ctx.Done():
			return
		case <-deadline:
			return
		case <-ticker.C:
			if _, err := relay.WriteToUDP(packet, relayAddr); err != nil {
				report("udp", target, err)
				return
			}
		}
	}
}

// dnsQuery sends one A query and returns the first A record.
func dnsQuery(server, name string) (net.IP, error) {
	conn, err := net.DialTimeout("udp", server, 3*time.Second)
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(3 * time.Second))
	id := make([]byte, 2)
	_, _ = rand.Read(id)
	query := append(id, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0)
	for _, label := range strings.Split(strings.TrimSuffix(name, "."), ".") {
		query = append(append(query, byte(len(label))), label...)
	}
	query = append(query, 0, 0, 1, 0, 1)
	if _, err := conn.Write(query); err != nil {
		return nil, err
	}
	answer := make([]byte, 1500)
	n, err := conn.Read(answer)
	if err != nil {
		return nil, err
	}
	answer = answer[:n]
	// Skip the header and question, then look for the first A record.
	offset := len(query)
	for count := binary.BigEndian.Uint16(answer[6:8]); count > 0 && offset < len(answer); count-- {
		if answer[offset]&0xc0 == 0xc0 {
			offset += 2
		} else {
			for offset < len(answer) && answer[offset] != 0 {
				offset += int(answer[offset]) + 1
			}
			offset++
		}
		if offset+10 > len(answer) {
			break
		}
		kind := binary.BigEndian.Uint16(answer[offset : offset+2])
		size := int(binary.BigEndian.Uint16(answer[offset+8 : offset+10]))
		offset += 10
		if kind == 1 && size == 4 && offset+4 <= len(answer) {
			return net.IP(answer[offset : offset+4]), nil
		}
		offset += size
	}
	return nil, fmt.Errorf("no A record for %s", name)
}

// ---- scenarios ------------------------------------------------------------

type phase struct {
	name    string
	seconds int
	run     func(ctx context.Context, seconds int)
}

func traffic(ctx context.Context, args []string) error {
	fs := flag.NewFlagSet("traffic", flag.ExitOnError)
	profile := fs.String("profile", "laptop", "laptop, phone or local")
	socksAddr := fs.String("socks", "", "SOCKS5 inbound host:port")
	httpAddr := fs.String("http", "", "HTTP proxy inbound host:port")
	mixedAddr := fs.String("mixed", "", "mixed inbound host:port")
	dnsAddr := fs.String("dns", "", "DNS server host:port")
	once := fs.Bool("once", false, "run the cycle once instead of looping")
	count := fs.Int("count", 100, "load profile: concurrent connections")
	direction := fs.String("direction", "down", "flow profile: down, up or both")
	rate := fs.Int64("rate", 4<<20, "flow profile: bytes per second in each direction")
	target := fs.String("target", "cdn.demo.internal:80", "flow profile: destination")
	_ = fs.Parse(args)
	switch *profile {
	case "load":
		// -socks and -http may list several inbounds; connections rotate over all of them.
		var dialers []dialer
		for _, address := range strings.Split(*socksAddr, ",") {
			if address != "" {
				dialers = append(dialers, socks5{address})
			}
		}
		for _, address := range strings.Split(*httpAddr, ",") {
			if address != "" {
				dialers = append(dialers, httpProxy{address})
			}
		}
		return load(ctx, dialers, *count)
	case "flow":
		// One steady flow until stopped: a fixed scene for screenshots.
		log.Printf("[flow] %s %d B/s to %s", *direction, *rate, *target)
		s := socks5{*socksAddr}
		for ctx.Err() == nil {
			switch *direction {
			case "up":
				upload(ctx, s, *target, *rate, 600)
			case "both":
				parallel(func() { download(ctx, s, *target, *rate, 600) }, func() { upload(ctx, s, *target, *rate, 600) })
			default:
				download(ctx, s, *target, *rate, 600)
			}
		}
		return ctx.Err()
	}

	s := socks5{*socksAddr}
	h := httpProxy{*httpAddr}
	m := socks5{*mixedAddr}
	var phases []phase
	background := func(ctx context.Context) {}

	switch *profile {
	case "laptop":
		// Short API calls through the selector: connections open and close continuously.
		background = func(ctx context.Context) {
			every(ctx, 1500*time.Millisecond, func() { go small(ctx, s, "api.demo.internal:80") })
		}
		phases = []phase{
			{"cdn 600 KB/s download (direct)", 30, func(ctx context.Context, n int) {
				download(ctx, s, "cdn.demo.internal:80", 600<<10, n)
			}},
			{"cdn 4 MB/s download + 1 MB/s upload to files", 30, func(ctx context.Context, n int) {
				parallel(
					func() { download(ctx, s, "cdn.demo.internal:80", 4<<20, n) },
					func() { upload(ctx, s, "files.demo.internal:80", 1<<20, n) })
			}},
			{"UDP telemetry 60 pkt/s + light downloads", 30, func(ctx context.Context, n int) {
				parallel(
					func() { udpTelemetry(ctx, s, "metrics.demo.internal:9000", 60, 1200, n) },
					func() { download(ctx, s, "cdn.demo.internal:80", 150<<10, n) })
			}},
			{"quiet: API calls only", 30, func(ctx context.Context, n int) { sleep(ctx, n) }},
		}
	case "phone":
		media := func() string {
			// Resolve through yuhaiin's DNS server: with FakeDNS this is a FakeIP.
			ip, err := dnsQuery(*dnsAddr, "media.demo.internal")
			if err != nil {
				report("dns", "media.demo.internal", err)
				return "media.demo.internal:80"
			}
			return net.JoinHostPort(ip.String(), "80")
		}
		background = func(ctx context.Context) {
			every(ctx, 4*time.Second, func() {
				for _, name := range []string{"api.demo.internal", "cdn.demo.internal", "ads.demo.internal", "files.demo.internal"} {
					_, _ = dnsQuery(*dnsAddr, name)
				}
			})
			every(ctx, 7*time.Second, func() { go small(ctx, h, "ads.demo.internal:80") })
		}
		phases = []phase{
			{"video 1.5 MB/s via WireGuard (FakeIP)", 30, func(ctx context.Context, n int) {
				download(ctx, h, media(), 1536<<10, n)
			}},
			{"video 6 MB/s via WireGuard + photo upload", 30, func(ctx context.Context, n int) {
				parallel(
					func() { download(ctx, h, media(), 6<<20, n) },
					func() { upload(ctx, m, "files.demo.internal:80", 512<<10, n) })
			}},
			{"several API sessions", 30, func(ctx context.Context, n int) {
				parallel(
					func() {
						every(withTimeout(ctx, n), 900*time.Millisecond, func() { go small(ctx, m, "api.demo.internal:80") })
					},
					func() { download(ctx, h, media(), 300<<10, n) })
			}},
			{"quiet", 30, func(ctx context.Context, n int) { sleep(ctx, n) }},
		}
	case "local":
		phases = []phase{
			{"IPv6 download through the mixed inbound", 45, func(ctx context.Context, n int) {
				download(ctx, m, "v6.demo.internal:80", 800<<10, n)
			}},
			{"idle", 15, func(ctx context.Context, n int) { sleep(ctx, n) }},
			{"IPv6 upload", 30, func(ctx context.Context, n int) {
				upload(ctx, m, "v6.demo.internal:80", 400<<10, n)
			}},
			{"idle", 30, func(ctx context.Context, n int) { sleep(ctx, n) }},
		}
	default:
		return fmt.Errorf("unknown profile %q", *profile)
	}

	go background(ctx)
	for {
		for _, p := range phases {
			log.Printf("[%s] %s (%ds)", *profile, p.name, p.seconds)
			phaseCtx := withTimeout(ctx, p.seconds+2)
			p.run(phaseCtx, p.seconds)
			if ctx.Err() != nil {
				return ctx.Err()
			}
		}
		if *once {
			return nil
		}
	}
}

// load keeps `count` slow, long-lived downloads open: half to distinct domains
// (direct), the rest through the selector, the SOCKS relay and the WireGuard
// node, rotating over the given inbounds. Rates of 1-4 KB/s keep every
// counter moving without saturating anything.
func load(ctx context.Context, dialers []dialer, count int) error {
	if len(dialers) == 0 {
		return errors.New("load needs at least one -socks or -http inbound")
	}
	log.Printf("[load] %d connections over %d inbounds", count, len(dialers))
	fixed := []string{"api.demo.internal", "api.demo.internal", "metrics.demo.internal", "media.demo.internal", "files.demo.internal"}
	var wg sync.WaitGroup
	for index := range count {
		var target string
		if index%10 < 5 {
			target = fmt.Sprintf("s%03d.load.demo.internal:80", index%400)
		} else {
			target = fixed[index%10-5] + ":80"
		}
		d := dialers[index%len(dialers)]
		rate := int64(1024 * (1 + index%4))
		wg.Go(func() {
			// Stagger the start so the connections arrive over ~10 s.
			select {
			case <-ctx.Done():
				return
			case <-time.After(time.Duration(index) * 10 * time.Second / time.Duration(max(count, 1))):
			}
			for ctx.Err() == nil {
				download(ctx, d, target, rate, 900)
				sleep(ctx, 1)
			}
		})
	}
	wg.Wait()
	return ctx.Err()
}

func every(ctx context.Context, interval time.Duration, f func()) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			f()
		}
	}
}

func parallel(fs ...func()) {
	var wg sync.WaitGroup
	for _, f := range fs {
		wg.Go(f)
	}
	wg.Wait()
}

func sleep(ctx context.Context, seconds int) {
	select {
	case <-ctx.Done():
	case <-time.After(time.Duration(seconds) * time.Second):
	}
}

// withTimeout bounds a phase; the cancel function is released with the parent.
func withTimeout(ctx context.Context, seconds int) context.Context {
	child, cancel := context.WithTimeout(ctx, time.Duration(seconds)*time.Second)
	context.AfterFunc(child, cancel)
	return child
}
