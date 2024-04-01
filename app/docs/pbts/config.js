/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots.config || ($protobuf.roots.config = {});

export const yuhaiin = $root.yuhaiin = (() => {

    /**
     * Namespace yuhaiin.
     * @exports yuhaiin
     * @namespace
     */
    const yuhaiin = {};

    yuhaiin.config = (function() {

        /**
         * Namespace config.
         * @memberof yuhaiin
         * @namespace
         */
        const config = {};

        config.setting = (function() {

            /**
             * Properties of a setting.
             * @memberof yuhaiin.config
             * @interface Isetting
             * @property {boolean|null} [ipv6] setting ipv6
             * @property {string|null} [net_interface] setting net_interface
             * @property {yuhaiin.config.Isystem_proxy|null} [system_proxy] setting system_proxy
             * @property {yuhaiin.bypass.Ibypass_config|null} [bypass] setting bypass
             * @property {yuhaiin.dns.Idns_config|null} [dns] setting dns
             * @property {yuhaiin.listener.Iinbound_config|null} [server] setting server
             * @property {yuhaiin.log.Ilogcat|null} [logcat] setting logcat
             */

            /**
             * Constructs a new setting.
             * @memberof yuhaiin.config
             * @classdesc Represents a setting.
             * @implements Isetting
             * @constructor
             * @param {yuhaiin.config.Isetting=} [p] Properties to set
             */
            function setting(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * setting ipv6.
             * @member {boolean} ipv6
             * @memberof yuhaiin.config.setting
             * @instance
             */
            setting.prototype.ipv6 = false;

            /**
             * setting net_interface.
             * @member {string} net_interface
             * @memberof yuhaiin.config.setting
             * @instance
             */
            setting.prototype.net_interface = "";

            /**
             * setting system_proxy.
             * @member {yuhaiin.config.Isystem_proxy|null|undefined} system_proxy
             * @memberof yuhaiin.config.setting
             * @instance
             */
            setting.prototype.system_proxy = null;

            /**
             * setting bypass.
             * @member {yuhaiin.bypass.Ibypass_config|null|undefined} bypass
             * @memberof yuhaiin.config.setting
             * @instance
             */
            setting.prototype.bypass = null;

            /**
             * setting dns.
             * @member {yuhaiin.dns.Idns_config|null|undefined} dns
             * @memberof yuhaiin.config.setting
             * @instance
             */
            setting.prototype.dns = null;

            /**
             * setting server.
             * @member {yuhaiin.listener.Iinbound_config|null|undefined} server
             * @memberof yuhaiin.config.setting
             * @instance
             */
            setting.prototype.server = null;

            /**
             * setting logcat.
             * @member {yuhaiin.log.Ilogcat|null|undefined} logcat
             * @memberof yuhaiin.config.setting
             * @instance
             */
            setting.prototype.logcat = null;

            /**
             * Creates a new setting instance using the specified properties.
             * @function create
             * @memberof yuhaiin.config.setting
             * @static
             * @param {yuhaiin.config.Isetting=} [properties] Properties to set
             * @returns {yuhaiin.config.setting} setting instance
             */
            setting.create = function create(properties) {
                return new setting(properties);
            };

            /**
             * Encodes the specified setting message. Does not implicitly {@link yuhaiin.config.setting.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.config.setting
             * @static
             * @param {yuhaiin.config.Isetting} m setting message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            setting.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.system_proxy != null && Object.hasOwnProperty.call(m, "system_proxy"))
                    $root.yuhaiin.config.system_proxy.encode(m.system_proxy, w.uint32(10).fork()).ldelim();
                if (m.bypass != null && Object.hasOwnProperty.call(m, "bypass"))
                    $root.yuhaiin.bypass.bypass_config.encode(m.bypass, w.uint32(18).fork()).ldelim();
                if (m.dns != null && Object.hasOwnProperty.call(m, "dns"))
                    $root.yuhaiin.dns.dns_config.encode(m.dns, w.uint32(34).fork()).ldelim();
                if (m.server != null && Object.hasOwnProperty.call(m, "server"))
                    $root.yuhaiin.listener.inbound_config.encode(m.server, w.uint32(42).fork()).ldelim();
                if (m.net_interface != null && Object.hasOwnProperty.call(m, "net_interface"))
                    w.uint32(50).string(m.net_interface);
                if (m.ipv6 != null && Object.hasOwnProperty.call(m, "ipv6"))
                    w.uint32(56).bool(m.ipv6);
                if (m.logcat != null && Object.hasOwnProperty.call(m, "logcat"))
                    $root.yuhaiin.log.logcat.encode(m.logcat, w.uint32(66).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a setting message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.config.setting
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.config.setting} setting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            setting.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.config.setting();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 7: {
                            m.ipv6 = r.bool();
                            break;
                        }
                    case 6: {
                            m.net_interface = r.string();
                            break;
                        }
                    case 1: {
                            m.system_proxy = $root.yuhaiin.config.system_proxy.decode(r, r.uint32());
                            break;
                        }
                    case 2: {
                            m.bypass = $root.yuhaiin.bypass.bypass_config.decode(r, r.uint32());
                            break;
                        }
                    case 4: {
                            m.dns = $root.yuhaiin.dns.dns_config.decode(r, r.uint32());
                            break;
                        }
                    case 5: {
                            m.server = $root.yuhaiin.listener.inbound_config.decode(r, r.uint32());
                            break;
                        }
                    case 8: {
                            m.logcat = $root.yuhaiin.log.logcat.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a setting message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.config.setting
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.config.setting} setting
             */
            setting.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.config.setting)
                    return d;
                var m = new $root.yuhaiin.config.setting();
                if (d.ipv6 != null) {
                    m.ipv6 = Boolean(d.ipv6);
                }
                if (d.net_interface != null) {
                    m.net_interface = String(d.net_interface);
                }
                if (d.system_proxy != null) {
                    if (typeof d.system_proxy !== "object")
                        throw TypeError(".yuhaiin.config.setting.system_proxy: object expected");
                    m.system_proxy = $root.yuhaiin.config.system_proxy.fromObject(d.system_proxy);
                }
                if (d.bypass != null) {
                    if (typeof d.bypass !== "object")
                        throw TypeError(".yuhaiin.config.setting.bypass: object expected");
                    m.bypass = $root.yuhaiin.bypass.bypass_config.fromObject(d.bypass);
                }
                if (d.dns != null) {
                    if (typeof d.dns !== "object")
                        throw TypeError(".yuhaiin.config.setting.dns: object expected");
                    m.dns = $root.yuhaiin.dns.dns_config.fromObject(d.dns);
                }
                if (d.server != null) {
                    if (typeof d.server !== "object")
                        throw TypeError(".yuhaiin.config.setting.server: object expected");
                    m.server = $root.yuhaiin.listener.inbound_config.fromObject(d.server);
                }
                if (d.logcat != null) {
                    if (typeof d.logcat !== "object")
                        throw TypeError(".yuhaiin.config.setting.logcat: object expected");
                    m.logcat = $root.yuhaiin.log.logcat.fromObject(d.logcat);
                }
                return m;
            };

            /**
             * Creates a plain object from a setting message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.config.setting
             * @static
             * @param {yuhaiin.config.setting} m setting
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            setting.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.system_proxy = null;
                    d.bypass = null;
                    d.dns = null;
                    d.server = null;
                    d.net_interface = "";
                    d.ipv6 = false;
                    d.logcat = null;
                }
                if (m.system_proxy != null && m.hasOwnProperty("system_proxy")) {
                    d.system_proxy = $root.yuhaiin.config.system_proxy.toObject(m.system_proxy, o);
                }
                if (m.bypass != null && m.hasOwnProperty("bypass")) {
                    d.bypass = $root.yuhaiin.bypass.bypass_config.toObject(m.bypass, o);
                }
                if (m.dns != null && m.hasOwnProperty("dns")) {
                    d.dns = $root.yuhaiin.dns.dns_config.toObject(m.dns, o);
                }
                if (m.server != null && m.hasOwnProperty("server")) {
                    d.server = $root.yuhaiin.listener.inbound_config.toObject(m.server, o);
                }
                if (m.net_interface != null && m.hasOwnProperty("net_interface")) {
                    d.net_interface = m.net_interface;
                }
                if (m.ipv6 != null && m.hasOwnProperty("ipv6")) {
                    d.ipv6 = m.ipv6;
                }
                if (m.logcat != null && m.hasOwnProperty("logcat")) {
                    d.logcat = $root.yuhaiin.log.logcat.toObject(m.logcat, o);
                }
                return d;
            };

            /**
             * Converts this setting to JSON.
             * @function toJSON
             * @memberof yuhaiin.config.setting
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            setting.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return setting;
        })();

        config.system_proxy = (function() {

            /**
             * Properties of a system_proxy.
             * @memberof yuhaiin.config
             * @interface Isystem_proxy
             * @property {boolean|null} [http] system_proxy http
             * @property {boolean|null} [socks5] system_proxy socks5
             */

            /**
             * Constructs a new system_proxy.
             * @memberof yuhaiin.config
             * @classdesc Represents a system_proxy.
             * @implements Isystem_proxy
             * @constructor
             * @param {yuhaiin.config.Isystem_proxy=} [p] Properties to set
             */
            function system_proxy(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * system_proxy http.
             * @member {boolean} http
             * @memberof yuhaiin.config.system_proxy
             * @instance
             */
            system_proxy.prototype.http = false;

            /**
             * system_proxy socks5.
             * @member {boolean} socks5
             * @memberof yuhaiin.config.system_proxy
             * @instance
             */
            system_proxy.prototype.socks5 = false;

            /**
             * Creates a new system_proxy instance using the specified properties.
             * @function create
             * @memberof yuhaiin.config.system_proxy
             * @static
             * @param {yuhaiin.config.Isystem_proxy=} [properties] Properties to set
             * @returns {yuhaiin.config.system_proxy} system_proxy instance
             */
            system_proxy.create = function create(properties) {
                return new system_proxy(properties);
            };

            /**
             * Encodes the specified system_proxy message. Does not implicitly {@link yuhaiin.config.system_proxy.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.config.system_proxy
             * @static
             * @param {yuhaiin.config.Isystem_proxy} m system_proxy message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            system_proxy.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.http != null && Object.hasOwnProperty.call(m, "http"))
                    w.uint32(16).bool(m.http);
                if (m.socks5 != null && Object.hasOwnProperty.call(m, "socks5"))
                    w.uint32(24).bool(m.socks5);
                return w;
            };

            /**
             * Decodes a system_proxy message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.config.system_proxy
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.config.system_proxy} system_proxy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            system_proxy.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.config.system_proxy();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 2: {
                            m.http = r.bool();
                            break;
                        }
                    case 3: {
                            m.socks5 = r.bool();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a system_proxy message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.config.system_proxy
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.config.system_proxy} system_proxy
             */
            system_proxy.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.config.system_proxy)
                    return d;
                var m = new $root.yuhaiin.config.system_proxy();
                if (d.http != null) {
                    m.http = Boolean(d.http);
                }
                if (d.socks5 != null) {
                    m.socks5 = Boolean(d.socks5);
                }
                return m;
            };

            /**
             * Creates a plain object from a system_proxy message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.config.system_proxy
             * @static
             * @param {yuhaiin.config.system_proxy} m system_proxy
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            system_proxy.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.http = false;
                    d.socks5 = false;
                }
                if (m.http != null && m.hasOwnProperty("http")) {
                    d.http = m.http;
                }
                if (m.socks5 != null && m.hasOwnProperty("socks5")) {
                    d.socks5 = m.socks5;
                }
                return d;
            };

            /**
             * Converts this system_proxy to JSON.
             * @function toJSON
             * @memberof yuhaiin.config.system_proxy
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            system_proxy.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return system_proxy;
        })();

        config.info = (function() {

            /**
             * Properties of an info.
             * @memberof yuhaiin.config
             * @interface Iinfo
             * @property {string|null} [version] info version
             * @property {string|null} [commit] info commit
             * @property {string|null} [build_time] info build_time
             * @property {string|null} [go_version] info go_version
             * @property {string|null} [arch] info arch
             * @property {string|null} [platform] info platform
             * @property {string|null} [os] info os
             * @property {string|null} [compiler] info compiler
             * @property {Array.<string>|null} [build] info build
             */

            /**
             * Constructs a new info.
             * @memberof yuhaiin.config
             * @classdesc Represents an info.
             * @implements Iinfo
             * @constructor
             * @param {yuhaiin.config.Iinfo=} [p] Properties to set
             */
            function info(p) {
                this.build = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * info version.
             * @member {string} version
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.version = "";

            /**
             * info commit.
             * @member {string} commit
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.commit = "";

            /**
             * info build_time.
             * @member {string} build_time
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.build_time = "";

            /**
             * info go_version.
             * @member {string} go_version
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.go_version = "";

            /**
             * info arch.
             * @member {string} arch
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.arch = "";

            /**
             * info platform.
             * @member {string} platform
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.platform = "";

            /**
             * info os.
             * @member {string} os
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.os = "";

            /**
             * info compiler.
             * @member {string} compiler
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.compiler = "";

            /**
             * info build.
             * @member {Array.<string>} build
             * @memberof yuhaiin.config.info
             * @instance
             */
            info.prototype.build = $util.emptyArray;

            /**
             * Creates a new info instance using the specified properties.
             * @function create
             * @memberof yuhaiin.config.info
             * @static
             * @param {yuhaiin.config.Iinfo=} [properties] Properties to set
             * @returns {yuhaiin.config.info} info instance
             */
            info.create = function create(properties) {
                return new info(properties);
            };

            /**
             * Encodes the specified info message. Does not implicitly {@link yuhaiin.config.info.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.config.info
             * @static
             * @param {yuhaiin.config.Iinfo} m info message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            info.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.version != null && Object.hasOwnProperty.call(m, "version"))
                    w.uint32(10).string(m.version);
                if (m.commit != null && Object.hasOwnProperty.call(m, "commit"))
                    w.uint32(18).string(m.commit);
                if (m.build_time != null && Object.hasOwnProperty.call(m, "build_time"))
                    w.uint32(26).string(m.build_time);
                if (m.go_version != null && Object.hasOwnProperty.call(m, "go_version"))
                    w.uint32(34).string(m.go_version);
                if (m.arch != null && Object.hasOwnProperty.call(m, "arch"))
                    w.uint32(42).string(m.arch);
                if (m.platform != null && Object.hasOwnProperty.call(m, "platform"))
                    w.uint32(50).string(m.platform);
                if (m.os != null && Object.hasOwnProperty.call(m, "os"))
                    w.uint32(58).string(m.os);
                if (m.compiler != null && Object.hasOwnProperty.call(m, "compiler"))
                    w.uint32(66).string(m.compiler);
                if (m.build != null && m.build.length) {
                    for (var i = 0; i < m.build.length; ++i)
                        w.uint32(74).string(m.build[i]);
                }
                return w;
            };

            /**
             * Decodes an info message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.config.info
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.config.info} info
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            info.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.config.info();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.version = r.string();
                            break;
                        }
                    case 2: {
                            m.commit = r.string();
                            break;
                        }
                    case 3: {
                            m.build_time = r.string();
                            break;
                        }
                    case 4: {
                            m.go_version = r.string();
                            break;
                        }
                    case 5: {
                            m.arch = r.string();
                            break;
                        }
                    case 6: {
                            m.platform = r.string();
                            break;
                        }
                    case 7: {
                            m.os = r.string();
                            break;
                        }
                    case 8: {
                            m.compiler = r.string();
                            break;
                        }
                    case 9: {
                            if (!(m.build && m.build.length))
                                m.build = [];
                            m.build.push(r.string());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates an info message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.config.info
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.config.info} info
             */
            info.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.config.info)
                    return d;
                var m = new $root.yuhaiin.config.info();
                if (d.version != null) {
                    m.version = String(d.version);
                }
                if (d.commit != null) {
                    m.commit = String(d.commit);
                }
                if (d.build_time != null) {
                    m.build_time = String(d.build_time);
                }
                if (d.go_version != null) {
                    m.go_version = String(d.go_version);
                }
                if (d.arch != null) {
                    m.arch = String(d.arch);
                }
                if (d.platform != null) {
                    m.platform = String(d.platform);
                }
                if (d.os != null) {
                    m.os = String(d.os);
                }
                if (d.compiler != null) {
                    m.compiler = String(d.compiler);
                }
                if (d.build) {
                    if (!Array.isArray(d.build))
                        throw TypeError(".yuhaiin.config.info.build: array expected");
                    m.build = [];
                    for (var i = 0; i < d.build.length; ++i) {
                        m.build[i] = String(d.build[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from an info message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.config.info
             * @static
             * @param {yuhaiin.config.info} m info
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            info.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.build = [];
                }
                if (o.defaults) {
                    d.version = "";
                    d.commit = "";
                    d.build_time = "";
                    d.go_version = "";
                    d.arch = "";
                    d.platform = "";
                    d.os = "";
                    d.compiler = "";
                }
                if (m.version != null && m.hasOwnProperty("version")) {
                    d.version = m.version;
                }
                if (m.commit != null && m.hasOwnProperty("commit")) {
                    d.commit = m.commit;
                }
                if (m.build_time != null && m.hasOwnProperty("build_time")) {
                    d.build_time = m.build_time;
                }
                if (m.go_version != null && m.hasOwnProperty("go_version")) {
                    d.go_version = m.go_version;
                }
                if (m.arch != null && m.hasOwnProperty("arch")) {
                    d.arch = m.arch;
                }
                if (m.platform != null && m.hasOwnProperty("platform")) {
                    d.platform = m.platform;
                }
                if (m.os != null && m.hasOwnProperty("os")) {
                    d.os = m.os;
                }
                if (m.compiler != null && m.hasOwnProperty("compiler")) {
                    d.compiler = m.compiler;
                }
                if (m.build && m.build.length) {
                    d.build = [];
                    for (var j = 0; j < m.build.length; ++j) {
                        d.build[j] = m.build[j];
                    }
                }
                return d;
            };

            /**
             * Converts this info to JSON.
             * @function toJSON
             * @memberof yuhaiin.config.info
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            info.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return info;
        })();

        return config;
    })();

    yuhaiin.log = (function() {

        /**
         * Namespace log.
         * @memberof yuhaiin
         * @namespace
         */
        const log = {};

        /**
         * log_level enum.
         * @name yuhaiin.log.log_level
         * @enum {number}
         * @property {number} verbose=0 verbose value
         * @property {number} debug=1 debug value
         * @property {number} info=2 info value
         * @property {number} warning=3 warning value
         * @property {number} error=4 error value
         * @property {number} fatal=5 fatal value
         */
        log.log_level = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "verbose"] = 0;
            values[valuesById[1] = "debug"] = 1;
            values[valuesById[2] = "info"] = 2;
            values[valuesById[3] = "warning"] = 3;
            values[valuesById[4] = "error"] = 4;
            values[valuesById[5] = "fatal"] = 5;
            return values;
        })();

        log.logcat = (function() {

            /**
             * Properties of a logcat.
             * @memberof yuhaiin.log
             * @interface Ilogcat
             * @property {yuhaiin.log.log_level|null} [level] logcat level
             * @property {boolean|null} [save] logcat save
             */

            /**
             * Constructs a new logcat.
             * @memberof yuhaiin.log
             * @classdesc Represents a logcat.
             * @implements Ilogcat
             * @constructor
             * @param {yuhaiin.log.Ilogcat=} [p] Properties to set
             */
            function logcat(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * logcat level.
             * @member {yuhaiin.log.log_level} level
             * @memberof yuhaiin.log.logcat
             * @instance
             */
            logcat.prototype.level = 0;

            /**
             * logcat save.
             * @member {boolean} save
             * @memberof yuhaiin.log.logcat
             * @instance
             */
            logcat.prototype.save = false;

            /**
             * Creates a new logcat instance using the specified properties.
             * @function create
             * @memberof yuhaiin.log.logcat
             * @static
             * @param {yuhaiin.log.Ilogcat=} [properties] Properties to set
             * @returns {yuhaiin.log.logcat} logcat instance
             */
            logcat.create = function create(properties) {
                return new logcat(properties);
            };

            /**
             * Encodes the specified logcat message. Does not implicitly {@link yuhaiin.log.logcat.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.log.logcat
             * @static
             * @param {yuhaiin.log.Ilogcat} m logcat message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            logcat.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.level != null && Object.hasOwnProperty.call(m, "level"))
                    w.uint32(8).int32(m.level);
                if (m.save != null && Object.hasOwnProperty.call(m, "save"))
                    w.uint32(16).bool(m.save);
                return w;
            };

            /**
             * Decodes a logcat message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.log.logcat
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.log.logcat} logcat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            logcat.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.log.logcat();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.level = r.int32();
                            break;
                        }
                    case 2: {
                            m.save = r.bool();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a logcat message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.log.logcat
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.log.logcat} logcat
             */
            logcat.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.log.logcat)
                    return d;
                var m = new $root.yuhaiin.log.logcat();
                switch (d.level) {
                default:
                    if (typeof d.level === "number") {
                        m.level = d.level;
                        break;
                    }
                    break;
                case "verbose":
                case 0:
                    m.level = 0;
                    break;
                case "debug":
                case 1:
                    m.level = 1;
                    break;
                case "info":
                case 2:
                    m.level = 2;
                    break;
                case "warning":
                case 3:
                    m.level = 3;
                    break;
                case "error":
                case 4:
                    m.level = 4;
                    break;
                case "fatal":
                case 5:
                    m.level = 5;
                    break;
                }
                if (d.save != null) {
                    m.save = Boolean(d.save);
                }
                return m;
            };

            /**
             * Creates a plain object from a logcat message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.log.logcat
             * @static
             * @param {yuhaiin.log.logcat} m logcat
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            logcat.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.level = o.enums === String ? "verbose" : 0;
                    d.save = false;
                }
                if (m.level != null && m.hasOwnProperty("level")) {
                    d.level = o.enums === String ? $root.yuhaiin.log.log_level[m.level] === undefined ? m.level : $root.yuhaiin.log.log_level[m.level] : m.level;
                }
                if (m.save != null && m.hasOwnProperty("save")) {
                    d.save = m.save;
                }
                return d;
            };

            /**
             * Converts this logcat to JSON.
             * @function toJSON
             * @memberof yuhaiin.log.logcat
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            logcat.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return logcat;
        })();

        return log;
    })();

    yuhaiin.bypass = (function() {

        /**
         * Namespace bypass.
         * @memberof yuhaiin
         * @namespace
         */
        const bypass = {};

        /**
         * mode enum.
         * @name yuhaiin.bypass.mode
         * @enum {number}
         * @property {number} bypass=0 bypass value
         * @property {number} direct=1 direct value
         * @property {number} proxy=2 proxy value
         * @property {number} block=3 block value
         */
        bypass.mode = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "bypass"] = 0;
            values[valuesById[1] = "direct"] = 1;
            values[valuesById[2] = "proxy"] = 2;
            values[valuesById[3] = "block"] = 3;
            return values;
        })();

        bypass.bypass_config = (function() {

            /**
             * Properties of a bypass_config.
             * @memberof yuhaiin.bypass
             * @interface Ibypass_config
             * @property {yuhaiin.bypass.mode|null} [tcp] bypass_config tcp
             * @property {yuhaiin.bypass.mode|null} [udp] bypass_config udp
             * @property {string|null} [bypass_file] bypass_config bypass_file
             * @property {Array.<yuhaiin.bypass.Imode_config>|null} [custom_rule_v3] bypass_config custom_rule_v3
             */

            /**
             * Constructs a new bypass_config.
             * @memberof yuhaiin.bypass
             * @classdesc Represents a bypass_config.
             * @implements Ibypass_config
             * @constructor
             * @param {yuhaiin.bypass.Ibypass_config=} [p] Properties to set
             */
            function bypass_config(p) {
                this.custom_rule_v3 = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * bypass_config tcp.
             * @member {yuhaiin.bypass.mode} tcp
             * @memberof yuhaiin.bypass.bypass_config
             * @instance
             */
            bypass_config.prototype.tcp = 0;

            /**
             * bypass_config udp.
             * @member {yuhaiin.bypass.mode} udp
             * @memberof yuhaiin.bypass.bypass_config
             * @instance
             */
            bypass_config.prototype.udp = 0;

            /**
             * bypass_config bypass_file.
             * @member {string} bypass_file
             * @memberof yuhaiin.bypass.bypass_config
             * @instance
             */
            bypass_config.prototype.bypass_file = "";

            /**
             * bypass_config custom_rule_v3.
             * @member {Array.<yuhaiin.bypass.Imode_config>} custom_rule_v3
             * @memberof yuhaiin.bypass.bypass_config
             * @instance
             */
            bypass_config.prototype.custom_rule_v3 = $util.emptyArray;

            /**
             * Creates a new bypass_config instance using the specified properties.
             * @function create
             * @memberof yuhaiin.bypass.bypass_config
             * @static
             * @param {yuhaiin.bypass.Ibypass_config=} [properties] Properties to set
             * @returns {yuhaiin.bypass.bypass_config} bypass_config instance
             */
            bypass_config.create = function create(properties) {
                return new bypass_config(properties);
            };

            /**
             * Encodes the specified bypass_config message. Does not implicitly {@link yuhaiin.bypass.bypass_config.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.bypass.bypass_config
             * @static
             * @param {yuhaiin.bypass.Ibypass_config} m bypass_config message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            bypass_config.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.bypass_file != null && Object.hasOwnProperty.call(m, "bypass_file"))
                    w.uint32(18).string(m.bypass_file);
                if (m.tcp != null && Object.hasOwnProperty.call(m, "tcp"))
                    w.uint32(24).int32(m.tcp);
                if (m.udp != null && Object.hasOwnProperty.call(m, "udp"))
                    w.uint32(32).int32(m.udp);
                if (m.custom_rule_v3 != null && m.custom_rule_v3.length) {
                    for (var i = 0; i < m.custom_rule_v3.length; ++i)
                        $root.yuhaiin.bypass.mode_config.encode(m.custom_rule_v3[i], w.uint32(58).fork()).ldelim();
                }
                return w;
            };

            /**
             * Decodes a bypass_config message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.bypass.bypass_config
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.bypass.bypass_config} bypass_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            bypass_config.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.bypass.bypass_config();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 3: {
                            m.tcp = r.int32();
                            break;
                        }
                    case 4: {
                            m.udp = r.int32();
                            break;
                        }
                    case 2: {
                            m.bypass_file = r.string();
                            break;
                        }
                    case 7: {
                            if (!(m.custom_rule_v3 && m.custom_rule_v3.length))
                                m.custom_rule_v3 = [];
                            m.custom_rule_v3.push($root.yuhaiin.bypass.mode_config.decode(r, r.uint32()));
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a bypass_config message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.bypass.bypass_config
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.bypass.bypass_config} bypass_config
             */
            bypass_config.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.bypass.bypass_config)
                    return d;
                var m = new $root.yuhaiin.bypass.bypass_config();
                switch (d.tcp) {
                default:
                    if (typeof d.tcp === "number") {
                        m.tcp = d.tcp;
                        break;
                    }
                    break;
                case "bypass":
                case 0:
                    m.tcp = 0;
                    break;
                case "direct":
                case 1:
                    m.tcp = 1;
                    break;
                case "proxy":
                case 2:
                    m.tcp = 2;
                    break;
                case "block":
                case 3:
                    m.tcp = 3;
                    break;
                }
                switch (d.udp) {
                default:
                    if (typeof d.udp === "number") {
                        m.udp = d.udp;
                        break;
                    }
                    break;
                case "bypass":
                case 0:
                    m.udp = 0;
                    break;
                case "direct":
                case 1:
                    m.udp = 1;
                    break;
                case "proxy":
                case 2:
                    m.udp = 2;
                    break;
                case "block":
                case 3:
                    m.udp = 3;
                    break;
                }
                if (d.bypass_file != null) {
                    m.bypass_file = String(d.bypass_file);
                }
                if (d.custom_rule_v3) {
                    if (!Array.isArray(d.custom_rule_v3))
                        throw TypeError(".yuhaiin.bypass.bypass_config.custom_rule_v3: array expected");
                    m.custom_rule_v3 = [];
                    for (var i = 0; i < d.custom_rule_v3.length; ++i) {
                        if (typeof d.custom_rule_v3[i] !== "object")
                            throw TypeError(".yuhaiin.bypass.bypass_config.custom_rule_v3: object expected");
                        m.custom_rule_v3[i] = $root.yuhaiin.bypass.mode_config.fromObject(d.custom_rule_v3[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a bypass_config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.bypass.bypass_config
             * @static
             * @param {yuhaiin.bypass.bypass_config} m bypass_config
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            bypass_config.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.custom_rule_v3 = [];
                }
                if (o.defaults) {
                    d.bypass_file = "";
                    d.tcp = o.enums === String ? "bypass" : 0;
                    d.udp = o.enums === String ? "bypass" : 0;
                }
                if (m.bypass_file != null && m.hasOwnProperty("bypass_file")) {
                    d.bypass_file = m.bypass_file;
                }
                if (m.tcp != null && m.hasOwnProperty("tcp")) {
                    d.tcp = o.enums === String ? $root.yuhaiin.bypass.mode[m.tcp] === undefined ? m.tcp : $root.yuhaiin.bypass.mode[m.tcp] : m.tcp;
                }
                if (m.udp != null && m.hasOwnProperty("udp")) {
                    d.udp = o.enums === String ? $root.yuhaiin.bypass.mode[m.udp] === undefined ? m.udp : $root.yuhaiin.bypass.mode[m.udp] : m.udp;
                }
                if (m.custom_rule_v3 && m.custom_rule_v3.length) {
                    d.custom_rule_v3 = [];
                    for (var j = 0; j < m.custom_rule_v3.length; ++j) {
                        d.custom_rule_v3[j] = $root.yuhaiin.bypass.mode_config.toObject(m.custom_rule_v3[j], o);
                    }
                }
                return d;
            };

            /**
             * Converts this bypass_config to JSON.
             * @function toJSON
             * @memberof yuhaiin.bypass.bypass_config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            bypass_config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return bypass_config;
        })();

        /**
         * resolve_strategy enum.
         * @name yuhaiin.bypass.resolve_strategy
         * @enum {number}
         * @property {number} default=0 default value
         * @property {number} prefer_ipv4=1 prefer_ipv4 value
         * @property {number} only_ipv4=2 only_ipv4 value
         * @property {number} prefer_ipv6=3 prefer_ipv6 value
         * @property {number} only_ipv6=4 only_ipv6 value
         */
        bypass.resolve_strategy = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "default"] = 0;
            values[valuesById[1] = "prefer_ipv4"] = 1;
            values[valuesById[2] = "only_ipv4"] = 2;
            values[valuesById[3] = "prefer_ipv6"] = 3;
            values[valuesById[4] = "only_ipv6"] = 4;
            return values;
        })();

        bypass.mode_config = (function() {

            /**
             * Properties of a mode_config.
             * @memberof yuhaiin.bypass
             * @interface Imode_config
             * @property {yuhaiin.bypass.mode|null} [mode] mode_config mode
             * @property {string|null} [tag] mode_config tag
             * @property {Array.<string>|null} [hostname] mode_config hostname
             * @property {yuhaiin.bypass.resolve_strategy|null} [resolve_strategy] mode_config resolve_strategy
             */

            /**
             * Constructs a new mode_config.
             * @memberof yuhaiin.bypass
             * @classdesc Represents a mode_config.
             * @implements Imode_config
             * @constructor
             * @param {yuhaiin.bypass.Imode_config=} [p] Properties to set
             */
            function mode_config(p) {
                this.hostname = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * mode_config mode.
             * @member {yuhaiin.bypass.mode} mode
             * @memberof yuhaiin.bypass.mode_config
             * @instance
             */
            mode_config.prototype.mode = 0;

            /**
             * mode_config tag.
             * @member {string} tag
             * @memberof yuhaiin.bypass.mode_config
             * @instance
             */
            mode_config.prototype.tag = "";

            /**
             * mode_config hostname.
             * @member {Array.<string>} hostname
             * @memberof yuhaiin.bypass.mode_config
             * @instance
             */
            mode_config.prototype.hostname = $util.emptyArray;

            /**
             * mode_config resolve_strategy.
             * @member {yuhaiin.bypass.resolve_strategy} resolve_strategy
             * @memberof yuhaiin.bypass.mode_config
             * @instance
             */
            mode_config.prototype.resolve_strategy = 0;

            /**
             * Creates a new mode_config instance using the specified properties.
             * @function create
             * @memberof yuhaiin.bypass.mode_config
             * @static
             * @param {yuhaiin.bypass.Imode_config=} [properties] Properties to set
             * @returns {yuhaiin.bypass.mode_config} mode_config instance
             */
            mode_config.create = function create(properties) {
                return new mode_config(properties);
            };

            /**
             * Encodes the specified mode_config message. Does not implicitly {@link yuhaiin.bypass.mode_config.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.bypass.mode_config
             * @static
             * @param {yuhaiin.bypass.Imode_config} m mode_config message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            mode_config.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                    w.uint32(8).int32(m.mode);
                if (m.tag != null && Object.hasOwnProperty.call(m, "tag"))
                    w.uint32(18).string(m.tag);
                if (m.hostname != null && m.hostname.length) {
                    for (var i = 0; i < m.hostname.length; ++i)
                        w.uint32(26).string(m.hostname[i]);
                }
                if (m.resolve_strategy != null && Object.hasOwnProperty.call(m, "resolve_strategy"))
                    w.uint32(32).int32(m.resolve_strategy);
                return w;
            };

            /**
             * Decodes a mode_config message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.bypass.mode_config
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.bypass.mode_config} mode_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            mode_config.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.bypass.mode_config();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.mode = r.int32();
                            break;
                        }
                    case 2: {
                            m.tag = r.string();
                            break;
                        }
                    case 3: {
                            if (!(m.hostname && m.hostname.length))
                                m.hostname = [];
                            m.hostname.push(r.string());
                            break;
                        }
                    case 4: {
                            m.resolve_strategy = r.int32();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a mode_config message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.bypass.mode_config
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.bypass.mode_config} mode_config
             */
            mode_config.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.bypass.mode_config)
                    return d;
                var m = new $root.yuhaiin.bypass.mode_config();
                switch (d.mode) {
                default:
                    if (typeof d.mode === "number") {
                        m.mode = d.mode;
                        break;
                    }
                    break;
                case "bypass":
                case 0:
                    m.mode = 0;
                    break;
                case "direct":
                case 1:
                    m.mode = 1;
                    break;
                case "proxy":
                case 2:
                    m.mode = 2;
                    break;
                case "block":
                case 3:
                    m.mode = 3;
                    break;
                }
                if (d.tag != null) {
                    m.tag = String(d.tag);
                }
                if (d.hostname) {
                    if (!Array.isArray(d.hostname))
                        throw TypeError(".yuhaiin.bypass.mode_config.hostname: array expected");
                    m.hostname = [];
                    for (var i = 0; i < d.hostname.length; ++i) {
                        m.hostname[i] = String(d.hostname[i]);
                    }
                }
                switch (d.resolve_strategy) {
                default:
                    if (typeof d.resolve_strategy === "number") {
                        m.resolve_strategy = d.resolve_strategy;
                        break;
                    }
                    break;
                case "default":
                case 0:
                    m.resolve_strategy = 0;
                    break;
                case "prefer_ipv4":
                case 1:
                    m.resolve_strategy = 1;
                    break;
                case "only_ipv4":
                case 2:
                    m.resolve_strategy = 2;
                    break;
                case "prefer_ipv6":
                case 3:
                    m.resolve_strategy = 3;
                    break;
                case "only_ipv6":
                case 4:
                    m.resolve_strategy = 4;
                    break;
                }
                return m;
            };

            /**
             * Creates a plain object from a mode_config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.bypass.mode_config
             * @static
             * @param {yuhaiin.bypass.mode_config} m mode_config
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            mode_config.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.hostname = [];
                }
                if (o.defaults) {
                    d.mode = o.enums === String ? "bypass" : 0;
                    d.tag = "";
                    d.resolve_strategy = o.enums === String ? "default" : 0;
                }
                if (m.mode != null && m.hasOwnProperty("mode")) {
                    d.mode = o.enums === String ? $root.yuhaiin.bypass.mode[m.mode] === undefined ? m.mode : $root.yuhaiin.bypass.mode[m.mode] : m.mode;
                }
                if (m.tag != null && m.hasOwnProperty("tag")) {
                    d.tag = m.tag;
                }
                if (m.hostname && m.hostname.length) {
                    d.hostname = [];
                    for (var j = 0; j < m.hostname.length; ++j) {
                        d.hostname[j] = m.hostname[j];
                    }
                }
                if (m.resolve_strategy != null && m.hasOwnProperty("resolve_strategy")) {
                    d.resolve_strategy = o.enums === String ? $root.yuhaiin.bypass.resolve_strategy[m.resolve_strategy] === undefined ? m.resolve_strategy : $root.yuhaiin.bypass.resolve_strategy[m.resolve_strategy] : m.resolve_strategy;
                }
                return d;
            };

            /**
             * Converts this mode_config to JSON.
             * @function toJSON
             * @memberof yuhaiin.bypass.mode_config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            mode_config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return mode_config;
        })();

        return bypass;
    })();

    yuhaiin.dns = (function() {

        /**
         * Namespace dns.
         * @memberof yuhaiin
         * @namespace
         */
        const dns = {};

        /**
         * type enum.
         * @name yuhaiin.dns.type
         * @enum {number}
         * @property {number} reserve=0 reserve value
         * @property {number} udp=1 udp value
         * @property {number} tcp=2 tcp value
         * @property {number} doh=3 doh value
         * @property {number} dot=4 dot value
         * @property {number} doq=5 doq value
         * @property {number} doh3=6 doh3 value
         */
        dns.type = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "reserve"] = 0;
            values[valuesById[1] = "udp"] = 1;
            values[valuesById[2] = "tcp"] = 2;
            values[valuesById[3] = "doh"] = 3;
            values[valuesById[4] = "dot"] = 4;
            values[valuesById[5] = "doq"] = 5;
            values[valuesById[6] = "doh3"] = 6;
            return values;
        })();

        dns.dns = (function() {

            /**
             * Properties of a dns.
             * @memberof yuhaiin.dns
             * @interface Idns
             * @property {string|null} [host] dns host
             * @property {yuhaiin.dns.type|null} [type] dns type
             * @property {string|null} [subnet] dns subnet
             * @property {string|null} [tls_servername] dns tls_servername
             */

            /**
             * Constructs a new dns.
             * @memberof yuhaiin.dns
             * @classdesc Represents a dns.
             * @implements Idns
             * @constructor
             * @param {yuhaiin.dns.Idns=} [p] Properties to set
             */
            function dns(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * dns host.
             * @member {string} host
             * @memberof yuhaiin.dns.dns
             * @instance
             */
            dns.prototype.host = "";

            /**
             * dns type.
             * @member {yuhaiin.dns.type} type
             * @memberof yuhaiin.dns.dns
             * @instance
             */
            dns.prototype.type = 0;

            /**
             * dns subnet.
             * @member {string} subnet
             * @memberof yuhaiin.dns.dns
             * @instance
             */
            dns.prototype.subnet = "";

            /**
             * dns tls_servername.
             * @member {string} tls_servername
             * @memberof yuhaiin.dns.dns
             * @instance
             */
            dns.prototype.tls_servername = "";

            /**
             * Creates a new dns instance using the specified properties.
             * @function create
             * @memberof yuhaiin.dns.dns
             * @static
             * @param {yuhaiin.dns.Idns=} [properties] Properties to set
             * @returns {yuhaiin.dns.dns} dns instance
             */
            dns.create = function create(properties) {
                return new dns(properties);
            };

            /**
             * Encodes the specified dns message. Does not implicitly {@link yuhaiin.dns.dns.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.dns.dns
             * @static
             * @param {yuhaiin.dns.Idns} m dns message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            dns.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.tls_servername != null && Object.hasOwnProperty.call(m, "tls_servername"))
                    w.uint32(18).string(m.tls_servername);
                if (m.subnet != null && Object.hasOwnProperty.call(m, "subnet"))
                    w.uint32(34).string(m.subnet);
                if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                    w.uint32(40).int32(m.type);
                return w;
            };

            /**
             * Decodes a dns message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.dns.dns
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.dns.dns} dns
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            dns.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.dns.dns();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 5: {
                            m.type = r.int32();
                            break;
                        }
                    case 4: {
                            m.subnet = r.string();
                            break;
                        }
                    case 2: {
                            m.tls_servername = r.string();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a dns message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.dns.dns
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.dns.dns} dns
             */
            dns.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.dns.dns)
                    return d;
                var m = new $root.yuhaiin.dns.dns();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                switch (d.type) {
                default:
                    if (typeof d.type === "number") {
                        m.type = d.type;
                        break;
                    }
                    break;
                case "reserve":
                case 0:
                    m.type = 0;
                    break;
                case "udp":
                case 1:
                    m.type = 1;
                    break;
                case "tcp":
                case 2:
                    m.type = 2;
                    break;
                case "doh":
                case 3:
                    m.type = 3;
                    break;
                case "dot":
                case 4:
                    m.type = 4;
                    break;
                case "doq":
                case 5:
                    m.type = 5;
                    break;
                case "doh3":
                case 6:
                    m.type = 6;
                    break;
                }
                if (d.subnet != null) {
                    m.subnet = String(d.subnet);
                }
                if (d.tls_servername != null) {
                    m.tls_servername = String(d.tls_servername);
                }
                return m;
            };

            /**
             * Creates a plain object from a dns message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.dns.dns
             * @static
             * @param {yuhaiin.dns.dns} m dns
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            dns.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.tls_servername = "";
                    d.subnet = "";
                    d.type = o.enums === String ? "reserve" : 0;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.tls_servername != null && m.hasOwnProperty("tls_servername")) {
                    d.tls_servername = m.tls_servername;
                }
                if (m.subnet != null && m.hasOwnProperty("subnet")) {
                    d.subnet = m.subnet;
                }
                if (m.type != null && m.hasOwnProperty("type")) {
                    d.type = o.enums === String ? $root.yuhaiin.dns.type[m.type] === undefined ? m.type : $root.yuhaiin.dns.type[m.type] : m.type;
                }
                return d;
            };

            /**
             * Converts this dns to JSON.
             * @function toJSON
             * @memberof yuhaiin.dns.dns
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            dns.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return dns;
        })();

        dns.dns_config = (function() {

            /**
             * Properties of a dns_config.
             * @memberof yuhaiin.dns
             * @interface Idns_config
             * @property {string|null} [server] dns_config server
             * @property {boolean|null} [fakedns] dns_config fakedns
             * @property {string|null} [fakedns_ip_range] dns_config fakedns_ip_range
             * @property {string|null} [fakedns_ipv6_range] dns_config fakedns_ipv6_range
             * @property {Array.<string>|null} [fakedns_whitelist] dns_config fakedns_whitelist
             * @property {boolean|null} [resolve_remote_domain] dns_config resolve_remote_domain
             * @property {yuhaiin.dns.Idns|null} [remote] dns_config remote
             * @property {yuhaiin.dns.Idns|null} [local] dns_config local
             * @property {yuhaiin.dns.Idns|null} [bootstrap] dns_config bootstrap
             * @property {Object.<string,string>|null} [hosts] dns_config hosts
             * @property {Object.<string,yuhaiin.dns.Idns>|null} [resolver] dns_config resolver
             */

            /**
             * Constructs a new dns_config.
             * @memberof yuhaiin.dns
             * @classdesc Represents a dns_config.
             * @implements Idns_config
             * @constructor
             * @param {yuhaiin.dns.Idns_config=} [p] Properties to set
             */
            function dns_config(p) {
                this.fakedns_whitelist = [];
                this.hosts = {};
                this.resolver = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * dns_config server.
             * @member {string} server
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.server = "";

            /**
             * dns_config fakedns.
             * @member {boolean} fakedns
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.fakedns = false;

            /**
             * dns_config fakedns_ip_range.
             * @member {string} fakedns_ip_range
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.fakedns_ip_range = "";

            /**
             * dns_config fakedns_ipv6_range.
             * @member {string} fakedns_ipv6_range
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.fakedns_ipv6_range = "";

            /**
             * dns_config fakedns_whitelist.
             * @member {Array.<string>} fakedns_whitelist
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.fakedns_whitelist = $util.emptyArray;

            /**
             * dns_config resolve_remote_domain.
             * @member {boolean} resolve_remote_domain
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.resolve_remote_domain = false;

            /**
             * dns_config remote.
             * @member {yuhaiin.dns.Idns|null|undefined} remote
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.remote = null;

            /**
             * dns_config local.
             * @member {yuhaiin.dns.Idns|null|undefined} local
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.local = null;

            /**
             * dns_config bootstrap.
             * @member {yuhaiin.dns.Idns|null|undefined} bootstrap
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.bootstrap = null;

            /**
             * dns_config hosts.
             * @member {Object.<string,string>} hosts
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.hosts = $util.emptyObject;

            /**
             * dns_config resolver.
             * @member {Object.<string,yuhaiin.dns.Idns>} resolver
             * @memberof yuhaiin.dns.dns_config
             * @instance
             */
            dns_config.prototype.resolver = $util.emptyObject;

            /**
             * Creates a new dns_config instance using the specified properties.
             * @function create
             * @memberof yuhaiin.dns.dns_config
             * @static
             * @param {yuhaiin.dns.Idns_config=} [properties] Properties to set
             * @returns {yuhaiin.dns.dns_config} dns_config instance
             */
            dns_config.create = function create(properties) {
                return new dns_config(properties);
            };

            /**
             * Encodes the specified dns_config message. Does not implicitly {@link yuhaiin.dns.dns_config.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.dns.dns_config
             * @static
             * @param {yuhaiin.dns.Idns_config} m dns_config message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            dns_config.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.remote != null && Object.hasOwnProperty.call(m, "remote"))
                    $root.yuhaiin.dns.dns.encode(m.remote, w.uint32(10).fork()).ldelim();
                if (m.local != null && Object.hasOwnProperty.call(m, "local"))
                    $root.yuhaiin.dns.dns.encode(m.local, w.uint32(18).fork()).ldelim();
                if (m.bootstrap != null && Object.hasOwnProperty.call(m, "bootstrap"))
                    $root.yuhaiin.dns.dns.encode(m.bootstrap, w.uint32(26).fork()).ldelim();
                if (m.server != null && Object.hasOwnProperty.call(m, "server"))
                    w.uint32(34).string(m.server);
                if (m.fakedns != null && Object.hasOwnProperty.call(m, "fakedns"))
                    w.uint32(40).bool(m.fakedns);
                if (m.fakedns_ip_range != null && Object.hasOwnProperty.call(m, "fakedns_ip_range"))
                    w.uint32(50).string(m.fakedns_ip_range);
                if (m.resolve_remote_domain != null && Object.hasOwnProperty.call(m, "resolve_remote_domain"))
                    w.uint32(56).bool(m.resolve_remote_domain);
                if (m.hosts != null && Object.hasOwnProperty.call(m, "hosts")) {
                    for (var ks = Object.keys(m.hosts), i = 0; i < ks.length; ++i) {
                        w.uint32(66).fork().uint32(10).string(ks[i]).uint32(18).string(m.hosts[ks[i]]).ldelim();
                    }
                }
                if (m.fakedns_whitelist != null && m.fakedns_whitelist.length) {
                    for (var i = 0; i < m.fakedns_whitelist.length; ++i)
                        w.uint32(74).string(m.fakedns_whitelist[i]);
                }
                if (m.resolver != null && Object.hasOwnProperty.call(m, "resolver")) {
                    for (var ks = Object.keys(m.resolver), i = 0; i < ks.length; ++i) {
                        w.uint32(82).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.dns.dns.encode(m.resolver[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                if (m.fakedns_ipv6_range != null && Object.hasOwnProperty.call(m, "fakedns_ipv6_range"))
                    w.uint32(106).string(m.fakedns_ipv6_range);
                return w;
            };

            /**
             * Decodes a dns_config message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.dns.dns_config
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.dns.dns_config} dns_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            dns_config.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.dns.dns_config(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 4: {
                            m.server = r.string();
                            break;
                        }
                    case 5: {
                            m.fakedns = r.bool();
                            break;
                        }
                    case 6: {
                            m.fakedns_ip_range = r.string();
                            break;
                        }
                    case 13: {
                            m.fakedns_ipv6_range = r.string();
                            break;
                        }
                    case 9: {
                            if (!(m.fakedns_whitelist && m.fakedns_whitelist.length))
                                m.fakedns_whitelist = [];
                            m.fakedns_whitelist.push(r.string());
                            break;
                        }
                    case 7: {
                            m.resolve_remote_domain = r.bool();
                            break;
                        }
                    case 1: {
                            m.remote = $root.yuhaiin.dns.dns.decode(r, r.uint32());
                            break;
                        }
                    case 2: {
                            m.local = $root.yuhaiin.dns.dns.decode(r, r.uint32());
                            break;
                        }
                    case 3: {
                            m.bootstrap = $root.yuhaiin.dns.dns.decode(r, r.uint32());
                            break;
                        }
                    case 8: {
                            if (m.hosts === $util.emptyObject)
                                m.hosts = {};
                            var c2 = r.uint32() + r.pos;
                            k = "";
                            value = "";
                            while (r.pos < c2) {
                                var tag2 = r.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    k = r.string();
                                    break;
                                case 2:
                                    value = r.string();
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.hosts[k] = value;
                            break;
                        }
                    case 10: {
                            if (m.resolver === $util.emptyObject)
                                m.resolver = {};
                            var c2 = r.uint32() + r.pos;
                            k = "";
                            value = null;
                            while (r.pos < c2) {
                                var tag2 = r.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    k = r.string();
                                    break;
                                case 2:
                                    value = $root.yuhaiin.dns.dns.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.resolver[k] = value;
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a dns_config message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.dns.dns_config
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.dns.dns_config} dns_config
             */
            dns_config.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.dns.dns_config)
                    return d;
                var m = new $root.yuhaiin.dns.dns_config();
                if (d.server != null) {
                    m.server = String(d.server);
                }
                if (d.fakedns != null) {
                    m.fakedns = Boolean(d.fakedns);
                }
                if (d.fakedns_ip_range != null) {
                    m.fakedns_ip_range = String(d.fakedns_ip_range);
                }
                if (d.fakedns_ipv6_range != null) {
                    m.fakedns_ipv6_range = String(d.fakedns_ipv6_range);
                }
                if (d.fakedns_whitelist) {
                    if (!Array.isArray(d.fakedns_whitelist))
                        throw TypeError(".yuhaiin.dns.dns_config.fakedns_whitelist: array expected");
                    m.fakedns_whitelist = [];
                    for (var i = 0; i < d.fakedns_whitelist.length; ++i) {
                        m.fakedns_whitelist[i] = String(d.fakedns_whitelist[i]);
                    }
                }
                if (d.resolve_remote_domain != null) {
                    m.resolve_remote_domain = Boolean(d.resolve_remote_domain);
                }
                if (d.remote != null) {
                    if (typeof d.remote !== "object")
                        throw TypeError(".yuhaiin.dns.dns_config.remote: object expected");
                    m.remote = $root.yuhaiin.dns.dns.fromObject(d.remote);
                }
                if (d.local != null) {
                    if (typeof d.local !== "object")
                        throw TypeError(".yuhaiin.dns.dns_config.local: object expected");
                    m.local = $root.yuhaiin.dns.dns.fromObject(d.local);
                }
                if (d.bootstrap != null) {
                    if (typeof d.bootstrap !== "object")
                        throw TypeError(".yuhaiin.dns.dns_config.bootstrap: object expected");
                    m.bootstrap = $root.yuhaiin.dns.dns.fromObject(d.bootstrap);
                }
                if (d.hosts) {
                    if (typeof d.hosts !== "object")
                        throw TypeError(".yuhaiin.dns.dns_config.hosts: object expected");
                    m.hosts = {};
                    for (var ks = Object.keys(d.hosts), i = 0; i < ks.length; ++i) {
                        m.hosts[ks[i]] = String(d.hosts[ks[i]]);
                    }
                }
                if (d.resolver) {
                    if (typeof d.resolver !== "object")
                        throw TypeError(".yuhaiin.dns.dns_config.resolver: object expected");
                    m.resolver = {};
                    for (var ks = Object.keys(d.resolver), i = 0; i < ks.length; ++i) {
                        if (typeof d.resolver[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.dns.dns_config.resolver: object expected");
                        m.resolver[ks[i]] = $root.yuhaiin.dns.dns.fromObject(d.resolver[ks[i]]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a dns_config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.dns.dns_config
             * @static
             * @param {yuhaiin.dns.dns_config} m dns_config
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            dns_config.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.fakedns_whitelist = [];
                }
                if (o.objects || o.defaults) {
                    d.hosts = {};
                    d.resolver = {};
                }
                if (o.defaults) {
                    d.remote = null;
                    d.local = null;
                    d.bootstrap = null;
                    d.server = "";
                    d.fakedns = false;
                    d.fakedns_ip_range = "";
                    d.resolve_remote_domain = false;
                    d.fakedns_ipv6_range = "";
                }
                if (m.remote != null && m.hasOwnProperty("remote")) {
                    d.remote = $root.yuhaiin.dns.dns.toObject(m.remote, o);
                }
                if (m.local != null && m.hasOwnProperty("local")) {
                    d.local = $root.yuhaiin.dns.dns.toObject(m.local, o);
                }
                if (m.bootstrap != null && m.hasOwnProperty("bootstrap")) {
                    d.bootstrap = $root.yuhaiin.dns.dns.toObject(m.bootstrap, o);
                }
                if (m.server != null && m.hasOwnProperty("server")) {
                    d.server = m.server;
                }
                if (m.fakedns != null && m.hasOwnProperty("fakedns")) {
                    d.fakedns = m.fakedns;
                }
                if (m.fakedns_ip_range != null && m.hasOwnProperty("fakedns_ip_range")) {
                    d.fakedns_ip_range = m.fakedns_ip_range;
                }
                if (m.resolve_remote_domain != null && m.hasOwnProperty("resolve_remote_domain")) {
                    d.resolve_remote_domain = m.resolve_remote_domain;
                }
                var ks2;
                if (m.hosts && (ks2 = Object.keys(m.hosts)).length) {
                    d.hosts = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.hosts[ks2[j]] = m.hosts[ks2[j]];
                    }
                }
                if (m.fakedns_whitelist && m.fakedns_whitelist.length) {
                    d.fakedns_whitelist = [];
                    for (var j = 0; j < m.fakedns_whitelist.length; ++j) {
                        d.fakedns_whitelist[j] = m.fakedns_whitelist[j];
                    }
                }
                if (m.resolver && (ks2 = Object.keys(m.resolver)).length) {
                    d.resolver = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.resolver[ks2[j]] = $root.yuhaiin.dns.dns.toObject(m.resolver[ks2[j]], o);
                    }
                }
                if (m.fakedns_ipv6_range != null && m.hasOwnProperty("fakedns_ipv6_range")) {
                    d.fakedns_ipv6_range = m.fakedns_ipv6_range;
                }
                return d;
            };

            /**
             * Converts this dns_config to JSON.
             * @function toJSON
             * @memberof yuhaiin.dns.dns_config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            dns_config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return dns_config;
        })();

        return dns;
    })();

    yuhaiin.listener = (function() {

        /**
         * Namespace listener.
         * @memberof yuhaiin
         * @namespace
         */
        const listener = {};

        listener.protocol = (function() {

            /**
             * Properties of a protocol.
             * @memberof yuhaiin.listener
             * @interface Iprotocol
             * @property {string|null} [name] protocol name
             * @property {boolean|null} [enabled] protocol enabled
             * @property {yuhaiin.listener.Ihttp|null} [http] protocol http
             * @property {yuhaiin.listener.Isocks5|null} [socks5] protocol socks5
             * @property {yuhaiin.listener.Iredir|null} [redir] protocol redir
             * @property {yuhaiin.listener.Itun|null} [tun] protocol tun
             * @property {yuhaiin.listener.Iyuubinsya|null} [yuubinsya] protocol yuubinsya
             * @property {yuhaiin.listener.Imixed|null} [mix] protocol mix
             * @property {yuhaiin.listener.Isocks4a|null} [socks4a] protocol socks4a
             * @property {yuhaiin.listener.Itproxy|null} [tproxy] protocol tproxy
             */

            /**
             * Constructs a new protocol.
             * @memberof yuhaiin.listener
             * @classdesc Represents a protocol.
             * @implements Iprotocol
             * @constructor
             * @param {yuhaiin.listener.Iprotocol=} [p] Properties to set
             */
            function protocol(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * protocol name.
             * @member {string} name
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.name = "";

            /**
             * protocol enabled.
             * @member {boolean} enabled
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.enabled = false;

            /**
             * protocol http.
             * @member {yuhaiin.listener.Ihttp|null|undefined} http
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.http = null;

            /**
             * protocol socks5.
             * @member {yuhaiin.listener.Isocks5|null|undefined} socks5
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.socks5 = null;

            /**
             * protocol redir.
             * @member {yuhaiin.listener.Iredir|null|undefined} redir
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.redir = null;

            /**
             * protocol tun.
             * @member {yuhaiin.listener.Itun|null|undefined} tun
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.tun = null;

            /**
             * protocol yuubinsya.
             * @member {yuhaiin.listener.Iyuubinsya|null|undefined} yuubinsya
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.yuubinsya = null;

            /**
             * protocol mix.
             * @member {yuhaiin.listener.Imixed|null|undefined} mix
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.mix = null;

            /**
             * protocol socks4a.
             * @member {yuhaiin.listener.Isocks4a|null|undefined} socks4a
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.socks4a = null;

            /**
             * protocol tproxy.
             * @member {yuhaiin.listener.Itproxy|null|undefined} tproxy
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            protocol.prototype.tproxy = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * protocol protocol.
             * @member {"http"|"socks5"|"redir"|"tun"|"yuubinsya"|"mix"|"socks4a"|"tproxy"|undefined} protocol
             * @memberof yuhaiin.listener.protocol
             * @instance
             */
            Object.defineProperty(protocol.prototype, "protocol", {
                get: $util.oneOfGetter($oneOfFields = ["http", "socks5", "redir", "tun", "yuubinsya", "mix", "socks4a", "tproxy"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new protocol instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.protocol
             * @static
             * @param {yuhaiin.listener.Iprotocol=} [properties] Properties to set
             * @returns {yuhaiin.listener.protocol} protocol instance
             */
            protocol.create = function create(properties) {
                return new protocol(properties);
            };

            /**
             * Encodes the specified protocol message. Does not implicitly {@link yuhaiin.listener.protocol.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.protocol
             * @static
             * @param {yuhaiin.listener.Iprotocol} m protocol message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            protocol.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.name != null && Object.hasOwnProperty.call(m, "name"))
                    w.uint32(10).string(m.name);
                if (m.enabled != null && Object.hasOwnProperty.call(m, "enabled"))
                    w.uint32(16).bool(m.enabled);
                if (m.http != null && Object.hasOwnProperty.call(m, "http"))
                    $root.yuhaiin.listener.http.encode(m.http, w.uint32(26).fork()).ldelim();
                if (m.socks5 != null && Object.hasOwnProperty.call(m, "socks5"))
                    $root.yuhaiin.listener.socks5.encode(m.socks5, w.uint32(34).fork()).ldelim();
                if (m.redir != null && Object.hasOwnProperty.call(m, "redir"))
                    $root.yuhaiin.listener.redir.encode(m.redir, w.uint32(42).fork()).ldelim();
                if (m.tun != null && Object.hasOwnProperty.call(m, "tun"))
                    $root.yuhaiin.listener.tun.encode(m.tun, w.uint32(50).fork()).ldelim();
                if (m.yuubinsya != null && Object.hasOwnProperty.call(m, "yuubinsya"))
                    $root.yuhaiin.listener.yuubinsya.encode(m.yuubinsya, w.uint32(58).fork()).ldelim();
                if (m.mix != null && Object.hasOwnProperty.call(m, "mix"))
                    $root.yuhaiin.listener.mixed.encode(m.mix, w.uint32(66).fork()).ldelim();
                if (m.socks4a != null && Object.hasOwnProperty.call(m, "socks4a"))
                    $root.yuhaiin.listener.socks4a.encode(m.socks4a, w.uint32(74).fork()).ldelim();
                if (m.tproxy != null && Object.hasOwnProperty.call(m, "tproxy"))
                    $root.yuhaiin.listener.tproxy.encode(m.tproxy, w.uint32(82).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a protocol message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.protocol
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.protocol} protocol
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            protocol.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.protocol();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.name = r.string();
                            break;
                        }
                    case 2: {
                            m.enabled = r.bool();
                            break;
                        }
                    case 3: {
                            m.http = $root.yuhaiin.listener.http.decode(r, r.uint32());
                            break;
                        }
                    case 4: {
                            m.socks5 = $root.yuhaiin.listener.socks5.decode(r, r.uint32());
                            break;
                        }
                    case 5: {
                            m.redir = $root.yuhaiin.listener.redir.decode(r, r.uint32());
                            break;
                        }
                    case 6: {
                            m.tun = $root.yuhaiin.listener.tun.decode(r, r.uint32());
                            break;
                        }
                    case 7: {
                            m.yuubinsya = $root.yuhaiin.listener.yuubinsya.decode(r, r.uint32());
                            break;
                        }
                    case 8: {
                            m.mix = $root.yuhaiin.listener.mixed.decode(r, r.uint32());
                            break;
                        }
                    case 9: {
                            m.socks4a = $root.yuhaiin.listener.socks4a.decode(r, r.uint32());
                            break;
                        }
                    case 10: {
                            m.tproxy = $root.yuhaiin.listener.tproxy.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a protocol message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.protocol
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.protocol} protocol
             */
            protocol.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.protocol)
                    return d;
                var m = new $root.yuhaiin.listener.protocol();
                if (d.name != null) {
                    m.name = String(d.name);
                }
                if (d.enabled != null) {
                    m.enabled = Boolean(d.enabled);
                }
                if (d.http != null) {
                    if (typeof d.http !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.http: object expected");
                    m.http = $root.yuhaiin.listener.http.fromObject(d.http);
                }
                if (d.socks5 != null) {
                    if (typeof d.socks5 !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.socks5: object expected");
                    m.socks5 = $root.yuhaiin.listener.socks5.fromObject(d.socks5);
                }
                if (d.redir != null) {
                    if (typeof d.redir !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.redir: object expected");
                    m.redir = $root.yuhaiin.listener.redir.fromObject(d.redir);
                }
                if (d.tun != null) {
                    if (typeof d.tun !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.tun: object expected");
                    m.tun = $root.yuhaiin.listener.tun.fromObject(d.tun);
                }
                if (d.yuubinsya != null) {
                    if (typeof d.yuubinsya !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.yuubinsya: object expected");
                    m.yuubinsya = $root.yuhaiin.listener.yuubinsya.fromObject(d.yuubinsya);
                }
                if (d.mix != null) {
                    if (typeof d.mix !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.mix: object expected");
                    m.mix = $root.yuhaiin.listener.mixed.fromObject(d.mix);
                }
                if (d.socks4a != null) {
                    if (typeof d.socks4a !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.socks4a: object expected");
                    m.socks4a = $root.yuhaiin.listener.socks4a.fromObject(d.socks4a);
                }
                if (d.tproxy != null) {
                    if (typeof d.tproxy !== "object")
                        throw TypeError(".yuhaiin.listener.protocol.tproxy: object expected");
                    m.tproxy = $root.yuhaiin.listener.tproxy.fromObject(d.tproxy);
                }
                return m;
            };

            /**
             * Creates a plain object from a protocol message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.protocol
             * @static
             * @param {yuhaiin.listener.protocol} m protocol
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            protocol.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.name = "";
                    d.enabled = false;
                }
                if (m.name != null && m.hasOwnProperty("name")) {
                    d.name = m.name;
                }
                if (m.enabled != null && m.hasOwnProperty("enabled")) {
                    d.enabled = m.enabled;
                }
                if (m.http != null && m.hasOwnProperty("http")) {
                    d.http = $root.yuhaiin.listener.http.toObject(m.http, o);
                    if (o.oneofs)
                        d.protocol = "http";
                }
                if (m.socks5 != null && m.hasOwnProperty("socks5")) {
                    d.socks5 = $root.yuhaiin.listener.socks5.toObject(m.socks5, o);
                    if (o.oneofs)
                        d.protocol = "socks5";
                }
                if (m.redir != null && m.hasOwnProperty("redir")) {
                    d.redir = $root.yuhaiin.listener.redir.toObject(m.redir, o);
                    if (o.oneofs)
                        d.protocol = "redir";
                }
                if (m.tun != null && m.hasOwnProperty("tun")) {
                    d.tun = $root.yuhaiin.listener.tun.toObject(m.tun, o);
                    if (o.oneofs)
                        d.protocol = "tun";
                }
                if (m.yuubinsya != null && m.hasOwnProperty("yuubinsya")) {
                    d.yuubinsya = $root.yuhaiin.listener.yuubinsya.toObject(m.yuubinsya, o);
                    if (o.oneofs)
                        d.protocol = "yuubinsya";
                }
                if (m.mix != null && m.hasOwnProperty("mix")) {
                    d.mix = $root.yuhaiin.listener.mixed.toObject(m.mix, o);
                    if (o.oneofs)
                        d.protocol = "mix";
                }
                if (m.socks4a != null && m.hasOwnProperty("socks4a")) {
                    d.socks4a = $root.yuhaiin.listener.socks4a.toObject(m.socks4a, o);
                    if (o.oneofs)
                        d.protocol = "socks4a";
                }
                if (m.tproxy != null && m.hasOwnProperty("tproxy")) {
                    d.tproxy = $root.yuhaiin.listener.tproxy.toObject(m.tproxy, o);
                    if (o.oneofs)
                        d.protocol = "tproxy";
                }
                return d;
            };

            /**
             * Converts this protocol to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.protocol
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            protocol.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return protocol;
        })();

        listener.inbound = (function() {

            /**
             * Properties of an inbound.
             * @memberof yuhaiin.listener
             * @interface Iinbound
             * @property {string|null} [name] inbound name
             * @property {boolean|null} [enabled] inbound enabled
             * @property {boolean|null} [IPv6] inbound IPv6
             * @property {yuhaiin.listener.Iempty|null} [empty] inbound empty
             * @property {yuhaiin.listener.Itcpudp|null} [tcpudp] inbound tcpudp
             * @property {yuhaiin.listener.Iquic2|null} [quic] inbound quic
             * @property {Array.<yuhaiin.listener.Itransport>|null} [transport] inbound transport
             * @property {yuhaiin.listener.Ihttp|null} [http] inbound http
             * @property {yuhaiin.listener.Isocks5|null} [socks5] inbound socks5
             * @property {yuhaiin.listener.Iyuubinsya|null} [yuubinsya] inbound yuubinsya
             * @property {yuhaiin.listener.Imixed|null} [mix] inbound mix
             * @property {yuhaiin.listener.Isocks4a|null} [socks4a] inbound socks4a
             * @property {yuhaiin.listener.Itproxy|null} [tproxy] inbound tproxy
             * @property {yuhaiin.listener.Iredir|null} [redir] inbound redir
             * @property {yuhaiin.listener.Itun|null} [tun] inbound tun
             */

            /**
             * Constructs a new inbound.
             * @memberof yuhaiin.listener
             * @classdesc Represents an inbound.
             * @implements Iinbound
             * @constructor
             * @param {yuhaiin.listener.Iinbound=} [p] Properties to set
             */
            function inbound(p) {
                this.transport = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * inbound name.
             * @member {string} name
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.name = "";

            /**
             * inbound enabled.
             * @member {boolean} enabled
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.enabled = false;

            /**
             * inbound IPv6.
             * @member {boolean} IPv6
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.IPv6 = false;

            /**
             * inbound empty.
             * @member {yuhaiin.listener.Iempty|null|undefined} empty
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.empty = null;

            /**
             * inbound tcpudp.
             * @member {yuhaiin.listener.Itcpudp|null|undefined} tcpudp
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.tcpudp = null;

            /**
             * inbound quic.
             * @member {yuhaiin.listener.Iquic2|null|undefined} quic
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.quic = null;

            /**
             * inbound transport.
             * @member {Array.<yuhaiin.listener.Itransport>} transport
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.transport = $util.emptyArray;

            /**
             * inbound http.
             * @member {yuhaiin.listener.Ihttp|null|undefined} http
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.http = null;

            /**
             * inbound socks5.
             * @member {yuhaiin.listener.Isocks5|null|undefined} socks5
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.socks5 = null;

            /**
             * inbound yuubinsya.
             * @member {yuhaiin.listener.Iyuubinsya|null|undefined} yuubinsya
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.yuubinsya = null;

            /**
             * inbound mix.
             * @member {yuhaiin.listener.Imixed|null|undefined} mix
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.mix = null;

            /**
             * inbound socks4a.
             * @member {yuhaiin.listener.Isocks4a|null|undefined} socks4a
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.socks4a = null;

            /**
             * inbound tproxy.
             * @member {yuhaiin.listener.Itproxy|null|undefined} tproxy
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.tproxy = null;

            /**
             * inbound redir.
             * @member {yuhaiin.listener.Iredir|null|undefined} redir
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.redir = null;

            /**
             * inbound tun.
             * @member {yuhaiin.listener.Itun|null|undefined} tun
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            inbound.prototype.tun = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * inbound network.
             * @member {"empty"|"tcpudp"|"quic"|undefined} network
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            Object.defineProperty(inbound.prototype, "network", {
                get: $util.oneOfGetter($oneOfFields = ["empty", "tcpudp", "quic"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * inbound protocol.
             * @member {"http"|"socks5"|"yuubinsya"|"mix"|"socks4a"|"tproxy"|"redir"|"tun"|undefined} protocol
             * @memberof yuhaiin.listener.inbound
             * @instance
             */
            Object.defineProperty(inbound.prototype, "protocol", {
                get: $util.oneOfGetter($oneOfFields = ["http", "socks5", "yuubinsya", "mix", "socks4a", "tproxy", "redir", "tun"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new inbound instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.inbound
             * @static
             * @param {yuhaiin.listener.Iinbound=} [properties] Properties to set
             * @returns {yuhaiin.listener.inbound} inbound instance
             */
            inbound.create = function create(properties) {
                return new inbound(properties);
            };

            /**
             * Encodes the specified inbound message. Does not implicitly {@link yuhaiin.listener.inbound.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.inbound
             * @static
             * @param {yuhaiin.listener.Iinbound} m inbound message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            inbound.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.transport != null && m.transport.length) {
                    for (var i = 0; i < m.transport.length; ++i)
                        $root.yuhaiin.listener.transport.encode(m.transport[i], w.uint32(18).fork()).ldelim();
                }
                if (m.http != null && Object.hasOwnProperty.call(m, "http"))
                    $root.yuhaiin.listener.http.encode(m.http, w.uint32(26).fork()).ldelim();
                if (m.socks5 != null && Object.hasOwnProperty.call(m, "socks5"))
                    $root.yuhaiin.listener.socks5.encode(m.socks5, w.uint32(34).fork()).ldelim();
                if (m.yuubinsya != null && Object.hasOwnProperty.call(m, "yuubinsya"))
                    $root.yuhaiin.listener.yuubinsya.encode(m.yuubinsya, w.uint32(58).fork()).ldelim();
                if (m.mix != null && Object.hasOwnProperty.call(m, "mix"))
                    $root.yuhaiin.listener.mixed.encode(m.mix, w.uint32(66).fork()).ldelim();
                if (m.socks4a != null && Object.hasOwnProperty.call(m, "socks4a"))
                    $root.yuhaiin.listener.socks4a.encode(m.socks4a, w.uint32(74).fork()).ldelim();
                if (m.name != null && Object.hasOwnProperty.call(m, "name"))
                    w.uint32(106).string(m.name);
                if (m.enabled != null && Object.hasOwnProperty.call(m, "enabled"))
                    w.uint32(112).bool(m.enabled);
                if (m.tcpudp != null && Object.hasOwnProperty.call(m, "tcpudp"))
                    $root.yuhaiin.listener.tcpudp.encode(m.tcpudp, w.uint32(122).fork()).ldelim();
                if (m.quic != null && Object.hasOwnProperty.call(m, "quic"))
                    $root.yuhaiin.listener.quic2.encode(m.quic, w.uint32(130).fork()).ldelim();
                if (m.IPv6 != null && Object.hasOwnProperty.call(m, "IPv6"))
                    w.uint32(136).bool(m.IPv6);
                if (m.redir != null && Object.hasOwnProperty.call(m, "redir"))
                    $root.yuhaiin.listener.redir.encode(m.redir, w.uint32(146).fork()).ldelim();
                if (m.tun != null && Object.hasOwnProperty.call(m, "tun"))
                    $root.yuhaiin.listener.tun.encode(m.tun, w.uint32(154).fork()).ldelim();
                if (m.tproxy != null && Object.hasOwnProperty.call(m, "tproxy"))
                    $root.yuhaiin.listener.tproxy.encode(m.tproxy, w.uint32(162).fork()).ldelim();
                if (m.empty != null && Object.hasOwnProperty.call(m, "empty"))
                    $root.yuhaiin.listener.empty.encode(m.empty, w.uint32(170).fork()).ldelim();
                return w;
            };

            /**
             * Decodes an inbound message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.inbound
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.inbound} inbound
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            inbound.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.inbound();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 13: {
                            m.name = r.string();
                            break;
                        }
                    case 14: {
                            m.enabled = r.bool();
                            break;
                        }
                    case 17: {
                            m.IPv6 = r.bool();
                            break;
                        }
                    case 21: {
                            m.empty = $root.yuhaiin.listener.empty.decode(r, r.uint32());
                            break;
                        }
                    case 15: {
                            m.tcpudp = $root.yuhaiin.listener.tcpudp.decode(r, r.uint32());
                            break;
                        }
                    case 16: {
                            m.quic = $root.yuhaiin.listener.quic2.decode(r, r.uint32());
                            break;
                        }
                    case 2: {
                            if (!(m.transport && m.transport.length))
                                m.transport = [];
                            m.transport.push($root.yuhaiin.listener.transport.decode(r, r.uint32()));
                            break;
                        }
                    case 3: {
                            m.http = $root.yuhaiin.listener.http.decode(r, r.uint32());
                            break;
                        }
                    case 4: {
                            m.socks5 = $root.yuhaiin.listener.socks5.decode(r, r.uint32());
                            break;
                        }
                    case 7: {
                            m.yuubinsya = $root.yuhaiin.listener.yuubinsya.decode(r, r.uint32());
                            break;
                        }
                    case 8: {
                            m.mix = $root.yuhaiin.listener.mixed.decode(r, r.uint32());
                            break;
                        }
                    case 9: {
                            m.socks4a = $root.yuhaiin.listener.socks4a.decode(r, r.uint32());
                            break;
                        }
                    case 20: {
                            m.tproxy = $root.yuhaiin.listener.tproxy.decode(r, r.uint32());
                            break;
                        }
                    case 18: {
                            m.redir = $root.yuhaiin.listener.redir.decode(r, r.uint32());
                            break;
                        }
                    case 19: {
                            m.tun = $root.yuhaiin.listener.tun.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates an inbound message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.inbound
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.inbound} inbound
             */
            inbound.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.inbound)
                    return d;
                var m = new $root.yuhaiin.listener.inbound();
                if (d.name != null) {
                    m.name = String(d.name);
                }
                if (d.enabled != null) {
                    m.enabled = Boolean(d.enabled);
                }
                if (d.IPv6 != null) {
                    m.IPv6 = Boolean(d.IPv6);
                }
                if (d.empty != null) {
                    if (typeof d.empty !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.empty: object expected");
                    m.empty = $root.yuhaiin.listener.empty.fromObject(d.empty);
                }
                if (d.tcpudp != null) {
                    if (typeof d.tcpudp !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.tcpudp: object expected");
                    m.tcpudp = $root.yuhaiin.listener.tcpudp.fromObject(d.tcpudp);
                }
                if (d.quic != null) {
                    if (typeof d.quic !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.quic: object expected");
                    m.quic = $root.yuhaiin.listener.quic2.fromObject(d.quic);
                }
                if (d.transport) {
                    if (!Array.isArray(d.transport))
                        throw TypeError(".yuhaiin.listener.inbound.transport: array expected");
                    m.transport = [];
                    for (var i = 0; i < d.transport.length; ++i) {
                        if (typeof d.transport[i] !== "object")
                            throw TypeError(".yuhaiin.listener.inbound.transport: object expected");
                        m.transport[i] = $root.yuhaiin.listener.transport.fromObject(d.transport[i]);
                    }
                }
                if (d.http != null) {
                    if (typeof d.http !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.http: object expected");
                    m.http = $root.yuhaiin.listener.http.fromObject(d.http);
                }
                if (d.socks5 != null) {
                    if (typeof d.socks5 !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.socks5: object expected");
                    m.socks5 = $root.yuhaiin.listener.socks5.fromObject(d.socks5);
                }
                if (d.yuubinsya != null) {
                    if (typeof d.yuubinsya !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.yuubinsya: object expected");
                    m.yuubinsya = $root.yuhaiin.listener.yuubinsya.fromObject(d.yuubinsya);
                }
                if (d.mix != null) {
                    if (typeof d.mix !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.mix: object expected");
                    m.mix = $root.yuhaiin.listener.mixed.fromObject(d.mix);
                }
                if (d.socks4a != null) {
                    if (typeof d.socks4a !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.socks4a: object expected");
                    m.socks4a = $root.yuhaiin.listener.socks4a.fromObject(d.socks4a);
                }
                if (d.tproxy != null) {
                    if (typeof d.tproxy !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.tproxy: object expected");
                    m.tproxy = $root.yuhaiin.listener.tproxy.fromObject(d.tproxy);
                }
                if (d.redir != null) {
                    if (typeof d.redir !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.redir: object expected");
                    m.redir = $root.yuhaiin.listener.redir.fromObject(d.redir);
                }
                if (d.tun != null) {
                    if (typeof d.tun !== "object")
                        throw TypeError(".yuhaiin.listener.inbound.tun: object expected");
                    m.tun = $root.yuhaiin.listener.tun.fromObject(d.tun);
                }
                return m;
            };

            /**
             * Creates a plain object from an inbound message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.inbound
             * @static
             * @param {yuhaiin.listener.inbound} m inbound
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            inbound.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.transport = [];
                }
                if (o.defaults) {
                    d.name = "";
                    d.enabled = false;
                    d.IPv6 = false;
                }
                if (m.transport && m.transport.length) {
                    d.transport = [];
                    for (var j = 0; j < m.transport.length; ++j) {
                        d.transport[j] = $root.yuhaiin.listener.transport.toObject(m.transport[j], o);
                    }
                }
                if (m.http != null && m.hasOwnProperty("http")) {
                    d.http = $root.yuhaiin.listener.http.toObject(m.http, o);
                    if (o.oneofs)
                        d.protocol = "http";
                }
                if (m.socks5 != null && m.hasOwnProperty("socks5")) {
                    d.socks5 = $root.yuhaiin.listener.socks5.toObject(m.socks5, o);
                    if (o.oneofs)
                        d.protocol = "socks5";
                }
                if (m.yuubinsya != null && m.hasOwnProperty("yuubinsya")) {
                    d.yuubinsya = $root.yuhaiin.listener.yuubinsya.toObject(m.yuubinsya, o);
                    if (o.oneofs)
                        d.protocol = "yuubinsya";
                }
                if (m.mix != null && m.hasOwnProperty("mix")) {
                    d.mix = $root.yuhaiin.listener.mixed.toObject(m.mix, o);
                    if (o.oneofs)
                        d.protocol = "mix";
                }
                if (m.socks4a != null && m.hasOwnProperty("socks4a")) {
                    d.socks4a = $root.yuhaiin.listener.socks4a.toObject(m.socks4a, o);
                    if (o.oneofs)
                        d.protocol = "socks4a";
                }
                if (m.name != null && m.hasOwnProperty("name")) {
                    d.name = m.name;
                }
                if (m.enabled != null && m.hasOwnProperty("enabled")) {
                    d.enabled = m.enabled;
                }
                if (m.tcpudp != null && m.hasOwnProperty("tcpudp")) {
                    d.tcpudp = $root.yuhaiin.listener.tcpudp.toObject(m.tcpudp, o);
                    if (o.oneofs)
                        d.network = "tcpudp";
                }
                if (m.quic != null && m.hasOwnProperty("quic")) {
                    d.quic = $root.yuhaiin.listener.quic2.toObject(m.quic, o);
                    if (o.oneofs)
                        d.network = "quic";
                }
                if (m.IPv6 != null && m.hasOwnProperty("IPv6")) {
                    d.IPv6 = m.IPv6;
                }
                if (m.redir != null && m.hasOwnProperty("redir")) {
                    d.redir = $root.yuhaiin.listener.redir.toObject(m.redir, o);
                    if (o.oneofs)
                        d.protocol = "redir";
                }
                if (m.tun != null && m.hasOwnProperty("tun")) {
                    d.tun = $root.yuhaiin.listener.tun.toObject(m.tun, o);
                    if (o.oneofs)
                        d.protocol = "tun";
                }
                if (m.tproxy != null && m.hasOwnProperty("tproxy")) {
                    d.tproxy = $root.yuhaiin.listener.tproxy.toObject(m.tproxy, o);
                    if (o.oneofs)
                        d.protocol = "tproxy";
                }
                if (m.empty != null && m.hasOwnProperty("empty")) {
                    d.empty = $root.yuhaiin.listener.empty.toObject(m.empty, o);
                    if (o.oneofs)
                        d.network = "empty";
                }
                return d;
            };

            /**
             * Converts this inbound to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.inbound
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            inbound.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return inbound;
        })();

        listener.transport = (function() {

            /**
             * Properties of a transport.
             * @memberof yuhaiin.listener
             * @interface Itransport
             * @property {yuhaiin.listener.Inormal|null} [normal] transport normal
             * @property {yuhaiin.listener.Itls|null} [tls] transport tls
             * @property {yuhaiin.listener.Imux|null} [mux] transport mux
             * @property {yuhaiin.listener.Ihttp2|null} [http2] transport http2
             * @property {yuhaiin.listener.Iwebsocket|null} [websocket] transport websocket
             * @property {yuhaiin.listener.Igrpc|null} [grpc] transport grpc
             * @property {yuhaiin.listener.Ireality|null} [reality] transport reality
             */

            /**
             * Constructs a new transport.
             * @memberof yuhaiin.listener
             * @classdesc Represents a transport.
             * @implements Itransport
             * @constructor
             * @param {yuhaiin.listener.Itransport=} [p] Properties to set
             */
            function transport(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * transport normal.
             * @member {yuhaiin.listener.Inormal|null|undefined} normal
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            transport.prototype.normal = null;

            /**
             * transport tls.
             * @member {yuhaiin.listener.Itls|null|undefined} tls
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            transport.prototype.tls = null;

            /**
             * transport mux.
             * @member {yuhaiin.listener.Imux|null|undefined} mux
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            transport.prototype.mux = null;

            /**
             * transport http2.
             * @member {yuhaiin.listener.Ihttp2|null|undefined} http2
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            transport.prototype.http2 = null;

            /**
             * transport websocket.
             * @member {yuhaiin.listener.Iwebsocket|null|undefined} websocket
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            transport.prototype.websocket = null;

            /**
             * transport grpc.
             * @member {yuhaiin.listener.Igrpc|null|undefined} grpc
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            transport.prototype.grpc = null;

            /**
             * transport reality.
             * @member {yuhaiin.listener.Ireality|null|undefined} reality
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            transport.prototype.reality = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * transport transport.
             * @member {"normal"|"tls"|"mux"|"http2"|"websocket"|"grpc"|"reality"|undefined} transport
             * @memberof yuhaiin.listener.transport
             * @instance
             */
            Object.defineProperty(transport.prototype, "transport", {
                get: $util.oneOfGetter($oneOfFields = ["normal", "tls", "mux", "http2", "websocket", "grpc", "reality"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new transport instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.transport
             * @static
             * @param {yuhaiin.listener.Itransport=} [properties] Properties to set
             * @returns {yuhaiin.listener.transport} transport instance
             */
            transport.create = function create(properties) {
                return new transport(properties);
            };

            /**
             * Encodes the specified transport message. Does not implicitly {@link yuhaiin.listener.transport.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.transport
             * @static
             * @param {yuhaiin.listener.Itransport} m transport message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            transport.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls.encode(m.tls, w.uint32(10).fork()).ldelim();
                if (m.mux != null && Object.hasOwnProperty.call(m, "mux"))
                    $root.yuhaiin.listener.mux.encode(m.mux, w.uint32(18).fork()).ldelim();
                if (m.http2 != null && Object.hasOwnProperty.call(m, "http2"))
                    $root.yuhaiin.listener.http2.encode(m.http2, w.uint32(42).fork()).ldelim();
                if (m.websocket != null && Object.hasOwnProperty.call(m, "websocket"))
                    $root.yuhaiin.listener.websocket.encode(m.websocket, w.uint32(50).fork()).ldelim();
                if (m.reality != null && Object.hasOwnProperty.call(m, "reality"))
                    $root.yuhaiin.listener.reality.encode(m.reality, w.uint32(82).fork()).ldelim();
                if (m.grpc != null && Object.hasOwnProperty.call(m, "grpc"))
                    $root.yuhaiin.listener.grpc.encode(m.grpc, w.uint32(90).fork()).ldelim();
                if (m.normal != null && Object.hasOwnProperty.call(m, "normal"))
                    $root.yuhaiin.listener.normal.encode(m.normal, w.uint32(98).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a transport message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.transport
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.transport} transport
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            transport.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.transport();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 12: {
                            m.normal = $root.yuhaiin.listener.normal.decode(r, r.uint32());
                            break;
                        }
                    case 1: {
                            m.tls = $root.yuhaiin.listener.tls.decode(r, r.uint32());
                            break;
                        }
                    case 2: {
                            m.mux = $root.yuhaiin.listener.mux.decode(r, r.uint32());
                            break;
                        }
                    case 5: {
                            m.http2 = $root.yuhaiin.listener.http2.decode(r, r.uint32());
                            break;
                        }
                    case 6: {
                            m.websocket = $root.yuhaiin.listener.websocket.decode(r, r.uint32());
                            break;
                        }
                    case 11: {
                            m.grpc = $root.yuhaiin.listener.grpc.decode(r, r.uint32());
                            break;
                        }
                    case 10: {
                            m.reality = $root.yuhaiin.listener.reality.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a transport message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.transport
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.transport} transport
             */
            transport.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.transport)
                    return d;
                var m = new $root.yuhaiin.listener.transport();
                if (d.normal != null) {
                    if (typeof d.normal !== "object")
                        throw TypeError(".yuhaiin.listener.transport.normal: object expected");
                    m.normal = $root.yuhaiin.listener.normal.fromObject(d.normal);
                }
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.transport.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls.fromObject(d.tls);
                }
                if (d.mux != null) {
                    if (typeof d.mux !== "object")
                        throw TypeError(".yuhaiin.listener.transport.mux: object expected");
                    m.mux = $root.yuhaiin.listener.mux.fromObject(d.mux);
                }
                if (d.http2 != null) {
                    if (typeof d.http2 !== "object")
                        throw TypeError(".yuhaiin.listener.transport.http2: object expected");
                    m.http2 = $root.yuhaiin.listener.http2.fromObject(d.http2);
                }
                if (d.websocket != null) {
                    if (typeof d.websocket !== "object")
                        throw TypeError(".yuhaiin.listener.transport.websocket: object expected");
                    m.websocket = $root.yuhaiin.listener.websocket.fromObject(d.websocket);
                }
                if (d.grpc != null) {
                    if (typeof d.grpc !== "object")
                        throw TypeError(".yuhaiin.listener.transport.grpc: object expected");
                    m.grpc = $root.yuhaiin.listener.grpc.fromObject(d.grpc);
                }
                if (d.reality != null) {
                    if (typeof d.reality !== "object")
                        throw TypeError(".yuhaiin.listener.transport.reality: object expected");
                    m.reality = $root.yuhaiin.listener.reality.fromObject(d.reality);
                }
                return m;
            };

            /**
             * Creates a plain object from a transport message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.transport
             * @static
             * @param {yuhaiin.listener.transport} m transport
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            transport.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls.toObject(m.tls, o);
                    if (o.oneofs)
                        d.transport = "tls";
                }
                if (m.mux != null && m.hasOwnProperty("mux")) {
                    d.mux = $root.yuhaiin.listener.mux.toObject(m.mux, o);
                    if (o.oneofs)
                        d.transport = "mux";
                }
                if (m.http2 != null && m.hasOwnProperty("http2")) {
                    d.http2 = $root.yuhaiin.listener.http2.toObject(m.http2, o);
                    if (o.oneofs)
                        d.transport = "http2";
                }
                if (m.websocket != null && m.hasOwnProperty("websocket")) {
                    d.websocket = $root.yuhaiin.listener.websocket.toObject(m.websocket, o);
                    if (o.oneofs)
                        d.transport = "websocket";
                }
                if (m.reality != null && m.hasOwnProperty("reality")) {
                    d.reality = $root.yuhaiin.listener.reality.toObject(m.reality, o);
                    if (o.oneofs)
                        d.transport = "reality";
                }
                if (m.grpc != null && m.hasOwnProperty("grpc")) {
                    d.grpc = $root.yuhaiin.listener.grpc.toObject(m.grpc, o);
                    if (o.oneofs)
                        d.transport = "grpc";
                }
                if (m.normal != null && m.hasOwnProperty("normal")) {
                    d.normal = $root.yuhaiin.listener.normal.toObject(m.normal, o);
                    if (o.oneofs)
                        d.transport = "normal";
                }
                return d;
            };

            /**
             * Converts this transport to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.transport
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            transport.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return transport;
        })();

        listener.empty = (function() {

            /**
             * Properties of an empty.
             * @memberof yuhaiin.listener
             * @interface Iempty
             */

            /**
             * Constructs a new empty.
             * @memberof yuhaiin.listener
             * @classdesc Represents an empty.
             * @implements Iempty
             * @constructor
             * @param {yuhaiin.listener.Iempty=} [p] Properties to set
             */
            function empty(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new empty instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.empty
             * @static
             * @param {yuhaiin.listener.Iempty=} [properties] Properties to set
             * @returns {yuhaiin.listener.empty} empty instance
             */
            empty.create = function create(properties) {
                return new empty(properties);
            };

            /**
             * Encodes the specified empty message. Does not implicitly {@link yuhaiin.listener.empty.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.empty
             * @static
             * @param {yuhaiin.listener.Iempty} m empty message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            empty.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes an empty message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.empty
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.empty} empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            empty.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.empty();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates an empty message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.empty
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.empty} empty
             */
            empty.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.empty)
                    return d;
                return new $root.yuhaiin.listener.empty();
            };

            /**
             * Creates a plain object from an empty message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.empty
             * @static
             * @param {yuhaiin.listener.empty} m empty
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            empty.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this empty to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.empty
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            empty.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return empty;
        })();

        listener.mux = (function() {

            /**
             * Properties of a mux.
             * @memberof yuhaiin.listener
             * @interface Imux
             */

            /**
             * Constructs a new mux.
             * @memberof yuhaiin.listener
             * @classdesc Represents a mux.
             * @implements Imux
             * @constructor
             * @param {yuhaiin.listener.Imux=} [p] Properties to set
             */
            function mux(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new mux instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.mux
             * @static
             * @param {yuhaiin.listener.Imux=} [properties] Properties to set
             * @returns {yuhaiin.listener.mux} mux instance
             */
            mux.create = function create(properties) {
                return new mux(properties);
            };

            /**
             * Encodes the specified mux message. Does not implicitly {@link yuhaiin.listener.mux.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.mux
             * @static
             * @param {yuhaiin.listener.Imux} m mux message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            mux.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes a mux message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.mux
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.mux} mux
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            mux.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.mux();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a mux message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.mux
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.mux} mux
             */
            mux.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.mux)
                    return d;
                return new $root.yuhaiin.listener.mux();
            };

            /**
             * Creates a plain object from a mux message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.mux
             * @static
             * @param {yuhaiin.listener.mux} m mux
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            mux.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this mux to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.mux
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            mux.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return mux;
        })();

        /**
         * tcp_udp_control enum.
         * @name yuhaiin.listener.tcp_udp_control
         * @enum {number}
         * @property {number} tcp_udp_control_all=0 tcp_udp_control_all value
         * @property {number} disable_tcp=1 disable_tcp value
         * @property {number} disable_udp=2 disable_udp value
         */
        listener.tcp_udp_control = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "tcp_udp_control_all"] = 0;
            values[valuesById[1] = "disable_tcp"] = 1;
            values[valuesById[2] = "disable_udp"] = 2;
            return values;
        })();

        listener.tcpudp = (function() {

            /**
             * Properties of a tcpudp.
             * @memberof yuhaiin.listener
             * @interface Itcpudp
             * @property {string|null} [host] tcpudp host
             * @property {yuhaiin.listener.tcp_udp_control|null} [control] tcpudp control
             */

            /**
             * Constructs a new tcpudp.
             * @memberof yuhaiin.listener
             * @classdesc Represents a tcpudp.
             * @implements Itcpudp
             * @constructor
             * @param {yuhaiin.listener.Itcpudp=} [p] Properties to set
             */
            function tcpudp(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * tcpudp host.
             * @member {string} host
             * @memberof yuhaiin.listener.tcpudp
             * @instance
             */
            tcpudp.prototype.host = "";

            /**
             * tcpudp control.
             * @member {yuhaiin.listener.tcp_udp_control} control
             * @memberof yuhaiin.listener.tcpudp
             * @instance
             */
            tcpudp.prototype.control = 0;

            /**
             * Creates a new tcpudp instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.tcpudp
             * @static
             * @param {yuhaiin.listener.Itcpudp=} [properties] Properties to set
             * @returns {yuhaiin.listener.tcpudp} tcpudp instance
             */
            tcpudp.create = function create(properties) {
                return new tcpudp(properties);
            };

            /**
             * Encodes the specified tcpudp message. Does not implicitly {@link yuhaiin.listener.tcpudp.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.tcpudp
             * @static
             * @param {yuhaiin.listener.Itcpudp} m tcpudp message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            tcpudp.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.control != null && Object.hasOwnProperty.call(m, "control"))
                    w.uint32(16).int32(m.control);
                return w;
            };

            /**
             * Decodes a tcpudp message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.tcpudp
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.tcpudp} tcpudp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            tcpudp.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.tcpudp();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.control = r.int32();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a tcpudp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.tcpudp
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.tcpudp} tcpudp
             */
            tcpudp.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.tcpudp)
                    return d;
                var m = new $root.yuhaiin.listener.tcpudp();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                switch (d.control) {
                default:
                    if (typeof d.control === "number") {
                        m.control = d.control;
                        break;
                    }
                    break;
                case "tcp_udp_control_all":
                case 0:
                    m.control = 0;
                    break;
                case "disable_tcp":
                case 1:
                    m.control = 1;
                    break;
                case "disable_udp":
                case 2:
                    m.control = 2;
                    break;
                }
                return m;
            };

            /**
             * Creates a plain object from a tcpudp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.tcpudp
             * @static
             * @param {yuhaiin.listener.tcpudp} m tcpudp
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            tcpudp.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.control = o.enums === String ? "tcp_udp_control_all" : 0;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.control != null && m.hasOwnProperty("control")) {
                    d.control = o.enums === String ? $root.yuhaiin.listener.tcp_udp_control[m.control] === undefined ? m.control : $root.yuhaiin.listener.tcp_udp_control[m.control] : m.control;
                }
                return d;
            };

            /**
             * Converts this tcpudp to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.tcpudp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            tcpudp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return tcpudp;
        })();

        listener.quic2 = (function() {

            /**
             * Properties of a quic2.
             * @memberof yuhaiin.listener
             * @interface Iquic2
             * @property {string|null} [host] quic2 host
             * @property {yuhaiin.listener.Itls_config|null} [tls] quic2 tls
             */

            /**
             * Constructs a new quic2.
             * @memberof yuhaiin.listener
             * @classdesc Represents a quic2.
             * @implements Iquic2
             * @constructor
             * @param {yuhaiin.listener.Iquic2=} [p] Properties to set
             */
            function quic2(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * quic2 host.
             * @member {string} host
             * @memberof yuhaiin.listener.quic2
             * @instance
             */
            quic2.prototype.host = "";

            /**
             * quic2 tls.
             * @member {yuhaiin.listener.Itls_config|null|undefined} tls
             * @memberof yuhaiin.listener.quic2
             * @instance
             */
            quic2.prototype.tls = null;

            /**
             * Creates a new quic2 instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.quic2
             * @static
             * @param {yuhaiin.listener.Iquic2=} [properties] Properties to set
             * @returns {yuhaiin.listener.quic2} quic2 instance
             */
            quic2.create = function create(properties) {
                return new quic2(properties);
            };

            /**
             * Encodes the specified quic2 message. Does not implicitly {@link yuhaiin.listener.quic2.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.quic2
             * @static
             * @param {yuhaiin.listener.Iquic2} m quic2 message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            quic2.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls_config.encode(m.tls, w.uint32(26).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a quic2 message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.quic2
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.quic2} quic2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            quic2.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.quic2();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 3: {
                            m.tls = $root.yuhaiin.listener.tls_config.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a quic2 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.quic2
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.quic2} quic2
             */
            quic2.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.quic2)
                    return d;
                var m = new $root.yuhaiin.listener.quic2();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.quic2.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a quic2 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.quic2
             * @static
             * @param {yuhaiin.listener.quic2} m quic2
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            quic2.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.tls = null;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls_config.toObject(m.tls, o);
                }
                return d;
            };

            /**
             * Converts this quic2 to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.quic2
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            quic2.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return quic2;
        })();

        listener.inbound_config = (function() {

            /**
             * Properties of an inbound_config.
             * @memberof yuhaiin.listener
             * @interface Iinbound_config
             * @property {boolean|null} [hijack_dns] inbound_config hijack_dns
             * @property {boolean|null} [hijack_dns_fakeip] inbound_config hijack_dns_fakeip
             * @property {Object.<string,yuhaiin.listener.Iprotocol>|null} [servers] inbound_config servers
             * @property {Object.<string,yuhaiin.listener.Iinbound>|null} [inbounds] inbound_config inbounds
             */

            /**
             * Constructs a new inbound_config.
             * @memberof yuhaiin.listener
             * @classdesc Represents an inbound_config.
             * @implements Iinbound_config
             * @constructor
             * @param {yuhaiin.listener.Iinbound_config=} [p] Properties to set
             */
            function inbound_config(p) {
                this.servers = {};
                this.inbounds = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * inbound_config hijack_dns.
             * @member {boolean} hijack_dns
             * @memberof yuhaiin.listener.inbound_config
             * @instance
             */
            inbound_config.prototype.hijack_dns = false;

            /**
             * inbound_config hijack_dns_fakeip.
             * @member {boolean} hijack_dns_fakeip
             * @memberof yuhaiin.listener.inbound_config
             * @instance
             */
            inbound_config.prototype.hijack_dns_fakeip = false;

            /**
             * inbound_config servers.
             * @member {Object.<string,yuhaiin.listener.Iprotocol>} servers
             * @memberof yuhaiin.listener.inbound_config
             * @instance
             */
            inbound_config.prototype.servers = $util.emptyObject;

            /**
             * inbound_config inbounds.
             * @member {Object.<string,yuhaiin.listener.Iinbound>} inbounds
             * @memberof yuhaiin.listener.inbound_config
             * @instance
             */
            inbound_config.prototype.inbounds = $util.emptyObject;

            /**
             * Creates a new inbound_config instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.inbound_config
             * @static
             * @param {yuhaiin.listener.Iinbound_config=} [properties] Properties to set
             * @returns {yuhaiin.listener.inbound_config} inbound_config instance
             */
            inbound_config.create = function create(properties) {
                return new inbound_config(properties);
            };

            /**
             * Encodes the specified inbound_config message. Does not implicitly {@link yuhaiin.listener.inbound_config.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.inbound_config
             * @static
             * @param {yuhaiin.listener.Iinbound_config} m inbound_config message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            inbound_config.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.inbounds != null && Object.hasOwnProperty.call(m, "inbounds")) {
                    for (var ks = Object.keys(m.inbounds), i = 0; i < ks.length; ++i) {
                        w.uint32(10).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.listener.inbound.encode(m.inbounds[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                if (m.hijack_dns != null && Object.hasOwnProperty.call(m, "hijack_dns"))
                    w.uint32(16).bool(m.hijack_dns);
                if (m.hijack_dns_fakeip != null && Object.hasOwnProperty.call(m, "hijack_dns_fakeip"))
                    w.uint32(24).bool(m.hijack_dns_fakeip);
                if (m.servers != null && Object.hasOwnProperty.call(m, "servers")) {
                    for (var ks = Object.keys(m.servers), i = 0; i < ks.length; ++i) {
                        w.uint32(42).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.listener.protocol.encode(m.servers[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                return w;
            };

            /**
             * Decodes an inbound_config message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.inbound_config
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.inbound_config} inbound_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            inbound_config.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.inbound_config(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 2: {
                            m.hijack_dns = r.bool();
                            break;
                        }
                    case 3: {
                            m.hijack_dns_fakeip = r.bool();
                            break;
                        }
                    case 5: {
                            if (m.servers === $util.emptyObject)
                                m.servers = {};
                            var c2 = r.uint32() + r.pos;
                            k = "";
                            value = null;
                            while (r.pos < c2) {
                                var tag2 = r.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    k = r.string();
                                    break;
                                case 2:
                                    value = $root.yuhaiin.listener.protocol.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.servers[k] = value;
                            break;
                        }
                    case 1: {
                            if (m.inbounds === $util.emptyObject)
                                m.inbounds = {};
                            var c2 = r.uint32() + r.pos;
                            k = "";
                            value = null;
                            while (r.pos < c2) {
                                var tag2 = r.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    k = r.string();
                                    break;
                                case 2:
                                    value = $root.yuhaiin.listener.inbound.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.inbounds[k] = value;
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates an inbound_config message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.inbound_config
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.inbound_config} inbound_config
             */
            inbound_config.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.inbound_config)
                    return d;
                var m = new $root.yuhaiin.listener.inbound_config();
                if (d.hijack_dns != null) {
                    m.hijack_dns = Boolean(d.hijack_dns);
                }
                if (d.hijack_dns_fakeip != null) {
                    m.hijack_dns_fakeip = Boolean(d.hijack_dns_fakeip);
                }
                if (d.servers) {
                    if (typeof d.servers !== "object")
                        throw TypeError(".yuhaiin.listener.inbound_config.servers: object expected");
                    m.servers = {};
                    for (var ks = Object.keys(d.servers), i = 0; i < ks.length; ++i) {
                        if (typeof d.servers[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.listener.inbound_config.servers: object expected");
                        m.servers[ks[i]] = $root.yuhaiin.listener.protocol.fromObject(d.servers[ks[i]]);
                    }
                }
                if (d.inbounds) {
                    if (typeof d.inbounds !== "object")
                        throw TypeError(".yuhaiin.listener.inbound_config.inbounds: object expected");
                    m.inbounds = {};
                    for (var ks = Object.keys(d.inbounds), i = 0; i < ks.length; ++i) {
                        if (typeof d.inbounds[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.listener.inbound_config.inbounds: object expected");
                        m.inbounds[ks[i]] = $root.yuhaiin.listener.inbound.fromObject(d.inbounds[ks[i]]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from an inbound_config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.inbound_config
             * @static
             * @param {yuhaiin.listener.inbound_config} m inbound_config
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            inbound_config.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.objects || o.defaults) {
                    d.inbounds = {};
                    d.servers = {};
                }
                if (o.defaults) {
                    d.hijack_dns = false;
                    d.hijack_dns_fakeip = false;
                }
                var ks2;
                if (m.inbounds && (ks2 = Object.keys(m.inbounds)).length) {
                    d.inbounds = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.inbounds[ks2[j]] = $root.yuhaiin.listener.inbound.toObject(m.inbounds[ks2[j]], o);
                    }
                }
                if (m.hijack_dns != null && m.hasOwnProperty("hijack_dns")) {
                    d.hijack_dns = m.hijack_dns;
                }
                if (m.hijack_dns_fakeip != null && m.hasOwnProperty("hijack_dns_fakeip")) {
                    d.hijack_dns_fakeip = m.hijack_dns_fakeip;
                }
                if (m.servers && (ks2 = Object.keys(m.servers)).length) {
                    d.servers = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.servers[ks2[j]] = $root.yuhaiin.listener.protocol.toObject(m.servers[ks2[j]], o);
                    }
                }
                return d;
            };

            /**
             * Converts this inbound_config to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.inbound_config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            inbound_config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return inbound_config;
        })();

        listener.http = (function() {

            /**
             * Properties of a http.
             * @memberof yuhaiin.listener
             * @interface Ihttp
             * @property {string|null} [host] http host
             * @property {string|null} [username] http username
             * @property {string|null} [password] http password
             */

            /**
             * Constructs a new http.
             * @memberof yuhaiin.listener
             * @classdesc Represents a http.
             * @implements Ihttp
             * @constructor
             * @param {yuhaiin.listener.Ihttp=} [p] Properties to set
             */
            function http(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * http host.
             * @member {string} host
             * @memberof yuhaiin.listener.http
             * @instance
             */
            http.prototype.host = "";

            /**
             * http username.
             * @member {string} username
             * @memberof yuhaiin.listener.http
             * @instance
             */
            http.prototype.username = "";

            /**
             * http password.
             * @member {string} password
             * @memberof yuhaiin.listener.http
             * @instance
             */
            http.prototype.password = "";

            /**
             * Creates a new http instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.http
             * @static
             * @param {yuhaiin.listener.Ihttp=} [properties] Properties to set
             * @returns {yuhaiin.listener.http} http instance
             */
            http.create = function create(properties) {
                return new http(properties);
            };

            /**
             * Encodes the specified http message. Does not implicitly {@link yuhaiin.listener.http.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.http
             * @static
             * @param {yuhaiin.listener.Ihttp} m http message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            http.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.username != null && Object.hasOwnProperty.call(m, "username"))
                    w.uint32(26).string(m.username);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(34).string(m.password);
                return w;
            };

            /**
             * Decodes a http message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.http
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.http} http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            http.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.http();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 3: {
                            m.username = r.string();
                            break;
                        }
                    case 4: {
                            m.password = r.string();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a http message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.http
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.http} http
             */
            http.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.http)
                    return d;
                var m = new $root.yuhaiin.listener.http();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.username != null) {
                    m.username = String(d.username);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                return m;
            };

            /**
             * Creates a plain object from a http message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.http
             * @static
             * @param {yuhaiin.listener.http} m http
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            http.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.username = "";
                    d.password = "";
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.username != null && m.hasOwnProperty("username")) {
                    d.username = m.username;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                return d;
            };

            /**
             * Converts this http to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.http
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            http.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return http;
        })();

        listener.socks5 = (function() {

            /**
             * Properties of a socks5.
             * @memberof yuhaiin.listener
             * @interface Isocks5
             * @property {string|null} [host] socks5 host
             * @property {string|null} [username] socks5 username
             * @property {string|null} [password] socks5 password
             * @property {boolean|null} [udp] socks5 udp
             */

            /**
             * Constructs a new socks5.
             * @memberof yuhaiin.listener
             * @classdesc Represents a socks5.
             * @implements Isocks5
             * @constructor
             * @param {yuhaiin.listener.Isocks5=} [p] Properties to set
             */
            function socks5(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * socks5 host.
             * @member {string} host
             * @memberof yuhaiin.listener.socks5
             * @instance
             */
            socks5.prototype.host = "";

            /**
             * socks5 username.
             * @member {string} username
             * @memberof yuhaiin.listener.socks5
             * @instance
             */
            socks5.prototype.username = "";

            /**
             * socks5 password.
             * @member {string} password
             * @memberof yuhaiin.listener.socks5
             * @instance
             */
            socks5.prototype.password = "";

            /**
             * socks5 udp.
             * @member {boolean} udp
             * @memberof yuhaiin.listener.socks5
             * @instance
             */
            socks5.prototype.udp = false;

            /**
             * Creates a new socks5 instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.socks5
             * @static
             * @param {yuhaiin.listener.Isocks5=} [properties] Properties to set
             * @returns {yuhaiin.listener.socks5} socks5 instance
             */
            socks5.create = function create(properties) {
                return new socks5(properties);
            };

            /**
             * Encodes the specified socks5 message. Does not implicitly {@link yuhaiin.listener.socks5.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.socks5
             * @static
             * @param {yuhaiin.listener.Isocks5} m socks5 message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            socks5.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.username != null && Object.hasOwnProperty.call(m, "username"))
                    w.uint32(26).string(m.username);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(34).string(m.password);
                if (m.udp != null && Object.hasOwnProperty.call(m, "udp"))
                    w.uint32(40).bool(m.udp);
                return w;
            };

            /**
             * Decodes a socks5 message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.socks5
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.socks5} socks5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            socks5.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.socks5();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 3: {
                            m.username = r.string();
                            break;
                        }
                    case 4: {
                            m.password = r.string();
                            break;
                        }
                    case 5: {
                            m.udp = r.bool();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a socks5 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.socks5
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.socks5} socks5
             */
            socks5.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.socks5)
                    return d;
                var m = new $root.yuhaiin.listener.socks5();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.username != null) {
                    m.username = String(d.username);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                if (d.udp != null) {
                    m.udp = Boolean(d.udp);
                }
                return m;
            };

            /**
             * Creates a plain object from a socks5 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.socks5
             * @static
             * @param {yuhaiin.listener.socks5} m socks5
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            socks5.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.username = "";
                    d.password = "";
                    d.udp = false;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.username != null && m.hasOwnProperty("username")) {
                    d.username = m.username;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                if (m.udp != null && m.hasOwnProperty("udp")) {
                    d.udp = m.udp;
                }
                return d;
            };

            /**
             * Converts this socks5 to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.socks5
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            socks5.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return socks5;
        })();

        listener.socks4a = (function() {

            /**
             * Properties of a socks4a.
             * @memberof yuhaiin.listener
             * @interface Isocks4a
             * @property {string|null} [host] socks4a host
             * @property {string|null} [username] socks4a username
             */

            /**
             * Constructs a new socks4a.
             * @memberof yuhaiin.listener
             * @classdesc Represents a socks4a.
             * @implements Isocks4a
             * @constructor
             * @param {yuhaiin.listener.Isocks4a=} [p] Properties to set
             */
            function socks4a(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * socks4a host.
             * @member {string} host
             * @memberof yuhaiin.listener.socks4a
             * @instance
             */
            socks4a.prototype.host = "";

            /**
             * socks4a username.
             * @member {string} username
             * @memberof yuhaiin.listener.socks4a
             * @instance
             */
            socks4a.prototype.username = "";

            /**
             * Creates a new socks4a instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.socks4a
             * @static
             * @param {yuhaiin.listener.Isocks4a=} [properties] Properties to set
             * @returns {yuhaiin.listener.socks4a} socks4a instance
             */
            socks4a.create = function create(properties) {
                return new socks4a(properties);
            };

            /**
             * Encodes the specified socks4a message. Does not implicitly {@link yuhaiin.listener.socks4a.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.socks4a
             * @static
             * @param {yuhaiin.listener.Isocks4a} m socks4a message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            socks4a.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.username != null && Object.hasOwnProperty.call(m, "username"))
                    w.uint32(18).string(m.username);
                return w;
            };

            /**
             * Decodes a socks4a message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.socks4a
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.socks4a} socks4a
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            socks4a.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.socks4a();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.username = r.string();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a socks4a message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.socks4a
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.socks4a} socks4a
             */
            socks4a.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.socks4a)
                    return d;
                var m = new $root.yuhaiin.listener.socks4a();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.username != null) {
                    m.username = String(d.username);
                }
                return m;
            };

            /**
             * Creates a plain object from a socks4a message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.socks4a
             * @static
             * @param {yuhaiin.listener.socks4a} m socks4a
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            socks4a.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.username = "";
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.username != null && m.hasOwnProperty("username")) {
                    d.username = m.username;
                }
                return d;
            };

            /**
             * Converts this socks4a to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.socks4a
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            socks4a.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return socks4a;
        })();

        listener.mixed = (function() {

            /**
             * Properties of a mixed.
             * @memberof yuhaiin.listener
             * @interface Imixed
             * @property {string|null} [host] mixed host
             * @property {string|null} [username] mixed username
             * @property {string|null} [password] mixed password
             */

            /**
             * Constructs a new mixed.
             * @memberof yuhaiin.listener
             * @classdesc Represents a mixed.
             * @implements Imixed
             * @constructor
             * @param {yuhaiin.listener.Imixed=} [p] Properties to set
             */
            function mixed(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * mixed host.
             * @member {string} host
             * @memberof yuhaiin.listener.mixed
             * @instance
             */
            mixed.prototype.host = "";

            /**
             * mixed username.
             * @member {string} username
             * @memberof yuhaiin.listener.mixed
             * @instance
             */
            mixed.prototype.username = "";

            /**
             * mixed password.
             * @member {string} password
             * @memberof yuhaiin.listener.mixed
             * @instance
             */
            mixed.prototype.password = "";

            /**
             * Creates a new mixed instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.mixed
             * @static
             * @param {yuhaiin.listener.Imixed=} [properties] Properties to set
             * @returns {yuhaiin.listener.mixed} mixed instance
             */
            mixed.create = function create(properties) {
                return new mixed(properties);
            };

            /**
             * Encodes the specified mixed message. Does not implicitly {@link yuhaiin.listener.mixed.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.mixed
             * @static
             * @param {yuhaiin.listener.Imixed} m mixed message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            mixed.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.username != null && Object.hasOwnProperty.call(m, "username"))
                    w.uint32(26).string(m.username);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(34).string(m.password);
                return w;
            };

            /**
             * Decodes a mixed message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.mixed
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.mixed} mixed
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            mixed.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.mixed();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 3: {
                            m.username = r.string();
                            break;
                        }
                    case 4: {
                            m.password = r.string();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a mixed message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.mixed
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.mixed} mixed
             */
            mixed.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.mixed)
                    return d;
                var m = new $root.yuhaiin.listener.mixed();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.username != null) {
                    m.username = String(d.username);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                return m;
            };

            /**
             * Creates a plain object from a mixed message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.mixed
             * @static
             * @param {yuhaiin.listener.mixed} m mixed
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            mixed.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.username = "";
                    d.password = "";
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.username != null && m.hasOwnProperty("username")) {
                    d.username = m.username;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                return d;
            };

            /**
             * Converts this mixed to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.mixed
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            mixed.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return mixed;
        })();

        listener.redir = (function() {

            /**
             * Properties of a redir.
             * @memberof yuhaiin.listener
             * @interface Iredir
             * @property {string|null} [host] redir host
             */

            /**
             * Constructs a new redir.
             * @memberof yuhaiin.listener
             * @classdesc Represents a redir.
             * @implements Iredir
             * @constructor
             * @param {yuhaiin.listener.Iredir=} [p] Properties to set
             */
            function redir(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * redir host.
             * @member {string} host
             * @memberof yuhaiin.listener.redir
             * @instance
             */
            redir.prototype.host = "";

            /**
             * Creates a new redir instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.redir
             * @static
             * @param {yuhaiin.listener.Iredir=} [properties] Properties to set
             * @returns {yuhaiin.listener.redir} redir instance
             */
            redir.create = function create(properties) {
                return new redir(properties);
            };

            /**
             * Encodes the specified redir message. Does not implicitly {@link yuhaiin.listener.redir.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.redir
             * @static
             * @param {yuhaiin.listener.Iredir} m redir message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            redir.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                return w;
            };

            /**
             * Decodes a redir message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.redir
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.redir} redir
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            redir.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.redir();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a redir message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.redir
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.redir} redir
             */
            redir.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.redir)
                    return d;
                var m = new $root.yuhaiin.listener.redir();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                return m;
            };

            /**
             * Creates a plain object from a redir message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.redir
             * @static
             * @param {yuhaiin.listener.redir} m redir
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            redir.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                return d;
            };

            /**
             * Converts this redir to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.redir
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            redir.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return redir;
        })();

        listener.tproxy = (function() {

            /**
             * Properties of a tproxy.
             * @memberof yuhaiin.listener
             * @interface Itproxy
             * @property {string|null} [host] tproxy host
             * @property {boolean|null} [dns_hijacking] tproxy dns_hijacking
             * @property {boolean|null} [force_fakeip] tproxy force_fakeip
             */

            /**
             * Constructs a new tproxy.
             * @memberof yuhaiin.listener
             * @classdesc Represents a tproxy.
             * @implements Itproxy
             * @constructor
             * @param {yuhaiin.listener.Itproxy=} [p] Properties to set
             */
            function tproxy(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * tproxy host.
             * @member {string} host
             * @memberof yuhaiin.listener.tproxy
             * @instance
             */
            tproxy.prototype.host = "";

            /**
             * tproxy dns_hijacking.
             * @member {boolean} dns_hijacking
             * @memberof yuhaiin.listener.tproxy
             * @instance
             */
            tproxy.prototype.dns_hijacking = false;

            /**
             * tproxy force_fakeip.
             * @member {boolean} force_fakeip
             * @memberof yuhaiin.listener.tproxy
             * @instance
             */
            tproxy.prototype.force_fakeip = false;

            /**
             * Creates a new tproxy instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.tproxy
             * @static
             * @param {yuhaiin.listener.Itproxy=} [properties] Properties to set
             * @returns {yuhaiin.listener.tproxy} tproxy instance
             */
            tproxy.create = function create(properties) {
                return new tproxy(properties);
            };

            /**
             * Encodes the specified tproxy message. Does not implicitly {@link yuhaiin.listener.tproxy.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.tproxy
             * @static
             * @param {yuhaiin.listener.Itproxy} m tproxy message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            tproxy.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.dns_hijacking != null && Object.hasOwnProperty.call(m, "dns_hijacking"))
                    w.uint32(16).bool(m.dns_hijacking);
                if (m.force_fakeip != null && Object.hasOwnProperty.call(m, "force_fakeip"))
                    w.uint32(24).bool(m.force_fakeip);
                return w;
            };

            /**
             * Decodes a tproxy message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.tproxy
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.tproxy} tproxy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            tproxy.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.tproxy();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.dns_hijacking = r.bool();
                            break;
                        }
                    case 3: {
                            m.force_fakeip = r.bool();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a tproxy message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.tproxy
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.tproxy} tproxy
             */
            tproxy.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.tproxy)
                    return d;
                var m = new $root.yuhaiin.listener.tproxy();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.dns_hijacking != null) {
                    m.dns_hijacking = Boolean(d.dns_hijacking);
                }
                if (d.force_fakeip != null) {
                    m.force_fakeip = Boolean(d.force_fakeip);
                }
                return m;
            };

            /**
             * Creates a plain object from a tproxy message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.tproxy
             * @static
             * @param {yuhaiin.listener.tproxy} m tproxy
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            tproxy.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.dns_hijacking = false;
                    d.force_fakeip = false;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.dns_hijacking != null && m.hasOwnProperty("dns_hijacking")) {
                    d.dns_hijacking = m.dns_hijacking;
                }
                if (m.force_fakeip != null && m.hasOwnProperty("force_fakeip")) {
                    d.force_fakeip = m.force_fakeip;
                }
                return d;
            };

            /**
             * Converts this tproxy to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.tproxy
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            tproxy.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return tproxy;
        })();

        listener.tun = (function() {

            /**
             * Properties of a tun.
             * @memberof yuhaiin.listener
             * @interface Itun
             * @property {string|null} [name] tun name
             * @property {number|null} [mtu] tun mtu
             * @property {string|null} [gateway] tun gateway
             * @property {boolean|null} [dns_hijacking] tun dns_hijacking
             * @property {boolean|null} [force_fakeip] tun force_fakeip
             * @property {boolean|null} [skip_multicast] tun skip_multicast
             * @property {yuhaiin.listener.tun.endpoint_driver|null} [driver] tun driver
             * @property {string|null} [portal] tun portal
             * @property {string|null} [portal_v6] tun portal_v6
             * @property {yuhaiin.listener.Iroute|null} [route] tun route
             */

            /**
             * Constructs a new tun.
             * @memberof yuhaiin.listener
             * @classdesc Represents a tun.
             * @implements Itun
             * @constructor
             * @param {yuhaiin.listener.Itun=} [p] Properties to set
             */
            function tun(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * tun name.
             * @member {string} name
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.name = "";

            /**
             * tun mtu.
             * @member {number} mtu
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.mtu = 0;

            /**
             * tun gateway.
             * @member {string} gateway
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.gateway = "";

            /**
             * tun dns_hijacking.
             * @member {boolean} dns_hijacking
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.dns_hijacking = false;

            /**
             * tun force_fakeip.
             * @member {boolean} force_fakeip
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.force_fakeip = false;

            /**
             * tun skip_multicast.
             * @member {boolean} skip_multicast
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.skip_multicast = false;

            /**
             * tun driver.
             * @member {yuhaiin.listener.tun.endpoint_driver} driver
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.driver = 0;

            /**
             * tun portal.
             * @member {string} portal
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.portal = "";

            /**
             * tun portal_v6.
             * @member {string} portal_v6
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.portal_v6 = "";

            /**
             * tun route.
             * @member {yuhaiin.listener.Iroute|null|undefined} route
             * @memberof yuhaiin.listener.tun
             * @instance
             */
            tun.prototype.route = null;

            /**
             * Creates a new tun instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.tun
             * @static
             * @param {yuhaiin.listener.Itun=} [properties] Properties to set
             * @returns {yuhaiin.listener.tun} tun instance
             */
            tun.create = function create(properties) {
                return new tun(properties);
            };

            /**
             * Encodes the specified tun message. Does not implicitly {@link yuhaiin.listener.tun.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.tun
             * @static
             * @param {yuhaiin.listener.Itun} m tun message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            tun.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.name != null && Object.hasOwnProperty.call(m, "name"))
                    w.uint32(10).string(m.name);
                if (m.mtu != null && Object.hasOwnProperty.call(m, "mtu"))
                    w.uint32(16).int32(m.mtu);
                if (m.gateway != null && Object.hasOwnProperty.call(m, "gateway"))
                    w.uint32(26).string(m.gateway);
                if (m.dns_hijacking != null && Object.hasOwnProperty.call(m, "dns_hijacking"))
                    w.uint32(32).bool(m.dns_hijacking);
                if (m.skip_multicast != null && Object.hasOwnProperty.call(m, "skip_multicast"))
                    w.uint32(48).bool(m.skip_multicast);
                if (m.driver != null && Object.hasOwnProperty.call(m, "driver"))
                    w.uint32(56).int32(m.driver);
                if (m.portal != null && Object.hasOwnProperty.call(m, "portal"))
                    w.uint32(66).string(m.portal);
                if (m.force_fakeip != null && Object.hasOwnProperty.call(m, "force_fakeip"))
                    w.uint32(72).bool(m.force_fakeip);
                if (m.route != null && Object.hasOwnProperty.call(m, "route"))
                    $root.yuhaiin.listener.route.encode(m.route, w.uint32(82).fork()).ldelim();
                if (m.portal_v6 != null && Object.hasOwnProperty.call(m, "portal_v6"))
                    w.uint32(90).string(m.portal_v6);
                return w;
            };

            /**
             * Decodes a tun message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.tun
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.tun} tun
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            tun.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.tun();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.name = r.string();
                            break;
                        }
                    case 2: {
                            m.mtu = r.int32();
                            break;
                        }
                    case 3: {
                            m.gateway = r.string();
                            break;
                        }
                    case 4: {
                            m.dns_hijacking = r.bool();
                            break;
                        }
                    case 9: {
                            m.force_fakeip = r.bool();
                            break;
                        }
                    case 6: {
                            m.skip_multicast = r.bool();
                            break;
                        }
                    case 7: {
                            m.driver = r.int32();
                            break;
                        }
                    case 8: {
                            m.portal = r.string();
                            break;
                        }
                    case 11: {
                            m.portal_v6 = r.string();
                            break;
                        }
                    case 10: {
                            m.route = $root.yuhaiin.listener.route.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a tun message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.tun
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.tun} tun
             */
            tun.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.tun)
                    return d;
                var m = new $root.yuhaiin.listener.tun();
                if (d.name != null) {
                    m.name = String(d.name);
                }
                if (d.mtu != null) {
                    m.mtu = d.mtu | 0;
                }
                if (d.gateway != null) {
                    m.gateway = String(d.gateway);
                }
                if (d.dns_hijacking != null) {
                    m.dns_hijacking = Boolean(d.dns_hijacking);
                }
                if (d.force_fakeip != null) {
                    m.force_fakeip = Boolean(d.force_fakeip);
                }
                if (d.skip_multicast != null) {
                    m.skip_multicast = Boolean(d.skip_multicast);
                }
                switch (d.driver) {
                default:
                    if (typeof d.driver === "number") {
                        m.driver = d.driver;
                        break;
                    }
                    break;
                case "fdbased":
                case 0:
                    m.driver = 0;
                    break;
                case "channel":
                case 1:
                    m.driver = 1;
                    break;
                case "system_gvisor":
                case 2:
                    m.driver = 2;
                    break;
                }
                if (d.portal != null) {
                    m.portal = String(d.portal);
                }
                if (d.portal_v6 != null) {
                    m.portal_v6 = String(d.portal_v6);
                }
                if (d.route != null) {
                    if (typeof d.route !== "object")
                        throw TypeError(".yuhaiin.listener.tun.route: object expected");
                    m.route = $root.yuhaiin.listener.route.fromObject(d.route);
                }
                return m;
            };

            /**
             * Creates a plain object from a tun message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.tun
             * @static
             * @param {yuhaiin.listener.tun} m tun
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            tun.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.name = "";
                    d.mtu = 0;
                    d.gateway = "";
                    d.dns_hijacking = false;
                    d.skip_multicast = false;
                    d.driver = o.enums === String ? "fdbased" : 0;
                    d.portal = "";
                    d.force_fakeip = false;
                    d.route = null;
                    d.portal_v6 = "";
                }
                if (m.name != null && m.hasOwnProperty("name")) {
                    d.name = m.name;
                }
                if (m.mtu != null && m.hasOwnProperty("mtu")) {
                    d.mtu = m.mtu;
                }
                if (m.gateway != null && m.hasOwnProperty("gateway")) {
                    d.gateway = m.gateway;
                }
                if (m.dns_hijacking != null && m.hasOwnProperty("dns_hijacking")) {
                    d.dns_hijacking = m.dns_hijacking;
                }
                if (m.skip_multicast != null && m.hasOwnProperty("skip_multicast")) {
                    d.skip_multicast = m.skip_multicast;
                }
                if (m.driver != null && m.hasOwnProperty("driver")) {
                    d.driver = o.enums === String ? $root.yuhaiin.listener.tun.endpoint_driver[m.driver] === undefined ? m.driver : $root.yuhaiin.listener.tun.endpoint_driver[m.driver] : m.driver;
                }
                if (m.portal != null && m.hasOwnProperty("portal")) {
                    d.portal = m.portal;
                }
                if (m.force_fakeip != null && m.hasOwnProperty("force_fakeip")) {
                    d.force_fakeip = m.force_fakeip;
                }
                if (m.route != null && m.hasOwnProperty("route")) {
                    d.route = $root.yuhaiin.listener.route.toObject(m.route, o);
                }
                if (m.portal_v6 != null && m.hasOwnProperty("portal_v6")) {
                    d.portal_v6 = m.portal_v6;
                }
                return d;
            };

            /**
             * Converts this tun to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.tun
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            tun.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * endpoint_driver enum.
             * @name yuhaiin.listener.tun.endpoint_driver
             * @enum {number}
             * @property {number} fdbased=0 fdbased value
             * @property {number} channel=1 channel value
             * @property {number} system_gvisor=2 system_gvisor value
             */
            tun.endpoint_driver = (function() {
                const valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "fdbased"] = 0;
                values[valuesById[1] = "channel"] = 1;
                values[valuesById[2] = "system_gvisor"] = 2;
                return values;
            })();

            return tun;
        })();

        listener.route = (function() {

            /**
             * Properties of a route.
             * @memberof yuhaiin.listener
             * @interface Iroute
             * @property {Array.<string>|null} [routes] route routes
             * @property {Array.<string>|null} [excludes] route excludes
             */

            /**
             * Constructs a new route.
             * @memberof yuhaiin.listener
             * @classdesc Represents a route.
             * @implements Iroute
             * @constructor
             * @param {yuhaiin.listener.Iroute=} [p] Properties to set
             */
            function route(p) {
                this.routes = [];
                this.excludes = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * route routes.
             * @member {Array.<string>} routes
             * @memberof yuhaiin.listener.route
             * @instance
             */
            route.prototype.routes = $util.emptyArray;

            /**
             * route excludes.
             * @member {Array.<string>} excludes
             * @memberof yuhaiin.listener.route
             * @instance
             */
            route.prototype.excludes = $util.emptyArray;

            /**
             * Creates a new route instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.route
             * @static
             * @param {yuhaiin.listener.Iroute=} [properties] Properties to set
             * @returns {yuhaiin.listener.route} route instance
             */
            route.create = function create(properties) {
                return new route(properties);
            };

            /**
             * Encodes the specified route message. Does not implicitly {@link yuhaiin.listener.route.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.route
             * @static
             * @param {yuhaiin.listener.Iroute} m route message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            route.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.routes != null && m.routes.length) {
                    for (var i = 0; i < m.routes.length; ++i)
                        w.uint32(10).string(m.routes[i]);
                }
                if (m.excludes != null && m.excludes.length) {
                    for (var i = 0; i < m.excludes.length; ++i)
                        w.uint32(18).string(m.excludes[i]);
                }
                return w;
            };

            /**
             * Decodes a route message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.route
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.route} route
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            route.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.route();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            if (!(m.routes && m.routes.length))
                                m.routes = [];
                            m.routes.push(r.string());
                            break;
                        }
                    case 2: {
                            if (!(m.excludes && m.excludes.length))
                                m.excludes = [];
                            m.excludes.push(r.string());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a route message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.route
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.route} route
             */
            route.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.route)
                    return d;
                var m = new $root.yuhaiin.listener.route();
                if (d.routes) {
                    if (!Array.isArray(d.routes))
                        throw TypeError(".yuhaiin.listener.route.routes: array expected");
                    m.routes = [];
                    for (var i = 0; i < d.routes.length; ++i) {
                        m.routes[i] = String(d.routes[i]);
                    }
                }
                if (d.excludes) {
                    if (!Array.isArray(d.excludes))
                        throw TypeError(".yuhaiin.listener.route.excludes: array expected");
                    m.excludes = [];
                    for (var i = 0; i < d.excludes.length; ++i) {
                        m.excludes[i] = String(d.excludes[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a route message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.route
             * @static
             * @param {yuhaiin.listener.route} m route
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            route.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.routes = [];
                    d.excludes = [];
                }
                if (m.routes && m.routes.length) {
                    d.routes = [];
                    for (var j = 0; j < m.routes.length; ++j) {
                        d.routes[j] = m.routes[j];
                    }
                }
                if (m.excludes && m.excludes.length) {
                    d.excludes = [];
                    for (var j = 0; j < m.excludes.length; ++j) {
                        d.excludes[j] = m.excludes[j];
                    }
                }
                return d;
            };

            /**
             * Converts this route to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.route
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            route.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return route;
        })();

        listener.yuubinsya = (function() {

            /**
             * Properties of a yuubinsya.
             * @memberof yuhaiin.listener
             * @interface Iyuubinsya
             * @property {string|null} [host] yuubinsya host
             * @property {string|null} [password] yuubinsya password
             * @property {boolean|null} [force_disable_encrypt] yuubinsya force_disable_encrypt
             * @property {boolean|null} [mux] yuubinsya mux
             * @property {yuhaiin.listener.Inormal|null} [normal] yuubinsya normal
             * @property {yuhaiin.listener.Itls|null} [tls] yuubinsya tls
             * @property {yuhaiin.listener.Iquic|null} [quic] yuubinsya quic
             * @property {yuhaiin.listener.Iwebsocket|null} [websocket] yuubinsya websocket
             * @property {yuhaiin.listener.Igrpc|null} [grpc] yuubinsya grpc
             * @property {yuhaiin.listener.Ihttp2|null} [http2] yuubinsya http2
             * @property {yuhaiin.listener.Ireality|null} [reality] yuubinsya reality
             */

            /**
             * Constructs a new yuubinsya.
             * @memberof yuhaiin.listener
             * @classdesc Represents a yuubinsya.
             * @implements Iyuubinsya
             * @constructor
             * @param {yuhaiin.listener.Iyuubinsya=} [p] Properties to set
             */
            function yuubinsya(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * yuubinsya host.
             * @member {string} host
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.host = "";

            /**
             * yuubinsya password.
             * @member {string} password
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.password = "";

            /**
             * yuubinsya force_disable_encrypt.
             * @member {boolean} force_disable_encrypt
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.force_disable_encrypt = false;

            /**
             * yuubinsya mux.
             * @member {boolean} mux
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.mux = false;

            /**
             * yuubinsya normal.
             * @member {yuhaiin.listener.Inormal|null|undefined} normal
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.normal = null;

            /**
             * yuubinsya tls.
             * @member {yuhaiin.listener.Itls|null|undefined} tls
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.tls = null;

            /**
             * yuubinsya quic.
             * @member {yuhaiin.listener.Iquic|null|undefined} quic
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.quic = null;

            /**
             * yuubinsya websocket.
             * @member {yuhaiin.listener.Iwebsocket|null|undefined} websocket
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.websocket = null;

            /**
             * yuubinsya grpc.
             * @member {yuhaiin.listener.Igrpc|null|undefined} grpc
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.grpc = null;

            /**
             * yuubinsya http2.
             * @member {yuhaiin.listener.Ihttp2|null|undefined} http2
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.http2 = null;

            /**
             * yuubinsya reality.
             * @member {yuhaiin.listener.Ireality|null|undefined} reality
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            yuubinsya.prototype.reality = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * yuubinsya protocol.
             * @member {"normal"|"tls"|"quic"|"websocket"|"grpc"|"http2"|"reality"|undefined} protocol
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             */
            Object.defineProperty(yuubinsya.prototype, "protocol", {
                get: $util.oneOfGetter($oneOfFields = ["normal", "tls", "quic", "websocket", "grpc", "http2", "reality"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new yuubinsya instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.yuubinsya
             * @static
             * @param {yuhaiin.listener.Iyuubinsya=} [properties] Properties to set
             * @returns {yuhaiin.listener.yuubinsya} yuubinsya instance
             */
            yuubinsya.create = function create(properties) {
                return new yuubinsya(properties);
            };

            /**
             * Encodes the specified yuubinsya message. Does not implicitly {@link yuhaiin.listener.yuubinsya.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.yuubinsya
             * @static
             * @param {yuhaiin.listener.Iyuubinsya} m yuubinsya message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            yuubinsya.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(18).string(m.password);
                if (m.normal != null && Object.hasOwnProperty.call(m, "normal"))
                    $root.yuhaiin.listener.normal.encode(m.normal, w.uint32(26).fork()).ldelim();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls.encode(m.tls, w.uint32(34).fork()).ldelim();
                if (m.quic != null && Object.hasOwnProperty.call(m, "quic"))
                    $root.yuhaiin.listener.quic.encode(m.quic, w.uint32(42).fork()).ldelim();
                if (m.websocket != null && Object.hasOwnProperty.call(m, "websocket"))
                    $root.yuhaiin.listener.websocket.encode(m.websocket, w.uint32(50).fork()).ldelim();
                if (m.grpc != null && Object.hasOwnProperty.call(m, "grpc"))
                    $root.yuhaiin.listener.grpc.encode(m.grpc, w.uint32(58).fork()).ldelim();
                if (m.force_disable_encrypt != null && Object.hasOwnProperty.call(m, "force_disable_encrypt"))
                    w.uint32(64).bool(m.force_disable_encrypt);
                if (m.http2 != null && Object.hasOwnProperty.call(m, "http2"))
                    $root.yuhaiin.listener.http2.encode(m.http2, w.uint32(74).fork()).ldelim();
                if (m.reality != null && Object.hasOwnProperty.call(m, "reality"))
                    $root.yuhaiin.listener.reality.encode(m.reality, w.uint32(82).fork()).ldelim();
                if (m.mux != null && Object.hasOwnProperty.call(m, "mux"))
                    w.uint32(88).bool(m.mux);
                return w;
            };

            /**
             * Decodes a yuubinsya message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.yuubinsya
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.yuubinsya} yuubinsya
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            yuubinsya.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.yuubinsya();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.password = r.string();
                            break;
                        }
                    case 8: {
                            m.force_disable_encrypt = r.bool();
                            break;
                        }
                    case 11: {
                            m.mux = r.bool();
                            break;
                        }
                    case 3: {
                            m.normal = $root.yuhaiin.listener.normal.decode(r, r.uint32());
                            break;
                        }
                    case 4: {
                            m.tls = $root.yuhaiin.listener.tls.decode(r, r.uint32());
                            break;
                        }
                    case 5: {
                            m.quic = $root.yuhaiin.listener.quic.decode(r, r.uint32());
                            break;
                        }
                    case 6: {
                            m.websocket = $root.yuhaiin.listener.websocket.decode(r, r.uint32());
                            break;
                        }
                    case 7: {
                            m.grpc = $root.yuhaiin.listener.grpc.decode(r, r.uint32());
                            break;
                        }
                    case 9: {
                            m.http2 = $root.yuhaiin.listener.http2.decode(r, r.uint32());
                            break;
                        }
                    case 10: {
                            m.reality = $root.yuhaiin.listener.reality.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a yuubinsya message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.yuubinsya
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.yuubinsya} yuubinsya
             */
            yuubinsya.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.yuubinsya)
                    return d;
                var m = new $root.yuhaiin.listener.yuubinsya();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                if (d.force_disable_encrypt != null) {
                    m.force_disable_encrypt = Boolean(d.force_disable_encrypt);
                }
                if (d.mux != null) {
                    m.mux = Boolean(d.mux);
                }
                if (d.normal != null) {
                    if (typeof d.normal !== "object")
                        throw TypeError(".yuhaiin.listener.yuubinsya.normal: object expected");
                    m.normal = $root.yuhaiin.listener.normal.fromObject(d.normal);
                }
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.yuubinsya.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls.fromObject(d.tls);
                }
                if (d.quic != null) {
                    if (typeof d.quic !== "object")
                        throw TypeError(".yuhaiin.listener.yuubinsya.quic: object expected");
                    m.quic = $root.yuhaiin.listener.quic.fromObject(d.quic);
                }
                if (d.websocket != null) {
                    if (typeof d.websocket !== "object")
                        throw TypeError(".yuhaiin.listener.yuubinsya.websocket: object expected");
                    m.websocket = $root.yuhaiin.listener.websocket.fromObject(d.websocket);
                }
                if (d.grpc != null) {
                    if (typeof d.grpc !== "object")
                        throw TypeError(".yuhaiin.listener.yuubinsya.grpc: object expected");
                    m.grpc = $root.yuhaiin.listener.grpc.fromObject(d.grpc);
                }
                if (d.http2 != null) {
                    if (typeof d.http2 !== "object")
                        throw TypeError(".yuhaiin.listener.yuubinsya.http2: object expected");
                    m.http2 = $root.yuhaiin.listener.http2.fromObject(d.http2);
                }
                if (d.reality != null) {
                    if (typeof d.reality !== "object")
                        throw TypeError(".yuhaiin.listener.yuubinsya.reality: object expected");
                    m.reality = $root.yuhaiin.listener.reality.fromObject(d.reality);
                }
                return m;
            };

            /**
             * Creates a plain object from a yuubinsya message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.yuubinsya
             * @static
             * @param {yuhaiin.listener.yuubinsya} m yuubinsya
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            yuubinsya.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.password = "";
                    d.force_disable_encrypt = false;
                    d.mux = false;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                if (m.normal != null && m.hasOwnProperty("normal")) {
                    d.normal = $root.yuhaiin.listener.normal.toObject(m.normal, o);
                    if (o.oneofs)
                        d.protocol = "normal";
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls.toObject(m.tls, o);
                    if (o.oneofs)
                        d.protocol = "tls";
                }
                if (m.quic != null && m.hasOwnProperty("quic")) {
                    d.quic = $root.yuhaiin.listener.quic.toObject(m.quic, o);
                    if (o.oneofs)
                        d.protocol = "quic";
                }
                if (m.websocket != null && m.hasOwnProperty("websocket")) {
                    d.websocket = $root.yuhaiin.listener.websocket.toObject(m.websocket, o);
                    if (o.oneofs)
                        d.protocol = "websocket";
                }
                if (m.grpc != null && m.hasOwnProperty("grpc")) {
                    d.grpc = $root.yuhaiin.listener.grpc.toObject(m.grpc, o);
                    if (o.oneofs)
                        d.protocol = "grpc";
                }
                if (m.force_disable_encrypt != null && m.hasOwnProperty("force_disable_encrypt")) {
                    d.force_disable_encrypt = m.force_disable_encrypt;
                }
                if (m.http2 != null && m.hasOwnProperty("http2")) {
                    d.http2 = $root.yuhaiin.listener.http2.toObject(m.http2, o);
                    if (o.oneofs)
                        d.protocol = "http2";
                }
                if (m.reality != null && m.hasOwnProperty("reality")) {
                    d.reality = $root.yuhaiin.listener.reality.toObject(m.reality, o);
                    if (o.oneofs)
                        d.protocol = "reality";
                }
                if (m.mux != null && m.hasOwnProperty("mux")) {
                    d.mux = m.mux;
                }
                return d;
            };

            /**
             * Converts this yuubinsya to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.yuubinsya
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            yuubinsya.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            yuubinsya.protocol_normal = (function() {

                /**
                 * Properties of a protocol_normal.
                 * @memberof yuhaiin.listener.yuubinsya
                 * @interface Iprotocol_normal
                 */

                /**
                 * Constructs a new protocol_normal.
                 * @memberof yuhaiin.listener.yuubinsya
                 * @classdesc Represents a protocol_normal.
                 * @implements Iprotocol_normal
                 * @constructor
                 * @param {yuhaiin.listener.yuubinsya.Iprotocol_normal=} [p] Properties to set
                 */
                function protocol_normal(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }

                /**
                 * Creates a new protocol_normal instance using the specified properties.
                 * @function create
                 * @memberof yuhaiin.listener.yuubinsya.protocol_normal
                 * @static
                 * @param {yuhaiin.listener.yuubinsya.Iprotocol_normal=} [properties] Properties to set
                 * @returns {yuhaiin.listener.yuubinsya.protocol_normal} protocol_normal instance
                 */
                protocol_normal.create = function create(properties) {
                    return new protocol_normal(properties);
                };

                /**
                 * Encodes the specified protocol_normal message. Does not implicitly {@link yuhaiin.listener.yuubinsya.protocol_normal.verify|verify} messages.
                 * @function encode
                 * @memberof yuhaiin.listener.yuubinsya.protocol_normal
                 * @static
                 * @param {yuhaiin.listener.yuubinsya.Iprotocol_normal} m protocol_normal message or plain object to encode
                 * @param {$protobuf.Writer} [w] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                protocol_normal.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    return w;
                };

                /**
                 * Decodes a protocol_normal message from the specified reader or buffer.
                 * @function decode
                 * @memberof yuhaiin.listener.yuubinsya.protocol_normal
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                 * @param {number} [l] Message length if known beforehand
                 * @returns {yuhaiin.listener.yuubinsya.protocol_normal} protocol_normal
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                protocol_normal.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.yuubinsya.protocol_normal();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                        default:
                            r.skipType(t & 7);
                            break;
                        }
                    }
                    return m;
                };

                /**
                 * Creates a protocol_normal message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof yuhaiin.listener.yuubinsya.protocol_normal
                 * @static
                 * @param {Object.<string,*>} d Plain object
                 * @returns {yuhaiin.listener.yuubinsya.protocol_normal} protocol_normal
                 */
                protocol_normal.fromObject = function fromObject(d) {
                    if (d instanceof $root.yuhaiin.listener.yuubinsya.protocol_normal)
                        return d;
                    return new $root.yuhaiin.listener.yuubinsya.protocol_normal();
                };

                /**
                 * Creates a plain object from a protocol_normal message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof yuhaiin.listener.yuubinsya.protocol_normal
                 * @static
                 * @param {yuhaiin.listener.yuubinsya.protocol_normal} m protocol_normal
                 * @param {$protobuf.IConversionOptions} [o] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                protocol_normal.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this protocol_normal to JSON.
                 * @function toJSON
                 * @memberof yuhaiin.listener.yuubinsya.protocol_normal
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                protocol_normal.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return protocol_normal;
            })();

            return yuubinsya;
        })();

        listener.normal = (function() {

            /**
             * Properties of a normal.
             * @memberof yuhaiin.listener
             * @interface Inormal
             */

            /**
             * Constructs a new normal.
             * @memberof yuhaiin.listener
             * @classdesc Represents a normal.
             * @implements Inormal
             * @constructor
             * @param {yuhaiin.listener.Inormal=} [p] Properties to set
             */
            function normal(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new normal instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.normal
             * @static
             * @param {yuhaiin.listener.Inormal=} [properties] Properties to set
             * @returns {yuhaiin.listener.normal} normal instance
             */
            normal.create = function create(properties) {
                return new normal(properties);
            };

            /**
             * Encodes the specified normal message. Does not implicitly {@link yuhaiin.listener.normal.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.normal
             * @static
             * @param {yuhaiin.listener.Inormal} m normal message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            normal.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes a normal message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.normal
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.normal} normal
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            normal.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.normal();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a normal message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.normal
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.normal} normal
             */
            normal.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.normal)
                    return d;
                return new $root.yuhaiin.listener.normal();
            };

            /**
             * Creates a plain object from a normal message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.normal
             * @static
             * @param {yuhaiin.listener.normal} m normal
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            normal.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this normal to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.normal
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            normal.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return normal;
        })();

        listener.websocket = (function() {

            /**
             * Properties of a websocket.
             * @memberof yuhaiin.listener
             * @interface Iwebsocket
             * @property {yuhaiin.listener.Itls_config|null} [tls] websocket tls
             */

            /**
             * Constructs a new websocket.
             * @memberof yuhaiin.listener
             * @classdesc Represents a websocket.
             * @implements Iwebsocket
             * @constructor
             * @param {yuhaiin.listener.Iwebsocket=} [p] Properties to set
             */
            function websocket(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * websocket tls.
             * @member {yuhaiin.listener.Itls_config|null|undefined} tls
             * @memberof yuhaiin.listener.websocket
             * @instance
             */
            websocket.prototype.tls = null;

            /**
             * Creates a new websocket instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.websocket
             * @static
             * @param {yuhaiin.listener.Iwebsocket=} [properties] Properties to set
             * @returns {yuhaiin.listener.websocket} websocket instance
             */
            websocket.create = function create(properties) {
                return new websocket(properties);
            };

            /**
             * Encodes the specified websocket message. Does not implicitly {@link yuhaiin.listener.websocket.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.websocket
             * @static
             * @param {yuhaiin.listener.Iwebsocket} m websocket message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            websocket.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls_config.encode(m.tls, w.uint32(10).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a websocket message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.websocket
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.websocket} websocket
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            websocket.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.websocket();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.tls = $root.yuhaiin.listener.tls_config.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a websocket message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.websocket
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.websocket} websocket
             */
            websocket.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.websocket)
                    return d;
                var m = new $root.yuhaiin.listener.websocket();
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.websocket.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a websocket message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.websocket
             * @static
             * @param {yuhaiin.listener.websocket} m websocket
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            websocket.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.tls = null;
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls_config.toObject(m.tls, o);
                }
                return d;
            };

            /**
             * Converts this websocket to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.websocket
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            websocket.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return websocket;
        })();

        listener.quic = (function() {

            /**
             * Properties of a quic.
             * @memberof yuhaiin.listener
             * @interface Iquic
             * @property {yuhaiin.listener.Itls_config|null} [tls] quic tls
             */

            /**
             * Constructs a new quic.
             * @memberof yuhaiin.listener
             * @classdesc Represents a quic.
             * @implements Iquic
             * @constructor
             * @param {yuhaiin.listener.Iquic=} [p] Properties to set
             */
            function quic(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * quic tls.
             * @member {yuhaiin.listener.Itls_config|null|undefined} tls
             * @memberof yuhaiin.listener.quic
             * @instance
             */
            quic.prototype.tls = null;

            /**
             * Creates a new quic instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.quic
             * @static
             * @param {yuhaiin.listener.Iquic=} [properties] Properties to set
             * @returns {yuhaiin.listener.quic} quic instance
             */
            quic.create = function create(properties) {
                return new quic(properties);
            };

            /**
             * Encodes the specified quic message. Does not implicitly {@link yuhaiin.listener.quic.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.quic
             * @static
             * @param {yuhaiin.listener.Iquic} m quic message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            quic.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls_config.encode(m.tls, w.uint32(10).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a quic message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.quic
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.quic} quic
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            quic.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.quic();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.tls = $root.yuhaiin.listener.tls_config.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a quic message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.quic
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.quic} quic
             */
            quic.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.quic)
                    return d;
                var m = new $root.yuhaiin.listener.quic();
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.quic.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a quic message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.quic
             * @static
             * @param {yuhaiin.listener.quic} m quic
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            quic.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.tls = null;
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls_config.toObject(m.tls, o);
                }
                return d;
            };

            /**
             * Converts this quic to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.quic
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            quic.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return quic;
        })();

        listener.tls = (function() {

            /**
             * Properties of a tls.
             * @memberof yuhaiin.listener
             * @interface Itls
             * @property {yuhaiin.listener.Itls_config|null} [tls] tls tls
             */

            /**
             * Constructs a new tls.
             * @memberof yuhaiin.listener
             * @classdesc Represents a tls.
             * @implements Itls
             * @constructor
             * @param {yuhaiin.listener.Itls=} [p] Properties to set
             */
            function tls(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * tls tls.
             * @member {yuhaiin.listener.Itls_config|null|undefined} tls
             * @memberof yuhaiin.listener.tls
             * @instance
             */
            tls.prototype.tls = null;

            /**
             * Creates a new tls instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.tls
             * @static
             * @param {yuhaiin.listener.Itls=} [properties] Properties to set
             * @returns {yuhaiin.listener.tls} tls instance
             */
            tls.create = function create(properties) {
                return new tls(properties);
            };

            /**
             * Encodes the specified tls message. Does not implicitly {@link yuhaiin.listener.tls.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.tls
             * @static
             * @param {yuhaiin.listener.Itls} m tls message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            tls.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls_config.encode(m.tls, w.uint32(10).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a tls message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.tls
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.tls} tls
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            tls.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.tls();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.tls = $root.yuhaiin.listener.tls_config.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a tls message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.tls
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.tls} tls
             */
            tls.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.tls)
                    return d;
                var m = new $root.yuhaiin.listener.tls();
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.tls.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a tls message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.tls
             * @static
             * @param {yuhaiin.listener.tls} m tls
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            tls.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.tls = null;
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls_config.toObject(m.tls, o);
                }
                return d;
            };

            /**
             * Converts this tls to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.tls
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            tls.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return tls;
        })();

        listener.grpc = (function() {

            /**
             * Properties of a grpc.
             * @memberof yuhaiin.listener
             * @interface Igrpc
             * @property {yuhaiin.listener.Itls_config|null} [tls] grpc tls
             */

            /**
             * Constructs a new grpc.
             * @memberof yuhaiin.listener
             * @classdesc Represents a grpc.
             * @implements Igrpc
             * @constructor
             * @param {yuhaiin.listener.Igrpc=} [p] Properties to set
             */
            function grpc(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * grpc tls.
             * @member {yuhaiin.listener.Itls_config|null|undefined} tls
             * @memberof yuhaiin.listener.grpc
             * @instance
             */
            grpc.prototype.tls = null;

            /**
             * Creates a new grpc instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.grpc
             * @static
             * @param {yuhaiin.listener.Igrpc=} [properties] Properties to set
             * @returns {yuhaiin.listener.grpc} grpc instance
             */
            grpc.create = function create(properties) {
                return new grpc(properties);
            };

            /**
             * Encodes the specified grpc message. Does not implicitly {@link yuhaiin.listener.grpc.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.grpc
             * @static
             * @param {yuhaiin.listener.Igrpc} m grpc message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            grpc.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls_config.encode(m.tls, w.uint32(10).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a grpc message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.grpc
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.grpc} grpc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            grpc.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.grpc();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.tls = $root.yuhaiin.listener.tls_config.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a grpc message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.grpc
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.grpc} grpc
             */
            grpc.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.grpc)
                    return d;
                var m = new $root.yuhaiin.listener.grpc();
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.grpc.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a grpc message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.grpc
             * @static
             * @param {yuhaiin.listener.grpc} m grpc
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            grpc.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.tls = null;
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls_config.toObject(m.tls, o);
                }
                return d;
            };

            /**
             * Converts this grpc to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.grpc
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            grpc.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return grpc;
        })();

        listener.http2 = (function() {

            /**
             * Properties of a http2.
             * @memberof yuhaiin.listener
             * @interface Ihttp2
             * @property {yuhaiin.listener.Itls_config|null} [tls] http2 tls
             */

            /**
             * Constructs a new http2.
             * @memberof yuhaiin.listener
             * @classdesc Represents a http2.
             * @implements Ihttp2
             * @constructor
             * @param {yuhaiin.listener.Ihttp2=} [p] Properties to set
             */
            function http2(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * http2 tls.
             * @member {yuhaiin.listener.Itls_config|null|undefined} tls
             * @memberof yuhaiin.listener.http2
             * @instance
             */
            http2.prototype.tls = null;

            /**
             * Creates a new http2 instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.http2
             * @static
             * @param {yuhaiin.listener.Ihttp2=} [properties] Properties to set
             * @returns {yuhaiin.listener.http2} http2 instance
             */
            http2.create = function create(properties) {
                return new http2(properties);
            };

            /**
             * Encodes the specified http2 message. Does not implicitly {@link yuhaiin.listener.http2.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.http2
             * @static
             * @param {yuhaiin.listener.Ihttp2} m http2 message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            http2.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.listener.tls_config.encode(m.tls, w.uint32(10).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a http2 message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.http2
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.http2} http2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            http2.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.http2();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.tls = $root.yuhaiin.listener.tls_config.decode(r, r.uint32());
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a http2 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.http2
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.http2} http2
             */
            http2.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.http2)
                    return d;
                var m = new $root.yuhaiin.listener.http2();
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.listener.http2.tls: object expected");
                    m.tls = $root.yuhaiin.listener.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a http2 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.http2
             * @static
             * @param {yuhaiin.listener.http2} m http2
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            http2.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.tls = null;
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.listener.tls_config.toObject(m.tls, o);
                }
                return d;
            };

            /**
             * Converts this http2 to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.http2
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            http2.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return http2;
        })();

        listener.reality = (function() {

            /**
             * Properties of a reality.
             * @memberof yuhaiin.listener
             * @interface Ireality
             * @property {Array.<string>|null} [short_id] reality short_id
             * @property {Array.<string>|null} [server_name] reality server_name
             * @property {string|null} [dest] reality dest
             * @property {string|null} [private_key] reality private_key
             * @property {boolean|null} [debug] reality debug
             */

            /**
             * Constructs a new reality.
             * @memberof yuhaiin.listener
             * @classdesc Represents a reality.
             * @implements Ireality
             * @constructor
             * @param {yuhaiin.listener.Ireality=} [p] Properties to set
             */
            function reality(p) {
                this.short_id = [];
                this.server_name = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * reality short_id.
             * @member {Array.<string>} short_id
             * @memberof yuhaiin.listener.reality
             * @instance
             */
            reality.prototype.short_id = $util.emptyArray;

            /**
             * reality server_name.
             * @member {Array.<string>} server_name
             * @memberof yuhaiin.listener.reality
             * @instance
             */
            reality.prototype.server_name = $util.emptyArray;

            /**
             * reality dest.
             * @member {string} dest
             * @memberof yuhaiin.listener.reality
             * @instance
             */
            reality.prototype.dest = "";

            /**
             * reality private_key.
             * @member {string} private_key
             * @memberof yuhaiin.listener.reality
             * @instance
             */
            reality.prototype.private_key = "";

            /**
             * reality debug.
             * @member {boolean} debug
             * @memberof yuhaiin.listener.reality
             * @instance
             */
            reality.prototype.debug = false;

            /**
             * Creates a new reality instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.reality
             * @static
             * @param {yuhaiin.listener.Ireality=} [properties] Properties to set
             * @returns {yuhaiin.listener.reality} reality instance
             */
            reality.create = function create(properties) {
                return new reality(properties);
            };

            /**
             * Encodes the specified reality message. Does not implicitly {@link yuhaiin.listener.reality.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.reality
             * @static
             * @param {yuhaiin.listener.Ireality} m reality message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            reality.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.short_id != null && m.short_id.length) {
                    for (var i = 0; i < m.short_id.length; ++i)
                        w.uint32(10).string(m.short_id[i]);
                }
                if (m.server_name != null && m.server_name.length) {
                    for (var i = 0; i < m.server_name.length; ++i)
                        w.uint32(18).string(m.server_name[i]);
                }
                if (m.dest != null && Object.hasOwnProperty.call(m, "dest"))
                    w.uint32(26).string(m.dest);
                if (m.private_key != null && Object.hasOwnProperty.call(m, "private_key"))
                    w.uint32(34).string(m.private_key);
                if (m.debug != null && Object.hasOwnProperty.call(m, "debug"))
                    w.uint32(40).bool(m.debug);
                return w;
            };

            /**
             * Decodes a reality message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.reality
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.reality} reality
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            reality.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.reality();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            if (!(m.short_id && m.short_id.length))
                                m.short_id = [];
                            m.short_id.push(r.string());
                            break;
                        }
                    case 2: {
                            if (!(m.server_name && m.server_name.length))
                                m.server_name = [];
                            m.server_name.push(r.string());
                            break;
                        }
                    case 3: {
                            m.dest = r.string();
                            break;
                        }
                    case 4: {
                            m.private_key = r.string();
                            break;
                        }
                    case 5: {
                            m.debug = r.bool();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a reality message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.reality
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.reality} reality
             */
            reality.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.reality)
                    return d;
                var m = new $root.yuhaiin.listener.reality();
                if (d.short_id) {
                    if (!Array.isArray(d.short_id))
                        throw TypeError(".yuhaiin.listener.reality.short_id: array expected");
                    m.short_id = [];
                    for (var i = 0; i < d.short_id.length; ++i) {
                        m.short_id[i] = String(d.short_id[i]);
                    }
                }
                if (d.server_name) {
                    if (!Array.isArray(d.server_name))
                        throw TypeError(".yuhaiin.listener.reality.server_name: array expected");
                    m.server_name = [];
                    for (var i = 0; i < d.server_name.length; ++i) {
                        m.server_name[i] = String(d.server_name[i]);
                    }
                }
                if (d.dest != null) {
                    m.dest = String(d.dest);
                }
                if (d.private_key != null) {
                    m.private_key = String(d.private_key);
                }
                if (d.debug != null) {
                    m.debug = Boolean(d.debug);
                }
                return m;
            };

            /**
             * Creates a plain object from a reality message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.reality
             * @static
             * @param {yuhaiin.listener.reality} m reality
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            reality.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.short_id = [];
                    d.server_name = [];
                }
                if (o.defaults) {
                    d.dest = "";
                    d.private_key = "";
                    d.debug = false;
                }
                if (m.short_id && m.short_id.length) {
                    d.short_id = [];
                    for (var j = 0; j < m.short_id.length; ++j) {
                        d.short_id[j] = m.short_id[j];
                    }
                }
                if (m.server_name && m.server_name.length) {
                    d.server_name = [];
                    for (var j = 0; j < m.server_name.length; ++j) {
                        d.server_name[j] = m.server_name[j];
                    }
                }
                if (m.dest != null && m.hasOwnProperty("dest")) {
                    d.dest = m.dest;
                }
                if (m.private_key != null && m.hasOwnProperty("private_key")) {
                    d.private_key = m.private_key;
                }
                if (m.debug != null && m.hasOwnProperty("debug")) {
                    d.debug = m.debug;
                }
                return d;
            };

            /**
             * Converts this reality to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.reality
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            reality.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return reality;
        })();

        listener.tls_config = (function() {

            /**
             * Properties of a tls_config.
             * @memberof yuhaiin.listener
             * @interface Itls_config
             * @property {Array.<yuhaiin.listener.Icertificate>|null} [certificates] tls_config certificates
             * @property {Array.<string>|null} [next_protos] tls_config next_protos
             * @property {Object.<string,yuhaiin.listener.Icertificate>|null} [server_name_certificate] tls_config server_name_certificate
             */

            /**
             * Constructs a new tls_config.
             * @memberof yuhaiin.listener
             * @classdesc Represents a tls_config.
             * @implements Itls_config
             * @constructor
             * @param {yuhaiin.listener.Itls_config=} [p] Properties to set
             */
            function tls_config(p) {
                this.certificates = [];
                this.next_protos = [];
                this.server_name_certificate = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * tls_config certificates.
             * @member {Array.<yuhaiin.listener.Icertificate>} certificates
             * @memberof yuhaiin.listener.tls_config
             * @instance
             */
            tls_config.prototype.certificates = $util.emptyArray;

            /**
             * tls_config next_protos.
             * @member {Array.<string>} next_protos
             * @memberof yuhaiin.listener.tls_config
             * @instance
             */
            tls_config.prototype.next_protos = $util.emptyArray;

            /**
             * tls_config server_name_certificate.
             * @member {Object.<string,yuhaiin.listener.Icertificate>} server_name_certificate
             * @memberof yuhaiin.listener.tls_config
             * @instance
             */
            tls_config.prototype.server_name_certificate = $util.emptyObject;

            /**
             * Creates a new tls_config instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.tls_config
             * @static
             * @param {yuhaiin.listener.Itls_config=} [properties] Properties to set
             * @returns {yuhaiin.listener.tls_config} tls_config instance
             */
            tls_config.create = function create(properties) {
                return new tls_config(properties);
            };

            /**
             * Encodes the specified tls_config message. Does not implicitly {@link yuhaiin.listener.tls_config.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.tls_config
             * @static
             * @param {yuhaiin.listener.Itls_config} m tls_config message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            tls_config.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.certificates != null && m.certificates.length) {
                    for (var i = 0; i < m.certificates.length; ++i)
                        $root.yuhaiin.listener.certificate.encode(m.certificates[i], w.uint32(10).fork()).ldelim();
                }
                if (m.next_protos != null && m.next_protos.length) {
                    for (var i = 0; i < m.next_protos.length; ++i)
                        w.uint32(26).string(m.next_protos[i]);
                }
                if (m.server_name_certificate != null && Object.hasOwnProperty.call(m, "server_name_certificate")) {
                    for (var ks = Object.keys(m.server_name_certificate), i = 0; i < ks.length; ++i) {
                        w.uint32(34).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.listener.certificate.encode(m.server_name_certificate[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                return w;
            };

            /**
             * Decodes a tls_config message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.tls_config
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.tls_config} tls_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            tls_config.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.tls_config(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            if (!(m.certificates && m.certificates.length))
                                m.certificates = [];
                            m.certificates.push($root.yuhaiin.listener.certificate.decode(r, r.uint32()));
                            break;
                        }
                    case 3: {
                            if (!(m.next_protos && m.next_protos.length))
                                m.next_protos = [];
                            m.next_protos.push(r.string());
                            break;
                        }
                    case 4: {
                            if (m.server_name_certificate === $util.emptyObject)
                                m.server_name_certificate = {};
                            var c2 = r.uint32() + r.pos;
                            k = "";
                            value = null;
                            while (r.pos < c2) {
                                var tag2 = r.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    k = r.string();
                                    break;
                                case 2:
                                    value = $root.yuhaiin.listener.certificate.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.server_name_certificate[k] = value;
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a tls_config message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.tls_config
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.tls_config} tls_config
             */
            tls_config.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.tls_config)
                    return d;
                var m = new $root.yuhaiin.listener.tls_config();
                if (d.certificates) {
                    if (!Array.isArray(d.certificates))
                        throw TypeError(".yuhaiin.listener.tls_config.certificates: array expected");
                    m.certificates = [];
                    for (var i = 0; i < d.certificates.length; ++i) {
                        if (typeof d.certificates[i] !== "object")
                            throw TypeError(".yuhaiin.listener.tls_config.certificates: object expected");
                        m.certificates[i] = $root.yuhaiin.listener.certificate.fromObject(d.certificates[i]);
                    }
                }
                if (d.next_protos) {
                    if (!Array.isArray(d.next_protos))
                        throw TypeError(".yuhaiin.listener.tls_config.next_protos: array expected");
                    m.next_protos = [];
                    for (var i = 0; i < d.next_protos.length; ++i) {
                        m.next_protos[i] = String(d.next_protos[i]);
                    }
                }
                if (d.server_name_certificate) {
                    if (typeof d.server_name_certificate !== "object")
                        throw TypeError(".yuhaiin.listener.tls_config.server_name_certificate: object expected");
                    m.server_name_certificate = {};
                    for (var ks = Object.keys(d.server_name_certificate), i = 0; i < ks.length; ++i) {
                        if (typeof d.server_name_certificate[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.listener.tls_config.server_name_certificate: object expected");
                        m.server_name_certificate[ks[i]] = $root.yuhaiin.listener.certificate.fromObject(d.server_name_certificate[ks[i]]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a tls_config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.tls_config
             * @static
             * @param {yuhaiin.listener.tls_config} m tls_config
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            tls_config.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.certificates = [];
                    d.next_protos = [];
                }
                if (o.objects || o.defaults) {
                    d.server_name_certificate = {};
                }
                if (m.certificates && m.certificates.length) {
                    d.certificates = [];
                    for (var j = 0; j < m.certificates.length; ++j) {
                        d.certificates[j] = $root.yuhaiin.listener.certificate.toObject(m.certificates[j], o);
                    }
                }
                if (m.next_protos && m.next_protos.length) {
                    d.next_protos = [];
                    for (var j = 0; j < m.next_protos.length; ++j) {
                        d.next_protos[j] = m.next_protos[j];
                    }
                }
                var ks2;
                if (m.server_name_certificate && (ks2 = Object.keys(m.server_name_certificate)).length) {
                    d.server_name_certificate = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.server_name_certificate[ks2[j]] = $root.yuhaiin.listener.certificate.toObject(m.server_name_certificate[ks2[j]], o);
                    }
                }
                return d;
            };

            /**
             * Converts this tls_config to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.tls_config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            tls_config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return tls_config;
        })();

        listener.certificate = (function() {

            /**
             * Properties of a certificate.
             * @memberof yuhaiin.listener
             * @interface Icertificate
             * @property {Uint8Array|null} [cert] certificate cert
             * @property {Uint8Array|null} [key] certificate key
             * @property {string|null} [cert_file_path] certificate cert_file_path
             * @property {string|null} [key_file_path] certificate key_file_path
             */

            /**
             * Constructs a new certificate.
             * @memberof yuhaiin.listener
             * @classdesc Represents a certificate.
             * @implements Icertificate
             * @constructor
             * @param {yuhaiin.listener.Icertificate=} [p] Properties to set
             */
            function certificate(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * certificate cert.
             * @member {Uint8Array} cert
             * @memberof yuhaiin.listener.certificate
             * @instance
             */
            certificate.prototype.cert = $util.newBuffer([]);

            /**
             * certificate key.
             * @member {Uint8Array} key
             * @memberof yuhaiin.listener.certificate
             * @instance
             */
            certificate.prototype.key = $util.newBuffer([]);

            /**
             * certificate cert_file_path.
             * @member {string} cert_file_path
             * @memberof yuhaiin.listener.certificate
             * @instance
             */
            certificate.prototype.cert_file_path = "";

            /**
             * certificate key_file_path.
             * @member {string} key_file_path
             * @memberof yuhaiin.listener.certificate
             * @instance
             */
            certificate.prototype.key_file_path = "";

            /**
             * Creates a new certificate instance using the specified properties.
             * @function create
             * @memberof yuhaiin.listener.certificate
             * @static
             * @param {yuhaiin.listener.Icertificate=} [properties] Properties to set
             * @returns {yuhaiin.listener.certificate} certificate instance
             */
            certificate.create = function create(properties) {
                return new certificate(properties);
            };

            /**
             * Encodes the specified certificate message. Does not implicitly {@link yuhaiin.listener.certificate.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.listener.certificate
             * @static
             * @param {yuhaiin.listener.Icertificate} m certificate message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            certificate.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.cert != null && Object.hasOwnProperty.call(m, "cert"))
                    w.uint32(10).bytes(m.cert);
                if (m.key != null && Object.hasOwnProperty.call(m, "key"))
                    w.uint32(18).bytes(m.key);
                if (m.cert_file_path != null && Object.hasOwnProperty.call(m, "cert_file_path"))
                    w.uint32(26).string(m.cert_file_path);
                if (m.key_file_path != null && Object.hasOwnProperty.call(m, "key_file_path"))
                    w.uint32(34).string(m.key_file_path);
                return w;
            };

            /**
             * Decodes a certificate message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.listener.certificate
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.listener.certificate} certificate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            certificate.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.listener.certificate();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.cert = r.bytes();
                            break;
                        }
                    case 2: {
                            m.key = r.bytes();
                            break;
                        }
                    case 3: {
                            m.cert_file_path = r.string();
                            break;
                        }
                    case 4: {
                            m.key_file_path = r.string();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a certificate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.listener.certificate
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.listener.certificate} certificate
             */
            certificate.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.listener.certificate)
                    return d;
                var m = new $root.yuhaiin.listener.certificate();
                if (d.cert != null) {
                    if (typeof d.cert === "string")
                        $util.base64.decode(d.cert, m.cert = $util.newBuffer($util.base64.length(d.cert)), 0);
                    else if (d.cert.length >= 0)
                        m.cert = d.cert;
                }
                if (d.key != null) {
                    if (typeof d.key === "string")
                        $util.base64.decode(d.key, m.key = $util.newBuffer($util.base64.length(d.key)), 0);
                    else if (d.key.length >= 0)
                        m.key = d.key;
                }
                if (d.cert_file_path != null) {
                    m.cert_file_path = String(d.cert_file_path);
                }
                if (d.key_file_path != null) {
                    m.key_file_path = String(d.key_file_path);
                }
                return m;
            };

            /**
             * Creates a plain object from a certificate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.listener.certificate
             * @static
             * @param {yuhaiin.listener.certificate} m certificate
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            certificate.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    if (o.bytes === String)
                        d.cert = "";
                    else {
                        d.cert = [];
                        if (o.bytes !== Array)
                            d.cert = $util.newBuffer(d.cert);
                    }
                    if (o.bytes === String)
                        d.key = "";
                    else {
                        d.key = [];
                        if (o.bytes !== Array)
                            d.key = $util.newBuffer(d.key);
                    }
                    d.cert_file_path = "";
                    d.key_file_path = "";
                }
                if (m.cert != null && m.hasOwnProperty("cert")) {
                    d.cert = o.bytes === String ? $util.base64.encode(m.cert, 0, m.cert.length) : o.bytes === Array ? Array.prototype.slice.call(m.cert) : m.cert;
                }
                if (m.key != null && m.hasOwnProperty("key")) {
                    d.key = o.bytes === String ? $util.base64.encode(m.key, 0, m.key.length) : o.bytes === Array ? Array.prototype.slice.call(m.key) : m.key;
                }
                if (m.cert_file_path != null && m.hasOwnProperty("cert_file_path")) {
                    d.cert_file_path = m.cert_file_path;
                }
                if (m.key_file_path != null && m.hasOwnProperty("key_file_path")) {
                    d.key_file_path = m.key_file_path;
                }
                return d;
            };

            /**
             * Converts this certificate to JSON.
             * @function toJSON
             * @memberof yuhaiin.listener.certificate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            certificate.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return certificate;
        })();

        return listener;
    })();

    return yuhaiin;
})();

export { $root as default };
