import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace yuhaiin. */
export namespace yuhaiin {

    /** Namespace config. */
    namespace config {

        /** Properties of a setting. */
        interface Isetting {

            /** setting ipv6 */
            ipv6?: (boolean|null);

            /** setting net_interface */
            net_interface?: (string|null);

            /** setting system_proxy */
            system_proxy?: (yuhaiin.config.Isystem_proxy|null);

            /** setting bypass */
            bypass?: (yuhaiin.bypass.Ibypass_config|null);

            /** setting dns */
            dns?: (yuhaiin.dns.Idns_config|null);

            /** setting server */
            server?: (yuhaiin.listener.Iinbound_config|null);

            /** setting logcat */
            logcat?: (yuhaiin.log.Ilogcat|null);
        }

        /** Represents a setting. */
        class setting implements Isetting {

            /**
             * Constructs a new setting.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.config.Isetting);

            /** setting ipv6. */
            public ipv6: boolean;

            /** setting net_interface. */
            public net_interface: string;

            /** setting system_proxy. */
            public system_proxy?: (yuhaiin.config.Isystem_proxy|null);

            /** setting bypass. */
            public bypass?: (yuhaiin.bypass.Ibypass_config|null);

            /** setting dns. */
            public dns?: (yuhaiin.dns.Idns_config|null);

            /** setting server. */
            public server?: (yuhaiin.listener.Iinbound_config|null);

            /** setting logcat. */
            public logcat?: (yuhaiin.log.Ilogcat|null);

            /**
             * Creates a new setting instance using the specified properties.
             * @param [properties] Properties to set
             * @returns setting instance
             */
            public static create(properties?: yuhaiin.config.Isetting): yuhaiin.config.setting;

            /**
             * Encodes the specified setting message. Does not implicitly {@link yuhaiin.config.setting.verify|verify} messages.
             * @param m setting message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.config.Isetting, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a setting message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns setting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.config.setting;

            /**
             * Creates a setting message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns setting
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.config.setting;

            /**
             * Creates a plain object from a setting message. Also converts values to other types if specified.
             * @param m setting
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.config.setting, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this setting to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a system_proxy. */
        interface Isystem_proxy {

            /** system_proxy http */
            http?: (boolean|null);

            /** system_proxy socks5 */
            socks5?: (boolean|null);
        }

        /** Represents a system_proxy. */
        class system_proxy implements Isystem_proxy {

            /**
             * Constructs a new system_proxy.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.config.Isystem_proxy);

            /** system_proxy http. */
            public http: boolean;

            /** system_proxy socks5. */
            public socks5: boolean;

            /**
             * Creates a new system_proxy instance using the specified properties.
             * @param [properties] Properties to set
             * @returns system_proxy instance
             */
            public static create(properties?: yuhaiin.config.Isystem_proxy): yuhaiin.config.system_proxy;

            /**
             * Encodes the specified system_proxy message. Does not implicitly {@link yuhaiin.config.system_proxy.verify|verify} messages.
             * @param m system_proxy message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.config.Isystem_proxy, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a system_proxy message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns system_proxy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.config.system_proxy;

            /**
             * Creates a system_proxy message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns system_proxy
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.config.system_proxy;

            /**
             * Creates a plain object from a system_proxy message. Also converts values to other types if specified.
             * @param m system_proxy
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.config.system_proxy, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this system_proxy to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace log. */
    namespace log {

        /** log_level enum. */
        enum log_level {
            verbose = 0,
            debug = 1,
            info = 2,
            warning = 3,
            error = 4,
            fatal = 5
        }

        /** Properties of a logcat. */
        interface Ilogcat {

            /** logcat level */
            level?: (yuhaiin.log.log_level|null);

            /** logcat save */
            save?: (boolean|null);
        }

        /** Represents a logcat. */
        class logcat implements Ilogcat {

            /**
             * Constructs a new logcat.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.log.Ilogcat);

            /** logcat level. */
            public level: yuhaiin.log.log_level;

            /** logcat save. */
            public save: boolean;

            /**
             * Creates a new logcat instance using the specified properties.
             * @param [properties] Properties to set
             * @returns logcat instance
             */
            public static create(properties?: yuhaiin.log.Ilogcat): yuhaiin.log.logcat;

            /**
             * Encodes the specified logcat message. Does not implicitly {@link yuhaiin.log.logcat.verify|verify} messages.
             * @param m logcat message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.log.Ilogcat, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a logcat message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns logcat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.log.logcat;

            /**
             * Creates a logcat message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns logcat
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.log.logcat;

            /**
             * Creates a plain object from a logcat message. Also converts values to other types if specified.
             * @param m logcat
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.log.logcat, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this logcat to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace bypass. */
    namespace bypass {

        /** mode enum. */
        enum mode {
            bypass = 0,
            direct = 1,
            proxy = 2,
            block = 3
        }

        /** Properties of a bypass_config. */
        interface Ibypass_config {

            /** bypass_config tcp */
            tcp?: (yuhaiin.bypass.mode|null);

            /** bypass_config udp */
            udp?: (yuhaiin.bypass.mode|null);

            /** bypass_config bypass_file */
            bypass_file?: (string|null);

            /** bypass_config custom_rule_v3 */
            custom_rule_v3?: (yuhaiin.bypass.Imode_config[]|null);
        }

        /** Represents a bypass_config. */
        class bypass_config implements Ibypass_config {

            /**
             * Constructs a new bypass_config.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.bypass.Ibypass_config);

            /** bypass_config tcp. */
            public tcp: yuhaiin.bypass.mode;

            /** bypass_config udp. */
            public udp: yuhaiin.bypass.mode;

            /** bypass_config bypass_file. */
            public bypass_file: string;

            /** bypass_config custom_rule_v3. */
            public custom_rule_v3: yuhaiin.bypass.Imode_config[];

            /**
             * Creates a new bypass_config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns bypass_config instance
             */
            public static create(properties?: yuhaiin.bypass.Ibypass_config): yuhaiin.bypass.bypass_config;

            /**
             * Encodes the specified bypass_config message. Does not implicitly {@link yuhaiin.bypass.bypass_config.verify|verify} messages.
             * @param m bypass_config message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.bypass.Ibypass_config, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a bypass_config message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns bypass_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.bypass.bypass_config;

            /**
             * Creates a bypass_config message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns bypass_config
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.bypass.bypass_config;

            /**
             * Creates a plain object from a bypass_config message. Also converts values to other types if specified.
             * @param m bypass_config
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.bypass.bypass_config, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this bypass_config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** resolve_strategy enum. */
        enum resolve_strategy {
            default = 0,
            prefer_ipv4 = 1,
            only_ipv4 = 2,
            prefer_ipv6 = 3,
            only_ipv6 = 4
        }

        /** Properties of a mode_config. */
        interface Imode_config {

            /** mode_config hostname */
            hostname?: (string[]|null);

            /** mode_config mode */
            mode?: (yuhaiin.bypass.mode|null);

            /** mode_config tag */
            tag?: (string|null);

            /** mode_config resolve_strategy */
            resolve_strategy?: (yuhaiin.bypass.resolve_strategy|null);
        }

        /** Represents a mode_config. */
        class mode_config implements Imode_config {

            /**
             * Constructs a new mode_config.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.bypass.Imode_config);

            /** mode_config hostname. */
            public hostname: string[];

            /** mode_config mode. */
            public mode: yuhaiin.bypass.mode;

            /** mode_config tag. */
            public tag: string;

            /** mode_config resolve_strategy. */
            public resolve_strategy: yuhaiin.bypass.resolve_strategy;

            /**
             * Creates a new mode_config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns mode_config instance
             */
            public static create(properties?: yuhaiin.bypass.Imode_config): yuhaiin.bypass.mode_config;

            /**
             * Encodes the specified mode_config message. Does not implicitly {@link yuhaiin.bypass.mode_config.verify|verify} messages.
             * @param m mode_config message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.bypass.Imode_config, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a mode_config message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns mode_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.bypass.mode_config;

            /**
             * Creates a mode_config message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns mode_config
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.bypass.mode_config;

            /**
             * Creates a plain object from a mode_config message. Also converts values to other types if specified.
             * @param m mode_config
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.bypass.mode_config, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this mode_config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace dns. */
    namespace dns {

        /** type enum. */
        enum type {
            reserve = 0,
            udp = 1,
            tcp = 2,
            doh = 3,
            dot = 4,
            doq = 5,
            doh3 = 6
        }

        /** Properties of a dns. */
        interface Idns {

            /** dns host */
            host?: (string|null);

            /** dns type */
            type?: (yuhaiin.dns.type|null);

            /** dns subnet */
            subnet?: (string|null);

            /** dns tls_servername */
            tls_servername?: (string|null);
        }

        /** Represents a dns. */
        class dns implements Idns {

            /**
             * Constructs a new dns.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.dns.Idns);

            /** dns host. */
            public host: string;

            /** dns type. */
            public type: yuhaiin.dns.type;

            /** dns subnet. */
            public subnet: string;

            /** dns tls_servername. */
            public tls_servername: string;

            /**
             * Creates a new dns instance using the specified properties.
             * @param [properties] Properties to set
             * @returns dns instance
             */
            public static create(properties?: yuhaiin.dns.Idns): yuhaiin.dns.dns;

            /**
             * Encodes the specified dns message. Does not implicitly {@link yuhaiin.dns.dns.verify|verify} messages.
             * @param m dns message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.dns.Idns, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a dns message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns dns
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.dns.dns;

            /**
             * Creates a dns message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns dns
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.dns.dns;

            /**
             * Creates a plain object from a dns message. Also converts values to other types if specified.
             * @param m dns
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.dns.dns, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this dns to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a dns_config. */
        interface Idns_config {

            /** dns_config server */
            server?: (string|null);

            /** dns_config fakedns */
            fakedns?: (boolean|null);

            /** dns_config fakedns_ip_range */
            fakedns_ip_range?: (string|null);

            /** dns_config resolve_remote_domain */
            resolve_remote_domain?: (boolean|null);

            /** dns_config remote */
            remote?: (yuhaiin.dns.Idns|null);

            /** dns_config local */
            local?: (yuhaiin.dns.Idns|null);

            /** dns_config bootstrap */
            bootstrap?: (yuhaiin.dns.Idns|null);

            /** dns_config hosts */
            hosts?: ({ [k: string]: string }|null);
        }

        /** Represents a dns_config. */
        class dns_config implements Idns_config {

            /**
             * Constructs a new dns_config.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.dns.Idns_config);

            /** dns_config server. */
            public server: string;

            /** dns_config fakedns. */
            public fakedns: boolean;

            /** dns_config fakedns_ip_range. */
            public fakedns_ip_range: string;

            /** dns_config resolve_remote_domain. */
            public resolve_remote_domain: boolean;

            /** dns_config remote. */
            public remote?: (yuhaiin.dns.Idns|null);

            /** dns_config local. */
            public local?: (yuhaiin.dns.Idns|null);

            /** dns_config bootstrap. */
            public bootstrap?: (yuhaiin.dns.Idns|null);

            /** dns_config hosts. */
            public hosts: { [k: string]: string };

            /**
             * Creates a new dns_config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns dns_config instance
             */
            public static create(properties?: yuhaiin.dns.Idns_config): yuhaiin.dns.dns_config;

            /**
             * Encodes the specified dns_config message. Does not implicitly {@link yuhaiin.dns.dns_config.verify|verify} messages.
             * @param m dns_config message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.dns.Idns_config, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a dns_config message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns dns_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.dns.dns_config;

            /**
             * Creates a dns_config message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns dns_config
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.dns.dns_config;

            /**
             * Creates a plain object from a dns_config message. Also converts values to other types if specified.
             * @param m dns_config
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.dns.dns_config, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this dns_config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace listener. */
    namespace listener {

        /** Properties of a protocol. */
        interface Iprotocol {

            /** protocol name */
            name?: (string|null);

            /** protocol enabled */
            enabled?: (boolean|null);

            /** protocol http */
            http?: (yuhaiin.listener.Ihttp|null);

            /** protocol socks5 */
            socks5?: (yuhaiin.listener.Isocks5|null);

            /** protocol redir */
            redir?: (yuhaiin.listener.Iredir|null);

            /** protocol tun */
            tun?: (yuhaiin.listener.Itun|null);

            /** protocol yuubinsya */
            yuubinsya?: (yuhaiin.listener.Iyuubinsya|null);

            /** protocol mix */
            mix?: (yuhaiin.listener.Imixed|null);

            /** protocol socks4a */
            socks4a?: (yuhaiin.listener.Isocks4a|null);

            /** protocol tproxy */
            tproxy?: (yuhaiin.listener.Itproxy|null);
        }

        /** Represents a protocol. */
        class protocol implements Iprotocol {

            /**
             * Constructs a new protocol.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iprotocol);

            /** protocol name. */
            public name: string;

            /** protocol enabled. */
            public enabled: boolean;

            /** protocol http. */
            public http?: (yuhaiin.listener.Ihttp|null);

            /** protocol socks5. */
            public socks5?: (yuhaiin.listener.Isocks5|null);

            /** protocol redir. */
            public redir?: (yuhaiin.listener.Iredir|null);

            /** protocol tun. */
            public tun?: (yuhaiin.listener.Itun|null);

            /** protocol yuubinsya. */
            public yuubinsya?: (yuhaiin.listener.Iyuubinsya|null);

            /** protocol mix. */
            public mix?: (yuhaiin.listener.Imixed|null);

            /** protocol socks4a. */
            public socks4a?: (yuhaiin.listener.Isocks4a|null);

            /** protocol tproxy. */
            public tproxy?: (yuhaiin.listener.Itproxy|null);

            /** protocol protocol. */
            public protocol?: ("http"|"socks5"|"redir"|"tun"|"yuubinsya"|"mix"|"socks4a"|"tproxy");

            /**
             * Creates a new protocol instance using the specified properties.
             * @param [properties] Properties to set
             * @returns protocol instance
             */
            public static create(properties?: yuhaiin.listener.Iprotocol): yuhaiin.listener.protocol;

            /**
             * Encodes the specified protocol message. Does not implicitly {@link yuhaiin.listener.protocol.verify|verify} messages.
             * @param m protocol message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iprotocol, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a protocol message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns protocol
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.protocol;

            /**
             * Creates a protocol message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns protocol
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.protocol;

            /**
             * Creates a plain object from a protocol message. Also converts values to other types if specified.
             * @param m protocol
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.protocol, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this protocol to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an inbound. */
        interface Iinbound {

            /** inbound name */
            name?: (string|null);

            /** inbound enabled */
            enabled?: (boolean|null);

            /** inbound IPv6 */
            IPv6?: (boolean|null);

            /** inbound empty */
            empty?: (yuhaiin.listener.Iempty|null);

            /** inbound tcpudp */
            tcpudp?: (yuhaiin.listener.Itcpudp|null);

            /** inbound quic */
            quic?: (yuhaiin.listener.Iquic2|null);

            /** inbound transport */
            transport?: (yuhaiin.listener.Itransport[]|null);

            /** inbound http */
            http?: (yuhaiin.listener.Ihttp|null);

            /** inbound socks5 */
            socks5?: (yuhaiin.listener.Isocks5|null);

