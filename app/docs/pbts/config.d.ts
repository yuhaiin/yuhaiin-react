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

        /** Properties of an info. */
        interface Iinfo {

            /** info version */
            version?: (string|null);

            /** info commit */
            commit?: (string|null);

            /** info build_time */
            build_time?: (string|null);

            /** info go_version */
            go_version?: (string|null);

            /** info arch */
            arch?: (string|null);

            /** info platform */
            platform?: (string|null);

            /** info os */
            os?: (string|null);

            /** info compiler */
            compiler?: (string|null);

            /** info build */
            build?: (string[]|null);
        }

        /** Represents an info. */
        class info implements Iinfo {

            /**
             * Constructs a new info.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.config.Iinfo);

            /** info version. */
            public version: string;

            /** info commit. */
            public commit: string;

            /** info build_time. */
            public build_time: string;

            /** info go_version. */
            public go_version: string;

            /** info arch. */
            public arch: string;

            /** info platform. */
            public platform: string;

            /** info os. */
            public os: string;

            /** info compiler. */
            public compiler: string;

            /** info build. */
            public build: string[];

            /**
             * Creates a new info instance using the specified properties.
             * @param [properties] Properties to set
             * @returns info instance
             */
            public static create(properties?: yuhaiin.config.Iinfo): yuhaiin.config.info;

            /**
             * Encodes the specified info message. Does not implicitly {@link yuhaiin.config.info.verify|verify} messages.
             * @param m info message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.config.Iinfo, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an info message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns info
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.config.info;

            /**
             * Creates an info message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns info
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.config.info;

            /**
             * Creates a plain object from an info message. Also converts values to other types if specified.
             * @param m info
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.config.info, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this info to JSON.
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

            /** mode_config mode */
            mode?: (yuhaiin.bypass.mode|null);

            /** mode_config tag */
            tag?: (string|null);

            /** mode_config hostname */
            hostname?: (string[]|null);

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

            /** mode_config mode. */
            public mode: yuhaiin.bypass.mode;

            /** mode_config tag. */
            public tag: string;

            /** mode_config hostname. */
            public hostname: string[];

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

            /** dns_config fakedns_ipv6_range */
            fakedns_ipv6_range?: (string|null);

            /** dns_config fakedns_whitelist */
            fakedns_whitelist?: (string[]|null);

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

            /** dns_config resolver */
            resolver?: ({ [k: string]: yuhaiin.dns.Idns }|null);
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

            /** dns_config fakedns_ipv6_range. */
            public fakedns_ipv6_range: string;

            /** dns_config fakedns_whitelist. */
            public fakedns_whitelist: string[];

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

            /** dns_config resolver. */
            public resolver: { [k: string]: yuhaiin.dns.Idns };

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

        /** tcp_udp_control enum. */
        enum tcp_udp_control {
            tcp_udp_control_all = 0,
            disable_tcp = 1,
            disable_udp = 2
        }

        /** Properties of a tcpudp. */
        interface Itcpudp {

            /** tcpudp host */
            host?: (string|null);

            /** tcpudp control */
            control?: (yuhaiin.listener.tcp_udp_control|null);
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

            /** tcpudp control. */
            public control: yuhaiin.listener.tcp_udp_control;

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

            /** tun portal_v6 */
            portal_v6?: (string|null);

            /** tun route */
            route?: (yuhaiin.listener.Iroute|null);
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

            /** tun portal_v6. */
            public portal_v6: string;

            /** tun route. */
            public route?: (yuhaiin.listener.Iroute|null);

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

        /** Properties of a route. */
        interface Iroute {

            /** route routes */
            routes?: (string[]|null);

            /** route excludes */
            excludes?: (string[]|null);
        }

        /** Represents a route. */
        class route implements Iroute {

            /**
             * Constructs a new route.
             * @param [p] Properties to set
             */
            constructor(p?: yuhaiin.listener.Iroute);

            /** route routes. */
            public routes: string[];

            /** route excludes. */
            public excludes: string[];

            /**
             * Creates a new route instance using the specified properties.
             * @param [properties] Properties to set
             * @returns route instance
             */
            public static create(properties?: yuhaiin.listener.Iroute): yuhaiin.listener.route;

            /**
             * Encodes the specified route message. Does not implicitly {@link yuhaiin.listener.route.verify|verify} messages.
             * @param m route message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: yuhaiin.listener.Iroute, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a route message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns route
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): yuhaiin.listener.route;

            /**
             * Creates a route message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns route
             */
            public static fromObject(d: { [k: string]: any }): yuhaiin.listener.route;

            /**
             * Creates a plain object from a route message. Also converts values to other types if specified.
             * @param m route
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: yuhaiin.listener.route, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this route to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
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
}