            /** inbound yuubinsya */
            yuubinsya?: (yuhaiin.listener.Iyuubinsya|null);

            /** inbound mix */
            mix?: (yuhaiin.listener.Imixed|null);

            /** inbound socks4a */
            socks4a?: (yuhaiin.listener.Isocks4a|null);

            /** inbound tproxy */
            tproxy?: (yuhaiin.listener.Itproxy|null);

            /** inbound redir */
            redir?: (yuhaiin.listener.Iredir|null);

            /** inbound tun */
            tun?: (yuhaiin.listener.Itun|null);
        }

        /** Represents an inbound. */
        class inbound implements Iinbound {

            /**
             * Constructs a new inbound.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iinbound);

            /** inbound name. */
            public name: string;

            /** inbound enabled. */
            public enabled: boolean;

            /** inbound IPv6. */
            public IPv6: boolean;

            /** inbound empty. */
            public empty?: (yuhaiin.listener.Iempty|null);

            /** inbound tcpudp. */
            public tcpudp?: (yuhaiin.listener.Itcpudp|null);

            /** inbound quic. */
            public quic?: (yuhaiin.listener.Iquic2|null);

            /** inbound transport. */
            public transport: yuhaiin.listener.Itransport[];

            /** inbound http. */
            public http?: (yuhaiin.listener.Ihttp|null);

            /** inbound socks5. */
            public socks5?: (yuhaiin.listener.Isocks5|null);

            /** inbound yuubinsya. */
            public yuubinsya?: (yuhaiin.listener.Iyuubinsya|null);

            /** inbound mix. */
            public mix?: (yuhaiin.listener.Imixed|null);

            /** inbound socks4a. */
            public socks4a?: (yuhaiin.listener.Isocks4a|null);

            /** inbound tproxy. */
            public tproxy?: (yuhaiin.listener.Itproxy|null);

            /** inbound redir. */
            public redir?: (yuhaiin.listener.Iredir|null);

            /** inbound tun. */
            public tun?: (yuhaiin.listener.Itun|null);

            /** inbound network. */
            public network?: ("empty"|"tcpudp"|"quic");

            /** inbound protocol. */
            public protocol?: ("http"|"socks5"|"yuubinsya"|"mix"|"socks4a"|"tproxy"|"redir"|"tun");

            /**
             * Creates a new inbound instance using the specified properties.
             * @param [properties] Properties to set
             * @returns inbound instance
             */
            public static create(properties?: yuhaiin.listener.Iinbound): yuhaiin.listener.inbound;

            /**
             * Encodes the specified inbound message. Does not implicitly {@link yuhaiin.listener.inbound.verify|verify} messages.
             * @param m inbound message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iinbound, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an inbound message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns inbound
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.inbound;

            /**
             * Creates an inbound message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns inbound
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.inbound;

            /**
             * Creates a plain object from an inbound message. Also converts values to other types if specified.
             * @param m inbound
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.inbound, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this inbound to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a transport. */
        interface Itransport {

            /** transport normal */
            normal?: (yuhaiin.listener.Inormal|null);

            /** transport tls */
            tls?: (yuhaiin.listener.Itls|null);

            /** transport mux */
            mux?: (yuhaiin.listener.Imux|null);

            /** transport http2 */
            http2?: (yuhaiin.listener.Ihttp2|null);

            /** transport websocket */
            websocket?: (yuhaiin.listener.Iwebsocket|null);

            /** transport grpc */
            grpc?: (yuhaiin.listener.Igrpc|null);

            /** transport reality */
            reality?: (yuhaiin.listener.Ireality|null);
        }

        /** Represents a transport. */
        class transport implements Itransport {

            /**
             * Constructs a new transport.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Itransport);

            /** transport normal. */
            public normal?: (yuhaiin.listener.Inormal|null);

            /** transport tls. */
            public tls?: (yuhaiin.listener.Itls|null);

            /** transport mux. */
            public mux?: (yuhaiin.listener.Imux|null);

            /** transport http2. */
            public http2?: (yuhaiin.listener.Ihttp2|null);

            /** transport websocket. */
            public websocket?: (yuhaiin.listener.Iwebsocket|null);

            /** transport grpc. */
            public grpc?: (yuhaiin.listener.Igrpc|null);

            /** transport reality. */
            public reality?: (yuhaiin.listener.Ireality|null);

            /** transport transport. */
            public transport?: ("normal"|"tls"|"mux"|"http2"|"websocket"|"grpc"|"reality");

            /**
             * Creates a new transport instance using the specified properties.
             * @param [properties] Properties to set
             * @returns transport instance
             */
            public static create(properties?: yuhaiin.listener.Itransport): yuhaiin.listener.transport;

            /**
             * Encodes the specified transport message. Does not implicitly {@link yuhaiin.listener.transport.verify|verify} messages.
             * @param m transport message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Itransport, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a transport message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns transport
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.transport;

            /**
             * Creates a transport message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns transport
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.transport;

            /**
             * Creates a plain object from a transport message. Also converts values to other types if specified.
             * @param m transport
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.transport, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this transport to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an empty. */
        interface Iempty {
        }

        /** Represents an empty. */
        class empty implements Iempty {

            /**
             * Constructs a new empty.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iempty);

            /**
             * Creates a new empty instance using the specified properties.
             * @param [properties] Properties to set
             * @returns empty instance
             */
            public static create(properties?: yuhaiin.listener.Iempty): yuhaiin.listener.empty;

            /**
             * Encodes the specified empty message. Does not implicitly {@link yuhaiin.listener.empty.verify|verify} messages.
             * @param m empty message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iempty, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an empty message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.empty;

            /**
             * Creates an empty message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns empty
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.empty;

            /**
             * Creates a plain object from an empty message. Also converts values to other types if specified.
             * @param m empty
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.empty, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this empty to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a mux. */
        interface Imux {
        }

        /** Represents a mux. */
        class mux implements Imux {

            /**
             * Constructs a new mux.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Imux);

            /**
             * Creates a new mux instance using the specified properties.
             * @param [properties] Properties to set
             * @returns mux instance
             */
            public static create(properties?: yuhaiin.listener.Imux): yuhaiin.listener.mux;

            /**
             * Encodes the specified mux message. Does not implicitly {@link yuhaiin.listener.mux.verify|verify} messages.
             * @param m mux message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Imux, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a mux message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns mux
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.mux;

            /**
             * Creates a mux message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns mux
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.mux;

            /**
             * Creates a plain object from a mux message. Also converts values to other types if specified.
             * @param m mux
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.mux, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this mux to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a tcpudp. */
        interface Itcpudp {

            /** tcpudp host */
            host?: (string|null);
        }

        /** Represents a tcpudp. */
        class tcpudp implements Itcpudp {

            /**
             * Constructs a new tcpudp.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Itcpudp);

            /** tcpudp host. */
            public host: string;

            /**
             * Creates a new tcpudp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns tcpudp instance
             */
            public static create(properties?: yuhaiin.listener.Itcpudp): yuhaiin.listener.tcpudp;

            /**
             * Encodes the specified tcpudp message. Does not implicitly {@link yuhaiin.listener.tcpudp.verify|verify} messages.
             * @param m tcpudp message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Itcpudp, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a tcpudp message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns tcpudp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.tcpudp;

            /**
             * Creates a tcpudp message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns tcpudp
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.tcpudp;

            /**
             * Creates a plain object from a tcpudp message. Also converts values to other types if specified.
             * @param m tcpudp
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.tcpudp, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this tcpudp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a quic2. */
        interface Iquic2 {

            /** quic2 host */
            host?: (string|null);

            /** quic2 tls */
            tls?: (yuhaiin.listener.Itls_config|null);
        }

        /** Represents a quic2. */
        class quic2 implements Iquic2 {

            /**
             * Constructs a new quic2.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iquic2);

            /** quic2 host. */
            public host: string;

            /** quic2 tls. */
            public tls?: (yuhaiin.listener.Itls_config|null);

            /**
             * Creates a new quic2 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns quic2 instance
             */
            public static create(properties?: yuhaiin.listener.Iquic2): yuhaiin.listener.quic2;

            /**
             * Encodes the specified quic2 message. Does not implicitly {@link yuhaiin.listener.quic2.verify|verify} messages.
             * @param m quic2 message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iquic2, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a quic2 message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns quic2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.quic2;

            /**
             * Creates a quic2 message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns quic2
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.quic2;

            /**
             * Creates a plain object from a quic2 message. Also converts values to other types if specified.
             * @param m quic2
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.quic2, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this quic2 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an inbound_config. */
        interface Iinbound_config {

            /** inbound_config hijack_dns */
            hijack_dns?: (boolean|null);

            /** inbound_config hijack_dns_fakeip */
            hijack_dns_fakeip?: (boolean|null);

            /** inbound_config servers */
            servers?: ({ [k: string]: yuhaiin.listener.Iprotocol }|null);

            /** inbound_config inbounds */
            inbounds?: ({ [k: string]: yuhaiin.listener.Iinbound }|null);
        }

        /** Represents an inbound_config. */
        class inbound_config implements Iinbound_config {

            /**
             * Constructs a new inbound_config.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iinbound_config);

            /** inbound_config hijack_dns. */
            public hijack_dns: boolean;

            /** inbound_config hijack_dns_fakeip. */
            public hijack_dns_fakeip: boolean;

            /** inbound_config servers. */
            public servers: { [k: string]: yuhaiin.listener.Iprotocol };

            /** inbound_config inbounds. */
            public inbounds: { [k: string]: yuhaiin.listener.Iinbound };

            /**
             * Creates a new inbound_config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns inbound_config instance
             */
            public static create(properties?: yuhaiin.listener.Iinbound_config): yuhaiin.listener.inbound_config;

            /**
             * Encodes the specified inbound_config message. Does not implicitly {@link yuhaiin.listener.inbound_config.verify|verify} messages.
             * @param m inbound_config message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iinbound_config, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an inbound_config message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns inbound_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.inbound_config;

            /**
             * Creates an inbound_config message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns inbound_config
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.inbound_config;

            /**
             * Creates a plain object from an inbound_config message. Also converts values to other types if specified.
             * @param m inbound_config
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.inbound_config, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this inbound_config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a http. */
        interface Ihttp {

            /** http host */
            host?: (string|null);

            /** http username */
            username?: (string|null);

            /** http password */
            password?: (string|null);
        }

        /** Represents a http. */
        class http implements Ihttp {

            /**
             * Constructs a new http.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Ihttp);

            /** http host. */
            public host: string;

            /** http username. */
            public username: string;

            /** http password. */
            public password: string;

            /**
             * Creates a new http instance using the specified properties.
             * @param [properties] Properties to set
             * @returns http instance
             */
            public static create(properties?: yuhaiin.listener.Ihttp): yuhaiin.listener.http;

            /**
             * Encodes the specified http message. Does not implicitly {@link yuhaiin.listener.http.verify|verify} messages.
             * @param m http message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Ihttp, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a http message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.http;

            /**
             * Creates a http message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns http
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.http;

            /**
             * Creates a plain object from a http message. Also converts values to other types if specified.
             * @param m http
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.http, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this http to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a socks5. */
        interface Isocks5 {

            /** socks5 host */
            host?: (string|null);

            /** socks5 username */
            username?: (string|null);

            /** socks5 password */
            password?: (string|null);

            /** socks5 udp */
            udp?: (boolean|null);
        }

        /** Represents a socks5. */
        class socks5 implements Isocks5 {

            /**
             * Constructs a new socks5.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Isocks5);

            /** socks5 host. */
            public host: string;

            /** socks5 username. */
            public username: string;

            /** socks5 password. */
            public password: string;

            /** socks5 udp. */
            public udp: boolean;

            /**
             * Creates a new socks5 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns socks5 instance
             */
            public static create(properties?: yuhaiin.listener.Isocks5): yuhaiin.listener.socks5;

            /**
             * Encodes the specified socks5 message. Does not implicitly {@link yuhaiin.listener.socks5.verify|verify} messages.
             * @param m socks5 message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Isocks5, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a socks5 message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns socks5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.socks5;

            /**
             * Creates a socks5 message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns socks5
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.socks5;

            /**
             * Creates a plain object from a socks5 message. Also converts values to other types if specified.
             * @param m socks5
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.socks5, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this socks5 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a socks4a. */
        interface Isocks4a {

            /** socks4a host */
            host?: (string|null);

            /** socks4a username */
            username?: (string|null);
        }

        /** Represents a socks4a. */
        class socks4a implements Isocks4a {

            /**
             * Constructs a new socks4a.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Isocks4a);

            /** socks4a host. */
            public host: string;

            /** socks4a username. */
            public username: string;

            /**
             * Creates a new socks4a instance using the specified properties.
             * @param [properties] Properties to set
             * @returns socks4a instance
             */
            public static create(properties?: yuhaiin.listener.Isocks4a): yuhaiin.listener.socks4a;

            /**
             * Encodes the specified socks4a message. Does not implicitly {@link yuhaiin.listener.socks4a.verify|verify} messages.
             * @param m socks4a message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Isocks4a, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a socks4a message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns socks4a
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.socks4a;

            /**
             * Creates a socks4a message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns socks4a
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.socks4a;

            /**
             * Creates a plain object from a socks4a message. Also converts values to other types if specified.
             * @param m socks4a
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.socks4a, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this socks4a to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a mixed. */
        interface Imixed {

            /** mixed host */
            host?: (string|null);

            /** mixed username */
            username?: (string|null);

            /** mixed password */
            password?: (string|null);
        }

        /** Represents a mixed. */
        class mixed implements Imixed {

            /**
             * Constructs a new mixed.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Imixed);

            /** mixed host. */
            public host: string;

            /** mixed username. */
            public username: string;

            /** mixed password. */
            public password: string;

            /**
             * Creates a new mixed instance using the specified properties.
             * @param [properties] Properties to set
             * @returns mixed instance
             */
            public static create(properties?: yuhaiin.listener.Imixed): yuhaiin.listener.any;

            /**
             * Encodes the specified mixed message. Does not implicitly {@link yuhaiin.listener.mixed.verify|verify} messages.
             * @param m mixed message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Imixed, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a mixed message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns mixed
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.any;

            /**
             * Creates a mixed message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns mixed
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.any;

            /**
             * Creates a plain object from a mixed message. Also converts values to other types if specified.
             * @param m mixed
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.any, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this mixed to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a redir. */
        interface Iredir {

            /** redir host */
            host?: (string|null);
        }

        /** Represents a redir. */
        class redir implements Iredir {

            /**
             * Constructs a new redir.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iredir);

            /** redir host. */
            public host: string;

            /**
             * Creates a new redir instance using the specified properties.
             * @param [properties] Properties to set
             * @returns redir instance
             */
            public static create(properties?: yuhaiin.listener.Iredir): yuhaiin.listener.redir;

            /**
             * Encodes the specified redir message. Does not implicitly {@link yuhaiin.listener.redir.verify|verify} messages.
             * @param m redir message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iredir, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a redir message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns redir
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.redir;

            /**
             * Creates a redir message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns redir
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.redir;

            /**
             * Creates a plain object from a redir message. Also converts values to other types if specified.
             * @param m redir
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.redir, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this redir to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a tproxy. */
        interface Itproxy {

            /** tproxy host */
            host?: (string|null);

            /** tproxy dns_hijacking */
            dns_hijacking?: (boolean|null);

            /** tproxy force_fakeip */
            force_fakeip?: (boolean|null);
        }

        /** Represents a tproxy. */
        class tproxy implements Itproxy {

            /**
             * Constructs a new tproxy.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Itproxy);

            /** tproxy host. */
            public host: string;

            /** tproxy dns_hijacking. */
            public dns_hijacking: boolean;

            /** tproxy force_fakeip. */
            public force_fakeip: boolean;

            /**
             * Creates a new tproxy instance using the specified properties.
             * @param [properties] Properties to set
             * @returns tproxy instance
             */
            public static create(properties?: yuhaiin.listener.Itproxy): yuhaiin.listener.tproxy;

            /**
             * Encodes the specified tproxy message. Does not implicitly {@link yuhaiin.listener.tproxy.verify|verify} messages.
             * @param m tproxy message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Itproxy, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a tproxy message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns tproxy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.tproxy;

            /**
             * Creates a tproxy message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns tproxy
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.tproxy;

            /**
             * Creates a plain object from a tproxy message. Also converts values to other types if specified.
             * @param m tproxy
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.tproxy, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this tproxy to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a tun. */
        interface Itun {

            /** tun name */
            name?: (string|null);

            /** tun mtu */
            mtu?: (number|null);

            /** tun gateway */
            gateway?: (string|null);

            /** tun dns_hijacking */
            dns_hijacking?: (boolean|null);

            /** tun force_fakeip */
            force_fakeip?: (boolean|null);

            /** tun skip_multicast */
            skip_multicast?: (boolean|null);

            /** tun driver */
            driver?: (yuhaiin.listener.tun.endpoint_driver|null);

            /** tun portal */
            portal?: (string|null);
        }

        /** Represents a tun. */
        class tun implements Itun {

            /**
             * Constructs a new tun.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Itun);

            /** tun name. */
            public name: string;

            /** tun mtu. */
            public mtu: number;

            /** tun gateway. */
            public gateway: string;

            /** tun dns_hijacking. */
            public dns_hijacking: boolean;

            /** tun force_fakeip. */
            public force_fakeip: boolean;

            /** tun skip_multicast. */
            public skip_multicast: boolean;

            /** tun driver. */
            public driver: yuhaiin.listener.tun.endpoint_driver;

            /** tun portal. */
            public portal: string;

            /**
             * Creates a new tun instance using the specified properties.
             * @param [properties] Properties to set
             * @returns tun instance
             */
            public static create(properties?: yuhaiin.listener.Itun): yuhaiin.listener.tun;

            /**
             * Encodes the specified tun message. Does not implicitly {@link yuhaiin.listener.tun.verify|verify} messages.
             * @param m tun message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Itun, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a tun message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns tun
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.tun;

            /**
             * Creates a tun message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns tun
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.tun;

            /**
             * Creates a plain object from a tun message. Also converts values to other types if specified.
             * @param m tun
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.tun, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this tun to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace tun {

            /** endpoint_driver enum. */
            enum endpoint_driver {
                fdbased = 0,
                channel = 1,
                system_gvisor = 2
            }
        }

        /** Properties of a yuubinsya. */
        interface Iyuubinsya {

            /** yuubinsya host */
            host?: (string|null);

            /** yuubinsya password */
            password?: (string|null);

            /** yuubinsya force_disable_encrypt */
            force_disable_encrypt?: (boolean|null);

            /** yuubinsya mux */
            mux?: (boolean|null);

            /** yuubinsya normal */
            normal?: (yuhaiin.listener.Inormal|null);

            /** yuubinsya tls */
            tls?: (yuhaiin.listener.Itls|null);

            /** yuubinsya quic */
            quic?: (yuhaiin.listener.Iquic|null);

            /** yuubinsya websocket */
            websocket?: (yuhaiin.listener.Iwebsocket|null);

            /** yuubinsya grpc */
            grpc?: (yuhaiin.listener.Igrpc|null);

            /** yuubinsya http2 */
            http2?: (yuhaiin.listener.Ihttp2|null);

            /** yuubinsya reality */
            reality?: (yuhaiin.listener.Ireality|null);
        }

        /** Represents a yuubinsya. */
        class yuubinsya implements Iyuubinsya {

            /**
             * Constructs a new yuubinsya.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iyuubinsya);

            /** yuubinsya host. */
            public host: string;

            /** yuubinsya password. */
            public password: string;

            /** yuubinsya force_disable_encrypt. */
            public force_disable_encrypt: boolean;

            /** yuubinsya mux. */
            public mux: boolean;

            /** yuubinsya normal. */
            public normal?: (yuhaiin.listener.Inormal|null);

            /** yuubinsya tls. */
            public tls?: (yuhaiin.listener.Itls|null);

            /** yuubinsya quic. */
            public quic?: (yuhaiin.listener.Iquic|null);

            /** yuubinsya websocket. */
            public websocket?: (yuhaiin.listener.Iwebsocket|null);

            /** yuubinsya grpc. */
            public grpc?: (yuhaiin.listener.Igrpc|null);

            /** yuubinsya http2. */
            public http2?: (yuhaiin.listener.Ihttp2|null);

            /** yuubinsya reality. */
            public reality?: (yuhaiin.listener.Ireality|null);

            /** yuubinsya protocol. */
            public protocol?: ("normal"|"tls"|"quic"|"websocket"|"grpc"|"http2"|"reality");

            /**
             * Creates a new yuubinsya instance using the specified properties.
             * @param [properties] Properties to set
             * @returns yuubinsya instance
             */
            public static create(properties?: yuhaiin.listener.Iyuubinsya): yuhaiin.listener.yuubinsya;

            /**
             * Encodes the specified yuubinsya message. Does not implicitly {@link yuhaiin.listener.yuubinsya.verify|verify} messages.
             * @param m yuubinsya message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iyuubinsya, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a yuubinsya message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns yuubinsya
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.yuubinsya;

            /**
             * Creates a yuubinsya message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns yuubinsya
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.yuubinsya;

            /**
             * Creates a plain object from a yuubinsya message. Also converts values to other types if specified.
             * @param m yuubinsya
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.yuubinsya, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this yuubinsya to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace yuubinsya {

            /** Properties of a protocol_normal. */
            interface Iprotocol_normal {
            }

            /** Represents a protocol_normal. */
            class protocol_normal implements Iprotocol_normal {

                /**
                 * Constructs a new protocol_normal.
                 * @param [p] Properties to set
                 */
                constructor(p?: yuhaiin.listener.yuubinsya.Iprotocol_normal);

                /**
                 * Creates a new protocol_normal instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns protocol_normal instance
                 */
                public static create(properties?: yuhaiin.listener.yuubinsya.Iprotocol_normal): yuhaiin.listener.yuubinsya.protocol_normal;

                /**
                 * Encodes the specified protocol_normal message. Does not implicitly {@link yuhaiin.listener.yuubinsya.protocol_normal.verify|verify} messages.
                 * @param m protocol_normal message or plain object to encode
                 * @param [w] Writer to encode to
                 * @returns Writer
                 */
                public static encode(m: yuhaiin.listener.yuubinsya.Iprotocol_normal, w?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a protocol_normal message from the specified reader or buffer.
                 * @param r Reader or buffer to decode from
                 * @param [l] Message length if known beforehand
                 * @returns protocol_normal
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.yuubinsya.protocol_normal;

                /**
                 * Creates a protocol_normal message from a plain object. Also converts values to their respective internal types.
                 * @param d Plain object
                 * @returns protocol_normal
                 */
                public static fromObject(d: { [k: string]: any }): yuhaiin.listener.yuubinsya.protocol_normal;

                /**
                 * Creates a plain object from a protocol_normal message. Also converts values to other types if specified.
                 * @param m protocol_normal
                 * @param [o] Conversion options
                 * @returns Plain object
                 */
                public static toObject(m: yuhaiin.listener.yuubinsya.protocol_normal, o?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this protocol_normal to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a normal. */
        interface Inormal {
        }

        /** Represents a normal. */
        class normal implements Inormal {

            /**
             * Constructs a new normal.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Inormal);

            /**
             * Creates a new normal instance using the specified properties.
             * @param [properties] Properties to set
             * @returns normal instance
             */
            public static create(properties?: yuhaiin.listener.Inormal): yuhaiin.listener.normal;

            /**
             * Encodes the specified normal message. Does not implicitly {@link yuhaiin.listener.normal.verify|verify} messages.
             * @param m normal message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Inormal, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a normal message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns normal
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.normal;

            /**
             * Creates a normal message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns normal
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.normal;

            /**
             * Creates a plain object from a normal message. Also converts values to other types if specified.
             * @param m normal
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.normal, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this normal to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a websocket. */
        interface Iwebsocket {

            /** websocket tls */
            tls?: (yuhaiin.listener.Itls_config|null);
        }

        /** Represents a websocket. */
        class websocket implements Iwebsocket {

            /**
             * Constructs a new websocket.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iwebsocket);

            /** websocket tls. */
            public tls?: (yuhaiin.listener.Itls_config|null);

            /**
             * Creates a new websocket instance using the specified properties.
             * @param [properties] Properties to set
             * @returns websocket instance
             */
            public static create(properties?: yuhaiin.listener.Iwebsocket): yuhaiin.listener.websocket;

            /**
             * Encodes the specified websocket message. Does not implicitly {@link yuhaiin.listener.websocket.verify|verify} messages.
             * @param m websocket message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iwebsocket, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a websocket message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns websocket
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.websocket;

            /**
             * Creates a websocket message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns websocket
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.websocket;

            /**
             * Creates a plain object from a websocket message. Also converts values to other types if specified.
             * @param m websocket
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.websocket, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this websocket to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a quic. */
        interface Iquic {

            /** quic tls */
            tls?: (yuhaiin.listener.Itls_config|null);
        }

        /** Represents a quic. */
        class quic implements Iquic {

            /**
             * Constructs a new quic.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iquic);

            /** quic tls. */
            public tls?: (yuhaiin.listener.Itls_config|null);

            /**
             * Creates a new quic instance using the specified properties.
             * @param [properties] Properties to set
             * @returns quic instance
             */
            public static create(properties?: yuhaiin.listener.Iquic): yuhaiin.listener.quic;

            /**
             * Encodes the specified quic message. Does not implicitly {@link yuhaiin.listener.quic.verify|verify} messages.
             * @param m quic message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iquic, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a quic message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns quic
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.quic;

            /**
             * Creates a quic message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns quic
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.quic;

            /**
             * Creates a plain object from a quic message. Also converts values to other types if specified.
             * @param m quic
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.quic, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this quic to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a tls. */
        interface Itls {

            /** tls tls */
            tls?: (yuhaiin.listener.Itls_config|null);
        }

        /** Represents a tls. */
        class tls implements Itls {

            /**
             * Constructs a new tls.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Itls);

            /** tls tls. */
            public tls?: (yuhaiin.listener.Itls_config|null);

            /**
             * Creates a new tls instance using the specified properties.
             * @param [properties] Properties to set
             * @returns tls instance
             */
            public static create(properties?: yuhaiin.listener.Itls): yuhaiin.listener.tls;

            /**
             * Encodes the specified tls message. Does not implicitly {@link yuhaiin.listener.tls.verify|verify} messages.
             * @param m tls message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Itls, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a tls message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns tls
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.tls;

            /**
             * Creates a tls message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns tls
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.tls;

            /**
             * Creates a plain object from a tls message. Also converts values to other types if specified.
             * @param m tls
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.tls, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this tls to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a grpc. */
        interface Igrpc {

            /** grpc tls */
            tls?: (yuhaiin.listener.Itls_config|null);
        }

        /** Represents a grpc. */
        class grpc implements Igrpc {

            /**
             * Constructs a new grpc.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Igrpc);

            /** grpc tls. */
            public tls?: (yuhaiin.listener.Itls_config|null);

            /**
             * Creates a new grpc instance using the specified properties.
             * @param [properties] Properties to set
             * @returns grpc instance
             */
            public static create(properties?: yuhaiin.listener.Igrpc): yuhaiin.listener.grpc;

            /**
             * Encodes the specified grpc message. Does not implicitly {@link yuhaiin.listener.grpc.verify|verify} messages.
             * @param m grpc message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Igrpc, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a grpc message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns grpc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.grpc;

            /**
             * Creates a grpc message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns grpc
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.grpc;

            /**
             * Creates a plain object from a grpc message. Also converts values to other types if specified.
             * @param m grpc
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.grpc, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this grpc to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a http2. */
        interface Ihttp2 {

            /** http2 tls */
            tls?: (yuhaiin.listener.Itls_config|null);
        }

        /** Represents a http2. */
        class http2 implements Ihttp2 {

            /**
             * Constructs a new http2.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Ihttp2);

            /** http2 tls. */
            public tls?: (yuhaiin.listener.Itls_config|null);

            /**
             * Creates a new http2 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns http2 instance
             */
            public static create(properties?: yuhaiin.listener.Ihttp2): yuhaiin.listener.http2;

            /**
             * Encodes the specified http2 message. Does not implicitly {@link yuhaiin.listener.http2.verify|verify} messages.
             * @param m http2 message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Ihttp2, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a http2 message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns http2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.http2;

            /**
             * Creates a http2 message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns http2
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.http2;

            /**
             * Creates a plain object from a http2 message. Also converts values to other types if specified.
             * @param m http2
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.http2, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this http2 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a reality. */
        interface Ireality {

            /** reality short_id */
            short_id?: (string[]|null);

            /** reality server_name */
            server_name?: (string[]|null);

            /** reality dest */
            dest?: (string|null);

            /** reality private_key */
            private_key?: (string|null);

            /** reality debug */
            debug?: (boolean|null);
        }

        /** Represents a reality. */
        class reality implements Ireality {

            /**
             * Constructs a new reality.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Ireality);

            /** reality short_id. */
            public short_id: string[];

            /** reality server_name. */
            public server_name: string[];

            /** reality dest. */
            public dest: string;

            /** reality private_key. */
            public private_key: string;

            /** reality debug. */
            public debug: boolean;

            /**
             * Creates a new reality instance using the specified properties.
             * @param [properties] Properties to set
             * @returns reality instance
             */
            public static create(properties?: yuhaiin.listener.Ireality): yuhaiin.listener.reality;

            /**
             * Encodes the specified reality message. Does not implicitly {@link yuhaiin.listener.reality.verify|verify} messages.
             * @param m reality message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Ireality, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a reality message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns reality
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.reality;

            /**
             * Creates a reality message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns reality
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.reality;

            /**
             * Creates a plain object from a reality message. Also converts values to other types if specified.
             * @param m reality
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.reality, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this reality to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a tls_config. */
        interface Itls_config {

            /** tls_config certificates */
            certificates?: (yuhaiin.listener.Icertificate[]|null);

            /** tls_config next_protos */
            next_protos?: (string[]|null);

            /** tls_config server_name_certificate */
            server_name_certificate?: ({ [k: string]: yuhaiin.listener.Icertificate }|null);
        }

        /** Represents a tls_config. */
        class tls_config implements Itls_config {

            /**
             * Constructs a new tls_config.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Itls_config);

            /** tls_config certificates. */
            public certificates: yuhaiin.listener.Icertificate[];

            /** tls_config next_protos. */
            public next_protos: string[];

            /** tls_config server_name_certificate. */
            public server_name_certificate: { [k: string]: yuhaiin.listener.Icertificate };

            /**
             * Creates a new tls_config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns tls_config instance
             */
            public static create(properties?: yuhaiin.listener.Itls_config): yuhaiin.listener.tls_config;

            /**
             * Encodes the specified tls_config message. Does not implicitly {@link yuhaiin.listener.tls_config.verify|verify} messages.
             * @param m tls_config message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Itls_config, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a tls_config message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns tls_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.tls_config;

            /**
             * Creates a tls_config message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns tls_config
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.tls_config;

            /**
             * Creates a plain object from a tls_config message. Also converts values to other types if specified.
             * @param m tls_config
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.tls_config, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this tls_config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a certificate. */
        interface Icertificate {

            /** certificate cert */
            cert?: (Uint8Array|null);

            /** certificate key */
            key?: (Uint8Array|null);

            /** certificate cert_file_path */
            cert_file_path?: (string|null);

            /** certificate key_file_path */
            key_file_path?: (string|null);
        }

        /** Represents a certificate. */
        class certificate implements Icertificate {

            /**
             * Constructs a new certificate.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Icertificate);

            /** certificate cert. */
            public cert: Uint8Array;

            /** certificate key. */
            public key: Uint8Array;

            /** certificate cert_file_path. */
            public cert_file_path: string;

            /** certificate key_file_path. */
            public key_file_path: string;

            /**
             * Creates a new certificate instance using the specified properties.
             * @param [properties] Properties to set
             * @returns certificate instance
             */
            public static create(properties?: yuhaiin.listener.Icertificate): yuhaiin.listener.certificate;

            /**
             * Encodes the specified certificate message. Does not implicitly {@link yuhaiin.listener.certificate.verify|verify} messages.
             * @param m certificate message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Icertificate, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a certificate message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns certificate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.certificate;

            /**
             * Creates a certificate message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns certificate
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.certificate;

            /**
             * Creates a plain object from a certificate message. Also converts values to other types if specified.
             * @param m certificate
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.certificate, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this certificate to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace node. */
    namespace node {

        /** Properties of a node. */
        interface Inode {

            /** node tcp */
            tcp?: (yuhaiin.point.Ipoint|null);

            /** node udp */
            udp?: (yuhaiin.point.Ipoint|null);

            /** node links */
            links?: ({ [k: string]: yuhaiin.subscribe.Ilink }|null);

            /** node manager */
            manager?: (yuhaiin.node.Imanager|null);
        }

        /** Represents a node. */
        class node implements Inode {

            /**
             * Constructs a new node.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.node.Inode);

            /** node tcp. */
            public tcp?: (yuhaiin.point.Ipoint|null);

            /** node udp. */
            public udp?: (yuhaiin.point.Ipoint|null);

            /** node links. */
            public links: { [k: string]: yuhaiin.subscribe.Ilink };

            /** node manager. */
            public manager?: (yuhaiin.node.Imanager|null);

            /**
             * Creates a new node instance using the specified properties.
             * @param [properties] Properties to set
             * @returns node instance
             */
            public static create(properties?: yuhaiin.node.Inode): yuhaiin.node.node;

            /**
             * Encodes the specified node message. Does not implicitly {@link yuhaiin.node.node.verify|verify} messages.
             * @param m node message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.node.Inode, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a node message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.node.node;

            /**
             * Creates a node message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns node
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.node.node;

            /**
             * Creates a plain object from a node message. Also converts values to other types if specified.
             * @param m node
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.node.node, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this node to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a nodes. */
        interface Inodes {

            /** nodes nodesV2 */
            nodesV2?: ({ [k: string]: string }|null);
        }

        /** Represents a nodes. */
        class nodes implements Inodes {

            /**
             * Constructs a new nodes.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.node.Inodes);

            /** nodes nodesV2. */
            public nodesV2: { [k: string]: string };

            /**
             * Creates a new nodes instance using the specified properties.
             * @param [properties] Properties to set
             * @returns nodes instance
             */
            public static create(properties?: yuhaiin.node.Inodes): yuhaiin.node.nodes;

            /**
             * Encodes the specified nodes message. Does not implicitly {@link yuhaiin.node.nodes.verify|verify} messages.
             * @param m nodes message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.node.Inodes, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a nodes message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns nodes
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.node.nodes;

            /**
             * Creates a nodes message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns nodes
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.node.nodes;

            /**
             * Creates a plain object from a nodes message. Also converts values to other types if specified.
             * @param m nodes
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.node.nodes, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this nodes to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a manager. */
        interface Imanager {

            /** manager groupsV2 */
            groupsV2?: ({ [k: string]: yuhaiin.node.Inodes }|null);

            /** manager nodes */
            nodes?: ({ [k: string]: yuhaiin.point.Ipoint }|null);

            /** manager tags */
            tags?: ({ [k: string]: yuhaiin.tag.Itags }|null);
        }

        /** Represents a manager. */
        class manager implements Imanager {

            /**
             * Constructs a new manager.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.node.Imanager);

            /** manager groupsV2. */
            public groupsV2: { [k: string]: yuhaiin.node.Inodes };

            /** manager nodes. */
            public nodes: { [k: string]: yuhaiin.point.Ipoint };

            /** manager tags. */
            public tags: { [k: string]: yuhaiin.tag.Itags };

            /**
             * Creates a new manager instance using the specified properties.
             * @param [properties] Properties to set
             * @returns manager instance
             */
            public static create(properties?: yuhaiin.node.Imanager): yuhaiin.node.manager;

            /**
             * Encodes the specified manager message. Does not implicitly {@link yuhaiin.node.manager.verify|verify} messages.
             * @param m manager message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.node.Imanager, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a manager message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns manager
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.node.manager;

            /**
             * Creates a manager message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns manager
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.node.manager;

            /**
             * Creates a plain object from a manager message. Also converts values to other types if specified.
             * @param m manager
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.node.manager, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this manager to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace point. */
    namespace point {

        /** origin enum. */
        enum origin {
            reserve = 0,
            remote = 101,
            manual = 102
        }

        /** Properties of a point. */
        interface Ipoint {

            /** point hash */
            hash?: (string|null);

            /** point name */
            name?: (string|null);

            /** point group */
            group?: (string|null);

            /** point origin */
            origin?: (yuhaiin.point.origin|null);

            /** point protocols */
            protocols?: (yuhaiin.protocol.Iprotocol[]|null);
        }

        /** Represents a point. */
        class point implements Ipoint {

            /**
             * Constructs a new point.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.point.Ipoint);

            /** point hash. */
            public hash: string;

            /** point name. */
            public name: string;

            /** point group. */
            public group: string;

            /** point origin. */
            public origin: yuhaiin.point.origin;

            /** point protocols. */
            public protocols: yuhaiin.protocol.Iprotocol[];

            /**
             * Creates a new point instance using the specified properties.
             * @param [properties] Properties to set
             * @returns point instance
             */
            public static create(properties?: yuhaiin.point.Ipoint): yuhaiin.point.point;

            /**
             * Encodes the specified point message. Does not implicitly {@link yuhaiin.point.point.verify|verify} messages.
             * @param m point message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.point.Ipoint, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a point message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns point
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.point.point;

            /**
             * Creates a point message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns point
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.point.point;

            /**
             * Creates a plain object from a point message. Also converts values to other types if specified.
             * @param m point
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.point.point, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this point to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace protocol. */
    namespace protocol {

        /** Properties of a protocol. */
        interface Iprotocol {

            /** protocol shadowsocks */
            shadowsocks?: (yuhaiin.protocol.Ishadowsocks|null);

            /** protocol shadowsocksr */
            shadowsocksr?: (yuhaiin.protocol.Ishadowsocksr|null);

            /** protocol vmess */
            vmess?: (yuhaiin.protocol.Ivmess|null);

            /** protocol websocket */
            websocket?: (yuhaiin.protocol.Iwebsocket|null);

            /** protocol quic */
            quic?: (yuhaiin.protocol.Iquic|null);

            /** protocol obfs_http */
            obfs_http?: (yuhaiin.protocol.Iobfs_http|null);

            /** protocol trojan */
            trojan?: (yuhaiin.protocol.Itrojan|null);

            /** protocol simple */
            simple?: (yuhaiin.protocol.Isimple|null);

            /** protocol none */
            none?: (yuhaiin.protocol.Inone|null);

            /** protocol socks5 */
            socks5?: (yuhaiin.protocol.Isocks5|null);

            /** protocol http */
            http?: (yuhaiin.protocol.Ihttp|null);

            /** protocol direct */
            direct?: (yuhaiin.protocol.Idirect|null);

            /** protocol reject */
            reject?: (yuhaiin.protocol.Ireject|null);

            /** protocol yuubinsya */
            yuubinsya?: (yuhaiin.protocol.Iyuubinsya|null);

            /** protocol grpc */
            grpc?: (yuhaiin.protocol.Igrpc|null);

            /** protocol http2 */
            http2?: (yuhaiin.protocol.Ihttp2|null);

            /** protocol reality */
            reality?: (yuhaiin.protocol.Ireality|null);

            /** protocol tls */
            tls?: (yuhaiin.protocol.Itls_config|null);

            /** protocol wireguard */
            wireguard?: (yuhaiin.protocol.Iwireguard|null);

            /** protocol mux */
            mux?: (yuhaiin.protocol.Imux|null);

            /** protocol drop */
            drop?: (yuhaiin.protocol.Idrop|null);
        }

        /** Represents a protocol. */
        class protocol implements Iprotocol {

            /**
             * Constructs a new protocol.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Iprotocol);

            /** protocol shadowsocks. */
            public shadowsocks?: (yuhaiin.protocol.Ishadowsocks|null);

            /** protocol shadowsocksr. */
            public shadowsocksr?: (yuhaiin.protocol.Ishadowsocksr|null);

            /** protocol vmess. */
            public vmess?: (yuhaiin.protocol.Ivmess|null);

            /** protocol websocket. */
            public websocket?: (yuhaiin.protocol.Iwebsocket|null);

            /** protocol quic. */
            public quic?: (yuhaiin.protocol.Iquic|null);

            /** protocol obfs_http. */
            public obfs_http?: (yuhaiin.protocol.Iobfs_http|null);

            /** protocol trojan. */
            public trojan?: (yuhaiin.protocol.Itrojan|null);

            /** protocol simple. */
            public simple?: (yuhaiin.protocol.Isimple|null);

            /** protocol none. */
            public none?: (yuhaiin.protocol.Inone|null);

            /** protocol socks5. */
            public socks5?: (yuhaiin.protocol.Isocks5|null);

            /** protocol http. */
            public http?: (yuhaiin.protocol.Ihttp|null);

            /** protocol direct. */
            public direct?: (yuhaiin.protocol.Idirect|null);

            /** protocol reject. */
            public reject?: (yuhaiin.protocol.Ireject|null);

            /** protocol yuubinsya. */
            public yuubinsya?: (yuhaiin.protocol.Iyuubinsya|null);

            /** protocol grpc. */
            public grpc?: (yuhaiin.protocol.Igrpc|null);

            /** protocol http2. */
            public http2?: (yuhaiin.protocol.Ihttp2|null);

            /** protocol reality. */
            public reality?: (yuhaiin.protocol.Ireality|null);

            /** protocol tls. */
            public tls?: (yuhaiin.protocol.Itls_config|null);

            /** protocol wireguard. */
            public wireguard?: (yuhaiin.protocol.Iwireguard|null);

            /** protocol mux. */
            public mux?: (yuhaiin.protocol.Imux|null);

            /** protocol drop. */
            public drop?: (yuhaiin.protocol.Idrop|null);

            /** protocol protocol. */
            public protocol?: ("shadowsocks"|"shadowsocksr"|"vmess"|"websocket"|"quic"|"obfs_http"|"trojan"|"simple"|"none"|"socks5"|"http"|"direct"|"reject"|"yuubinsya"|"grpc"|"http2"|"reality"|"tls"|"wireguard"|"mux"|"drop");

            /**
             * Creates a new protocol instance using the specified properties.
             * @param [properties] Properties to set
             * @returns protocol instance
             */
            public static create(properties?: yuhaiin.protocol.Iprotocol): yuhaiin.protocol.protocol;

            /**
             * Encodes the specified protocol message. Does not implicitly {@link yuhaiin.protocol.protocol.verify|verify} messages.
             * @param m protocol message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Iprotocol, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a protocol message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns protocol
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.protocol;

            /**
             * Creates a protocol message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns protocol
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.protocol;

            /**
             * Creates a plain object from a protocol message. Also converts values to other types if specified.
             * @param m protocol
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.protocol, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this protocol to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a socks5. */
        interface Isocks5 {

            /** socks5 hostname */
            hostname?: (string|null);

            /** socks5 user */
            user?: (string|null);

            /** socks5 password */
            password?: (string|null);
        }

        /** Represents a socks5. */
        class socks5 implements Isocks5 {

            /**
             * Constructs a new socks5.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Isocks5);

            /** socks5 hostname. */
            public hostname: string;

            /** socks5 user. */
            public user: string;

            /** socks5 password. */
            public password: string;

            /**
             * Creates a new socks5 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns socks5 instance
             */
            public static create(properties?: yuhaiin.protocol.Isocks5): yuhaiin.protocol.socks5;

            /**
             * Encodes the specified socks5 message. Does not implicitly {@link yuhaiin.protocol.socks5.verify|verify} messages.
             * @param m socks5 message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Isocks5, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a socks5 message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns socks5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.socks5;

            /**
             * Creates a socks5 message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns socks5
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.socks5;

            /**
             * Creates a plain object from a socks5 message. Also converts values to other types if specified.
             * @param m socks5
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.socks5, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this socks5 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a http. */
        interface Ihttp {

            /** http user */
            user?: (string|null);

            /** http password */
            password?: (string|null);
        }

        /** Represents a http. */
        class http implements Ihttp {

            /**
             * Constructs a new http.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ihttp);

            /** http user. */
            public user: string;

            /** http password. */
            public password: string;

            /**
             * Creates a new http instance using the specified properties.
             * @param [properties] Properties to set
             * @returns http instance
             */
            public static create(properties?: yuhaiin.protocol.Ihttp): yuhaiin.protocol.http;

            /**
             * Encodes the specified http message. Does not implicitly {@link yuhaiin.protocol.http.verify|verify} messages.
             * @param m http message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ihttp, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a http message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.http;

            /**
             * Creates a http message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns http
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.http;

            /**
             * Creates a plain object from a http message. Also converts values to other types if specified.
             * @param m http
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.http, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this http to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a shadowsocks. */
        interface Ishadowsocks {

            /** shadowsocks method */
            method?: (string|null);

            /** shadowsocks password */
            password?: (string|null);
        }

        /** Represents a shadowsocks. */
        class shadowsocks implements Ishadowsocks {

            /**
             * Constructs a new shadowsocks.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ishadowsocks);

            /** shadowsocks method. */
            public method: string;

            /** shadowsocks password. */
            public password: string;

            /**
             * Creates a new shadowsocks instance using the specified properties.
             * @param [properties] Properties to set
             * @returns shadowsocks instance
             */
            public static create(properties?: yuhaiin.protocol.Ishadowsocks): yuhaiin.protocol.shadowsocks;

            /**
             * Encodes the specified shadowsocks message. Does not implicitly {@link yuhaiin.protocol.shadowsocks.verify|verify} messages.
             * @param m shadowsocks message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ishadowsocks, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a shadowsocks message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns shadowsocks
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.shadowsocks;

            /**
             * Creates a shadowsocks message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns shadowsocks
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.shadowsocks;

            /**
             * Creates a plain object from a shadowsocks message. Also converts values to other types if specified.
             * @param m shadowsocks
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.shadowsocks, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this shadowsocks to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a shadowsocksr. */
        interface Ishadowsocksr {

            /** shadowsocksr server */
            server?: (string|null);

            /** shadowsocksr port */
            port?: (string|null);

            /** shadowsocksr method */
            method?: (string|null);

            /** shadowsocksr password */
            password?: (string|null);

            /** shadowsocksr obfs */
            obfs?: (string|null);

            /** shadowsocksr obfsparam */
            obfsparam?: (string|null);

            /** shadowsocksr protocol */
            protocol?: (string|null);

            /** shadowsocksr protoparam */
            protoparam?: (string|null);
        }

        /** Represents a shadowsocksr. */
        class shadowsocksr implements Ishadowsocksr {

            /**
             * Constructs a new shadowsocksr.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ishadowsocksr);

            /** shadowsocksr server. */
            public server: string;

            /** shadowsocksr port. */
            public port: string;

            /** shadowsocksr method. */
            public method: string;

            /** shadowsocksr password. */
            public password: string;

            /** shadowsocksr obfs. */
            public obfs: string;

            /** shadowsocksr obfsparam. */
            public obfsparam: string;

            /** shadowsocksr protocol. */
            public protocol: string;

            /** shadowsocksr protoparam. */
            public protoparam: string;

            /**
             * Creates a new shadowsocksr instance using the specified properties.
             * @param [properties] Properties to set
             * @returns shadowsocksr instance
             */
            public static create(properties?: yuhaiin.protocol.Ishadowsocksr): yuhaiin.protocol.shadowsocksr;

            /**
             * Encodes the specified shadowsocksr message. Does not implicitly {@link yuhaiin.protocol.shadowsocksr.verify|verify} messages.
             * @param m shadowsocksr message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ishadowsocksr, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a shadowsocksr message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns shadowsocksr
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.shadowsocksr;

            /**
             * Creates a shadowsocksr message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns shadowsocksr
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.shadowsocksr;

            /**
             * Creates a plain object from a shadowsocksr message. Also converts values to other types if specified.
             * @param m shadowsocksr
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.shadowsocksr, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this shadowsocksr to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a http2. */
        interface Ihttp2 {

            /** http2 concurrency */
            concurrency?: (number|null);
        }

        /** Represents a http2. */
        class http2 implements Ihttp2 {

            /**
             * Constructs a new http2.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ihttp2);

            /** http2 concurrency. */
            public concurrency: number;

            /**
             * Creates a new http2 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns http2 instance
             */
            public static create(properties?: yuhaiin.protocol.Ihttp2): yuhaiin.protocol.http2;

            /**
             * Encodes the specified http2 message. Does not implicitly {@link yuhaiin.protocol.http2.verify|verify} messages.
             * @param m http2 message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ihttp2, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a http2 message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns http2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.http2;

            /**
             * Creates a http2 message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns http2
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.http2;

            /**
             * Creates a plain object from a http2 message. Also converts values to other types if specified.
             * @param m http2
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.http2, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this http2 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a vmess. */
        interface Ivmess {

            /** vmess uuid */
            uuid?: (string|null);

            /** vmess alter_id */
            alter_id?: (string|null);

            /** vmess security */
            security?: (string|null);
        }

        /** Represents a vmess. */
        class vmess implements Ivmess {

            /**
             * Constructs a new vmess.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ivmess);

            /** vmess uuid. */
            public uuid: string;

            /** vmess alter_id. */
            public alter_id: string;

            /** vmess security. */
            public security: string;

            /**
             * Creates a new vmess instance using the specified properties.
             * @param [properties] Properties to set
             * @returns vmess instance
             */
            public static create(properties?: yuhaiin.protocol.Ivmess): yuhaiin.protocol.vmess;

            /**
             * Encodes the specified vmess message. Does not implicitly {@link yuhaiin.protocol.vmess.verify|verify} messages.
             * @param m vmess message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ivmess, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a vmess message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns vmess
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.vmess;

            /**
             * Creates a vmess message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns vmess
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.vmess;

            /**
             * Creates a plain object from a vmess message. Also converts values to other types if specified.
             * @param m vmess
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.vmess, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this vmess to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a trojan. */
        interface Itrojan {

            /** trojan password */
            password?: (string|null);

            /** trojan peer */
            peer?: (string|null);
        }

        /** Represents a trojan. */
        class trojan implements Itrojan {

            /**
             * Constructs a new trojan.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Itrojan);

            /** trojan password. */
            public password: string;

            /** trojan peer. */
            public peer: string;

            /**
             * Creates a new trojan instance using the specified properties.
             * @param [properties] Properties to set
             * @returns trojan instance
             */
            public static create(properties?: yuhaiin.protocol.Itrojan): yuhaiin.protocol.trojan;

            /**
             * Encodes the specified trojan message. Does not implicitly {@link yuhaiin.protocol.trojan.verify|verify} messages.
             * @param m trojan message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Itrojan, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a trojan message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns trojan
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.trojan;

            /**
             * Creates a trojan message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns trojan
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.trojan;

            /**
             * Creates a plain object from a trojan message. Also converts values to other types if specified.
             * @param m trojan
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.trojan, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this trojan to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a yuubinsya. */
        interface Iyuubinsya {

            /** yuubinsya password */
            password?: (string|null);

            /** yuubinsya encrypted */
            encrypted?: (boolean|null);

            /** yuubinsya udp_over_stream */
            udp_over_stream?: (boolean|null);
        }

        /** Represents a yuubinsya. */
        class yuubinsya implements Iyuubinsya {

            /**
             * Constructs a new yuubinsya.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Iyuubinsya);

            /** yuubinsya password. */
            public password: string;

            /** yuubinsya encrypted. */
            public encrypted: boolean;

            /** yuubinsya udp_over_stream. */
            public udp_over_stream: boolean;

            /**
             * Creates a new yuubinsya instance using the specified properties.
             * @param [properties] Properties to set
             * @returns yuubinsya instance
             */
            public static create(properties?: yuhaiin.protocol.Iyuubinsya): yuhaiin.protocol.yuubinsya;

            /**
             * Encodes the specified yuubinsya message. Does not implicitly {@link yuhaiin.protocol.yuubinsya.verify|verify} messages.
             * @param m yuubinsya message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Iyuubinsya, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a yuubinsya message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns yuubinsya
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.yuubinsya;

            /**
             * Creates a yuubinsya message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns yuubinsya
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.yuubinsya;

            /**
             * Creates a plain object from a yuubinsya message. Also converts values to other types if specified.
             * @param m yuubinsya
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.yuubinsya, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this yuubinsya to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a websocket. */
        interface Iwebsocket {

            /** websocket host */
            host?: (string|null);

            /** websocket path */
            path?: (string|null);

            /** websocket tls_enabled */
            tls_enabled?: (boolean|null);
        }

        /** Represents a websocket. */
        class websocket implements Iwebsocket {

            /**
             * Constructs a new websocket.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Iwebsocket);

            /** websocket host. */
            public host: string;

            /** websocket path. */
            public path: string;

            /** websocket tls_enabled. */
            public tls_enabled: boolean;

            /**
             * Creates a new websocket instance using the specified properties.
             * @param [properties] Properties to set
             * @returns websocket instance
             */
            public static create(properties?: yuhaiin.protocol.Iwebsocket): yuhaiin.protocol.websocket;

            /**
             * Encodes the specified websocket message. Does not implicitly {@link yuhaiin.protocol.websocket.verify|verify} messages.
             * @param m websocket message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Iwebsocket, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a websocket message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns websocket
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.websocket;

            /**
             * Creates a websocket message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns websocket
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.websocket;

            /**
             * Creates a plain object from a websocket message. Also converts values to other types if specified.
             * @param m websocket
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.websocket, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this websocket to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a grpc. */
        interface Igrpc {

            /** grpc tls */
            tls?: (yuhaiin.protocol.Itls_config|null);
        }

        /** Represents a grpc. */
        class grpc implements Igrpc {

            /**
             * Constructs a new grpc.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Igrpc);

            /** grpc tls. */
            public tls?: (yuhaiin.protocol.Itls_config|null);

            /**
             * Creates a new grpc instance using the specified properties.
             * @param [properties] Properties to set
             * @returns grpc instance
             */
            public static create(properties?: yuhaiin.protocol.Igrpc): yuhaiin.protocol.grpc;

            /**
             * Encodes the specified grpc message. Does not implicitly {@link yuhaiin.protocol.grpc.verify|verify} messages.
             * @param m grpc message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Igrpc, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a grpc message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns grpc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.grpc;

            /**
             * Creates a grpc message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns grpc
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.grpc;

            /**
             * Creates a plain object from a grpc message. Also converts values to other types if specified.
             * @param m grpc
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.grpc, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this grpc to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a quic. */
        interface Iquic {

            /** quic host */
            host?: (string|null);

            /** quic tls */
            tls?: (yuhaiin.protocol.Itls_config|null);

            /** quic as_network */
            as_network?: (boolean|null);
        }

        /** Represents a quic. */
        class quic implements Iquic {

            /**
             * Constructs a new quic.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Iquic);

            /** quic host. */
            public host: string;

            /** quic tls. */
            public tls?: (yuhaiin.protocol.Itls_config|null);

            /** quic as_network. */
            public as_network: boolean;

            /**
             * Creates a new quic instance using the specified properties.
             * @param [properties] Properties to set
             * @returns quic instance
             */
            public static create(properties?: yuhaiin.protocol.Iquic): yuhaiin.protocol.quic;

            /**
             * Encodes the specified quic message. Does not implicitly {@link yuhaiin.protocol.quic.verify|verify} messages.
             * @param m quic message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Iquic, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a quic message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns quic
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.quic;

            /**
             * Creates a quic message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns quic
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.quic;

            /**
             * Creates a plain object from a quic message. Also converts values to other types if specified.
             * @param m quic
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.quic, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this quic to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a reality. */
        interface Ireality {

            /** reality server_name */
            server_name?: (string|null);

            /** reality public_key */
            public_key?: (string|null);

            /** reality short_id */
            short_id?: (string|null);

            /** reality debug */
            debug?: (boolean|null);
        }

        /** Represents a reality. */
        class reality implements Ireality {

            /**
             * Constructs a new reality.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ireality);

            /** reality server_name. */
            public server_name: string;

            /** reality public_key. */
            public public_key: string;

            /** reality short_id. */
            public short_id: string;

            /** reality debug. */
            public debug: boolean;

            /**
             * Creates a new reality instance using the specified properties.
             * @param [properties] Properties to set
             * @returns reality instance
             */
            public static create(properties?: yuhaiin.protocol.Ireality): yuhaiin.protocol.reality;

            /**
             * Encodes the specified reality message. Does not implicitly {@link yuhaiin.protocol.reality.verify|verify} messages.
             * @param m reality message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ireality, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a reality message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns reality
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.reality;

            /**
             * Creates a reality message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns reality
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.reality;

            /**
             * Creates a plain object from a reality message. Also converts values to other types if specified.
             * @param m reality
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.reality, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this reality to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an obfs_http. */
        interface Iobfs_http {

            /** obfs_http host */
            host?: (string|null);

            /** obfs_http port */
            port?: (string|null);
        }

        /** Represents an obfs_http. */
        class obfs_http implements Iobfs_http {

            /**
             * Constructs a new obfs_http.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Iobfs_http);

            /** obfs_http host. */
            public host: string;

            /** obfs_http port. */
            public port: string;

            /**
             * Creates a new obfs_http instance using the specified properties.
             * @param [properties] Properties to set
             * @returns obfs_http instance
             */
            public static create(properties?: yuhaiin.protocol.Iobfs_http): yuhaiin.protocol.obfs_http;

            /**
             * Encodes the specified obfs_http message. Does not implicitly {@link yuhaiin.protocol.obfs_http.verify|verify} messages.
             * @param m obfs_http message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Iobfs_http, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an obfs_http message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns obfs_http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.obfs_http;

            /**
             * Creates an obfs_http message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns obfs_http
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.obfs_http;

            /**
             * Creates a plain object from an obfs_http message. Also converts values to other types if specified.
             * @param m obfs_http
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.obfs_http, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this obfs_http to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a none. */
        interface Inone {
        }

        /** Represents a none. */
        class none implements Inone {

            /**
             * Constructs a new none.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Inone);

            /**
             * Creates a new none instance using the specified properties.
             * @param [properties] Properties to set
             * @returns none instance
             */
            public static create(properties?: yuhaiin.protocol.Inone): yuhaiin.protocol.none;

            /**
             * Encodes the specified none message. Does not implicitly {@link yuhaiin.protocol.none.verify|verify} messages.
             * @param m none message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Inone, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a none message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns none
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.none;

            /**
             * Creates a none message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns none
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.none;

            /**
             * Creates a plain object from a none message. Also converts values to other types if specified.
             * @param m none
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.none, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this none to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a simple. */
        interface Isimple {

            /** simple host */
            host?: (string|null);

            /** simple port */
            port?: (number|null);

            /** simple timeout */
            timeout?: (number|Long|null);

            /** simple alternate_host */
            alternate_host?: (yuhaiin.protocol.Ihost[]|null);

            /** simple packet_conn_direct */
            packet_conn_direct?: (boolean|null);

            /** simple tls */
            tls?: (yuhaiin.protocol.Itls_config|null);
        }

        /** Represents a simple. */
        class simple implements Isimple {

            /**
             * Constructs a new simple.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Isimple);

            /** simple host. */
            public host: string;

            /** simple port. */
            public port: number;

            /** simple timeout. */
            public timeout: (number|Long);

            /** simple alternate_host. */
            public alternate_host: yuhaiin.protocol.Ihost[];

            /** simple packet_conn_direct. */
            public packet_conn_direct: boolean;

            /** simple tls. */
            public tls?: (yuhaiin.protocol.Itls_config|null);

            /**
             * Creates a new simple instance using the specified properties.
             * @param [properties] Properties to set
             * @returns simple instance
             */
            public static create(properties?: yuhaiin.protocol.Isimple): yuhaiin.protocol.simple;

            /**
             * Encodes the specified simple message. Does not implicitly {@link yuhaiin.protocol.simple.verify|verify} messages.
             * @param m simple message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Isimple, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a simple message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns simple
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.simple;

            /**
             * Creates a simple message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns simple
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.simple;

            /**
             * Creates a plain object from a simple message. Also converts values to other types if specified.
             * @param m simple
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.simple, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this simple to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a tls_config. */
        interface Itls_config {

            /** tls_config enable */
            enable?: (boolean|null);

            /** tls_config server_names */
            server_names?: (string[]|null);

            /** tls_config ca_cert */
            ca_cert?: (Uint8Array[]|null);

            /** tls_config insecure_skip_verify */
            insecure_skip_verify?: (boolean|null);

            /** tls_config next_protos */
            next_protos?: (string[]|null);
        }

        /** Represents a tls_config. */
        class tls_config implements Itls_config {

            /**
             * Constructs a new tls_config.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Itls_config);

            /** tls_config enable. */
            public enable: boolean;

            /** tls_config server_names. */
            public server_names: string[];

            /** tls_config ca_cert. */
            public ca_cert: Uint8Array[];

            /** tls_config insecure_skip_verify. */
            public insecure_skip_verify: boolean;

            /** tls_config next_protos. */
            public next_protos: string[];

            /**
             * Creates a new tls_config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns tls_config instance
             */
            public static create(properties?: yuhaiin.protocol.Itls_config): yuhaiin.protocol.tls_config;

            /**
             * Encodes the specified tls_config message. Does not implicitly {@link yuhaiin.protocol.tls_config.verify|verify} messages.
             * @param m tls_config message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Itls_config, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a tls_config message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns tls_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.tls_config;

            /**
             * Creates a tls_config message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns tls_config
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.tls_config;

            /**
             * Creates a plain object from a tls_config message. Also converts values to other types if specified.
             * @param m tls_config
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.tls_config, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this tls_config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a direct. */
        interface Idirect {
        }

        /** Represents a direct. */
        class direct implements Idirect {

            /**
             * Constructs a new direct.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Idirect);

            /**
             * Creates a new direct instance using the specified properties.
             * @param [properties] Properties to set
             * @returns direct instance
             */
            public static create(properties?: yuhaiin.protocol.Idirect): yuhaiin.protocol.direct;

            /**
             * Encodes the specified direct message. Does not implicitly {@link yuhaiin.protocol.direct.verify|verify} messages.
             * @param m direct message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Idirect, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a direct message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns direct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.direct;

            /**
             * Creates a direct message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns direct
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.direct;

            /**
             * Creates a plain object from a direct message. Also converts values to other types if specified.
             * @param m direct
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.direct, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this direct to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a reject. */
        interface Ireject {
        }

        /** Represents a reject. */
        class reject implements Ireject {

            /**
             * Constructs a new reject.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ireject);

            /**
             * Creates a new reject instance using the specified properties.
             * @param [properties] Properties to set
             * @returns reject instance
             */
            public static create(properties?: yuhaiin.protocol.Ireject): yuhaiin.protocol.reject;

            /**
             * Encodes the specified reject message. Does not implicitly {@link yuhaiin.protocol.reject.verify|verify} messages.
             * @param m reject message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ireject, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a reject message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns reject
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.reject;

            /**
             * Creates a reject message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns reject
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.reject;

            /**
             * Creates a plain object from a reject message. Also converts values to other types if specified.
             * @param m reject
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.reject, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this reject to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a drop. */
        interface Idrop {
        }

        /** Represents a drop. */
        class drop implements Idrop {

            /**
             * Constructs a new drop.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Idrop);

            /**
             * Creates a new drop instance using the specified properties.
             * @param [properties] Properties to set
             * @returns drop instance
             */
            public static create(properties?: yuhaiin.protocol.Idrop): yuhaiin.protocol.drop;

            /**
             * Encodes the specified drop message. Does not implicitly {@link yuhaiin.protocol.drop.verify|verify} messages.
             * @param m drop message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Idrop, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a drop message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns drop
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.drop;

            /**
             * Creates a drop message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns drop
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.drop;

            /**
             * Creates a plain object from a drop message. Also converts values to other types if specified.
             * @param m drop
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.drop, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this drop to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a host. */
        interface Ihost {

            /** host host */
            host?: (string|null);

            /** host port */
            port?: (number|null);
        }

        /** Represents a host. */
        class host implements Ihost {

            /**
             * Constructs a new host.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Ihost);

            /** host host. */
            public host: string;

            /** host port. */
            public port: number;

            /**
             * Creates a new host instance using the specified properties.
             * @param [properties] Properties to set
             * @returns host instance
             */
            public static create(properties?: yuhaiin.protocol.Ihost): yuhaiin.protocol.host;

            /**
             * Encodes the specified host message. Does not implicitly {@link yuhaiin.protocol.host.verify|verify} messages.
             * @param m host message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Ihost, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a host message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns host
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.host;

            /**
             * Creates a host message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns host
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.host;

            /**
             * Creates a plain object from a host message. Also converts values to other types if specified.
             * @param m host
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.host, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this host to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a wireguard_peer_config. */
        interface Iwireguard_peer_config {

            /** wireguard_peer_config public_key */
            public_key?: (string|null);

            /** wireguard_peer_config pre_shared_key */
            pre_shared_key?: (string|null);

            /** wireguard_peer_config endpoint */
            endpoint?: (string|null);

            /** wireguard_peer_config keep_alive */
            keep_alive?: (number|null);

            /** wireguard_peer_config allowed_ips */
            allowed_ips?: (string[]|null);
        }

        /** Represents a wireguard_peer_config. */
        class wireguard_peer_config implements Iwireguard_peer_config {

            /**
             * Constructs a new wireguard_peer_config.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Iwireguard_peer_config);

            /** wireguard_peer_config public_key. */
            public public_key: string;

            /** wireguard_peer_config pre_shared_key. */
            public pre_shared_key: string;

            /** wireguard_peer_config endpoint. */
            public endpoint: string;

            /** wireguard_peer_config keep_alive. */
            public keep_alive: number;

            /** wireguard_peer_config allowed_ips. */
            public allowed_ips: string[];

            /**
             * Creates a new wireguard_peer_config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns wireguard_peer_config instance
             */
            public static create(properties?: yuhaiin.protocol.Iwireguard_peer_config): yuhaiin.protocol.wireguard_peer_config;

            /**
             * Encodes the specified wireguard_peer_config message. Does not implicitly {@link yuhaiin.protocol.wireguard_peer_config.verify|verify} messages.
             * @param m wireguard_peer_config message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Iwireguard_peer_config, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a wireguard_peer_config message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns wireguard_peer_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.wireguard_peer_config;

            /**
             * Creates a wireguard_peer_config message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns wireguard_peer_config
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.wireguard_peer_config;

            /**
             * Creates a plain object from a wireguard_peer_config message. Also converts values to other types if specified.
             * @param m wireguard_peer_config
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.wireguard_peer_config, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this wireguard_peer_config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a wireguard. */
        interface Iwireguard {

            /** wireguard secret_key */
            secret_key?: (string|null);

            /** wireguard endpoint */
            endpoint?: (string[]|null);

            /** wireguard peers */
            peers?: (yuhaiin.protocol.Iwireguard_peer_config[]|null);

            /** wireguard mtu */
            mtu?: (number|null);

            /** wireguard num_workers */
            num_workers?: (number|null);

            /** wireguard reserved */
            reserved?: (Uint8Array|null);
        }

        /** Represents a wireguard. */
        class wireguard implements Iwireguard {

            /**
             * Constructs a new wireguard.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Iwireguard);

            /** wireguard secret_key. */
            public secret_key: string;

            /** wireguard endpoint. */
            public endpoint: string[];

            /** wireguard peers. */
            public peers: yuhaiin.protocol.Iwireguard_peer_config[];

            /** wireguard mtu. */
            public mtu: number;

            /** wireguard num_workers. */
            public num_workers: number;

            /** wireguard reserved. */
            public reserved: Uint8Array;

            /**
             * Creates a new wireguard instance using the specified properties.
             * @param [properties] Properties to set
             * @returns wireguard instance
             */
            public static create(properties?: yuhaiin.protocol.Iwireguard): yuhaiin.protocol.wireguard;

            /**
             * Encodes the specified wireguard message. Does not implicitly {@link yuhaiin.protocol.wireguard.verify|verify} messages.
             * @param m wireguard message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Iwireguard, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a wireguard message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns wireguard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.wireguard;

            /**
             * Creates a wireguard message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns wireguard
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.wireguard;

            /**
             * Creates a plain object from a wireguard message. Also converts values to other types if specified.
             * @param m wireguard
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.wireguard, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this wireguard to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a mux. */
        interface Imux {

            /** mux concurrency */
            concurrency?: (number|null);
        }

        /** Represents a mux. */
        class mux implements Imux {

            /**
             * Constructs a new mux.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.protocol.Imux);

            /** mux concurrency. */
            public concurrency: number;

            /**
             * Creates a new mux instance using the specified properties.
             * @param [properties] Properties to set
             * @returns mux instance
             */
            public static create(properties?: yuhaiin.protocol.Imux): yuhaiin.protocol.mux;

            /**
             * Encodes the specified mux message. Does not implicitly {@link yuhaiin.protocol.mux.verify|verify} messages.
             * @param m mux message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.protocol.Imux, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a mux message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns mux
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protocol.mux;

            /**
             * Creates a mux message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns mux
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.protocol.mux;

            /**
             * Creates a plain object from a mux message. Also converts values to other types if specified.
             * @param m mux
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.protocol.mux, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this mux to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace subscribe. */
    namespace subscribe {

        /** type enum. */
        enum type {
            reserve = 0,
            trojan = 1,
            vmess = 2,
            shadowsocks = 3,
            shadowsocksr = 4
        }

        /** Properties of a link. */
        interface Ilink {

            /** link name */
            name?: (string|null);

            /** link type */
            type?: (yuhaiin.subscribe.type|null);

            /** link url */
            url?: (string|null);
        }

        /** Represents a link. */
        class link implements Ilink {

            /**
             * Constructs a new link.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.subscribe.Ilink);

            /** link name. */
            public name: string;

            /** link type. */
            public type: yuhaiin.subscribe.type;

            /** link url. */
            public url: string;

            /**
             * Creates a new link instance using the specified properties.
             * @param [properties] Properties to set
             * @returns link instance
             */
            public static create(properties?: yuhaiin.subscribe.Ilink): yuhaiin.subscribe.link;

            /**
             * Encodes the specified link message. Does not implicitly {@link yuhaiin.subscribe.link.verify|verify} messages.
             * @param m link message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.subscribe.Ilink, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a link message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns link
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.subscribe.link;

            /**
             * Creates a link message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns link
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.subscribe.link;

            /**
             * Creates a plain object from a link message. Also converts values to other types if specified.
             * @param m link
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.subscribe.link, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this link to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace tag. */
    namespace tag {

        /** tag_type enum. */
        enum tag_type {
            node = 0,
            mirror = 1
        }

        /** Properties of a tags. */
        interface Itags {

            /** tags tag */
            tag?: (string|null);

            /** tags type */
            type?: (yuhaiin.tag.tag_type|null);

            /** tags hash */
            hash?: (string[]|null);
        }

        /** Represents a tags. */
        class tags implements Itags {

            /**
             * Constructs a new tags.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.tag.Itags);

            /** tags tag. */
            public tag: string;

            /** tags type. */
            public type: yuhaiin.tag.tag_type;

            /** tags hash. */
            public hash: string[];

            /**
             * Creates a new tags instance using the specified properties.
             * @param [properties] Properties to set
             * @returns tags instance
             */
            public static create(properties?: yuhaiin.tag.Itags): yuhaiin.tag.tags;

            /**
             * Encodes the specified tags message. Does not implicitly {@link yuhaiin.tag.tags.verify|verify} messages.
             * @param m tags message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.tag.Itags, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a tags message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns tags
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.tag.tags;

            /**
             * Creates a tags message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns tags
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.tag.tags;

            /**
             * Creates a plain object from a tags message. Also converts values to other types if specified.
             * @param m tags
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.tag.tags, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this tags to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace protos. */
    namespace protos {

        /** Namespace node. */
        namespace node {

            /** Namespace service. */
            namespace service {

                /** Properties of a now_resp. */
                interface Inow_resp {

                    /** now_resp tcp */
                    tcp?: (yuhaiin.point.Ipoint|null);

                    /** now_resp udp */
                    udp?: (yuhaiin.point.Ipoint|null);
                }

                /** Represents a now_resp. */
                class now_resp implements Inow_resp {

                    /**
                     * Constructs a new now_resp.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.node.service.Inow_resp);

                    /** now_resp tcp. */
                    public tcp?: (yuhaiin.point.Ipoint|null);

                    /** now_resp udp. */
                    public udp?: (yuhaiin.point.Ipoint|null);

                    /**
                     * Creates a new now_resp instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns now_resp instance
                     */
                    public static create(properties?: yuhaiin.protos.node.service.Inow_resp): yuhaiin.protos.node.service.now_resp;

                    /**
                     * Encodes the specified now_resp message. Does not implicitly {@link yuhaiin.protos.node.service.now_resp.verify|verify} messages.
                     * @param m now_resp message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.node.service.Inow_resp, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a now_resp message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns now_resp
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.node.service.now_resp;

                    /**
                     * Creates a now_resp message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns now_resp
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.node.service.now_resp;

                    /**
                     * Creates a plain object from a now_resp message. Also converts values to other types if specified.
                     * @param m now_resp
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.node.service.now_resp, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this now_resp to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a use_req. */
                interface Iuse_req {

                    /** use_req tcp */
                    tcp?: (boolean|null);

                    /** use_req udp */
                    udp?: (boolean|null);

                    /** use_req hash */
                    hash?: (string|null);
                }

                /** Represents a use_req. */
                class use_req implements Iuse_req {

                    /**
                     * Constructs a new use_req.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.node.service.Iuse_req);

                    /** use_req tcp. */
                    public tcp: boolean;

                    /** use_req udp. */
                    public udp: boolean;

                    /** use_req hash. */
                    public hash: string;

                    /**
                     * Creates a new use_req instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns use_req instance
                     */
                    public static create(properties?: yuhaiin.protos.node.service.Iuse_req): yuhaiin.protos.node.service.use_req;

                    /**
                     * Encodes the specified use_req message. Does not implicitly {@link yuhaiin.protos.node.service.use_req.verify|verify} messages.
                     * @param m use_req message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.node.service.Iuse_req, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a use_req message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns use_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.node.service.use_req;

                    /**
                     * Creates a use_req message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns use_req
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.node.service.use_req;

                    /**
                     * Creates a plain object from a use_req message. Also converts values to other types if specified.
                     * @param m use_req
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.node.service.use_req, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this use_req to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a save_link_req. */
                interface Isave_link_req {

                    /** save_link_req links */
                    links?: (yuhaiin.subscribe.Ilink[]|null);
                }

                /** Represents a save_link_req. */
                class save_link_req implements Isave_link_req {

                    /**
                     * Constructs a new save_link_req.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.node.service.Isave_link_req);

                    /** save_link_req links. */
                    public links: yuhaiin.subscribe.Ilink[];

                    /**
                     * Creates a new save_link_req instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns save_link_req instance
                     */
                    public static create(properties?: yuhaiin.protos.node.service.Isave_link_req): yuhaiin.protos.node.service.save_link_req;

                    /**
                     * Encodes the specified save_link_req message. Does not implicitly {@link yuhaiin.protos.node.service.save_link_req.verify|verify} messages.
                     * @param m save_link_req message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.node.service.Isave_link_req, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a save_link_req message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns save_link_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.node.service.save_link_req;

                    /**
                     * Creates a save_link_req message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns save_link_req
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.node.service.save_link_req;

                    /**
                     * Creates a plain object from a save_link_req message. Also converts values to other types if specified.
                     * @param m save_link_req
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.node.service.save_link_req, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this save_link_req to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a link_req. */
                interface Ilink_req {

                    /** link_req names */
                    names?: (string[]|null);
                }

                /** Represents a link_req. */
                class link_req implements Ilink_req {

                    /**
                     * Constructs a new link_req.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.node.service.Ilink_req);

                    /** link_req names. */
                    public names: string[];

                    /**
                     * Creates a new link_req instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns link_req instance
                     */
                    public static create(properties?: yuhaiin.protos.node.service.Ilink_req): yuhaiin.protos.node.service.link_req;

                    /**
                     * Encodes the specified link_req message. Does not implicitly {@link yuhaiin.protos.node.service.link_req.verify|verify} messages.
                     * @param m link_req message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.node.service.Ilink_req, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a link_req message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns link_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.node.service.link_req;

                    /**
                     * Creates a link_req message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns link_req
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.node.service.link_req;

                    /**
                     * Creates a plain object from a link_req message. Also converts values to other types if specified.
                     * @param m link_req
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.node.service.link_req, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this link_req to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a get_links_resp. */
                interface Iget_links_resp {

                    /** get_links_resp links */
                    links?: ({ [k: string]: yuhaiin.subscribe.Ilink }|null);
                }

                /** Represents a get_links_resp. */
                class get_links_resp implements Iget_links_resp {

                    /**
                     * Constructs a new get_links_resp.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.node.service.Iget_links_resp);

                    /** get_links_resp links. */
                    public links: { [k: string]: yuhaiin.subscribe.Ilink };

                    /**
                     * Creates a new get_links_resp instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns get_links_resp instance
                     */
                    public static create(properties?: yuhaiin.protos.node.service.Iget_links_resp): yuhaiin.protos.node.service.get_links_resp;

                    /**
                     * Encodes the specified get_links_resp message. Does not implicitly {@link yuhaiin.protos.node.service.get_links_resp.verify|verify} messages.
                     * @param m get_links_resp message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.node.service.Iget_links_resp, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a get_links_resp message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns get_links_resp
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.node.service.get_links_resp;

                    /**
                     * Creates a get_links_resp message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns get_links_resp
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.node.service.get_links_resp;

                    /**
                     * Creates a plain object from a get_links_resp message. Also converts values to other types if specified.
                     * @param m get_links_resp
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.node.service.get_links_resp, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this get_links_resp to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a save_tag_req. */
                interface Isave_tag_req {

                    /** save_tag_req tag */
                    tag?: (string|null);

                    /** save_tag_req type */
                    type?: (yuhaiin.tag.tag_type|null);

                    /** save_tag_req hash */
                    hash?: (string|null);
                }

                /** Represents a save_tag_req. */
                class save_tag_req implements Isave_tag_req {

                    /**
                     * Constructs a new save_tag_req.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.node.service.Isave_tag_req);

                    /** save_tag_req tag. */
                    public tag: string;

                    /** save_tag_req type. */
                    public type: yuhaiin.tag.tag_type;

                    /** save_tag_req hash. */
                    public hash: string;

                    /**
                     * Creates a new save_tag_req instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns save_tag_req instance
                     */
                    public static create(properties?: yuhaiin.protos.node.service.Isave_tag_req): yuhaiin.protos.node.service.save_tag_req;

                    /**
                     * Encodes the specified save_tag_req message. Does not implicitly {@link yuhaiin.protos.node.service.save_tag_req.verify|verify} messages.
                     * @param m save_tag_req message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.node.service.Isave_tag_req, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a save_tag_req message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns save_tag_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.node.service.save_tag_req;

                    /**
                     * Creates a save_tag_req message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns save_tag_req
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.node.service.save_tag_req;

                    /**
                     * Creates a plain object from a save_tag_req message. Also converts values to other types if specified.
                     * @param m save_tag_req
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.node.service.save_tag_req, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this save_tag_req to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }
        }

        /** Namespace statistic. */
        namespace statistic {

            /** Namespace service. */
            namespace service {

                /** Properties of a total_flow. */
                interface Itotal_flow {

                    /** total_flow download */
                    download?: (number|Long|null);

                    /** total_flow upload */
                    upload?: (number|Long|null);
                }

                /** Represents a total_flow. */
                class total_flow implements Itotal_flow {

                    /**
                     * Constructs a new total_flow.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.statistic.service.Itotal_flow);

                    /** total_flow download. */
                    public download: (number|Long);

                    /** total_flow upload. */
                    public upload: (number|Long);

                    /**
                     * Creates a new total_flow instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns total_flow instance
                     */
                    public static create(properties?: yuhaiin.protos.statistic.service.Itotal_flow): yuhaiin.protos.statistic.service.total_flow;

                    /**
                     * Encodes the specified total_flow message. Does not implicitly {@link yuhaiin.protos.statistic.service.total_flow.verify|verify} messages.
                     * @param m total_flow message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.statistic.service.Itotal_flow, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a total_flow message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns total_flow
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.statistic.service.total_flow;

                    /**
                     * Creates a total_flow message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns total_flow
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.statistic.service.total_flow;

                    /**
                     * Creates a plain object from a total_flow message. Also converts values to other types if specified.
                     * @param m total_flow
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.statistic.service.total_flow, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this total_flow to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a notify_data. */
                interface Inotify_data {

                    /** notify_data total_flow */
                    total_flow?: (yuhaiin.protos.statistic.service.Itotal_flow|null);

                    /** notify_data notify_new_connections */
                    notify_new_connections?: (yuhaiin.protos.statistic.service.Inotify_new_connections|null);

                    /** notify_data notify_remove_connections */
                    notify_remove_connections?: (yuhaiin.protos.statistic.service.Inotify_remove_connections|null);
                }

                /** Represents a notify_data. */
                class notify_data implements Inotify_data {

                    /**
                     * Constructs a new notify_data.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.statistic.service.Inotify_data);

                    /** notify_data total_flow. */
                    public total_flow?: (yuhaiin.protos.statistic.service.Itotal_flow|null);

                    /** notify_data notify_new_connections. */
                    public notify_new_connections?: (yuhaiin.protos.statistic.service.Inotify_new_connections|null);

                    /** notify_data notify_remove_connections. */
                    public notify_remove_connections?: (yuhaiin.protos.statistic.service.Inotify_remove_connections|null);

                    /** notify_data data. */
                    public data?: ("total_flow"|"notify_new_connections"|"notify_remove_connections");

                    /**
                     * Creates a new notify_data instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns notify_data instance
                     */
                    public static create(properties?: yuhaiin.protos.statistic.service.Inotify_data): yuhaiin.protos.statistic.service.notify_data;

                    /**
                     * Encodes the specified notify_data message. Does not implicitly {@link yuhaiin.protos.statistic.service.notify_data.verify|verify} messages.
                     * @param m notify_data message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.statistic.service.Inotify_data, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a notify_data message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns notify_data
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.statistic.service.notify_data;

                    /**
                     * Creates a notify_data message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns notify_data
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.statistic.service.notify_data;

                    /**
                     * Creates a plain object from a notify_data message. Also converts values to other types if specified.
                     * @param m notify_data
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.statistic.service.notify_data, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this notify_data to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a notify_new_connections. */
                interface Inotify_new_connections {

                    /** notify_new_connections connections */
                    connections?: (yuhaiin.statistic.Iconnection[]|null);
                }

                /** Represents a notify_new_connections. */
                class notify_new_connections implements Inotify_new_connections {

                    /**
                     * Constructs a new notify_new_connections.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.statistic.service.Inotify_new_connections);

                    /** notify_new_connections connections. */
                    public connections: yuhaiin.statistic.Iconnection[];

                    /**
                     * Creates a new notify_new_connections instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns notify_new_connections instance
                     */
                    public static create(properties?: yuhaiin.protos.statistic.service.Inotify_new_connections): yuhaiin.protos.statistic.service.notify_new_connections;

                    /**
                     * Encodes the specified notify_new_connections message. Does not implicitly {@link yuhaiin.protos.statistic.service.notify_new_connections.verify|verify} messages.
                     * @param m notify_new_connections message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.statistic.service.Inotify_new_connections, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a notify_new_connections message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns notify_new_connections
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.statistic.service.notify_new_connections;

                    /**
                     * Creates a notify_new_connections message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns notify_new_connections
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.statistic.service.notify_new_connections;

                    /**
                     * Creates a plain object from a notify_new_connections message. Also converts values to other types if specified.
                     * @param m notify_new_connections
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.statistic.service.notify_new_connections, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this notify_new_connections to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a notify_remove_connections. */
                interface Inotify_remove_connections {

                    /** notify_remove_connections ids */
                    ids?: ((number|Long)[]|null);
                }

                /** Represents a notify_remove_connections. */
                class notify_remove_connections implements Inotify_remove_connections {

                    /**
                     * Constructs a new notify_remove_connections.
                     * @param [p] Properties to set
                     */
                    constructor(p?: yuhaiin.protos.statistic.service.Inotify_remove_connections);

                    /** notify_remove_connections ids. */
                    public ids: (number|Long)[];

                    /**
                     * Creates a new notify_remove_connections instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns notify_remove_connections instance
                     */
                    public static create(properties?: yuhaiin.protos.statistic.service.Inotify_remove_connections): yuhaiin.protos.statistic.service.notify_remove_connections;

                    /**
                     * Encodes the specified notify_remove_connections message. Does not implicitly {@link yuhaiin.protos.statistic.service.notify_remove_connections.verify|verify} messages.
                     * @param m notify_remove_connections message or plain object to encode
                     * @param [w] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(m: yuhaiin.protos.statistic.service.Inotify_remove_connections, w?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a notify_remove_connections message from the specified reader or buffer.
                     * @param r Reader or buffer to decode from
                     * @param [l] Message length if known beforehand
                     * @returns notify_remove_connections
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.protos.statistic.service.notify_remove_connections;

                    /**
                     * Creates a notify_remove_connections message from a plain object. Also converts values to their respective internal types.
                     * @param d Plain object
                     * @returns notify_remove_connections
                     */
                    public static fromObject(d: { [k: string]: any }): yuhaiin.protos.statistic.service.notify_remove_connections;

                    /**
                     * Creates a plain object from a notify_remove_connections message. Also converts values to other types if specified.
                     * @param m notify_remove_connections
                     * @param [o] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(m: yuhaiin.protos.statistic.service.notify_remove_connections, o?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this notify_remove_connections to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }
        }
    }

    /** Namespace latency. */
    namespace latency {

        /** Properties of a http. */
        interface Ihttp {

            /** http url */
            url?: (string|null);
        }

        /** Represents a http. */
        class http implements Ihttp {

            /**
             * Constructs a new http.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.latency.Ihttp);

            /** http url. */
            public url: string;

            /**
             * Creates a new http instance using the specified properties.
             * @param [properties] Properties to set
             * @returns http instance
             */
            public static create(properties?: yuhaiin.latency.Ihttp): yuhaiin.latency.http;

            /**
             * Encodes the specified http message. Does not implicitly {@link yuhaiin.latency.http.verify|verify} messages.
             * @param m http message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.latency.Ihttp, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a http message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.latency.http;

            /**
             * Creates a http message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns http
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.latency.http;

            /**
             * Creates a plain object from a http message. Also converts values to other types if specified.
             * @param m http
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.latency.http, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this http to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a dns. */
        interface Idns {

            /** dns host */
            host?: (string|null);

            /** dns target_domain */
            target_domain?: (string|null);
        }

        /** Represents a dns. */
        class dns implements Idns {

            /**
             * Constructs a new dns.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.latency.Idns);

            /** dns host. */
            public host: string;

            /** dns target_domain. */
            public target_domain: string;

            /**
             * Creates a new dns instance using the specified properties.
             * @param [properties] Properties to set
             * @returns dns instance
             */
            public static create(properties?: yuhaiin.latency.Idns): yuhaiin.latency.dns;

            /**
             * Encodes the specified dns message. Does not implicitly {@link yuhaiin.latency.dns.verify|verify} messages.
             * @param m dns message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.latency.Idns, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a dns message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns dns
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.latency.dns;

            /**
             * Creates a dns message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns dns
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.latency.dns;

            /**
             * Creates a plain object from a dns message. Also converts values to other types if specified.
             * @param m dns
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.latency.dns, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this dns to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a dns_over_quic. */
        interface Idns_over_quic {

            /** dns_over_quic host */
            host?: (string|null);

            /** dns_over_quic target_domain */
            target_domain?: (string|null);
        }

        /** Represents a dns_over_quic. */
        class dns_over_quic implements Idns_over_quic {

            /**
             * Constructs a new dns_over_quic.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.latency.Idns_over_quic);

            /** dns_over_quic host. */
            public host: string;

            /** dns_over_quic target_domain. */
            public target_domain: string;

            /**
             * Creates a new dns_over_quic instance using the specified properties.
             * @param [properties] Properties to set
             * @returns dns_over_quic instance
             */
            public static create(properties?: yuhaiin.latency.Idns_over_quic): yuhaiin.latency.dns_over_quic;

            /**
             * Encodes the specified dns_over_quic message. Does not implicitly {@link yuhaiin.latency.dns_over_quic.verify|verify} messages.
             * @param m dns_over_quic message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.latency.Idns_over_quic, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a dns_over_quic message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns dns_over_quic
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.latency.dns_over_quic;

            /**
             * Creates a dns_over_quic message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns dns_over_quic
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.latency.dns_over_quic;

            /**
             * Creates a plain object from a dns_over_quic message. Also converts values to other types if specified.
             * @param m dns_over_quic
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.latency.dns_over_quic, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this dns_over_quic to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a protocol. */
        interface Iprotocol {

            /** protocol http */
            http?: (yuhaiin.latency.Ihttp|null);

            /** protocol dns */
            dns?: (yuhaiin.latency.Idns|null);

            /** protocol dns_over_quic */
            dns_over_quic?: (yuhaiin.latency.Idns_over_quic|null);
        }

        /** Represents a protocol. */
        class protocol implements Iprotocol {

            /**
             * Constructs a new protocol.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.latency.Iprotocol);

            /** protocol http. */
            public http?: (yuhaiin.latency.Ihttp|null);

            /** protocol dns. */
            public dns?: (yuhaiin.latency.Idns|null);

            /** protocol dns_over_quic. */
            public dns_over_quic?: (yuhaiin.latency.Idns_over_quic|null);

            /** protocol protocol. */
            public protocol?: ("http"|"dns"|"dns_over_quic");

            /**
             * Creates a new protocol instance using the specified properties.
             * @param [properties] Properties to set
             * @returns protocol instance
             */
            public static create(properties?: yuhaiin.latency.Iprotocol): yuhaiin.latency.protocol;

            /**
             * Encodes the specified protocol message. Does not implicitly {@link yuhaiin.latency.protocol.verify|verify} messages.
             * @param m protocol message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.latency.Iprotocol, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a protocol message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns protocol
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.latency.protocol;

            /**
             * Creates a protocol message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns protocol
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.latency.protocol;

            /**
             * Creates a plain object from a protocol message. Also converts values to other types if specified.
             * @param m protocol
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.latency.protocol, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this protocol to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a request. */
        interface Irequest {

            /** request id */
            id?: (string|null);

            /** request hash */
            hash?: (string|null);

            /** request protocol */
            protocol?: (yuhaiin.latency.Iprotocol|null);
        }

        /** Represents a request. */
        class request implements Irequest {

            /**
             * Constructs a new request.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.latency.Irequest);

            /** request id. */
            public id: string;

            /** request hash. */
            public hash: string;

            /** request protocol. */
            public protocol?: (yuhaiin.latency.Iprotocol|null);

            /**
             * Creates a new request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns request instance
             */
            public static create(properties?: yuhaiin.latency.Irequest): yuhaiin.latency.request;

            /**
             * Encodes the specified request message. Does not implicitly {@link yuhaiin.latency.request.verify|verify} messages.
             * @param m request message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.latency.Irequest, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a request message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.latency.request;

            /**
             * Creates a request message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns request
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.latency.request;

            /**
             * Creates a plain object from a request message. Also converts values to other types if specified.
             * @param m request
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.latency.request, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this request to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a requests. */
        interface Irequests {

            /** requests requests */
            requests?: (yuhaiin.latency.Irequest[]|null);
        }

        /** Represents a requests. */
        class requests implements Irequests {

            /**
             * Constructs a new requests.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.latency.Irequests);

            /** requests requests. */
            public requests: yuhaiin.latency.Irequest[];

            /**
             * Creates a new requests instance using the specified properties.
             * @param [properties] Properties to set
             * @returns requests instance
             */
            public static create(properties?: yuhaiin.latency.Irequests): yuhaiin.latency.requests;

            /**
             * Encodes the specified requests message. Does not implicitly {@link yuhaiin.latency.requests.verify|verify} messages.
             * @param m requests message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.latency.Irequests, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a requests message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns requests
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.latency.requests;

            /**
             * Creates a requests message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns requests
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.latency.requests;

            /**
             * Creates a plain object from a requests message. Also converts values to other types if specified.
             * @param m requests
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.latency.requests, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this requests to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a response. */
        interface Iresponse {

            /** response id_latency_map */
            id_latency_map?: ({ [k: string]: google.protobuf.IDuration }|null);
        }

        /** Represents a response. */
        class response implements Iresponse {

            /**
             * Constructs a new response.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.latency.Iresponse);

            /** response id_latency_map. */
            public id_latency_map: { [k: string]: google.protobuf.IDuration };

            /**
             * Creates a new response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns response instance
             */
            public static create(properties?: yuhaiin.latency.Iresponse): yuhaiin.latency.response;

            /**
             * Encodes the specified response message. Does not implicitly {@link yuhaiin.latency.response.verify|verify} messages.
             * @param m response message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.latency.Iresponse, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a response message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.latency.response;

            /**
             * Creates a response message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns response
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.latency.response;

            /**
             * Creates a plain object from a response message. Also converts values to other types if specified.
             * @param m response
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.latency.response, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this response to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace statistic. */
    namespace statistic {

        /** type enum. */
        enum type {
            unknown = 0,
            tcp = 1,
            tcp4 = 2,
            tcp6 = 3,
            udp = 4,
            udp4 = 5,
            udp6 = 6,
            ip = 7,
            ip4 = 8,
            ip6 = 9,
            unix = 10,
            unixgram = 11,
            unixpacket = 12
        }

        /** Properties of a net_type. */
        interface Inet_type {

            /** net_type conn_type */
            conn_type?: (yuhaiin.statistic.type|null);

            /** net_type underlying_type */
            underlying_type?: (yuhaiin.statistic.type|null);
        }

        /** Represents a net_type. */
        class net_type implements Inet_type {

            /**
             * Constructs a new net_type.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.statistic.Inet_type);

            /** net_type conn_type. */
            public conn_type: yuhaiin.statistic.type;

            /** net_type underlying_type. */
            public underlying_type: yuhaiin.statistic.type;

            /**
             * Creates a new net_type instance using the specified properties.
             * @param [properties] Properties to set
             * @returns net_type instance
             */
            public static create(properties?: yuhaiin.statistic.Inet_type): yuhaiin.statistic.net_type;

            /**
             * Encodes the specified net_type message. Does not implicitly {@link yuhaiin.statistic.net_type.verify|verify} messages.
             * @param m net_type message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.statistic.Inet_type, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a net_type message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns net_type
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.statistic.net_type;

            /**
             * Creates a net_type message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns net_type
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.statistic.net_type;

            /**
             * Creates a plain object from a net_type message. Also converts values to other types if specified.
             * @param m net_type
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.statistic.net_type, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this net_type to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a connection. */
        interface Iconnection {

            /** connection addr */
            addr?: (string|null);

            /** connection id */
            id?: (number|Long|null);

            /** connection type */
            type?: (yuhaiin.statistic.Inet_type|null);

            /** connection extra */
            extra?: ({ [k: string]: string }|null);
        }

        /** Represents a connection. */
        class connection implements Iconnection {

            /**
             * Constructs a new connection.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.statistic.Iconnection);

            /** connection addr. */
            public addr: string;

            /** connection id. */
            public id: (number|Long);

            /** connection type. */
            public type?: (yuhaiin.statistic.Inet_type|null);

            /** connection extra. */
            public extra: { [k: string]: string };

            /**
             * Creates a new connection instance using the specified properties.
             * @param [properties] Properties to set
             * @returns connection instance
             */
            public static create(properties?: yuhaiin.statistic.Iconnection): yuhaiin.statistic.connection;

            /**
             * Encodes the specified connection message. Does not implicitly {@link yuhaiin.statistic.connection.verify|verify} messages.
             * @param m connection message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.statistic.Iconnection, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a connection message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns connection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.statistic.connection;

            /**
             * Creates a connection message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns connection
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.statistic.connection;

            /**
             * Creates a plain object from a connection message. Also converts values to other types if specified.
             * @param m connection
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.statistic.connection, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this connection to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of an Empty. */
        interface IEmpty {
        }

        /** Represents an Empty. */
        class Empty implements IEmpty {

            /**
             * Constructs a new Empty.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IEmpty);

            /**
             * Creates a new Empty instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Empty instance
             */
            public static create(properties?: google.protobuf.IEmpty): google.protobuf.Empty;

            /**
             * Encodes the specified Empty message. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @param m Empty message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IEmpty, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Empty message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.Empty;

            /**
             * Creates an Empty message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns Empty
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.Empty;

            /**
             * Creates a plain object from an Empty message. Also converts values to other types if specified.
             * @param m Empty
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.Empty, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Empty to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DoubleValue. */
        interface IDoubleValue {

            /** DoubleValue value */
            value?: (number|null);
        }

        /** Represents a DoubleValue. */
        class DoubleValue implements IDoubleValue {

            /**
             * Constructs a new DoubleValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IDoubleValue);

            /** DoubleValue value. */
            public value: number;

            /**
             * Creates a new DoubleValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DoubleValue instance
             */
            public static create(properties?: google.protobuf.IDoubleValue): google.protobuf.DoubleValue;

            /**
             * Encodes the specified DoubleValue message. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
             * @param m DoubleValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IDoubleValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DoubleValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns DoubleValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.DoubleValue;

            /**
             * Creates a DoubleValue message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns DoubleValue
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.DoubleValue;

            /**
             * Creates a plain object from a DoubleValue message. Also converts values to other types if specified.
             * @param m DoubleValue
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.DoubleValue, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DoubleValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FloatValue. */
        interface IFloatValue {

            /** FloatValue value */
            value?: (number|null);
        }

        /** Represents a FloatValue. */
        class FloatValue implements IFloatValue {

            /**
             * Constructs a new FloatValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IFloatValue);

            /** FloatValue value. */
            public value: number;

            /**
             * Creates a new FloatValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FloatValue instance
             */
            public static create(properties?: google.protobuf.IFloatValue): google.protobuf.FloatValue;

            /**
             * Encodes the specified FloatValue message. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
             * @param m FloatValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IFloatValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FloatValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns FloatValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.FloatValue;

            /**
             * Creates a FloatValue message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns FloatValue
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.FloatValue;

            /**
             * Creates a plain object from a FloatValue message. Also converts values to other types if specified.
             * @param m FloatValue
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.FloatValue, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FloatValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an Int64Value. */
        interface IInt64Value {

            /** Int64Value value */
            value?: (number|Long|null);
        }

        /** Represents an Int64Value. */
        class Int64Value implements IInt64Value {

            /**
             * Constructs a new Int64Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IInt64Value);

            /** Int64Value value. */
            public value: (number|Long);

            /**
             * Creates a new Int64Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Int64Value instance
             */
            public static create(properties?: google.protobuf.IInt64Value): google.protobuf.Int64Value;

            /**
             * Encodes the specified Int64Value message. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
             * @param m Int64Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IInt64Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Int64Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Int64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.Int64Value;

            /**
             * Creates an Int64Value message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns Int64Value
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.Int64Value;

            /**
             * Creates a plain object from an Int64Value message. Also converts values to other types if specified.
             * @param m Int64Value
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.Int64Value, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Int64Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a UInt64Value. */
        interface IUInt64Value {

            /** UInt64Value value */
            value?: (number|Long|null);
        }

        /** Represents a UInt64Value. */
        class UInt64Value implements IUInt64Value {

            /**
             * Constructs a new UInt64Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IUInt64Value);

            /** UInt64Value value. */
            public value: (number|Long);

            /**
             * Creates a new UInt64Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UInt64Value instance
             */
            public static create(properties?: google.protobuf.IUInt64Value): google.protobuf.UInt64Value;

            /**
             * Encodes the specified UInt64Value message. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
             * @param m UInt64Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IUInt64Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UInt64Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns UInt64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.UInt64Value;

            /**
             * Creates a UInt64Value message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns UInt64Value
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.UInt64Value;

            /**
             * Creates a plain object from a UInt64Value message. Also converts values to other types if specified.
             * @param m UInt64Value
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.UInt64Value, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UInt64Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an Int32Value. */
        interface IInt32Value {

            /** Int32Value value */
            value?: (number|null);
        }

        /** Represents an Int32Value. */
        class Int32Value implements IInt32Value {

            /**
             * Constructs a new Int32Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IInt32Value);

            /** Int32Value value. */
            public value: number;

            /**
             * Creates a new Int32Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Int32Value instance
             */
            public static create(properties?: google.protobuf.IInt32Value): google.protobuf.Int32Value;

            /**
             * Encodes the specified Int32Value message. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
             * @param m Int32Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IInt32Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Int32Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Int32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.Int32Value;

            /**
             * Creates an Int32Value message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns Int32Value
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.Int32Value;

            /**
             * Creates a plain object from an Int32Value message. Also converts values to other types if specified.
             * @param m Int32Value
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.Int32Value, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Int32Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a UInt32Value. */
        interface IUInt32Value {

            /** UInt32Value value */
            value?: (number|null);
        }

        /** Represents a UInt32Value. */
        class UInt32Value implements IUInt32Value {

            /**
             * Constructs a new UInt32Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IUInt32Value);

            /** UInt32Value value. */
            public value: number;

            /**
             * Creates a new UInt32Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UInt32Value instance
             */
            public static create(properties?: google.protobuf.IUInt32Value): google.protobuf.UInt32Value;

            /**
             * Encodes the specified UInt32Value message. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
             * @param m UInt32Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IUInt32Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UInt32Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns UInt32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.UInt32Value;

            /**
             * Creates a UInt32Value message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns UInt32Value
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.UInt32Value;

            /**
             * Creates a plain object from a UInt32Value message. Also converts values to other types if specified.
             * @param m UInt32Value
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.UInt32Value, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UInt32Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a BoolValue. */
        interface IBoolValue {

            /** BoolValue value */
            value?: (boolean|null);
        }

        /** Represents a BoolValue. */
        class BoolValue implements IBoolValue {

            /**
             * Constructs a new BoolValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IBoolValue);

            /** BoolValue value. */
            public value: boolean;

            /**
             * Creates a new BoolValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BoolValue instance
             */
            public static create(properties?: google.protobuf.IBoolValue): google.protobuf.BoolValue;

            /**
             * Encodes the specified BoolValue message. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
             * @param m BoolValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IBoolValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BoolValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns BoolValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.BoolValue;

            /**
             * Creates a BoolValue message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns BoolValue
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.BoolValue;

            /**
             * Creates a plain object from a BoolValue message. Also converts values to other types if specified.
             * @param m BoolValue
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.BoolValue, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this BoolValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a StringValue. */
        interface IStringValue {

            /** StringValue value */
            value?: (string|null);
        }

        /** Represents a StringValue. */
        class StringValue implements IStringValue {

            /**
             * Constructs a new StringValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IStringValue);

            /** StringValue value. */
            public value: string;

            /**
             * Creates a new StringValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns StringValue instance
             */
            public static create(properties?: google.protobuf.IStringValue): google.protobuf.StringValue;

            /**
             * Encodes the specified StringValue message. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
             * @param m StringValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IStringValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a StringValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns StringValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.StringValue;

            /**
             * Creates a StringValue message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns StringValue
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.StringValue;

            /**
             * Creates a plain object from a StringValue message. Also converts values to other types if specified.
             * @param m StringValue
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.StringValue, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this StringValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a BytesValue. */
        interface IBytesValue {

            /** BytesValue value */
            value?: (Uint8Array|null);
        }

        /** Represents a BytesValue. */
        class BytesValue implements IBytesValue {

            /**
             * Constructs a new BytesValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IBytesValue);

            /** BytesValue value. */
            public value: Uint8Array;

            /**
             * Creates a new BytesValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BytesValue instance
             */
            public static create(properties?: google.protobuf.IBytesValue): google.protobuf.BytesValue;

            /**
             * Encodes the specified BytesValue message. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
             * @param m BytesValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IBytesValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BytesValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns BytesValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.BytesValue;

            /**
             * Creates a BytesValue message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns BytesValue
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.BytesValue;

            /**
             * Creates a plain object from a BytesValue message. Also converts values to other types if specified.
             * @param m BytesValue
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.BytesValue, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this BytesValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Duration. */
        interface IDuration {

            /** Duration seconds */
            seconds?: (number|Long|null);

            /** Duration nanos */
            nanos?: (number|null);
        }

        /** Represents a Duration. */
        class Duration implements IDuration {

            /**
             * Constructs a new Duration.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IDuration);

            /** Duration seconds. */
            public seconds: (number|Long);

            /** Duration nanos. */
            public nanos: number;

            /**
             * Creates a new Duration instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Duration instance
             */
            public static create(properties?: google.protobuf.IDuration): google.protobuf.Duration;

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param m Duration message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IDuration, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.Duration;

            /**
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns Duration
             */
            public static fromObject(d: { [k: string]: any }): google.protobuf.Duration;

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @param m Duration
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: google.protobuf.Duration, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Duration to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
