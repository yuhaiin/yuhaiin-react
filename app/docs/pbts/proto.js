/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

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
             * @property {Array.<string>|null} [hostname] mode_config hostname
             * @property {yuhaiin.bypass.mode|null} [mode] mode_config mode
             * @property {string|null} [tag] mode_config tag
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
             * mode_config hostname.
             * @member {Array.<string>} hostname
             * @memberof yuhaiin.bypass.mode_config
             * @instance
             */
            mode_config.prototype.hostname = $util.emptyArray;

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
                    case 3: {
                            if (!(m.hostname && m.hostname.length))
                                m.hostname = [];
                            m.hostname.push(r.string());
                            break;
                        }
                    case 1: {
                            m.mode = r.int32();
                            break;
                        }
                    case 2: {
                            m.tag = r.string();
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
                if (d.hostname) {
                    if (!Array.isArray(d.hostname))
                        throw TypeError(".yuhaiin.bypass.mode_config.hostname: array expected");
                    m.hostname = [];
                    for (var i = 0; i < d.hostname.length; ++i) {
                        m.hostname[i] = String(d.hostname[i]);
                    }
                }
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
             * @property {boolean|null} [resolve_remote_domain] dns_config resolve_remote_domain
             * @property {yuhaiin.dns.Idns|null} [remote] dns_config remote
             * @property {yuhaiin.dns.Idns|null} [local] dns_config local
             * @property {yuhaiin.dns.Idns|null} [bootstrap] dns_config bootstrap
             * @property {Object.<string,string>|null} [hosts] dns_config hosts
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
                this.hosts = {};
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
                if (o.objects || o.defaults) {
                    d.hosts = {};
                }
                if (o.defaults) {
                    d.remote = null;
                    d.local = null;
                    d.bootstrap = null;
                    d.server = "";
                    d.fakedns = false;
                    d.fakedns_ip_range = "";
                    d.resolve_remote_domain = false;
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

    yuhaiin.node = (function() {

        /**
         * Namespace node.
         * @memberof yuhaiin
         * @namespace
         */
        const node = {};

        node.node = (function() {

            /**
             * Properties of a node.
             * @memberof yuhaiin.node
             * @interface Inode
             * @property {yuhaiin.point.Ipoint|null} [tcp] node tcp
             * @property {yuhaiin.point.Ipoint|null} [udp] node udp
             * @property {Object.<string,yuhaiin.subscribe.Ilink>|null} [links] node links
             * @property {yuhaiin.node.Imanager|null} [manager] node manager
             */

            /**
             * Constructs a new node.
             * @memberof yuhaiin.node
             * @classdesc Represents a node.
             * @implements Inode
             * @constructor
             * @param {yuhaiin.node.Inode=} [p] Properties to set
             */
            function node(p) {
                this.links = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * node tcp.
             * @member {yuhaiin.point.Ipoint|null|undefined} tcp
             * @memberof yuhaiin.node.node
             * @instance
             */
            node.prototype.tcp = null;

            /**
             * node udp.
             * @member {yuhaiin.point.Ipoint|null|undefined} udp
             * @memberof yuhaiin.node.node
             * @instance
             */
            node.prototype.udp = null;

            /**
             * node links.
             * @member {Object.<string,yuhaiin.subscribe.Ilink>} links
             * @memberof yuhaiin.node.node
             * @instance
             */
            node.prototype.links = $util.emptyObject;

            /**
             * node manager.
             * @member {yuhaiin.node.Imanager|null|undefined} manager
             * @memberof yuhaiin.node.node
             * @instance
             */
            node.prototype.manager = null;

            /**
             * Creates a new node instance using the specified properties.
             * @function create
             * @memberof yuhaiin.node.node
             * @static
             * @param {yuhaiin.node.Inode=} [properties] Properties to set
             * @returns {yuhaiin.node.node} node instance
             */
            node.create = function create(properties) {
                return new node(properties);
            };

            /**
             * Encodes the specified node message. Does not implicitly {@link yuhaiin.node.node.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.node.node
             * @static
             * @param {yuhaiin.node.Inode} m node message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            node.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.links != null && Object.hasOwnProperty.call(m, "links")) {
                    for (var ks = Object.keys(m.links), i = 0; i < ks.length; ++i) {
                        w.uint32(18).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.subscribe.link.encode(m.links[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                if (m.manager != null && Object.hasOwnProperty.call(m, "manager"))
                    $root.yuhaiin.node.manager.encode(m.manager, w.uint32(26).fork()).ldelim();
                if (m.tcp != null && Object.hasOwnProperty.call(m, "tcp"))
                    $root.yuhaiin.point.point.encode(m.tcp, w.uint32(34).fork()).ldelim();
                if (m.udp != null && Object.hasOwnProperty.call(m, "udp"))
                    $root.yuhaiin.point.point.encode(m.udp, w.uint32(42).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a node message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.node.node
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.node.node} node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            node.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.node.node(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 4: {
                            m.tcp = $root.yuhaiin.point.point.decode(r, r.uint32());
                            break;
                        }
                    case 5: {
                            m.udp = $root.yuhaiin.point.point.decode(r, r.uint32());
                            break;
                        }
                    case 2: {
                            if (m.links === $util.emptyObject)
                                m.links = {};
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
                                    value = $root.yuhaiin.subscribe.link.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.links[k] = value;
                            break;
                        }
                    case 3: {
                            m.manager = $root.yuhaiin.node.manager.decode(r, r.uint32());
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
             * Creates a node message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.node.node
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.node.node} node
             */
            node.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.node.node)
                    return d;
                var m = new $root.yuhaiin.node.node();
                if (d.tcp != null) {
                    if (typeof d.tcp !== "object")
                        throw TypeError(".yuhaiin.node.node.tcp: object expected");
                    m.tcp = $root.yuhaiin.point.point.fromObject(d.tcp);
                }
                if (d.udp != null) {
                    if (typeof d.udp !== "object")
                        throw TypeError(".yuhaiin.node.node.udp: object expected");
                    m.udp = $root.yuhaiin.point.point.fromObject(d.udp);
                }
                if (d.links) {
                    if (typeof d.links !== "object")
                        throw TypeError(".yuhaiin.node.node.links: object expected");
                    m.links = {};
                    for (var ks = Object.keys(d.links), i = 0; i < ks.length; ++i) {
                        if (typeof d.links[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.node.node.links: object expected");
                        m.links[ks[i]] = $root.yuhaiin.subscribe.link.fromObject(d.links[ks[i]]);
                    }
                }
                if (d.manager != null) {
                    if (typeof d.manager !== "object")
                        throw TypeError(".yuhaiin.node.node.manager: object expected");
                    m.manager = $root.yuhaiin.node.manager.fromObject(d.manager);
                }
                return m;
            };

            /**
             * Creates a plain object from a node message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.node.node
             * @static
             * @param {yuhaiin.node.node} m node
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            node.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.objects || o.defaults) {
                    d.links = {};
                }
                if (o.defaults) {
                    d.manager = null;
                    d.tcp = null;
                    d.udp = null;
                }
                var ks2;
                if (m.links && (ks2 = Object.keys(m.links)).length) {
                    d.links = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.links[ks2[j]] = $root.yuhaiin.subscribe.link.toObject(m.links[ks2[j]], o);
                    }
                }
                if (m.manager != null && m.hasOwnProperty("manager")) {
                    d.manager = $root.yuhaiin.node.manager.toObject(m.manager, o);
                }
                if (m.tcp != null && m.hasOwnProperty("tcp")) {
                    d.tcp = $root.yuhaiin.point.point.toObject(m.tcp, o);
                }
                if (m.udp != null && m.hasOwnProperty("udp")) {
                    d.udp = $root.yuhaiin.point.point.toObject(m.udp, o);
                }
                return d;
            };

            /**
             * Converts this node to JSON.
             * @function toJSON
             * @memberof yuhaiin.node.node
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            node.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return node;
        })();

        node.nodes = (function() {

            /**
             * Properties of a nodes.
             * @memberof yuhaiin.node
             * @interface Inodes
             * @property {Object.<string,string>|null} [nodesV2] nodes nodesV2
             */

            /**
             * Constructs a new nodes.
             * @memberof yuhaiin.node
             * @classdesc Represents a nodes.
             * @implements Inodes
             * @constructor
             * @param {yuhaiin.node.Inodes=} [p] Properties to set
             */
            function nodes(p) {
                this.nodesV2 = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * nodes nodesV2.
             * @member {Object.<string,string>} nodesV2
             * @memberof yuhaiin.node.nodes
             * @instance
             */
            nodes.prototype.nodesV2 = $util.emptyObject;

            /**
             * Creates a new nodes instance using the specified properties.
             * @function create
             * @memberof yuhaiin.node.nodes
             * @static
             * @param {yuhaiin.node.Inodes=} [properties] Properties to set
             * @returns {yuhaiin.node.nodes} nodes instance
             */
            nodes.create = function create(properties) {
                return new nodes(properties);
            };

            /**
             * Encodes the specified nodes message. Does not implicitly {@link yuhaiin.node.nodes.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.node.nodes
             * @static
             * @param {yuhaiin.node.Inodes} m nodes message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            nodes.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.nodesV2 != null && Object.hasOwnProperty.call(m, "nodesV2")) {
                    for (var ks = Object.keys(m.nodesV2), i = 0; i < ks.length; ++i) {
                        w.uint32(26).fork().uint32(10).string(ks[i]).uint32(18).string(m.nodesV2[ks[i]]).ldelim();
                    }
                }
                return w;
            };

            /**
             * Decodes a nodes message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.node.nodes
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.node.nodes} nodes
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            nodes.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.node.nodes(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 3: {
                            if (m.nodesV2 === $util.emptyObject)
                                m.nodesV2 = {};
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
                            m.nodesV2[k] = value;
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
             * Creates a nodes message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.node.nodes
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.node.nodes} nodes
             */
            nodes.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.node.nodes)
                    return d;
                var m = new $root.yuhaiin.node.nodes();
                if (d.nodesV2) {
                    if (typeof d.nodesV2 !== "object")
                        throw TypeError(".yuhaiin.node.nodes.nodesV2: object expected");
                    m.nodesV2 = {};
                    for (var ks = Object.keys(d.nodesV2), i = 0; i < ks.length; ++i) {
                        m.nodesV2[ks[i]] = String(d.nodesV2[ks[i]]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a nodes message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.node.nodes
             * @static
             * @param {yuhaiin.node.nodes} m nodes
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            nodes.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.objects || o.defaults) {
                    d.nodesV2 = {};
                }
                var ks2;
                if (m.nodesV2 && (ks2 = Object.keys(m.nodesV2)).length) {
                    d.nodesV2 = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.nodesV2[ks2[j]] = m.nodesV2[ks2[j]];
                    }
                }
                return d;
            };

            /**
             * Converts this nodes to JSON.
             * @function toJSON
             * @memberof yuhaiin.node.nodes
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            nodes.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return nodes;
        })();

        node.manager = (function() {

            /**
             * Properties of a manager.
             * @memberof yuhaiin.node
             * @interface Imanager
             * @property {Object.<string,yuhaiin.node.Inodes>|null} [groupsV2] manager groupsV2
             * @property {Object.<string,yuhaiin.point.Ipoint>|null} [nodes] manager nodes
             * @property {Object.<string,yuhaiin.tag.Itags>|null} [tags] manager tags
             */

            /**
             * Constructs a new manager.
             * @memberof yuhaiin.node
             * @classdesc Represents a manager.
             * @implements Imanager
             * @constructor
             * @param {yuhaiin.node.Imanager=} [p] Properties to set
             */
            function manager(p) {
                this.groupsV2 = {};
                this.nodes = {};
                this.tags = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * manager groupsV2.
             * @member {Object.<string,yuhaiin.node.Inodes>} groupsV2
             * @memberof yuhaiin.node.manager
             * @instance
             */
            manager.prototype.groupsV2 = $util.emptyObject;

            /**
             * manager nodes.
             * @member {Object.<string,yuhaiin.point.Ipoint>} nodes
             * @memberof yuhaiin.node.manager
             * @instance
             */
            manager.prototype.nodes = $util.emptyObject;

            /**
             * manager tags.
             * @member {Object.<string,yuhaiin.tag.Itags>} tags
             * @memberof yuhaiin.node.manager
             * @instance
             */
            manager.prototype.tags = $util.emptyObject;

            /**
             * Creates a new manager instance using the specified properties.
             * @function create
             * @memberof yuhaiin.node.manager
             * @static
             * @param {yuhaiin.node.Imanager=} [properties] Properties to set
             * @returns {yuhaiin.node.manager} manager instance
             */
            manager.create = function create(properties) {
                return new manager(properties);
            };

            /**
             * Encodes the specified manager message. Does not implicitly {@link yuhaiin.node.manager.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.node.manager
             * @static
             * @param {yuhaiin.node.Imanager} m manager message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            manager.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.groupsV2 != null && Object.hasOwnProperty.call(m, "groupsV2")) {
                    for (var ks = Object.keys(m.groupsV2), i = 0; i < ks.length; ++i) {
                        w.uint32(18).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.node.nodes.encode(m.groupsV2[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                if (m.nodes != null && Object.hasOwnProperty.call(m, "nodes")) {
                    for (var ks = Object.keys(m.nodes), i = 0; i < ks.length; ++i) {
                        w.uint32(26).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.point.point.encode(m.nodes[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                if (m.tags != null && Object.hasOwnProperty.call(m, "tags")) {
                    for (var ks = Object.keys(m.tags), i = 0; i < ks.length; ++i) {
                        w.uint32(34).fork().uint32(10).string(ks[i]);
                        $root.yuhaiin.tag.tags.encode(m.tags[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                return w;
            };

            /**
             * Decodes a manager message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.node.manager
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.node.manager} manager
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            manager.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.node.manager(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 2: {
                            if (m.groupsV2 === $util.emptyObject)
                                m.groupsV2 = {};
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
                                    value = $root.yuhaiin.node.nodes.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.groupsV2[k] = value;
                            break;
                        }
                    case 3: {
                            if (m.nodes === $util.emptyObject)
                                m.nodes = {};
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
                                    value = $root.yuhaiin.point.point.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.nodes[k] = value;
                            break;
                        }
                    case 4: {
                            if (m.tags === $util.emptyObject)
                                m.tags = {};
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
                                    value = $root.yuhaiin.tag.tags.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.tags[k] = value;
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
             * Creates a manager message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.node.manager
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.node.manager} manager
             */
            manager.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.node.manager)
                    return d;
                var m = new $root.yuhaiin.node.manager();
                if (d.groupsV2) {
                    if (typeof d.groupsV2 !== "object")
                        throw TypeError(".yuhaiin.node.manager.groupsV2: object expected");
                    m.groupsV2 = {};
                    for (var ks = Object.keys(d.groupsV2), i = 0; i < ks.length; ++i) {
                        if (typeof d.groupsV2[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.node.manager.groupsV2: object expected");
                        m.groupsV2[ks[i]] = $root.yuhaiin.node.nodes.fromObject(d.groupsV2[ks[i]]);
                    }
                }
                if (d.nodes) {
                    if (typeof d.nodes !== "object")
                        throw TypeError(".yuhaiin.node.manager.nodes: object expected");
                    m.nodes = {};
                    for (var ks = Object.keys(d.nodes), i = 0; i < ks.length; ++i) {
                        if (typeof d.nodes[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.node.manager.nodes: object expected");
                        m.nodes[ks[i]] = $root.yuhaiin.point.point.fromObject(d.nodes[ks[i]]);
                    }
                }
                if (d.tags) {
                    if (typeof d.tags !== "object")
                        throw TypeError(".yuhaiin.node.manager.tags: object expected");
                    m.tags = {};
                    for (var ks = Object.keys(d.tags), i = 0; i < ks.length; ++i) {
                        if (typeof d.tags[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.node.manager.tags: object expected");
                        m.tags[ks[i]] = $root.yuhaiin.tag.tags.fromObject(d.tags[ks[i]]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a manager message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.node.manager
             * @static
             * @param {yuhaiin.node.manager} m manager
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            manager.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.objects || o.defaults) {
                    d.groupsV2 = {};
                    d.nodes = {};
                    d.tags = {};
                }
                var ks2;
                if (m.groupsV2 && (ks2 = Object.keys(m.groupsV2)).length) {
                    d.groupsV2 = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.groupsV2[ks2[j]] = $root.yuhaiin.node.nodes.toObject(m.groupsV2[ks2[j]], o);
                    }
                }
                if (m.nodes && (ks2 = Object.keys(m.nodes)).length) {
                    d.nodes = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.nodes[ks2[j]] = $root.yuhaiin.point.point.toObject(m.nodes[ks2[j]], o);
                    }
                }
                if (m.tags && (ks2 = Object.keys(m.tags)).length) {
                    d.tags = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.tags[ks2[j]] = $root.yuhaiin.tag.tags.toObject(m.tags[ks2[j]], o);
                    }
                }
                return d;
            };

            /**
             * Converts this manager to JSON.
             * @function toJSON
             * @memberof yuhaiin.node.manager
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            manager.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return manager;
        })();

        return node;
    })();

    yuhaiin.point = (function() {

        /**
         * Namespace point.
         * @memberof yuhaiin
         * @namespace
         */
        const point = {};

        /**
         * origin enum.
         * @name yuhaiin.point.origin
         * @enum {number}
         * @property {number} reserve=0 reserve value
         * @property {number} remote=101 remote value
         * @property {number} manual=102 manual value
         */
        point.origin = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "reserve"] = 0;
            values[valuesById[101] = "remote"] = 101;
            values[valuesById[102] = "manual"] = 102;
            return values;
        })();

        point.point = (function() {

            /**
             * Properties of a point.
             * @memberof yuhaiin.point
             * @interface Ipoint
             * @property {string|null} [hash] point hash
             * @property {string|null} [name] point name
             * @property {string|null} [group] point group
             * @property {yuhaiin.point.origin|null} [origin] point origin
             * @property {Array.<yuhaiin.protocol.Iprotocol>|null} [protocols] point protocols
             */

            /**
             * Constructs a new point.
             * @memberof yuhaiin.point
             * @classdesc Represents a point.
             * @implements Ipoint
             * @constructor
             * @param {yuhaiin.point.Ipoint=} [p] Properties to set
             */
            function point(p) {
                this.protocols = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * point hash.
             * @member {string} hash
             * @memberof yuhaiin.point.point
             * @instance
             */
            point.prototype.hash = "";

            /**
             * point name.
             * @member {string} name
             * @memberof yuhaiin.point.point
             * @instance
             */
            point.prototype.name = "";

            /**
             * point group.
             * @member {string} group
             * @memberof yuhaiin.point.point
             * @instance
             */
            point.prototype.group = "";

            /**
             * point origin.
             * @member {yuhaiin.point.origin} origin
             * @memberof yuhaiin.point.point
             * @instance
             */
            point.prototype.origin = 0;

            /**
             * point protocols.
             * @member {Array.<yuhaiin.protocol.Iprotocol>} protocols
             * @memberof yuhaiin.point.point
             * @instance
             */
            point.prototype.protocols = $util.emptyArray;

            /**
             * Creates a new point instance using the specified properties.
             * @function create
             * @memberof yuhaiin.point.point
             * @static
             * @param {yuhaiin.point.Ipoint=} [properties] Properties to set
             * @returns {yuhaiin.point.point} point instance
             */
            point.create = function create(properties) {
                return new point(properties);
            };

            /**
             * Encodes the specified point message. Does not implicitly {@link yuhaiin.point.point.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.point.point
             * @static
             * @param {yuhaiin.point.Ipoint} m point message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            point.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.hash != null && Object.hasOwnProperty.call(m, "hash"))
                    w.uint32(10).string(m.hash);
                if (m.name != null && Object.hasOwnProperty.call(m, "name"))
                    w.uint32(18).string(m.name);
                if (m.group != null && Object.hasOwnProperty.call(m, "group"))
                    w.uint32(26).string(m.group);
                if (m.origin != null && Object.hasOwnProperty.call(m, "origin"))
                    w.uint32(32).int32(m.origin);
                if (m.protocols != null && m.protocols.length) {
                    for (var i = 0; i < m.protocols.length; ++i)
                        $root.yuhaiin.protocol.protocol.encode(m.protocols[i], w.uint32(42).fork()).ldelim();
                }
                return w;
            };

            /**
             * Decodes a point message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.point.point
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.point.point} point
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            point.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.point.point();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.hash = r.string();
                            break;
                        }
                    case 2: {
                            m.name = r.string();
                            break;
                        }
                    case 3: {
                            m.group = r.string();
                            break;
                        }
                    case 4: {
                            m.origin = r.int32();
                            break;
                        }
                    case 5: {
                            if (!(m.protocols && m.protocols.length))
                                m.protocols = [];
                            m.protocols.push($root.yuhaiin.protocol.protocol.decode(r, r.uint32()));
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
             * Creates a point message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.point.point
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.point.point} point
             */
            point.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.point.point)
                    return d;
                var m = new $root.yuhaiin.point.point();
                if (d.hash != null) {
                    m.hash = String(d.hash);
                }
                if (d.name != null) {
                    m.name = String(d.name);
                }
                if (d.group != null) {
                    m.group = String(d.group);
                }
                switch (d.origin) {
                default:
                    if (typeof d.origin === "number") {
                        m.origin = d.origin;
                        break;
                    }
                    break;
                case "reserve":
                case 0:
                    m.origin = 0;
                    break;
                case "remote":
                case 101:
                    m.origin = 101;
                    break;
                case "manual":
                case 102:
                    m.origin = 102;
                    break;
                }
                if (d.protocols) {
                    if (!Array.isArray(d.protocols))
                        throw TypeError(".yuhaiin.point.point.protocols: array expected");
                    m.protocols = [];
                    for (var i = 0; i < d.protocols.length; ++i) {
                        if (typeof d.protocols[i] !== "object")
                            throw TypeError(".yuhaiin.point.point.protocols: object expected");
                        m.protocols[i] = $root.yuhaiin.protocol.protocol.fromObject(d.protocols[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a point message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.point.point
             * @static
             * @param {yuhaiin.point.point} m point
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            point.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.protocols = [];
                }
                if (o.defaults) {
                    d.hash = "";
                    d.name = "";
                    d.group = "";
                    d.origin = o.enums === String ? "reserve" : 0;
                }
                if (m.hash != null && m.hasOwnProperty("hash")) {
                    d.hash = m.hash;
                }
                if (m.name != null && m.hasOwnProperty("name")) {
                    d.name = m.name;
                }
                if (m.group != null && m.hasOwnProperty("group")) {
                    d.group = m.group;
                }
                if (m.origin != null && m.hasOwnProperty("origin")) {
                    d.origin = o.enums === String ? $root.yuhaiin.point.origin[m.origin] === undefined ? m.origin : $root.yuhaiin.point.origin[m.origin] : m.origin;
                }
                if (m.protocols && m.protocols.length) {
                    d.protocols = [];
                    for (var j = 0; j < m.protocols.length; ++j) {
                        d.protocols[j] = $root.yuhaiin.protocol.protocol.toObject(m.protocols[j], o);
                    }
                }
                return d;
            };

            /**
             * Converts this point to JSON.
             * @function toJSON
             * @memberof yuhaiin.point.point
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            point.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return point;
        })();

        return point;
    })();

    yuhaiin.protocol = (function() {

        /**
         * Namespace protocol.
         * @memberof yuhaiin
         * @namespace
         */
        const protocol = {};

        protocol.protocol = (function() {

            /**
             * Properties of a protocol.
             * @memberof yuhaiin.protocol
             * @interface Iprotocol
             * @property {yuhaiin.protocol.Ishadowsocks|null} [shadowsocks] protocol shadowsocks
             * @property {yuhaiin.protocol.Ishadowsocksr|null} [shadowsocksr] protocol shadowsocksr
             * @property {yuhaiin.protocol.Ivmess|null} [vmess] protocol vmess
             * @property {yuhaiin.protocol.Iwebsocket|null} [websocket] protocol websocket
             * @property {yuhaiin.protocol.Iquic|null} [quic] protocol quic
             * @property {yuhaiin.protocol.Iobfs_http|null} [obfs_http] protocol obfs_http
             * @property {yuhaiin.protocol.Itrojan|null} [trojan] protocol trojan
             * @property {yuhaiin.protocol.Isimple|null} [simple] protocol simple
             * @property {yuhaiin.protocol.Inone|null} [none] protocol none
             * @property {yuhaiin.protocol.Isocks5|null} [socks5] protocol socks5
             * @property {yuhaiin.protocol.Ihttp|null} [http] protocol http
             * @property {yuhaiin.protocol.Idirect|null} [direct] protocol direct
             * @property {yuhaiin.protocol.Ireject|null} [reject] protocol reject
             * @property {yuhaiin.protocol.Iyuubinsya|null} [yuubinsya] protocol yuubinsya
             * @property {yuhaiin.protocol.Igrpc|null} [grpc] protocol grpc
             * @property {yuhaiin.protocol.Ihttp2|null} [http2] protocol http2
             * @property {yuhaiin.protocol.Ireality|null} [reality] protocol reality
             * @property {yuhaiin.protocol.Itls_config|null} [tls] protocol tls
             * @property {yuhaiin.protocol.Iwireguard|null} [wireguard] protocol wireguard
             * @property {yuhaiin.protocol.Imux|null} [mux] protocol mux
             * @property {yuhaiin.protocol.Idrop|null} [drop] protocol drop
             * @property {yuhaiin.protocol.Ivless|null} [vless] protocol vless
             */

            /**
             * Constructs a new protocol.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a protocol.
             * @implements Iprotocol
             * @constructor
             * @param {yuhaiin.protocol.Iprotocol=} [p] Properties to set
             */
            function protocol(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * protocol shadowsocks.
             * @member {yuhaiin.protocol.Ishadowsocks|null|undefined} shadowsocks
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.shadowsocks = null;

            /**
             * protocol shadowsocksr.
             * @member {yuhaiin.protocol.Ishadowsocksr|null|undefined} shadowsocksr
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.shadowsocksr = null;

            /**
             * protocol vmess.
             * @member {yuhaiin.protocol.Ivmess|null|undefined} vmess
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.vmess = null;

            /**
             * protocol websocket.
             * @member {yuhaiin.protocol.Iwebsocket|null|undefined} websocket
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.websocket = null;

            /**
             * protocol quic.
             * @member {yuhaiin.protocol.Iquic|null|undefined} quic
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.quic = null;

            /**
             * protocol obfs_http.
             * @member {yuhaiin.protocol.Iobfs_http|null|undefined} obfs_http
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.obfs_http = null;

            /**
             * protocol trojan.
             * @member {yuhaiin.protocol.Itrojan|null|undefined} trojan
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.trojan = null;

            /**
             * protocol simple.
             * @member {yuhaiin.protocol.Isimple|null|undefined} simple
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.simple = null;

            /**
             * protocol none.
             * @member {yuhaiin.protocol.Inone|null|undefined} none
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.none = null;

            /**
             * protocol socks5.
             * @member {yuhaiin.protocol.Isocks5|null|undefined} socks5
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.socks5 = null;

            /**
             * protocol http.
             * @member {yuhaiin.protocol.Ihttp|null|undefined} http
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.http = null;

            /**
             * protocol direct.
             * @member {yuhaiin.protocol.Idirect|null|undefined} direct
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.direct = null;

            /**
             * protocol reject.
             * @member {yuhaiin.protocol.Ireject|null|undefined} reject
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.reject = null;

            /**
             * protocol yuubinsya.
             * @member {yuhaiin.protocol.Iyuubinsya|null|undefined} yuubinsya
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.yuubinsya = null;

            /**
             * protocol grpc.
             * @member {yuhaiin.protocol.Igrpc|null|undefined} grpc
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.grpc = null;

            /**
             * protocol http2.
             * @member {yuhaiin.protocol.Ihttp2|null|undefined} http2
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.http2 = null;

            /**
             * protocol reality.
             * @member {yuhaiin.protocol.Ireality|null|undefined} reality
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.reality = null;

            /**
             * protocol tls.
             * @member {yuhaiin.protocol.Itls_config|null|undefined} tls
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.tls = null;

            /**
             * protocol wireguard.
             * @member {yuhaiin.protocol.Iwireguard|null|undefined} wireguard
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.wireguard = null;

            /**
             * protocol mux.
             * @member {yuhaiin.protocol.Imux|null|undefined} mux
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.mux = null;

            /**
             * protocol drop.
             * @member {yuhaiin.protocol.Idrop|null|undefined} drop
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.drop = null;

            /**
             * protocol vless.
             * @member {yuhaiin.protocol.Ivless|null|undefined} vless
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            protocol.prototype.vless = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * protocol protocol.
             * @member {"shadowsocks"|"shadowsocksr"|"vmess"|"websocket"|"quic"|"obfs_http"|"trojan"|"simple"|"none"|"socks5"|"http"|"direct"|"reject"|"yuubinsya"|"grpc"|"http2"|"reality"|"tls"|"wireguard"|"mux"|"drop"|"vless"|undefined} protocol
             * @memberof yuhaiin.protocol.protocol
             * @instance
             */
            Object.defineProperty(protocol.prototype, "protocol", {
                get: $util.oneOfGetter($oneOfFields = ["shadowsocks", "shadowsocksr", "vmess", "websocket", "quic", "obfs_http", "trojan", "simple", "none", "socks5", "http", "direct", "reject", "yuubinsya", "grpc", "http2", "reality", "tls", "wireguard", "mux", "drop", "vless"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new protocol instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.protocol
             * @static
             * @param {yuhaiin.protocol.Iprotocol=} [properties] Properties to set
             * @returns {yuhaiin.protocol.protocol} protocol instance
             */
            protocol.create = function create(properties) {
                return new protocol(properties);
            };

            /**
             * Encodes the specified protocol message. Does not implicitly {@link yuhaiin.protocol.protocol.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.protocol
             * @static
             * @param {yuhaiin.protocol.Iprotocol} m protocol message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            protocol.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.shadowsocks != null && Object.hasOwnProperty.call(m, "shadowsocks"))
                    $root.yuhaiin.protocol.shadowsocks.encode(m.shadowsocks, w.uint32(10).fork()).ldelim();
                if (m.shadowsocksr != null && Object.hasOwnProperty.call(m, "shadowsocksr"))
                    $root.yuhaiin.protocol.shadowsocksr.encode(m.shadowsocksr, w.uint32(18).fork()).ldelim();
                if (m.vmess != null && Object.hasOwnProperty.call(m, "vmess"))
                    $root.yuhaiin.protocol.vmess.encode(m.vmess, w.uint32(26).fork()).ldelim();
                if (m.websocket != null && Object.hasOwnProperty.call(m, "websocket"))
                    $root.yuhaiin.protocol.websocket.encode(m.websocket, w.uint32(34).fork()).ldelim();
                if (m.quic != null && Object.hasOwnProperty.call(m, "quic"))
                    $root.yuhaiin.protocol.quic.encode(m.quic, w.uint32(42).fork()).ldelim();
                if (m.obfs_http != null && Object.hasOwnProperty.call(m, "obfs_http"))
                    $root.yuhaiin.protocol.obfs_http.encode(m.obfs_http, w.uint32(50).fork()).ldelim();
                if (m.trojan != null && Object.hasOwnProperty.call(m, "trojan"))
                    $root.yuhaiin.protocol.trojan.encode(m.trojan, w.uint32(58).fork()).ldelim();
                if (m.simple != null && Object.hasOwnProperty.call(m, "simple"))
                    $root.yuhaiin.protocol.simple.encode(m.simple, w.uint32(66).fork()).ldelim();
                if (m.none != null && Object.hasOwnProperty.call(m, "none"))
                    $root.yuhaiin.protocol.none.encode(m.none, w.uint32(74).fork()).ldelim();
                if (m.socks5 != null && Object.hasOwnProperty.call(m, "socks5"))
                    $root.yuhaiin.protocol.socks5.encode(m.socks5, w.uint32(82).fork()).ldelim();
                if (m.http != null && Object.hasOwnProperty.call(m, "http"))
                    $root.yuhaiin.protocol.http.encode(m.http, w.uint32(90).fork()).ldelim();
                if (m.direct != null && Object.hasOwnProperty.call(m, "direct"))
                    $root.yuhaiin.protocol.direct.encode(m.direct, w.uint32(98).fork()).ldelim();
                if (m.reject != null && Object.hasOwnProperty.call(m, "reject"))
                    $root.yuhaiin.protocol.reject.encode(m.reject, w.uint32(106).fork()).ldelim();
                if (m.yuubinsya != null && Object.hasOwnProperty.call(m, "yuubinsya"))
                    $root.yuhaiin.protocol.yuubinsya.encode(m.yuubinsya, w.uint32(114).fork()).ldelim();
                if (m.grpc != null && Object.hasOwnProperty.call(m, "grpc"))
                    $root.yuhaiin.protocol.grpc.encode(m.grpc, w.uint32(122).fork()).ldelim();
                if (m.http2 != null && Object.hasOwnProperty.call(m, "http2"))
                    $root.yuhaiin.protocol.http2.encode(m.http2, w.uint32(130).fork()).ldelim();
                if (m.reality != null && Object.hasOwnProperty.call(m, "reality"))
                    $root.yuhaiin.protocol.reality.encode(m.reality, w.uint32(138).fork()).ldelim();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.protocol.tls_config.encode(m.tls, w.uint32(146).fork()).ldelim();
                if (m.wireguard != null && Object.hasOwnProperty.call(m, "wireguard"))
                    $root.yuhaiin.protocol.wireguard.encode(m.wireguard, w.uint32(154).fork()).ldelim();
                if (m.mux != null && Object.hasOwnProperty.call(m, "mux"))
                    $root.yuhaiin.protocol.mux.encode(m.mux, w.uint32(162).fork()).ldelim();
                if (m.drop != null && Object.hasOwnProperty.call(m, "drop"))
                    $root.yuhaiin.protocol.drop.encode(m.drop, w.uint32(170).fork()).ldelim();
                if (m.vless != null && Object.hasOwnProperty.call(m, "vless"))
                    $root.yuhaiin.protocol.vless.encode(m.vless, w.uint32(178).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a protocol message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.protocol
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.protocol} protocol
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            protocol.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.protocol();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.shadowsocks = $root.yuhaiin.protocol.shadowsocks.decode(r, r.uint32());
                            break;
                        }
                    case 2: {
                            m.shadowsocksr = $root.yuhaiin.protocol.shadowsocksr.decode(r, r.uint32());
                            break;
                        }
                    case 3: {
                            m.vmess = $root.yuhaiin.protocol.vmess.decode(r, r.uint32());
                            break;
                        }
                    case 4: {
                            m.websocket = $root.yuhaiin.protocol.websocket.decode(r, r.uint32());
                            break;
                        }
                    case 5: {
                            m.quic = $root.yuhaiin.protocol.quic.decode(r, r.uint32());
                            break;
                        }
                    case 6: {
                            m.obfs_http = $root.yuhaiin.protocol.obfs_http.decode(r, r.uint32());
                            break;
                        }
                    case 7: {
                            m.trojan = $root.yuhaiin.protocol.trojan.decode(r, r.uint32());
                            break;
                        }
                    case 8: {
                            m.simple = $root.yuhaiin.protocol.simple.decode(r, r.uint32());
                            break;
                        }
                    case 9: {
                            m.none = $root.yuhaiin.protocol.none.decode(r, r.uint32());
                            break;
                        }
                    case 10: {
                            m.socks5 = $root.yuhaiin.protocol.socks5.decode(r, r.uint32());
                            break;
                        }
                    case 11: {
                            m.http = $root.yuhaiin.protocol.http.decode(r, r.uint32());
                            break;
                        }
                    case 12: {
                            m.direct = $root.yuhaiin.protocol.direct.decode(r, r.uint32());
                            break;
                        }
                    case 13: {
                            m.reject = $root.yuhaiin.protocol.reject.decode(r, r.uint32());
                            break;
                        }
                    case 14: {
                            m.yuubinsya = $root.yuhaiin.protocol.yuubinsya.decode(r, r.uint32());
                            break;
                        }
                    case 15: {
                            m.grpc = $root.yuhaiin.protocol.grpc.decode(r, r.uint32());
                            break;
                        }
                    case 16: {
                            m.http2 = $root.yuhaiin.protocol.http2.decode(r, r.uint32());
                            break;
                        }
                    case 17: {
                            m.reality = $root.yuhaiin.protocol.reality.decode(r, r.uint32());
                            break;
                        }
                    case 18: {
                            m.tls = $root.yuhaiin.protocol.tls_config.decode(r, r.uint32());
                            break;
                        }
                    case 19: {
                            m.wireguard = $root.yuhaiin.protocol.wireguard.decode(r, r.uint32());
                            break;
                        }
                    case 20: {
                            m.mux = $root.yuhaiin.protocol.mux.decode(r, r.uint32());
                            break;
                        }
                    case 21: {
                            m.drop = $root.yuhaiin.protocol.drop.decode(r, r.uint32());
                            break;
                        }
                    case 22: {
                            m.vless = $root.yuhaiin.protocol.vless.decode(r, r.uint32());
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
             * @memberof yuhaiin.protocol.protocol
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.protocol} protocol
             */
            protocol.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.protocol)
                    return d;
                var m = new $root.yuhaiin.protocol.protocol();
                if (d.shadowsocks != null) {
                    if (typeof d.shadowsocks !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.shadowsocks: object expected");
                    m.shadowsocks = $root.yuhaiin.protocol.shadowsocks.fromObject(d.shadowsocks);
                }
                if (d.shadowsocksr != null) {
                    if (typeof d.shadowsocksr !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.shadowsocksr: object expected");
                    m.shadowsocksr = $root.yuhaiin.protocol.shadowsocksr.fromObject(d.shadowsocksr);
                }
                if (d.vmess != null) {
                    if (typeof d.vmess !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.vmess: object expected");
                    m.vmess = $root.yuhaiin.protocol.vmess.fromObject(d.vmess);
                }
                if (d.websocket != null) {
                    if (typeof d.websocket !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.websocket: object expected");
                    m.websocket = $root.yuhaiin.protocol.websocket.fromObject(d.websocket);
                }
                if (d.quic != null) {
                    if (typeof d.quic !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.quic: object expected");
                    m.quic = $root.yuhaiin.protocol.quic.fromObject(d.quic);
                }
                if (d.obfs_http != null) {
                    if (typeof d.obfs_http !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.obfs_http: object expected");
                    m.obfs_http = $root.yuhaiin.protocol.obfs_http.fromObject(d.obfs_http);
                }
                if (d.trojan != null) {
                    if (typeof d.trojan !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.trojan: object expected");
                    m.trojan = $root.yuhaiin.protocol.trojan.fromObject(d.trojan);
                }
                if (d.simple != null) {
                    if (typeof d.simple !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.simple: object expected");
                    m.simple = $root.yuhaiin.protocol.simple.fromObject(d.simple);
                }
                if (d.none != null) {
                    if (typeof d.none !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.none: object expected");
                    m.none = $root.yuhaiin.protocol.none.fromObject(d.none);
                }
                if (d.socks5 != null) {
                    if (typeof d.socks5 !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.socks5: object expected");
                    m.socks5 = $root.yuhaiin.protocol.socks5.fromObject(d.socks5);
                }
                if (d.http != null) {
                    if (typeof d.http !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.http: object expected");
                    m.http = $root.yuhaiin.protocol.http.fromObject(d.http);
                }
                if (d.direct != null) {
                    if (typeof d.direct !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.direct: object expected");
                    m.direct = $root.yuhaiin.protocol.direct.fromObject(d.direct);
                }
                if (d.reject != null) {
                    if (typeof d.reject !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.reject: object expected");
                    m.reject = $root.yuhaiin.protocol.reject.fromObject(d.reject);
                }
                if (d.yuubinsya != null) {
                    if (typeof d.yuubinsya !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.yuubinsya: object expected");
                    m.yuubinsya = $root.yuhaiin.protocol.yuubinsya.fromObject(d.yuubinsya);
                }
                if (d.grpc != null) {
                    if (typeof d.grpc !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.grpc: object expected");
                    m.grpc = $root.yuhaiin.protocol.grpc.fromObject(d.grpc);
                }
                if (d.http2 != null) {
                    if (typeof d.http2 !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.http2: object expected");
                    m.http2 = $root.yuhaiin.protocol.http2.fromObject(d.http2);
                }
                if (d.reality != null) {
                    if (typeof d.reality !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.reality: object expected");
                    m.reality = $root.yuhaiin.protocol.reality.fromObject(d.reality);
                }
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.tls: object expected");
                    m.tls = $root.yuhaiin.protocol.tls_config.fromObject(d.tls);
                }
                if (d.wireguard != null) {
                    if (typeof d.wireguard !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.wireguard: object expected");
                    m.wireguard = $root.yuhaiin.protocol.wireguard.fromObject(d.wireguard);
                }
                if (d.mux != null) {
                    if (typeof d.mux !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.mux: object expected");
                    m.mux = $root.yuhaiin.protocol.mux.fromObject(d.mux);
                }
                if (d.drop != null) {
                    if (typeof d.drop !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.drop: object expected");
                    m.drop = $root.yuhaiin.protocol.drop.fromObject(d.drop);
                }
                if (d.vless != null) {
                    if (typeof d.vless !== "object")
                        throw TypeError(".yuhaiin.protocol.protocol.vless: object expected");
                    m.vless = $root.yuhaiin.protocol.vless.fromObject(d.vless);
                }
                return m;
            };

            /**
             * Creates a plain object from a protocol message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.protocol
             * @static
             * @param {yuhaiin.protocol.protocol} m protocol
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            protocol.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (m.shadowsocks != null && m.hasOwnProperty("shadowsocks")) {
                    d.shadowsocks = $root.yuhaiin.protocol.shadowsocks.toObject(m.shadowsocks, o);
                    if (o.oneofs)
                        d.protocol = "shadowsocks";
                }
                if (m.shadowsocksr != null && m.hasOwnProperty("shadowsocksr")) {
                    d.shadowsocksr = $root.yuhaiin.protocol.shadowsocksr.toObject(m.shadowsocksr, o);
                    if (o.oneofs)
                        d.protocol = "shadowsocksr";
                }
                if (m.vmess != null && m.hasOwnProperty("vmess")) {
                    d.vmess = $root.yuhaiin.protocol.vmess.toObject(m.vmess, o);
                    if (o.oneofs)
                        d.protocol = "vmess";
                }
                if (m.websocket != null && m.hasOwnProperty("websocket")) {
                    d.websocket = $root.yuhaiin.protocol.websocket.toObject(m.websocket, o);
                    if (o.oneofs)
                        d.protocol = "websocket";
                }
                if (m.quic != null && m.hasOwnProperty("quic")) {
                    d.quic = $root.yuhaiin.protocol.quic.toObject(m.quic, o);
                    if (o.oneofs)
                        d.protocol = "quic";
                }
                if (m.obfs_http != null && m.hasOwnProperty("obfs_http")) {
                    d.obfs_http = $root.yuhaiin.protocol.obfs_http.toObject(m.obfs_http, o);
                    if (o.oneofs)
                        d.protocol = "obfs_http";
                }
                if (m.trojan != null && m.hasOwnProperty("trojan")) {
                    d.trojan = $root.yuhaiin.protocol.trojan.toObject(m.trojan, o);
                    if (o.oneofs)
                        d.protocol = "trojan";
                }
                if (m.simple != null && m.hasOwnProperty("simple")) {
                    d.simple = $root.yuhaiin.protocol.simple.toObject(m.simple, o);
                    if (o.oneofs)
                        d.protocol = "simple";
                }
                if (m.none != null && m.hasOwnProperty("none")) {
                    d.none = $root.yuhaiin.protocol.none.toObject(m.none, o);
                    if (o.oneofs)
                        d.protocol = "none";
                }
                if (m.socks5 != null && m.hasOwnProperty("socks5")) {
                    d.socks5 = $root.yuhaiin.protocol.socks5.toObject(m.socks5, o);
                    if (o.oneofs)
                        d.protocol = "socks5";
                }
                if (m.http != null && m.hasOwnProperty("http")) {
                    d.http = $root.yuhaiin.protocol.http.toObject(m.http, o);
                    if (o.oneofs)
                        d.protocol = "http";
                }
                if (m.direct != null && m.hasOwnProperty("direct")) {
                    d.direct = $root.yuhaiin.protocol.direct.toObject(m.direct, o);
                    if (o.oneofs)
                        d.protocol = "direct";
                }
                if (m.reject != null && m.hasOwnProperty("reject")) {
                    d.reject = $root.yuhaiin.protocol.reject.toObject(m.reject, o);
                    if (o.oneofs)
                        d.protocol = "reject";
                }
                if (m.yuubinsya != null && m.hasOwnProperty("yuubinsya")) {
                    d.yuubinsya = $root.yuhaiin.protocol.yuubinsya.toObject(m.yuubinsya, o);
                    if (o.oneofs)
                        d.protocol = "yuubinsya";
                }
                if (m.grpc != null && m.hasOwnProperty("grpc")) {
                    d.grpc = $root.yuhaiin.protocol.grpc.toObject(m.grpc, o);
                    if (o.oneofs)
                        d.protocol = "grpc";
                }
                if (m.http2 != null && m.hasOwnProperty("http2")) {
                    d.http2 = $root.yuhaiin.protocol.http2.toObject(m.http2, o);
                    if (o.oneofs)
                        d.protocol = "http2";
                }
                if (m.reality != null && m.hasOwnProperty("reality")) {
                    d.reality = $root.yuhaiin.protocol.reality.toObject(m.reality, o);
                    if (o.oneofs)
                        d.protocol = "reality";
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.protocol.tls_config.toObject(m.tls, o);
                    if (o.oneofs)
                        d.protocol = "tls";
                }
                if (m.wireguard != null && m.hasOwnProperty("wireguard")) {
                    d.wireguard = $root.yuhaiin.protocol.wireguard.toObject(m.wireguard, o);
                    if (o.oneofs)
                        d.protocol = "wireguard";
                }
                if (m.mux != null && m.hasOwnProperty("mux")) {
                    d.mux = $root.yuhaiin.protocol.mux.toObject(m.mux, o);
                    if (o.oneofs)
                        d.protocol = "mux";
                }
                if (m.drop != null && m.hasOwnProperty("drop")) {
                    d.drop = $root.yuhaiin.protocol.drop.toObject(m.drop, o);
                    if (o.oneofs)
                        d.protocol = "drop";
                }
                if (m.vless != null && m.hasOwnProperty("vless")) {
                    d.vless = $root.yuhaiin.protocol.vless.toObject(m.vless, o);
                    if (o.oneofs)
                        d.protocol = "vless";
                }
                return d;
            };

            /**
             * Converts this protocol to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.protocol
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            protocol.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return protocol;
        })();

        protocol.socks5 = (function() {

            /**
             * Properties of a socks5.
             * @memberof yuhaiin.protocol
             * @interface Isocks5
             * @property {string|null} [hostname] socks5 hostname
             * @property {string|null} [user] socks5 user
             * @property {string|null} [password] socks5 password
             */

            /**
             * Constructs a new socks5.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a socks5.
             * @implements Isocks5
             * @constructor
             * @param {yuhaiin.protocol.Isocks5=} [p] Properties to set
             */
            function socks5(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * socks5 hostname.
             * @member {string} hostname
             * @memberof yuhaiin.protocol.socks5
             * @instance
             */
            socks5.prototype.hostname = "";

            /**
             * socks5 user.
             * @member {string} user
             * @memberof yuhaiin.protocol.socks5
             * @instance
             */
            socks5.prototype.user = "";

            /**
             * socks5 password.
             * @member {string} password
             * @memberof yuhaiin.protocol.socks5
             * @instance
             */
            socks5.prototype.password = "";

            /**
             * Creates a new socks5 instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.socks5
             * @static
             * @param {yuhaiin.protocol.Isocks5=} [properties] Properties to set
             * @returns {yuhaiin.protocol.socks5} socks5 instance
             */
            socks5.create = function create(properties) {
                return new socks5(properties);
            };

            /**
             * Encodes the specified socks5 message. Does not implicitly {@link yuhaiin.protocol.socks5.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.socks5
             * @static
             * @param {yuhaiin.protocol.Isocks5} m socks5 message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            socks5.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.user != null && Object.hasOwnProperty.call(m, "user"))
                    w.uint32(10).string(m.user);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(18).string(m.password);
                if (m.hostname != null && Object.hasOwnProperty.call(m, "hostname"))
                    w.uint32(26).string(m.hostname);
                return w;
            };

            /**
             * Decodes a socks5 message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.socks5
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.socks5} socks5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            socks5.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.socks5();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 3: {
                            m.hostname = r.string();
                            break;
                        }
                    case 1: {
                            m.user = r.string();
                            break;
                        }
                    case 2: {
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
             * Creates a socks5 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.socks5
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.socks5} socks5
             */
            socks5.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.socks5)
                    return d;
                var m = new $root.yuhaiin.protocol.socks5();
                if (d.hostname != null) {
                    m.hostname = String(d.hostname);
                }
                if (d.user != null) {
                    m.user = String(d.user);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                return m;
            };

            /**
             * Creates a plain object from a socks5 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.socks5
             * @static
             * @param {yuhaiin.protocol.socks5} m socks5
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            socks5.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.user = "";
                    d.password = "";
                    d.hostname = "";
                }
                if (m.user != null && m.hasOwnProperty("user")) {
                    d.user = m.user;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                if (m.hostname != null && m.hasOwnProperty("hostname")) {
                    d.hostname = m.hostname;
                }
                return d;
            };

            /**
             * Converts this socks5 to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.socks5
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            socks5.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return socks5;
        })();

        protocol.http = (function() {

            /**
             * Properties of a http.
             * @memberof yuhaiin.protocol
             * @interface Ihttp
             * @property {string|null} [user] http user
             * @property {string|null} [password] http password
             */

            /**
             * Constructs a new http.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a http.
             * @implements Ihttp
             * @constructor
             * @param {yuhaiin.protocol.Ihttp=} [p] Properties to set
             */
            function http(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * http user.
             * @member {string} user
             * @memberof yuhaiin.protocol.http
             * @instance
             */
            http.prototype.user = "";

            /**
             * http password.
             * @member {string} password
             * @memberof yuhaiin.protocol.http
             * @instance
             */
            http.prototype.password = "";

            /**
             * Creates a new http instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.http
             * @static
             * @param {yuhaiin.protocol.Ihttp=} [properties] Properties to set
             * @returns {yuhaiin.protocol.http} http instance
             */
            http.create = function create(properties) {
                return new http(properties);
            };

            /**
             * Encodes the specified http message. Does not implicitly {@link yuhaiin.protocol.http.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.http
             * @static
             * @param {yuhaiin.protocol.Ihttp} m http message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            http.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.user != null && Object.hasOwnProperty.call(m, "user"))
                    w.uint32(10).string(m.user);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(18).string(m.password);
                return w;
            };

            /**
             * Decodes a http message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.http
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.http} http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            http.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.http();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.user = r.string();
                            break;
                        }
                    case 2: {
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
             * @memberof yuhaiin.protocol.http
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.http} http
             */
            http.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.http)
                    return d;
                var m = new $root.yuhaiin.protocol.http();
                if (d.user != null) {
                    m.user = String(d.user);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                return m;
            };

            /**
             * Creates a plain object from a http message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.http
             * @static
             * @param {yuhaiin.protocol.http} m http
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            http.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.user = "";
                    d.password = "";
                }
                if (m.user != null && m.hasOwnProperty("user")) {
                    d.user = m.user;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                return d;
            };

            /**
             * Converts this http to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.http
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            http.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return http;
        })();

        protocol.shadowsocks = (function() {

            /**
             * Properties of a shadowsocks.
             * @memberof yuhaiin.protocol
             * @interface Ishadowsocks
             * @property {string|null} [method] shadowsocks method
             * @property {string|null} [password] shadowsocks password
             */

            /**
             * Constructs a new shadowsocks.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a shadowsocks.
             * @implements Ishadowsocks
             * @constructor
             * @param {yuhaiin.protocol.Ishadowsocks=} [p] Properties to set
             */
            function shadowsocks(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * shadowsocks method.
             * @member {string} method
             * @memberof yuhaiin.protocol.shadowsocks
             * @instance
             */
            shadowsocks.prototype.method = "";

            /**
             * shadowsocks password.
             * @member {string} password
             * @memberof yuhaiin.protocol.shadowsocks
             * @instance
             */
            shadowsocks.prototype.password = "";

            /**
             * Creates a new shadowsocks instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.shadowsocks
             * @static
             * @param {yuhaiin.protocol.Ishadowsocks=} [properties] Properties to set
             * @returns {yuhaiin.protocol.shadowsocks} shadowsocks instance
             */
            shadowsocks.create = function create(properties) {
                return new shadowsocks(properties);
            };

            /**
             * Encodes the specified shadowsocks message. Does not implicitly {@link yuhaiin.protocol.shadowsocks.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.shadowsocks
             * @static
             * @param {yuhaiin.protocol.Ishadowsocks} m shadowsocks message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            shadowsocks.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.method != null && Object.hasOwnProperty.call(m, "method"))
                    w.uint32(10).string(m.method);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(18).string(m.password);
                return w;
            };

            /**
             * Decodes a shadowsocks message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.shadowsocks
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.shadowsocks} shadowsocks
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            shadowsocks.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.shadowsocks();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.method = r.string();
                            break;
                        }
                    case 2: {
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
             * Creates a shadowsocks message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.shadowsocks
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.shadowsocks} shadowsocks
             */
            shadowsocks.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.shadowsocks)
                    return d;
                var m = new $root.yuhaiin.protocol.shadowsocks();
                if (d.method != null) {
                    m.method = String(d.method);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                return m;
            };

            /**
             * Creates a plain object from a shadowsocks message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.shadowsocks
             * @static
             * @param {yuhaiin.protocol.shadowsocks} m shadowsocks
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            shadowsocks.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.method = "";
                    d.password = "";
                }
                if (m.method != null && m.hasOwnProperty("method")) {
                    d.method = m.method;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                return d;
            };

            /**
             * Converts this shadowsocks to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.shadowsocks
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            shadowsocks.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return shadowsocks;
        })();

        protocol.shadowsocksr = (function() {

            /**
             * Properties of a shadowsocksr.
             * @memberof yuhaiin.protocol
             * @interface Ishadowsocksr
             * @property {string|null} [server] shadowsocksr server
             * @property {string|null} [port] shadowsocksr port
             * @property {string|null} [method] shadowsocksr method
             * @property {string|null} [password] shadowsocksr password
             * @property {string|null} [obfs] shadowsocksr obfs
             * @property {string|null} [obfsparam] shadowsocksr obfsparam
             * @property {string|null} [protocol] shadowsocksr protocol
             * @property {string|null} [protoparam] shadowsocksr protoparam
             */

            /**
             * Constructs a new shadowsocksr.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a shadowsocksr.
             * @implements Ishadowsocksr
             * @constructor
             * @param {yuhaiin.protocol.Ishadowsocksr=} [p] Properties to set
             */
            function shadowsocksr(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * shadowsocksr server.
             * @member {string} server
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.server = "";

            /**
             * shadowsocksr port.
             * @member {string} port
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.port = "";

            /**
             * shadowsocksr method.
             * @member {string} method
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.method = "";

            /**
             * shadowsocksr password.
             * @member {string} password
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.password = "";

            /**
             * shadowsocksr obfs.
             * @member {string} obfs
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.obfs = "";

            /**
             * shadowsocksr obfsparam.
             * @member {string} obfsparam
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.obfsparam = "";

            /**
             * shadowsocksr protocol.
             * @member {string} protocol
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.protocol = "";

            /**
             * shadowsocksr protoparam.
             * @member {string} protoparam
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             */
            shadowsocksr.prototype.protoparam = "";

            /**
             * Creates a new shadowsocksr instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.shadowsocksr
             * @static
             * @param {yuhaiin.protocol.Ishadowsocksr=} [properties] Properties to set
             * @returns {yuhaiin.protocol.shadowsocksr} shadowsocksr instance
             */
            shadowsocksr.create = function create(properties) {
                return new shadowsocksr(properties);
            };

            /**
             * Encodes the specified shadowsocksr message. Does not implicitly {@link yuhaiin.protocol.shadowsocksr.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.shadowsocksr
             * @static
             * @param {yuhaiin.protocol.Ishadowsocksr} m shadowsocksr message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            shadowsocksr.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.server != null && Object.hasOwnProperty.call(m, "server"))
                    w.uint32(10).string(m.server);
                if (m.port != null && Object.hasOwnProperty.call(m, "port"))
                    w.uint32(18).string(m.port);
                if (m.method != null && Object.hasOwnProperty.call(m, "method"))
                    w.uint32(26).string(m.method);
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(34).string(m.password);
                if (m.obfs != null && Object.hasOwnProperty.call(m, "obfs"))
                    w.uint32(42).string(m.obfs);
                if (m.obfsparam != null && Object.hasOwnProperty.call(m, "obfsparam"))
                    w.uint32(50).string(m.obfsparam);
                if (m.protocol != null && Object.hasOwnProperty.call(m, "protocol"))
                    w.uint32(58).string(m.protocol);
                if (m.protoparam != null && Object.hasOwnProperty.call(m, "protoparam"))
                    w.uint32(66).string(m.protoparam);
                return w;
            };

            /**
             * Decodes a shadowsocksr message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.shadowsocksr
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.shadowsocksr} shadowsocksr
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            shadowsocksr.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.shadowsocksr();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.server = r.string();
                            break;
                        }
                    case 2: {
                            m.port = r.string();
                            break;
                        }
                    case 3: {
                            m.method = r.string();
                            break;
                        }
                    case 4: {
                            m.password = r.string();
                            break;
                        }
                    case 5: {
                            m.obfs = r.string();
                            break;
                        }
                    case 6: {
                            m.obfsparam = r.string();
                            break;
                        }
                    case 7: {
                            m.protocol = r.string();
                            break;
                        }
                    case 8: {
                            m.protoparam = r.string();
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
             * Creates a shadowsocksr message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.shadowsocksr
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.shadowsocksr} shadowsocksr
             */
            shadowsocksr.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.shadowsocksr)
                    return d;
                var m = new $root.yuhaiin.protocol.shadowsocksr();
                if (d.server != null) {
                    m.server = String(d.server);
                }
                if (d.port != null) {
                    m.port = String(d.port);
                }
                if (d.method != null) {
                    m.method = String(d.method);
                }
                if (d.password != null) {
                    m.password = String(d.password);
                }
                if (d.obfs != null) {
                    m.obfs = String(d.obfs);
                }
                if (d.obfsparam != null) {
                    m.obfsparam = String(d.obfsparam);
                }
                if (d.protocol != null) {
                    m.protocol = String(d.protocol);
                }
                if (d.protoparam != null) {
                    m.protoparam = String(d.protoparam);
                }
                return m;
            };

            /**
             * Creates a plain object from a shadowsocksr message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.shadowsocksr
             * @static
             * @param {yuhaiin.protocol.shadowsocksr} m shadowsocksr
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            shadowsocksr.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.server = "";
                    d.port = "";
                    d.method = "";
                    d.password = "";
                    d.obfs = "";
                    d.obfsparam = "";
                    d.protocol = "";
                    d.protoparam = "";
                }
                if (m.server != null && m.hasOwnProperty("server")) {
                    d.server = m.server;
                }
                if (m.port != null && m.hasOwnProperty("port")) {
                    d.port = m.port;
                }
                if (m.method != null && m.hasOwnProperty("method")) {
                    d.method = m.method;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                if (m.obfs != null && m.hasOwnProperty("obfs")) {
                    d.obfs = m.obfs;
                }
                if (m.obfsparam != null && m.hasOwnProperty("obfsparam")) {
                    d.obfsparam = m.obfsparam;
                }
                if (m.protocol != null && m.hasOwnProperty("protocol")) {
                    d.protocol = m.protocol;
                }
                if (m.protoparam != null && m.hasOwnProperty("protoparam")) {
                    d.protoparam = m.protoparam;
                }
                return d;
            };

            /**
             * Converts this shadowsocksr to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.shadowsocksr
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            shadowsocksr.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return shadowsocksr;
        })();

        protocol.http2 = (function() {

            /**
             * Properties of a http2.
             * @memberof yuhaiin.protocol
             * @interface Ihttp2
             * @property {number|null} [concurrency] http2 concurrency
             */

            /**
             * Constructs a new http2.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a http2.
             * @implements Ihttp2
             * @constructor
             * @param {yuhaiin.protocol.Ihttp2=} [p] Properties to set
             */
            function http2(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * http2 concurrency.
             * @member {number} concurrency
             * @memberof yuhaiin.protocol.http2
             * @instance
             */
            http2.prototype.concurrency = 0;

            /**
             * Creates a new http2 instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.http2
             * @static
             * @param {yuhaiin.protocol.Ihttp2=} [properties] Properties to set
             * @returns {yuhaiin.protocol.http2} http2 instance
             */
            http2.create = function create(properties) {
                return new http2(properties);
            };

            /**
             * Encodes the specified http2 message. Does not implicitly {@link yuhaiin.protocol.http2.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.http2
             * @static
             * @param {yuhaiin.protocol.Ihttp2} m http2 message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            http2.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.concurrency != null && Object.hasOwnProperty.call(m, "concurrency"))
                    w.uint32(8).int32(m.concurrency);
                return w;
            };

            /**
             * Decodes a http2 message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.http2
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.http2} http2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            http2.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.http2();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.concurrency = r.int32();
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
             * @memberof yuhaiin.protocol.http2
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.http2} http2
             */
            http2.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.http2)
                    return d;
                var m = new $root.yuhaiin.protocol.http2();
                if (d.concurrency != null) {
                    m.concurrency = d.concurrency | 0;
                }
                return m;
            };

            /**
             * Creates a plain object from a http2 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.http2
             * @static
             * @param {yuhaiin.protocol.http2} m http2
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            http2.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.concurrency = 0;
                }
                if (m.concurrency != null && m.hasOwnProperty("concurrency")) {
                    d.concurrency = m.concurrency;
                }
                return d;
            };

            /**
             * Converts this http2 to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.http2
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            http2.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return http2;
        })();

        protocol.vmess = (function() {

            /**
             * Properties of a vmess.
             * @memberof yuhaiin.protocol
             * @interface Ivmess
             * @property {string|null} [uuid] vmess uuid
             * @property {string|null} [alter_id] vmess alter_id
             * @property {string|null} [security] vmess security
             */

            /**
             * Constructs a new vmess.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a vmess.
             * @implements Ivmess
             * @constructor
             * @param {yuhaiin.protocol.Ivmess=} [p] Properties to set
             */
            function vmess(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * vmess uuid.
             * @member {string} uuid
             * @memberof yuhaiin.protocol.vmess
             * @instance
             */
            vmess.prototype.uuid = "";

            /**
             * vmess alter_id.
             * @member {string} alter_id
             * @memberof yuhaiin.protocol.vmess
             * @instance
             */
            vmess.prototype.alter_id = "";

            /**
             * vmess security.
             * @member {string} security
             * @memberof yuhaiin.protocol.vmess
             * @instance
             */
            vmess.prototype.security = "";

            /**
             * Creates a new vmess instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.vmess
             * @static
             * @param {yuhaiin.protocol.Ivmess=} [properties] Properties to set
             * @returns {yuhaiin.protocol.vmess} vmess instance
             */
            vmess.create = function create(properties) {
                return new vmess(properties);
            };

            /**
             * Encodes the specified vmess message. Does not implicitly {@link yuhaiin.protocol.vmess.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.vmess
             * @static
             * @param {yuhaiin.protocol.Ivmess} m vmess message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            vmess.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.uuid != null && Object.hasOwnProperty.call(m, "uuid"))
                    w.uint32(10).string(m.uuid);
                if (m.alter_id != null && Object.hasOwnProperty.call(m, "alter_id"))
                    w.uint32(18).string(m.alter_id);
                if (m.security != null && Object.hasOwnProperty.call(m, "security"))
                    w.uint32(26).string(m.security);
                return w;
            };

            /**
             * Decodes a vmess message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.vmess
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.vmess} vmess
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            vmess.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.vmess();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.uuid = r.string();
                            break;
                        }
                    case 2: {
                            m.alter_id = r.string();
                            break;
                        }
                    case 3: {
                            m.security = r.string();
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
             * Creates a vmess message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.vmess
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.vmess} vmess
             */
            vmess.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.vmess)
                    return d;
                var m = new $root.yuhaiin.protocol.vmess();
                if (d.uuid != null) {
                    m.uuid = String(d.uuid);
                }
                if (d.alter_id != null) {
                    m.alter_id = String(d.alter_id);
                }
                if (d.security != null) {
                    m.security = String(d.security);
                }
                return m;
            };

            /**
             * Creates a plain object from a vmess message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.vmess
             * @static
             * @param {yuhaiin.protocol.vmess} m vmess
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            vmess.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.uuid = "";
                    d.alter_id = "";
                    d.security = "";
                }
                if (m.uuid != null && m.hasOwnProperty("uuid")) {
                    d.uuid = m.uuid;
                }
                if (m.alter_id != null && m.hasOwnProperty("alter_id")) {
                    d.alter_id = m.alter_id;
                }
                if (m.security != null && m.hasOwnProperty("security")) {
                    d.security = m.security;
                }
                return d;
            };

            /**
             * Converts this vmess to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.vmess
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            vmess.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return vmess;
        })();

        protocol.vless = (function() {

            /**
             * Properties of a vless.
             * @memberof yuhaiin.protocol
             * @interface Ivless
             * @property {string|null} [uuid] vless uuid
             */

            /**
             * Constructs a new vless.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a vless.
             * @implements Ivless
             * @constructor
             * @param {yuhaiin.protocol.Ivless=} [p] Properties to set
             */
            function vless(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * vless uuid.
             * @member {string} uuid
             * @memberof yuhaiin.protocol.vless
             * @instance
             */
            vless.prototype.uuid = "";

            /**
             * Creates a new vless instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.vless
             * @static
             * @param {yuhaiin.protocol.Ivless=} [properties] Properties to set
             * @returns {yuhaiin.protocol.vless} vless instance
             */
            vless.create = function create(properties) {
                return new vless(properties);
            };

            /**
             * Encodes the specified vless message. Does not implicitly {@link yuhaiin.protocol.vless.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.vless
             * @static
             * @param {yuhaiin.protocol.Ivless} m vless message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            vless.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.uuid != null && Object.hasOwnProperty.call(m, "uuid"))
                    w.uint32(10).string(m.uuid);
                return w;
            };

            /**
             * Decodes a vless message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.vless
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.vless} vless
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            vless.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.vless();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.uuid = r.string();
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
             * Creates a vless message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.vless
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.vless} vless
             */
            vless.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.vless)
                    return d;
                var m = new $root.yuhaiin.protocol.vless();
                if (d.uuid != null) {
                    m.uuid = String(d.uuid);
                }
                return m;
            };

            /**
             * Creates a plain object from a vless message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.vless
             * @static
             * @param {yuhaiin.protocol.vless} m vless
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            vless.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.uuid = "";
                }
                if (m.uuid != null && m.hasOwnProperty("uuid")) {
                    d.uuid = m.uuid;
                }
                return d;
            };

            /**
             * Converts this vless to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.vless
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            vless.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return vless;
        })();

        protocol.trojan = (function() {

            /**
             * Properties of a trojan.
             * @memberof yuhaiin.protocol
             * @interface Itrojan
             * @property {string|null} [password] trojan password
             * @property {string|null} [peer] trojan peer
             */

            /**
             * Constructs a new trojan.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a trojan.
             * @implements Itrojan
             * @constructor
             * @param {yuhaiin.protocol.Itrojan=} [p] Properties to set
             */
            function trojan(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * trojan password.
             * @member {string} password
             * @memberof yuhaiin.protocol.trojan
             * @instance
             */
            trojan.prototype.password = "";

            /**
             * trojan peer.
             * @member {string} peer
             * @memberof yuhaiin.protocol.trojan
             * @instance
             */
            trojan.prototype.peer = "";

            /**
             * Creates a new trojan instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.trojan
             * @static
             * @param {yuhaiin.protocol.Itrojan=} [properties] Properties to set
             * @returns {yuhaiin.protocol.trojan} trojan instance
             */
            trojan.create = function create(properties) {
                return new trojan(properties);
            };

            /**
             * Encodes the specified trojan message. Does not implicitly {@link yuhaiin.protocol.trojan.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.trojan
             * @static
             * @param {yuhaiin.protocol.Itrojan} m trojan message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            trojan.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(10).string(m.password);
                if (m.peer != null && Object.hasOwnProperty.call(m, "peer"))
                    w.uint32(18).string(m.peer);
                return w;
            };

            /**
             * Decodes a trojan message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.trojan
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.trojan} trojan
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            trojan.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.trojan();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.password = r.string();
                            break;
                        }
                    case 2: {
                            m.peer = r.string();
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
             * Creates a trojan message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.trojan
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.trojan} trojan
             */
            trojan.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.trojan)
                    return d;
                var m = new $root.yuhaiin.protocol.trojan();
                if (d.password != null) {
                    m.password = String(d.password);
                }
                if (d.peer != null) {
                    m.peer = String(d.peer);
                }
                return m;
            };

            /**
             * Creates a plain object from a trojan message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.trojan
             * @static
             * @param {yuhaiin.protocol.trojan} m trojan
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            trojan.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.password = "";
                    d.peer = "";
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                if (m.peer != null && m.hasOwnProperty("peer")) {
                    d.peer = m.peer;
                }
                return d;
            };

            /**
             * Converts this trojan to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.trojan
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            trojan.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return trojan;
        })();

        protocol.yuubinsya = (function() {

            /**
             * Properties of a yuubinsya.
             * @memberof yuhaiin.protocol
             * @interface Iyuubinsya
             * @property {string|null} [password] yuubinsya password
             * @property {boolean|null} [encrypted] yuubinsya encrypted
             * @property {boolean|null} [udp_over_stream] yuubinsya udp_over_stream
             */

            /**
             * Constructs a new yuubinsya.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a yuubinsya.
             * @implements Iyuubinsya
             * @constructor
             * @param {yuhaiin.protocol.Iyuubinsya=} [p] Properties to set
             */
            function yuubinsya(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * yuubinsya password.
             * @member {string} password
             * @memberof yuhaiin.protocol.yuubinsya
             * @instance
             */
            yuubinsya.prototype.password = "";

            /**
             * yuubinsya encrypted.
             * @member {boolean} encrypted
             * @memberof yuhaiin.protocol.yuubinsya
             * @instance
             */
            yuubinsya.prototype.encrypted = false;

            /**
             * yuubinsya udp_over_stream.
             * @member {boolean} udp_over_stream
             * @memberof yuhaiin.protocol.yuubinsya
             * @instance
             */
            yuubinsya.prototype.udp_over_stream = false;

            /**
             * Creates a new yuubinsya instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.yuubinsya
             * @static
             * @param {yuhaiin.protocol.Iyuubinsya=} [properties] Properties to set
             * @returns {yuhaiin.protocol.yuubinsya} yuubinsya instance
             */
            yuubinsya.create = function create(properties) {
                return new yuubinsya(properties);
            };

            /**
             * Encodes the specified yuubinsya message. Does not implicitly {@link yuhaiin.protocol.yuubinsya.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.yuubinsya
             * @static
             * @param {yuhaiin.protocol.Iyuubinsya} m yuubinsya message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            yuubinsya.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.password != null && Object.hasOwnProperty.call(m, "password"))
                    w.uint32(10).string(m.password);
                if (m.encrypted != null && Object.hasOwnProperty.call(m, "encrypted"))
                    w.uint32(16).bool(m.encrypted);
                if (m.udp_over_stream != null && Object.hasOwnProperty.call(m, "udp_over_stream"))
                    w.uint32(24).bool(m.udp_over_stream);
                return w;
            };

            /**
             * Decodes a yuubinsya message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.yuubinsya
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.yuubinsya} yuubinsya
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            yuubinsya.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.yuubinsya();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.password = r.string();
                            break;
                        }
                    case 2: {
                            m.encrypted = r.bool();
                            break;
                        }
                    case 3: {
                            m.udp_over_stream = r.bool();
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
             * @memberof yuhaiin.protocol.yuubinsya
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.yuubinsya} yuubinsya
             */
            yuubinsya.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.yuubinsya)
                    return d;
                var m = new $root.yuhaiin.protocol.yuubinsya();
                if (d.password != null) {
                    m.password = String(d.password);
                }
                if (d.encrypted != null) {
                    m.encrypted = Boolean(d.encrypted);
                }
                if (d.udp_over_stream != null) {
                    m.udp_over_stream = Boolean(d.udp_over_stream);
                }
                return m;
            };

            /**
             * Creates a plain object from a yuubinsya message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.yuubinsya
             * @static
             * @param {yuhaiin.protocol.yuubinsya} m yuubinsya
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            yuubinsya.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.password = "";
                    d.encrypted = false;
                    d.udp_over_stream = false;
                }
                if (m.password != null && m.hasOwnProperty("password")) {
                    d.password = m.password;
                }
                if (m.encrypted != null && m.hasOwnProperty("encrypted")) {
                    d.encrypted = m.encrypted;
                }
                if (m.udp_over_stream != null && m.hasOwnProperty("udp_over_stream")) {
                    d.udp_over_stream = m.udp_over_stream;
                }
                return d;
            };

            /**
             * Converts this yuubinsya to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.yuubinsya
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            yuubinsya.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return yuubinsya;
        })();

        protocol.websocket = (function() {

            /**
             * Properties of a websocket.
             * @memberof yuhaiin.protocol
             * @interface Iwebsocket
             * @property {string|null} [host] websocket host
             * @property {string|null} [path] websocket path
             * @property {boolean|null} [tls_enabled] websocket tls_enabled
             */

            /**
             * Constructs a new websocket.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a websocket.
             * @implements Iwebsocket
             * @constructor
             * @param {yuhaiin.protocol.Iwebsocket=} [p] Properties to set
             */
            function websocket(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * websocket host.
             * @member {string} host
             * @memberof yuhaiin.protocol.websocket
             * @instance
             */
            websocket.prototype.host = "";

            /**
             * websocket path.
             * @member {string} path
             * @memberof yuhaiin.protocol.websocket
             * @instance
             */
            websocket.prototype.path = "";

            /**
             * websocket tls_enabled.
             * @member {boolean} tls_enabled
             * @memberof yuhaiin.protocol.websocket
             * @instance
             */
            websocket.prototype.tls_enabled = false;

            /**
             * Creates a new websocket instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.websocket
             * @static
             * @param {yuhaiin.protocol.Iwebsocket=} [properties] Properties to set
             * @returns {yuhaiin.protocol.websocket} websocket instance
             */
            websocket.create = function create(properties) {
                return new websocket(properties);
            };

            /**
             * Encodes the specified websocket message. Does not implicitly {@link yuhaiin.protocol.websocket.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.websocket
             * @static
             * @param {yuhaiin.protocol.Iwebsocket} m websocket message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            websocket.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.path != null && Object.hasOwnProperty.call(m, "path"))
                    w.uint32(18).string(m.path);
                if (m.tls_enabled != null && Object.hasOwnProperty.call(m, "tls_enabled"))
                    w.uint32(32).bool(m.tls_enabled);
                return w;
            };

            /**
             * Decodes a websocket message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.websocket
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.websocket} websocket
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            websocket.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.websocket();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.path = r.string();
                            break;
                        }
                    case 4: {
                            m.tls_enabled = r.bool();
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
             * @memberof yuhaiin.protocol.websocket
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.websocket} websocket
             */
            websocket.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.websocket)
                    return d;
                var m = new $root.yuhaiin.protocol.websocket();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.path != null) {
                    m.path = String(d.path);
                }
                if (d.tls_enabled != null) {
                    m.tls_enabled = Boolean(d.tls_enabled);
                }
                return m;
            };

            /**
             * Creates a plain object from a websocket message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.websocket
             * @static
             * @param {yuhaiin.protocol.websocket} m websocket
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            websocket.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.path = "";
                    d.tls_enabled = false;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.path != null && m.hasOwnProperty("path")) {
                    d.path = m.path;
                }
                if (m.tls_enabled != null && m.hasOwnProperty("tls_enabled")) {
                    d.tls_enabled = m.tls_enabled;
                }
                return d;
            };

            /**
             * Converts this websocket to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.websocket
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            websocket.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return websocket;
        })();

        protocol.grpc = (function() {

            /**
             * Properties of a grpc.
             * @memberof yuhaiin.protocol
             * @interface Igrpc
             * @property {yuhaiin.protocol.Itls_config|null} [tls] grpc tls
             */

            /**
             * Constructs a new grpc.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a grpc.
             * @implements Igrpc
             * @constructor
             * @param {yuhaiin.protocol.Igrpc=} [p] Properties to set
             */
            function grpc(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * grpc tls.
             * @member {yuhaiin.protocol.Itls_config|null|undefined} tls
             * @memberof yuhaiin.protocol.grpc
             * @instance
             */
            grpc.prototype.tls = null;

            /**
             * Creates a new grpc instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.grpc
             * @static
             * @param {yuhaiin.protocol.Igrpc=} [properties] Properties to set
             * @returns {yuhaiin.protocol.grpc} grpc instance
             */
            grpc.create = function create(properties) {
                return new grpc(properties);
            };

            /**
             * Encodes the specified grpc message. Does not implicitly {@link yuhaiin.protocol.grpc.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.grpc
             * @static
             * @param {yuhaiin.protocol.Igrpc} m grpc message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            grpc.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.protocol.tls_config.encode(m.tls, w.uint32(10).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a grpc message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.grpc
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.grpc} grpc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            grpc.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.grpc();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.tls = $root.yuhaiin.protocol.tls_config.decode(r, r.uint32());
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
             * @memberof yuhaiin.protocol.grpc
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.grpc} grpc
             */
            grpc.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.grpc)
                    return d;
                var m = new $root.yuhaiin.protocol.grpc();
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.protocol.grpc.tls: object expected");
                    m.tls = $root.yuhaiin.protocol.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a grpc message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.grpc
             * @static
             * @param {yuhaiin.protocol.grpc} m grpc
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
                    d.tls = $root.yuhaiin.protocol.tls_config.toObject(m.tls, o);
                }
                return d;
            };

            /**
             * Converts this grpc to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.grpc
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            grpc.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return grpc;
        })();

        protocol.quic = (function() {

            /**
             * Properties of a quic.
             * @memberof yuhaiin.protocol
             * @interface Iquic
             * @property {string|null} [host] quic host
             * @property {yuhaiin.protocol.Itls_config|null} [tls] quic tls
             */

            /**
             * Constructs a new quic.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a quic.
             * @implements Iquic
             * @constructor
             * @param {yuhaiin.protocol.Iquic=} [p] Properties to set
             */
            function quic(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * quic host.
             * @member {string} host
             * @memberof yuhaiin.protocol.quic
             * @instance
             */
            quic.prototype.host = "";

            /**
             * quic tls.
             * @member {yuhaiin.protocol.Itls_config|null|undefined} tls
             * @memberof yuhaiin.protocol.quic
             * @instance
             */
            quic.prototype.tls = null;

            /**
             * Creates a new quic instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.quic
             * @static
             * @param {yuhaiin.protocol.Iquic=} [properties] Properties to set
             * @returns {yuhaiin.protocol.quic} quic instance
             */
            quic.create = function create(properties) {
                return new quic(properties);
            };

            /**
             * Encodes the specified quic message. Does not implicitly {@link yuhaiin.protocol.quic.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.quic
             * @static
             * @param {yuhaiin.protocol.Iquic} m quic message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            quic.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.protocol.tls_config.encode(m.tls, w.uint32(10).fork()).ldelim();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(18).string(m.host);
                return w;
            };

            /**
             * Decodes a quic message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.quic
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.quic} quic
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            quic.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.quic();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 2: {
                            m.host = r.string();
                            break;
                        }
                    case 1: {
                            m.tls = $root.yuhaiin.protocol.tls_config.decode(r, r.uint32());
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
             * @memberof yuhaiin.protocol.quic
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.quic} quic
             */
            quic.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.quic)
                    return d;
                var m = new $root.yuhaiin.protocol.quic();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.protocol.quic.tls: object expected");
                    m.tls = $root.yuhaiin.protocol.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a quic message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.quic
             * @static
             * @param {yuhaiin.protocol.quic} m quic
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            quic.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.tls = null;
                    d.host = "";
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.protocol.tls_config.toObject(m.tls, o);
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                return d;
            };

            /**
             * Converts this quic to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.quic
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            quic.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return quic;
        })();

        protocol.reality = (function() {

            /**
             * Properties of a reality.
             * @memberof yuhaiin.protocol
             * @interface Ireality
             * @property {string|null} [server_name] reality server_name
             * @property {string|null} [public_key] reality public_key
             * @property {string|null} [short_id] reality short_id
             * @property {boolean|null} [debug] reality debug
             */

            /**
             * Constructs a new reality.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a reality.
             * @implements Ireality
             * @constructor
             * @param {yuhaiin.protocol.Ireality=} [p] Properties to set
             */
            function reality(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * reality server_name.
             * @member {string} server_name
             * @memberof yuhaiin.protocol.reality
             * @instance
             */
            reality.prototype.server_name = "";

            /**
             * reality public_key.
             * @member {string} public_key
             * @memberof yuhaiin.protocol.reality
             * @instance
             */
            reality.prototype.public_key = "";

            /**
             * reality short_id.
             * @member {string} short_id
             * @memberof yuhaiin.protocol.reality
             * @instance
             */
            reality.prototype.short_id = "";

            /**
             * reality debug.
             * @member {boolean} debug
             * @memberof yuhaiin.protocol.reality
             * @instance
             */
            reality.prototype.debug = false;

            /**
             * Creates a new reality instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.reality
             * @static
             * @param {yuhaiin.protocol.Ireality=} [properties] Properties to set
             * @returns {yuhaiin.protocol.reality} reality instance
             */
            reality.create = function create(properties) {
                return new reality(properties);
            };

            /**
             * Encodes the specified reality message. Does not implicitly {@link yuhaiin.protocol.reality.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.reality
             * @static
             * @param {yuhaiin.protocol.Ireality} m reality message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            reality.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.server_name != null && Object.hasOwnProperty.call(m, "server_name"))
                    w.uint32(10).string(m.server_name);
                if (m.public_key != null && Object.hasOwnProperty.call(m, "public_key"))
                    w.uint32(18).string(m.public_key);
                if (m.short_id != null && Object.hasOwnProperty.call(m, "short_id"))
                    w.uint32(26).string(m.short_id);
                if (m.debug != null && Object.hasOwnProperty.call(m, "debug"))
                    w.uint32(32).bool(m.debug);
                return w;
            };

            /**
             * Decodes a reality message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.reality
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.reality} reality
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            reality.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.reality();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.server_name = r.string();
                            break;
                        }
                    case 2: {
                            m.public_key = r.string();
                            break;
                        }
                    case 3: {
                            m.short_id = r.string();
                            break;
                        }
                    case 4: {
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
             * @memberof yuhaiin.protocol.reality
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.reality} reality
             */
            reality.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.reality)
                    return d;
                var m = new $root.yuhaiin.protocol.reality();
                if (d.server_name != null) {
                    m.server_name = String(d.server_name);
                }
                if (d.public_key != null) {
                    m.public_key = String(d.public_key);
                }
                if (d.short_id != null) {
                    m.short_id = String(d.short_id);
                }
                if (d.debug != null) {
                    m.debug = Boolean(d.debug);
                }
                return m;
            };

            /**
             * Creates a plain object from a reality message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.reality
             * @static
             * @param {yuhaiin.protocol.reality} m reality
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            reality.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.server_name = "";
                    d.public_key = "";
                    d.short_id = "";
                    d.debug = false;
                }
                if (m.server_name != null && m.hasOwnProperty("server_name")) {
                    d.server_name = m.server_name;
                }
                if (m.public_key != null && m.hasOwnProperty("public_key")) {
                    d.public_key = m.public_key;
                }
                if (m.short_id != null && m.hasOwnProperty("short_id")) {
                    d.short_id = m.short_id;
                }
                if (m.debug != null && m.hasOwnProperty("debug")) {
                    d.debug = m.debug;
                }
                return d;
            };

            /**
             * Converts this reality to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.reality
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            reality.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return reality;
        })();

        protocol.obfs_http = (function() {

            /**
             * Properties of an obfs_http.
             * @memberof yuhaiin.protocol
             * @interface Iobfs_http
             * @property {string|null} [host] obfs_http host
             * @property {string|null} [port] obfs_http port
             */

            /**
             * Constructs a new obfs_http.
             * @memberof yuhaiin.protocol
             * @classdesc Represents an obfs_http.
             * @implements Iobfs_http
             * @constructor
             * @param {yuhaiin.protocol.Iobfs_http=} [p] Properties to set
             */
            function obfs_http(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * obfs_http host.
             * @member {string} host
             * @memberof yuhaiin.protocol.obfs_http
             * @instance
             */
            obfs_http.prototype.host = "";

            /**
             * obfs_http port.
             * @member {string} port
             * @memberof yuhaiin.protocol.obfs_http
             * @instance
             */
            obfs_http.prototype.port = "";

            /**
             * Creates a new obfs_http instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.obfs_http
             * @static
             * @param {yuhaiin.protocol.Iobfs_http=} [properties] Properties to set
             * @returns {yuhaiin.protocol.obfs_http} obfs_http instance
             */
            obfs_http.create = function create(properties) {
                return new obfs_http(properties);
            };

            /**
             * Encodes the specified obfs_http message. Does not implicitly {@link yuhaiin.protocol.obfs_http.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.obfs_http
             * @static
             * @param {yuhaiin.protocol.Iobfs_http} m obfs_http message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            obfs_http.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.port != null && Object.hasOwnProperty.call(m, "port"))
                    w.uint32(18).string(m.port);
                return w;
            };

            /**
             * Decodes an obfs_http message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.obfs_http
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.obfs_http} obfs_http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            obfs_http.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.obfs_http();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.port = r.string();
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
             * Creates an obfs_http message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.obfs_http
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.obfs_http} obfs_http
             */
            obfs_http.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.obfs_http)
                    return d;
                var m = new $root.yuhaiin.protocol.obfs_http();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.port != null) {
                    m.port = String(d.port);
                }
                return m;
            };

            /**
             * Creates a plain object from an obfs_http message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.obfs_http
             * @static
             * @param {yuhaiin.protocol.obfs_http} m obfs_http
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            obfs_http.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.port = "";
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.port != null && m.hasOwnProperty("port")) {
                    d.port = m.port;
                }
                return d;
            };

            /**
             * Converts this obfs_http to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.obfs_http
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            obfs_http.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return obfs_http;
        })();

        protocol.none = (function() {

            /**
             * Properties of a none.
             * @memberof yuhaiin.protocol
             * @interface Inone
             */

            /**
             * Constructs a new none.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a none.
             * @implements Inone
             * @constructor
             * @param {yuhaiin.protocol.Inone=} [p] Properties to set
             */
            function none(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new none instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.none
             * @static
             * @param {yuhaiin.protocol.Inone=} [properties] Properties to set
             * @returns {yuhaiin.protocol.none} none instance
             */
            none.create = function create(properties) {
                return new none(properties);
            };

            /**
             * Encodes the specified none message. Does not implicitly {@link yuhaiin.protocol.none.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.none
             * @static
             * @param {yuhaiin.protocol.Inone} m none message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            none.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes a none message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.none
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.none} none
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            none.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.none();
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
             * Creates a none message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.none
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.none} none
             */
            none.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.none)
                    return d;
                return new $root.yuhaiin.protocol.none();
            };

            /**
             * Creates a plain object from a none message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.none
             * @static
             * @param {yuhaiin.protocol.none} m none
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            none.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this none to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.none
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            none.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return none;
        })();

        protocol.simple = (function() {

            /**
             * Properties of a simple.
             * @memberof yuhaiin.protocol
             * @interface Isimple
             * @property {string|null} [host] simple host
             * @property {number|null} [port] simple port
             * @property {number|Long|null} [timeout] simple timeout
             * @property {Array.<yuhaiin.protocol.Ihost>|null} [alternate_host] simple alternate_host
             * @property {yuhaiin.protocol.Itls_config|null} [tls] simple tls
             */

            /**
             * Constructs a new simple.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a simple.
             * @implements Isimple
             * @constructor
             * @param {yuhaiin.protocol.Isimple=} [p] Properties to set
             */
            function simple(p) {
                this.alternate_host = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * simple host.
             * @member {string} host
             * @memberof yuhaiin.protocol.simple
             * @instance
             */
            simple.prototype.host = "";

            /**
             * simple port.
             * @member {number} port
             * @memberof yuhaiin.protocol.simple
             * @instance
             */
            simple.prototype.port = 0;

            /**
             * simple timeout.
             * @member {number|Long} timeout
             * @memberof yuhaiin.protocol.simple
             * @instance
             */
            simple.prototype.timeout = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * simple alternate_host.
             * @member {Array.<yuhaiin.protocol.Ihost>} alternate_host
             * @memberof yuhaiin.protocol.simple
             * @instance
             */
            simple.prototype.alternate_host = $util.emptyArray;

            /**
             * simple tls.
             * @member {yuhaiin.protocol.Itls_config|null|undefined} tls
             * @memberof yuhaiin.protocol.simple
             * @instance
             */
            simple.prototype.tls = null;

            /**
             * Creates a new simple instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.simple
             * @static
             * @param {yuhaiin.protocol.Isimple=} [properties] Properties to set
             * @returns {yuhaiin.protocol.simple} simple instance
             */
            simple.create = function create(properties) {
                return new simple(properties);
            };

            /**
             * Encodes the specified simple message. Does not implicitly {@link yuhaiin.protocol.simple.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.simple
             * @static
             * @param {yuhaiin.protocol.Isimple} m simple message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            simple.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.port != null && Object.hasOwnProperty.call(m, "port"))
                    w.uint32(16).int32(m.port);
                if (m.tls != null && Object.hasOwnProperty.call(m, "tls"))
                    $root.yuhaiin.protocol.tls_config.encode(m.tls, w.uint32(34).fork()).ldelim();
                if (m.alternate_host != null && m.alternate_host.length) {
                    for (var i = 0; i < m.alternate_host.length; ++i)
                        $root.yuhaiin.protocol.host.encode(m.alternate_host[i], w.uint32(42).fork()).ldelim();
                }
                if (m.timeout != null && Object.hasOwnProperty.call(m, "timeout"))
                    w.uint32(48).uint64(m.timeout);
                return w;
            };

            /**
             * Decodes a simple message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.simple
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.simple} simple
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            simple.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.simple();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.port = r.int32();
                            break;
                        }
                    case 6: {
                            m.timeout = r.uint64();
                            break;
                        }
                    case 5: {
                            if (!(m.alternate_host && m.alternate_host.length))
                                m.alternate_host = [];
                            m.alternate_host.push($root.yuhaiin.protocol.host.decode(r, r.uint32()));
                            break;
                        }
                    case 4: {
                            m.tls = $root.yuhaiin.protocol.tls_config.decode(r, r.uint32());
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
             * Creates a simple message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.simple
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.simple} simple
             */
            simple.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.simple)
                    return d;
                var m = new $root.yuhaiin.protocol.simple();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.port != null) {
                    m.port = d.port | 0;
                }
                if (d.timeout != null) {
                    if ($util.Long)
                        (m.timeout = $util.Long.fromValue(d.timeout)).unsigned = true;
                    else if (typeof d.timeout === "string")
                        m.timeout = parseInt(d.timeout, 10);
                    else if (typeof d.timeout === "number")
                        m.timeout = d.timeout;
                    else if (typeof d.timeout === "object")
                        m.timeout = new $util.LongBits(d.timeout.low >>> 0, d.timeout.high >>> 0).toNumber(true);
                }
                if (d.alternate_host) {
                    if (!Array.isArray(d.alternate_host))
                        throw TypeError(".yuhaiin.protocol.simple.alternate_host: array expected");
                    m.alternate_host = [];
                    for (var i = 0; i < d.alternate_host.length; ++i) {
                        if (typeof d.alternate_host[i] !== "object")
                            throw TypeError(".yuhaiin.protocol.simple.alternate_host: object expected");
                        m.alternate_host[i] = $root.yuhaiin.protocol.host.fromObject(d.alternate_host[i]);
                    }
                }
                if (d.tls != null) {
                    if (typeof d.tls !== "object")
                        throw TypeError(".yuhaiin.protocol.simple.tls: object expected");
                    m.tls = $root.yuhaiin.protocol.tls_config.fromObject(d.tls);
                }
                return m;
            };

            /**
             * Creates a plain object from a simple message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.simple
             * @static
             * @param {yuhaiin.protocol.simple} m simple
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            simple.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.alternate_host = [];
                }
                if (o.defaults) {
                    d.host = "";
                    d.port = 0;
                    d.tls = null;
                    if ($util.Long) {
                        var n = new $util.Long(0, 0, true);
                        d.timeout = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                    } else
                        d.timeout = o.longs === String ? "0" : 0;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.port != null && m.hasOwnProperty("port")) {
                    d.port = m.port;
                }
                if (m.tls != null && m.hasOwnProperty("tls")) {
                    d.tls = $root.yuhaiin.protocol.tls_config.toObject(m.tls, o);
                }
                if (m.alternate_host && m.alternate_host.length) {
                    d.alternate_host = [];
                    for (var j = 0; j < m.alternate_host.length; ++j) {
                        d.alternate_host[j] = $root.yuhaiin.protocol.host.toObject(m.alternate_host[j], o);
                    }
                }
                if (m.timeout != null && m.hasOwnProperty("timeout")) {
                    if (typeof m.timeout === "number")
                        d.timeout = o.longs === String ? String(m.timeout) : m.timeout;
                    else
                        d.timeout = o.longs === String ? $util.Long.prototype.toString.call(m.timeout) : o.longs === Number ? new $util.LongBits(m.timeout.low >>> 0, m.timeout.high >>> 0).toNumber(true) : m.timeout;
                }
                return d;
            };

            /**
             * Converts this simple to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.simple
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            simple.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return simple;
        })();

        protocol.tls_config = (function() {

            /**
             * Properties of a tls_config.
             * @memberof yuhaiin.protocol
             * @interface Itls_config
             * @property {boolean|null} [enable] tls_config enable
             * @property {Array.<string>|null} [server_names] tls_config server_names
             * @property {Array.<Uint8Array>|null} [ca_cert] tls_config ca_cert
             * @property {boolean|null} [insecure_skip_verify] tls_config insecure_skip_verify
             * @property {Array.<string>|null} [next_protos] tls_config next_protos
             */

            /**
             * Constructs a new tls_config.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a tls_config.
             * @implements Itls_config
             * @constructor
             * @param {yuhaiin.protocol.Itls_config=} [p] Properties to set
             */
            function tls_config(p) {
                this.server_names = [];
                this.ca_cert = [];
                this.next_protos = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * tls_config enable.
             * @member {boolean} enable
             * @memberof yuhaiin.protocol.tls_config
             * @instance
             */
            tls_config.prototype.enable = false;

            /**
             * tls_config server_names.
             * @member {Array.<string>} server_names
             * @memberof yuhaiin.protocol.tls_config
             * @instance
             */
            tls_config.prototype.server_names = $util.emptyArray;

            /**
             * tls_config ca_cert.
             * @member {Array.<Uint8Array>} ca_cert
             * @memberof yuhaiin.protocol.tls_config
             * @instance
             */
            tls_config.prototype.ca_cert = $util.emptyArray;

            /**
             * tls_config insecure_skip_verify.
             * @member {boolean} insecure_skip_verify
             * @memberof yuhaiin.protocol.tls_config
             * @instance
             */
            tls_config.prototype.insecure_skip_verify = false;

            /**
             * tls_config next_protos.
             * @member {Array.<string>} next_protos
             * @memberof yuhaiin.protocol.tls_config
             * @instance
             */
            tls_config.prototype.next_protos = $util.emptyArray;

            /**
             * Creates a new tls_config instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.tls_config
             * @static
             * @param {yuhaiin.protocol.Itls_config=} [properties] Properties to set
             * @returns {yuhaiin.protocol.tls_config} tls_config instance
             */
            tls_config.create = function create(properties) {
                return new tls_config(properties);
            };

            /**
             * Encodes the specified tls_config message. Does not implicitly {@link yuhaiin.protocol.tls_config.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.tls_config
             * @static
             * @param {yuhaiin.protocol.Itls_config} m tls_config message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            tls_config.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.enable != null && Object.hasOwnProperty.call(m, "enable"))
                    w.uint32(8).bool(m.enable);
                if (m.ca_cert != null && m.ca_cert.length) {
                    for (var i = 0; i < m.ca_cert.length; ++i)
                        w.uint32(26).bytes(m.ca_cert[i]);
                }
                if (m.insecure_skip_verify != null && Object.hasOwnProperty.call(m, "insecure_skip_verify"))
                    w.uint32(32).bool(m.insecure_skip_verify);
                if (m.next_protos != null && m.next_protos.length) {
                    for (var i = 0; i < m.next_protos.length; ++i)
                        w.uint32(42).string(m.next_protos[i]);
                }
                if (m.server_names != null && m.server_names.length) {
                    for (var i = 0; i < m.server_names.length; ++i)
                        w.uint32(50).string(m.server_names[i]);
                }
                return w;
            };

            /**
             * Decodes a tls_config message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.tls_config
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.tls_config} tls_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            tls_config.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.tls_config();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.enable = r.bool();
                            break;
                        }
                    case 6: {
                            if (!(m.server_names && m.server_names.length))
                                m.server_names = [];
                            m.server_names.push(r.string());
                            break;
                        }
                    case 3: {
                            if (!(m.ca_cert && m.ca_cert.length))
                                m.ca_cert = [];
                            m.ca_cert.push(r.bytes());
                            break;
                        }
                    case 4: {
                            m.insecure_skip_verify = r.bool();
                            break;
                        }
                    case 5: {
                            if (!(m.next_protos && m.next_protos.length))
                                m.next_protos = [];
                            m.next_protos.push(r.string());
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
             * @memberof yuhaiin.protocol.tls_config
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.tls_config} tls_config
             */
            tls_config.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.tls_config)
                    return d;
                var m = new $root.yuhaiin.protocol.tls_config();
                if (d.enable != null) {
                    m.enable = Boolean(d.enable);
                }
                if (d.server_names) {
                    if (!Array.isArray(d.server_names))
                        throw TypeError(".yuhaiin.protocol.tls_config.server_names: array expected");
                    m.server_names = [];
                    for (var i = 0; i < d.server_names.length; ++i) {
                        m.server_names[i] = String(d.server_names[i]);
                    }
                }
                if (d.ca_cert) {
                    if (!Array.isArray(d.ca_cert))
                        throw TypeError(".yuhaiin.protocol.tls_config.ca_cert: array expected");
                    m.ca_cert = [];
                    for (var i = 0; i < d.ca_cert.length; ++i) {
                        if (typeof d.ca_cert[i] === "string")
                            $util.base64.decode(d.ca_cert[i], m.ca_cert[i] = $util.newBuffer($util.base64.length(d.ca_cert[i])), 0);
                        else if (d.ca_cert[i].length >= 0)
                            m.ca_cert[i] = d.ca_cert[i];
                    }
                }
                if (d.insecure_skip_verify != null) {
                    m.insecure_skip_verify = Boolean(d.insecure_skip_verify);
                }
                if (d.next_protos) {
                    if (!Array.isArray(d.next_protos))
                        throw TypeError(".yuhaiin.protocol.tls_config.next_protos: array expected");
                    m.next_protos = [];
                    for (var i = 0; i < d.next_protos.length; ++i) {
                        m.next_protos[i] = String(d.next_protos[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a tls_config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.tls_config
             * @static
             * @param {yuhaiin.protocol.tls_config} m tls_config
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            tls_config.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.ca_cert = [];
                    d.next_protos = [];
                    d.server_names = [];
                }
                if (o.defaults) {
                    d.enable = false;
                    d.insecure_skip_verify = false;
                }
                if (m.enable != null && m.hasOwnProperty("enable")) {
                    d.enable = m.enable;
                }
                if (m.ca_cert && m.ca_cert.length) {
                    d.ca_cert = [];
                    for (var j = 0; j < m.ca_cert.length; ++j) {
                        d.ca_cert[j] = o.bytes === String ? $util.base64.encode(m.ca_cert[j], 0, m.ca_cert[j].length) : o.bytes === Array ? Array.prototype.slice.call(m.ca_cert[j]) : m.ca_cert[j];
                    }
                }
                if (m.insecure_skip_verify != null && m.hasOwnProperty("insecure_skip_verify")) {
                    d.insecure_skip_verify = m.insecure_skip_verify;
                }
                if (m.next_protos && m.next_protos.length) {
                    d.next_protos = [];
                    for (var j = 0; j < m.next_protos.length; ++j) {
                        d.next_protos[j] = m.next_protos[j];
                    }
                }
                if (m.server_names && m.server_names.length) {
                    d.server_names = [];
                    for (var j = 0; j < m.server_names.length; ++j) {
                        d.server_names[j] = m.server_names[j];
                    }
                }
                return d;
            };

            /**
             * Converts this tls_config to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.tls_config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            tls_config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return tls_config;
        })();

        protocol.direct = (function() {

            /**
             * Properties of a direct.
             * @memberof yuhaiin.protocol
             * @interface Idirect
             */

            /**
             * Constructs a new direct.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a direct.
             * @implements Idirect
             * @constructor
             * @param {yuhaiin.protocol.Idirect=} [p] Properties to set
             */
            function direct(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new direct instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.direct
             * @static
             * @param {yuhaiin.protocol.Idirect=} [properties] Properties to set
             * @returns {yuhaiin.protocol.direct} direct instance
             */
            direct.create = function create(properties) {
                return new direct(properties);
            };

            /**
             * Encodes the specified direct message. Does not implicitly {@link yuhaiin.protocol.direct.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.direct
             * @static
             * @param {yuhaiin.protocol.Idirect} m direct message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            direct.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes a direct message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.direct
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.direct} direct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            direct.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.direct();
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
             * Creates a direct message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.direct
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.direct} direct
             */
            direct.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.direct)
                    return d;
                return new $root.yuhaiin.protocol.direct();
            };

            /**
             * Creates a plain object from a direct message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.direct
             * @static
             * @param {yuhaiin.protocol.direct} m direct
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            direct.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this direct to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.direct
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            direct.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return direct;
        })();

        protocol.reject = (function() {

            /**
             * Properties of a reject.
             * @memberof yuhaiin.protocol
             * @interface Ireject
             */

            /**
             * Constructs a new reject.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a reject.
             * @implements Ireject
             * @constructor
             * @param {yuhaiin.protocol.Ireject=} [p] Properties to set
             */
            function reject(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new reject instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.reject
             * @static
             * @param {yuhaiin.protocol.Ireject=} [properties] Properties to set
             * @returns {yuhaiin.protocol.reject} reject instance
             */
            reject.create = function create(properties) {
                return new reject(properties);
            };

            /**
             * Encodes the specified reject message. Does not implicitly {@link yuhaiin.protocol.reject.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.reject
             * @static
             * @param {yuhaiin.protocol.Ireject} m reject message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            reject.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes a reject message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.reject
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.reject} reject
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            reject.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.reject();
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
             * Creates a reject message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.reject
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.reject} reject
             */
            reject.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.reject)
                    return d;
                return new $root.yuhaiin.protocol.reject();
            };

            /**
             * Creates a plain object from a reject message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.reject
             * @static
             * @param {yuhaiin.protocol.reject} m reject
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            reject.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this reject to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.reject
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            reject.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return reject;
        })();

        protocol.drop = (function() {

            /**
             * Properties of a drop.
             * @memberof yuhaiin.protocol
             * @interface Idrop
             */

            /**
             * Constructs a new drop.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a drop.
             * @implements Idrop
             * @constructor
             * @param {yuhaiin.protocol.Idrop=} [p] Properties to set
             */
            function drop(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new drop instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.drop
             * @static
             * @param {yuhaiin.protocol.Idrop=} [properties] Properties to set
             * @returns {yuhaiin.protocol.drop} drop instance
             */
            drop.create = function create(properties) {
                return new drop(properties);
            };

            /**
             * Encodes the specified drop message. Does not implicitly {@link yuhaiin.protocol.drop.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.drop
             * @static
             * @param {yuhaiin.protocol.Idrop} m drop message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            drop.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes a drop message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.drop
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.drop} drop
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            drop.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.drop();
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
             * Creates a drop message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.drop
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.drop} drop
             */
            drop.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.drop)
                    return d;
                return new $root.yuhaiin.protocol.drop();
            };

            /**
             * Creates a plain object from a drop message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.drop
             * @static
             * @param {yuhaiin.protocol.drop} m drop
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            drop.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this drop to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.drop
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            drop.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return drop;
        })();

        protocol.host = (function() {

            /**
             * Properties of a host.
             * @memberof yuhaiin.protocol
             * @interface Ihost
             * @property {string|null} [host] host host
             * @property {number|null} [port] host port
             */

            /**
             * Constructs a new host.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a host.
             * @implements Ihost
             * @constructor
             * @param {yuhaiin.protocol.Ihost=} [p] Properties to set
             */
            function host(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * host host.
             * @member {string} host
             * @memberof yuhaiin.protocol.host
             * @instance
             */
            host.prototype.host = "";

            /**
             * host port.
             * @member {number} port
             * @memberof yuhaiin.protocol.host
             * @instance
             */
            host.prototype.port = 0;

            /**
             * Creates a new host instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.host
             * @static
             * @param {yuhaiin.protocol.Ihost=} [properties] Properties to set
             * @returns {yuhaiin.protocol.host} host instance
             */
            host.create = function create(properties) {
                return new host(properties);
            };

            /**
             * Encodes the specified host message. Does not implicitly {@link yuhaiin.protocol.host.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.host
             * @static
             * @param {yuhaiin.protocol.Ihost} m host message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            host.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.port != null && Object.hasOwnProperty.call(m, "port"))
                    w.uint32(16).int32(m.port);
                return w;
            };

            /**
             * Decodes a host message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.host
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.host} host
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            host.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.host();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.port = r.int32();
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
             * Creates a host message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.host
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.host} host
             */
            host.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.host)
                    return d;
                var m = new $root.yuhaiin.protocol.host();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.port != null) {
                    m.port = d.port | 0;
                }
                return m;
            };

            /**
             * Creates a plain object from a host message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.host
             * @static
             * @param {yuhaiin.protocol.host} m host
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            host.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.port = 0;
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.port != null && m.hasOwnProperty("port")) {
                    d.port = m.port;
                }
                return d;
            };

            /**
             * Converts this host to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.host
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            host.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return host;
        })();

        protocol.wireguard_peer_config = (function() {

            /**
             * Properties of a wireguard_peer_config.
             * @memberof yuhaiin.protocol
             * @interface Iwireguard_peer_config
             * @property {string|null} [public_key] wireguard_peer_config public_key
             * @property {string|null} [pre_shared_key] wireguard_peer_config pre_shared_key
             * @property {string|null} [endpoint] wireguard_peer_config endpoint
             * @property {number|null} [keep_alive] wireguard_peer_config keep_alive
             * @property {Array.<string>|null} [allowed_ips] wireguard_peer_config allowed_ips
             */

            /**
             * Constructs a new wireguard_peer_config.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a wireguard_peer_config.
             * @implements Iwireguard_peer_config
             * @constructor
             * @param {yuhaiin.protocol.Iwireguard_peer_config=} [p] Properties to set
             */
            function wireguard_peer_config(p) {
                this.allowed_ips = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * wireguard_peer_config public_key.
             * @member {string} public_key
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @instance
             */
            wireguard_peer_config.prototype.public_key = "";

            /**
             * wireguard_peer_config pre_shared_key.
             * @member {string} pre_shared_key
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @instance
             */
            wireguard_peer_config.prototype.pre_shared_key = "";

            /**
             * wireguard_peer_config endpoint.
             * @member {string} endpoint
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @instance
             */
            wireguard_peer_config.prototype.endpoint = "";

            /**
             * wireguard_peer_config keep_alive.
             * @member {number} keep_alive
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @instance
             */
            wireguard_peer_config.prototype.keep_alive = 0;

            /**
             * wireguard_peer_config allowed_ips.
             * @member {Array.<string>} allowed_ips
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @instance
             */
            wireguard_peer_config.prototype.allowed_ips = $util.emptyArray;

            /**
             * Creates a new wireguard_peer_config instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @static
             * @param {yuhaiin.protocol.Iwireguard_peer_config=} [properties] Properties to set
             * @returns {yuhaiin.protocol.wireguard_peer_config} wireguard_peer_config instance
             */
            wireguard_peer_config.create = function create(properties) {
                return new wireguard_peer_config(properties);
            };

            /**
             * Encodes the specified wireguard_peer_config message. Does not implicitly {@link yuhaiin.protocol.wireguard_peer_config.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @static
             * @param {yuhaiin.protocol.Iwireguard_peer_config} m wireguard_peer_config message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            wireguard_peer_config.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.public_key != null && Object.hasOwnProperty.call(m, "public_key"))
                    w.uint32(10).string(m.public_key);
                if (m.pre_shared_key != null && Object.hasOwnProperty.call(m, "pre_shared_key"))
                    w.uint32(18).string(m.pre_shared_key);
                if (m.endpoint != null && Object.hasOwnProperty.call(m, "endpoint"))
                    w.uint32(26).string(m.endpoint);
                if (m.keep_alive != null && Object.hasOwnProperty.call(m, "keep_alive"))
                    w.uint32(32).int32(m.keep_alive);
                if (m.allowed_ips != null && m.allowed_ips.length) {
                    for (var i = 0; i < m.allowed_ips.length; ++i)
                        w.uint32(42).string(m.allowed_ips[i]);
                }
                return w;
            };

            /**
             * Decodes a wireguard_peer_config message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.wireguard_peer_config} wireguard_peer_config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            wireguard_peer_config.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.wireguard_peer_config();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.public_key = r.string();
                            break;
                        }
                    case 2: {
                            m.pre_shared_key = r.string();
                            break;
                        }
                    case 3: {
                            m.endpoint = r.string();
                            break;
                        }
                    case 4: {
                            m.keep_alive = r.int32();
                            break;
                        }
                    case 5: {
                            if (!(m.allowed_ips && m.allowed_ips.length))
                                m.allowed_ips = [];
                            m.allowed_ips.push(r.string());
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
             * Creates a wireguard_peer_config message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.wireguard_peer_config} wireguard_peer_config
             */
            wireguard_peer_config.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.wireguard_peer_config)
                    return d;
                var m = new $root.yuhaiin.protocol.wireguard_peer_config();
                if (d.public_key != null) {
                    m.public_key = String(d.public_key);
                }
                if (d.pre_shared_key != null) {
                    m.pre_shared_key = String(d.pre_shared_key);
                }
                if (d.endpoint != null) {
                    m.endpoint = String(d.endpoint);
                }
                if (d.keep_alive != null) {
                    m.keep_alive = d.keep_alive | 0;
                }
                if (d.allowed_ips) {
                    if (!Array.isArray(d.allowed_ips))
                        throw TypeError(".yuhaiin.protocol.wireguard_peer_config.allowed_ips: array expected");
                    m.allowed_ips = [];
                    for (var i = 0; i < d.allowed_ips.length; ++i) {
                        m.allowed_ips[i] = String(d.allowed_ips[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a wireguard_peer_config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @static
             * @param {yuhaiin.protocol.wireguard_peer_config} m wireguard_peer_config
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            wireguard_peer_config.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.allowed_ips = [];
                }
                if (o.defaults) {
                    d.public_key = "";
                    d.pre_shared_key = "";
                    d.endpoint = "";
                    d.keep_alive = 0;
                }
                if (m.public_key != null && m.hasOwnProperty("public_key")) {
                    d.public_key = m.public_key;
                }
                if (m.pre_shared_key != null && m.hasOwnProperty("pre_shared_key")) {
                    d.pre_shared_key = m.pre_shared_key;
                }
                if (m.endpoint != null && m.hasOwnProperty("endpoint")) {
                    d.endpoint = m.endpoint;
                }
                if (m.keep_alive != null && m.hasOwnProperty("keep_alive")) {
                    d.keep_alive = m.keep_alive;
                }
                if (m.allowed_ips && m.allowed_ips.length) {
                    d.allowed_ips = [];
                    for (var j = 0; j < m.allowed_ips.length; ++j) {
                        d.allowed_ips[j] = m.allowed_ips[j];
                    }
                }
                return d;
            };

            /**
             * Converts this wireguard_peer_config to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.wireguard_peer_config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            wireguard_peer_config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return wireguard_peer_config;
        })();

        protocol.wireguard = (function() {

            /**
             * Properties of a wireguard.
             * @memberof yuhaiin.protocol
             * @interface Iwireguard
             * @property {string|null} [secret_key] wireguard secret_key
             * @property {Array.<string>|null} [endpoint] wireguard endpoint
             * @property {Array.<yuhaiin.protocol.Iwireguard_peer_config>|null} [peers] wireguard peers
             * @property {number|null} [mtu] wireguard mtu
             * @property {Uint8Array|null} [reserved] wireguard reserved
             * @property {number|null} [idle_timeout] wireguard idle_timeout
             */

            /**
             * Constructs a new wireguard.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a wireguard.
             * @implements Iwireguard
             * @constructor
             * @param {yuhaiin.protocol.Iwireguard=} [p] Properties to set
             */
            function wireguard(p) {
                this.endpoint = [];
                this.peers = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * wireguard secret_key.
             * @member {string} secret_key
             * @memberof yuhaiin.protocol.wireguard
             * @instance
             */
            wireguard.prototype.secret_key = "";

            /**
             * wireguard endpoint.
             * @member {Array.<string>} endpoint
             * @memberof yuhaiin.protocol.wireguard
             * @instance
             */
            wireguard.prototype.endpoint = $util.emptyArray;

            /**
             * wireguard peers.
             * @member {Array.<yuhaiin.protocol.Iwireguard_peer_config>} peers
             * @memberof yuhaiin.protocol.wireguard
             * @instance
             */
            wireguard.prototype.peers = $util.emptyArray;

            /**
             * wireguard mtu.
             * @member {number} mtu
             * @memberof yuhaiin.protocol.wireguard
             * @instance
             */
            wireguard.prototype.mtu = 0;

            /**
             * wireguard reserved.
             * @member {Uint8Array} reserved
             * @memberof yuhaiin.protocol.wireguard
             * @instance
             */
            wireguard.prototype.reserved = $util.newBuffer([]);

            /**
             * wireguard idle_timeout.
             * @member {number} idle_timeout
             * @memberof yuhaiin.protocol.wireguard
             * @instance
             */
            wireguard.prototype.idle_timeout = 0;

            /**
             * Creates a new wireguard instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.wireguard
             * @static
             * @param {yuhaiin.protocol.Iwireguard=} [properties] Properties to set
             * @returns {yuhaiin.protocol.wireguard} wireguard instance
             */
            wireguard.create = function create(properties) {
                return new wireguard(properties);
            };

            /**
             * Encodes the specified wireguard message. Does not implicitly {@link yuhaiin.protocol.wireguard.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.wireguard
             * @static
             * @param {yuhaiin.protocol.Iwireguard} m wireguard message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            wireguard.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.secret_key != null && Object.hasOwnProperty.call(m, "secret_key"))
                    w.uint32(10).string(m.secret_key);
                if (m.endpoint != null && m.endpoint.length) {
                    for (var i = 0; i < m.endpoint.length; ++i)
                        w.uint32(18).string(m.endpoint[i]);
                }
                if (m.peers != null && m.peers.length) {
                    for (var i = 0; i < m.peers.length; ++i)
                        $root.yuhaiin.protocol.wireguard_peer_config.encode(m.peers[i], w.uint32(26).fork()).ldelim();
                }
                if (m.mtu != null && Object.hasOwnProperty.call(m, "mtu"))
                    w.uint32(32).int32(m.mtu);
                if (m.reserved != null && Object.hasOwnProperty.call(m, "reserved"))
                    w.uint32(50).bytes(m.reserved);
                if (m.idle_timeout != null && Object.hasOwnProperty.call(m, "idle_timeout"))
                    w.uint32(56).int32(m.idle_timeout);
                return w;
            };

            /**
             * Decodes a wireguard message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.wireguard
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.wireguard} wireguard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            wireguard.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.wireguard();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.secret_key = r.string();
                            break;
                        }
                    case 2: {
                            if (!(m.endpoint && m.endpoint.length))
                                m.endpoint = [];
                            m.endpoint.push(r.string());
                            break;
                        }
                    case 3: {
                            if (!(m.peers && m.peers.length))
                                m.peers = [];
                            m.peers.push($root.yuhaiin.protocol.wireguard_peer_config.decode(r, r.uint32()));
                            break;
                        }
                    case 4: {
                            m.mtu = r.int32();
                            break;
                        }
                    case 6: {
                            m.reserved = r.bytes();
                            break;
                        }
                    case 7: {
                            m.idle_timeout = r.int32();
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
             * Creates a wireguard message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.wireguard
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.wireguard} wireguard
             */
            wireguard.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.wireguard)
                    return d;
                var m = new $root.yuhaiin.protocol.wireguard();
                if (d.secret_key != null) {
                    m.secret_key = String(d.secret_key);
                }
                if (d.endpoint) {
                    if (!Array.isArray(d.endpoint))
                        throw TypeError(".yuhaiin.protocol.wireguard.endpoint: array expected");
                    m.endpoint = [];
                    for (var i = 0; i < d.endpoint.length; ++i) {
                        m.endpoint[i] = String(d.endpoint[i]);
                    }
                }
                if (d.peers) {
                    if (!Array.isArray(d.peers))
                        throw TypeError(".yuhaiin.protocol.wireguard.peers: array expected");
                    m.peers = [];
                    for (var i = 0; i < d.peers.length; ++i) {
                        if (typeof d.peers[i] !== "object")
                            throw TypeError(".yuhaiin.protocol.wireguard.peers: object expected");
                        m.peers[i] = $root.yuhaiin.protocol.wireguard_peer_config.fromObject(d.peers[i]);
                    }
                }
                if (d.mtu != null) {
                    m.mtu = d.mtu | 0;
                }
                if (d.reserved != null) {
                    if (typeof d.reserved === "string")
                        $util.base64.decode(d.reserved, m.reserved = $util.newBuffer($util.base64.length(d.reserved)), 0);
                    else if (d.reserved.length >= 0)
                        m.reserved = d.reserved;
                }
                if (d.idle_timeout != null) {
                    m.idle_timeout = d.idle_timeout | 0;
                }
                return m;
            };

            /**
             * Creates a plain object from a wireguard message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.wireguard
             * @static
             * @param {yuhaiin.protocol.wireguard} m wireguard
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            wireguard.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.endpoint = [];
                    d.peers = [];
                }
                if (o.defaults) {
                    d.secret_key = "";
                    d.mtu = 0;
                    if (o.bytes === String)
                        d.reserved = "";
                    else {
                        d.reserved = [];
                        if (o.bytes !== Array)
                            d.reserved = $util.newBuffer(d.reserved);
                    }
                    d.idle_timeout = 0;
                }
                if (m.secret_key != null && m.hasOwnProperty("secret_key")) {
                    d.secret_key = m.secret_key;
                }
                if (m.endpoint && m.endpoint.length) {
                    d.endpoint = [];
                    for (var j = 0; j < m.endpoint.length; ++j) {
                        d.endpoint[j] = m.endpoint[j];
                    }
                }
                if (m.peers && m.peers.length) {
                    d.peers = [];
                    for (var j = 0; j < m.peers.length; ++j) {
                        d.peers[j] = $root.yuhaiin.protocol.wireguard_peer_config.toObject(m.peers[j], o);
                    }
                }
                if (m.mtu != null && m.hasOwnProperty("mtu")) {
                    d.mtu = m.mtu;
                }
                if (m.reserved != null && m.hasOwnProperty("reserved")) {
                    d.reserved = o.bytes === String ? $util.base64.encode(m.reserved, 0, m.reserved.length) : o.bytes === Array ? Array.prototype.slice.call(m.reserved) : m.reserved;
                }
                if (m.idle_timeout != null && m.hasOwnProperty("idle_timeout")) {
                    d.idle_timeout = m.idle_timeout;
                }
                return d;
            };

            /**
             * Converts this wireguard to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.wireguard
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            wireguard.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return wireguard;
        })();

        protocol.mux = (function() {

            /**
             * Properties of a mux.
             * @memberof yuhaiin.protocol
             * @interface Imux
             * @property {number|null} [concurrency] mux concurrency
             */

            /**
             * Constructs a new mux.
             * @memberof yuhaiin.protocol
             * @classdesc Represents a mux.
             * @implements Imux
             * @constructor
             * @param {yuhaiin.protocol.Imux=} [p] Properties to set
             */
            function mux(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * mux concurrency.
             * @member {number} concurrency
             * @memberof yuhaiin.protocol.mux
             * @instance
             */
            mux.prototype.concurrency = 0;

            /**
             * Creates a new mux instance using the specified properties.
             * @function create
             * @memberof yuhaiin.protocol.mux
             * @static
             * @param {yuhaiin.protocol.Imux=} [properties] Properties to set
             * @returns {yuhaiin.protocol.mux} mux instance
             */
            mux.create = function create(properties) {
                return new mux(properties);
            };

            /**
             * Encodes the specified mux message. Does not implicitly {@link yuhaiin.protocol.mux.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.protocol.mux
             * @static
             * @param {yuhaiin.protocol.Imux} m mux message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            mux.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.concurrency != null && Object.hasOwnProperty.call(m, "concurrency"))
                    w.uint32(8).int32(m.concurrency);
                return w;
            };

            /**
             * Decodes a mux message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.protocol.mux
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.protocol.mux} mux
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            mux.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protocol.mux();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.concurrency = r.int32();
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
             * Creates a mux message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.protocol.mux
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.protocol.mux} mux
             */
            mux.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.protocol.mux)
                    return d;
                var m = new $root.yuhaiin.protocol.mux();
                if (d.concurrency != null) {
                    m.concurrency = d.concurrency | 0;
                }
                return m;
            };

            /**
             * Creates a plain object from a mux message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.protocol.mux
             * @static
             * @param {yuhaiin.protocol.mux} m mux
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            mux.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.concurrency = 0;
                }
                if (m.concurrency != null && m.hasOwnProperty("concurrency")) {
                    d.concurrency = m.concurrency;
                }
                return d;
            };

            /**
             * Converts this mux to JSON.
             * @function toJSON
             * @memberof yuhaiin.protocol.mux
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            mux.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return mux;
        })();

        return protocol;
    })();

    yuhaiin.subscribe = (function() {

        /**
         * Namespace subscribe.
         * @memberof yuhaiin
         * @namespace
         */
        const subscribe = {};

        /**
         * type enum.
         * @name yuhaiin.subscribe.type
         * @enum {number}
         * @property {number} reserve=0 reserve value
         * @property {number} trojan=1 trojan value
         * @property {number} vmess=2 vmess value
         * @property {number} shadowsocks=3 shadowsocks value
         * @property {number} shadowsocksr=4 shadowsocksr value
         */
        subscribe.type = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "reserve"] = 0;
            values[valuesById[1] = "trojan"] = 1;
            values[valuesById[2] = "vmess"] = 2;
            values[valuesById[3] = "shadowsocks"] = 3;
            values[valuesById[4] = "shadowsocksr"] = 4;
            return values;
        })();

        subscribe.link = (function() {

            /**
             * Properties of a link.
             * @memberof yuhaiin.subscribe
             * @interface Ilink
             * @property {string|null} [name] link name
             * @property {yuhaiin.subscribe.type|null} [type] link type
             * @property {string|null} [url] link url
             */

            /**
             * Constructs a new link.
             * @memberof yuhaiin.subscribe
             * @classdesc Represents a link.
             * @implements Ilink
             * @constructor
             * @param {yuhaiin.subscribe.Ilink=} [p] Properties to set
             */
            function link(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * link name.
             * @member {string} name
             * @memberof yuhaiin.subscribe.link
             * @instance
             */
            link.prototype.name = "";

            /**
             * link type.
             * @member {yuhaiin.subscribe.type} type
             * @memberof yuhaiin.subscribe.link
             * @instance
             */
            link.prototype.type = 0;

            /**
             * link url.
             * @member {string} url
             * @memberof yuhaiin.subscribe.link
             * @instance
             */
            link.prototype.url = "";

            /**
             * Creates a new link instance using the specified properties.
             * @function create
             * @memberof yuhaiin.subscribe.link
             * @static
             * @param {yuhaiin.subscribe.Ilink=} [properties] Properties to set
             * @returns {yuhaiin.subscribe.link} link instance
             */
            link.create = function create(properties) {
                return new link(properties);
            };

            /**
             * Encodes the specified link message. Does not implicitly {@link yuhaiin.subscribe.link.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.subscribe.link
             * @static
             * @param {yuhaiin.subscribe.Ilink} m link message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            link.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.name != null && Object.hasOwnProperty.call(m, "name"))
                    w.uint32(10).string(m.name);
                if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                    w.uint32(16).int32(m.type);
                if (m.url != null && Object.hasOwnProperty.call(m, "url"))
                    w.uint32(26).string(m.url);
                return w;
            };

            /**
             * Decodes a link message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.subscribe.link
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.subscribe.link} link
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            link.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.subscribe.link();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.name = r.string();
                            break;
                        }
                    case 2: {
                            m.type = r.int32();
                            break;
                        }
                    case 3: {
                            m.url = r.string();
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
             * Creates a link message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.subscribe.link
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.subscribe.link} link
             */
            link.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.subscribe.link)
                    return d;
                var m = new $root.yuhaiin.subscribe.link();
                if (d.name != null) {
                    m.name = String(d.name);
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
                case "trojan":
                case 1:
                    m.type = 1;
                    break;
                case "vmess":
                case 2:
                    m.type = 2;
                    break;
                case "shadowsocks":
                case 3:
                    m.type = 3;
                    break;
                case "shadowsocksr":
                case 4:
                    m.type = 4;
                    break;
                }
                if (d.url != null) {
                    m.url = String(d.url);
                }
                return m;
            };

            /**
             * Creates a plain object from a link message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.subscribe.link
             * @static
             * @param {yuhaiin.subscribe.link} m link
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            link.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.name = "";
                    d.type = o.enums === String ? "reserve" : 0;
                    d.url = "";
                }
                if (m.name != null && m.hasOwnProperty("name")) {
                    d.name = m.name;
                }
                if (m.type != null && m.hasOwnProperty("type")) {
                    d.type = o.enums === String ? $root.yuhaiin.subscribe.type[m.type] === undefined ? m.type : $root.yuhaiin.subscribe.type[m.type] : m.type;
                }
                if (m.url != null && m.hasOwnProperty("url")) {
                    d.url = m.url;
                }
                return d;
            };

            /**
             * Converts this link to JSON.
             * @function toJSON
             * @memberof yuhaiin.subscribe.link
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            link.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return link;
        })();

        return subscribe;
    })();

    yuhaiin.tag = (function() {

        /**
         * Namespace tag.
         * @memberof yuhaiin
         * @namespace
         */
        const tag = {};

        /**
         * tag_type enum.
         * @name yuhaiin.tag.tag_type
         * @enum {number}
         * @property {number} node=0 node value
         * @property {number} mirror=1 mirror value
         */
        tag.tag_type = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "node"] = 0;
            values[valuesById[1] = "mirror"] = 1;
            return values;
        })();

        tag.tags = (function() {

            /**
             * Properties of a tags.
             * @memberof yuhaiin.tag
             * @interface Itags
             * @property {string|null} [tag] tags tag
             * @property {yuhaiin.tag.tag_type|null} [type] tags type
             * @property {Array.<string>|null} [hash] tags hash
             */

            /**
             * Constructs a new tags.
             * @memberof yuhaiin.tag
             * @classdesc Represents a tags.
             * @implements Itags
             * @constructor
             * @param {yuhaiin.tag.Itags=} [p] Properties to set
             */
            function tags(p) {
                this.hash = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * tags tag.
             * @member {string} tag
             * @memberof yuhaiin.tag.tags
             * @instance
             */
            tags.prototype.tag = "";

            /**
             * tags type.
             * @member {yuhaiin.tag.tag_type} type
             * @memberof yuhaiin.tag.tags
             * @instance
             */
            tags.prototype.type = 0;

            /**
             * tags hash.
             * @member {Array.<string>} hash
             * @memberof yuhaiin.tag.tags
             * @instance
             */
            tags.prototype.hash = $util.emptyArray;

            /**
             * Creates a new tags instance using the specified properties.
             * @function create
             * @memberof yuhaiin.tag.tags
             * @static
             * @param {yuhaiin.tag.Itags=} [properties] Properties to set
             * @returns {yuhaiin.tag.tags} tags instance
             */
            tags.create = function create(properties) {
                return new tags(properties);
            };

            /**
             * Encodes the specified tags message. Does not implicitly {@link yuhaiin.tag.tags.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.tag.tags
             * @static
             * @param {yuhaiin.tag.Itags} m tags message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            tags.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.tag != null && Object.hasOwnProperty.call(m, "tag"))
                    w.uint32(10).string(m.tag);
                if (m.hash != null && m.hash.length) {
                    for (var i = 0; i < m.hash.length; ++i)
                        w.uint32(18).string(m.hash[i]);
                }
                if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                    w.uint32(24).int32(m.type);
                return w;
            };

            /**
             * Decodes a tags message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.tag.tags
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.tag.tags} tags
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            tags.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.tag.tags();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.tag = r.string();
                            break;
                        }
                    case 3: {
                            m.type = r.int32();
                            break;
                        }
                    case 2: {
                            if (!(m.hash && m.hash.length))
                                m.hash = [];
                            m.hash.push(r.string());
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
             * Creates a tags message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.tag.tags
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.tag.tags} tags
             */
            tags.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.tag.tags)
                    return d;
                var m = new $root.yuhaiin.tag.tags();
                if (d.tag != null) {
                    m.tag = String(d.tag);
                }
                switch (d.type) {
                default:
                    if (typeof d.type === "number") {
                        m.type = d.type;
                        break;
                    }
                    break;
                case "node":
                case 0:
                    m.type = 0;
                    break;
                case "mirror":
                case 1:
                    m.type = 1;
                    break;
                }
                if (d.hash) {
                    if (!Array.isArray(d.hash))
                        throw TypeError(".yuhaiin.tag.tags.hash: array expected");
                    m.hash = [];
                    for (var i = 0; i < d.hash.length; ++i) {
                        m.hash[i] = String(d.hash[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a tags message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.tag.tags
             * @static
             * @param {yuhaiin.tag.tags} m tags
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            tags.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.hash = [];
                }
                if (o.defaults) {
                    d.tag = "";
                    d.type = o.enums === String ? "node" : 0;
                }
                if (m.tag != null && m.hasOwnProperty("tag")) {
                    d.tag = m.tag;
                }
                if (m.hash && m.hash.length) {
                    d.hash = [];
                    for (var j = 0; j < m.hash.length; ++j) {
                        d.hash[j] = m.hash[j];
                    }
                }
                if (m.type != null && m.hasOwnProperty("type")) {
                    d.type = o.enums === String ? $root.yuhaiin.tag.tag_type[m.type] === undefined ? m.type : $root.yuhaiin.tag.tag_type[m.type] : m.type;
                }
                return d;
            };

            /**
             * Converts this tags to JSON.
             * @function toJSON
             * @memberof yuhaiin.tag.tags
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            tags.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return tags;
        })();

        return tag;
    })();

    yuhaiin.protos = (function() {

        /**
         * Namespace protos.
         * @memberof yuhaiin
         * @namespace
         */
        const protos = {};

        protos.node = (function() {

            /**
             * Namespace node.
             * @memberof yuhaiin.protos
             * @namespace
             */
            const node = {};

            node.service = (function() {

                /**
                 * Namespace service.
                 * @memberof yuhaiin.protos.node
                 * @namespace
                 */
                const service = {};

                service.now_resp = (function() {

                    /**
                     * Properties of a now_resp.
                     * @memberof yuhaiin.protos.node.service
                     * @interface Inow_resp
                     * @property {yuhaiin.point.Ipoint|null} [tcp] now_resp tcp
                     * @property {yuhaiin.point.Ipoint|null} [udp] now_resp udp
                     */

                    /**
                     * Constructs a new now_resp.
                     * @memberof yuhaiin.protos.node.service
                     * @classdesc Represents a now_resp.
                     * @implements Inow_resp
                     * @constructor
                     * @param {yuhaiin.protos.node.service.Inow_resp=} [p] Properties to set
                     */
                    function now_resp(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * now_resp tcp.
                     * @member {yuhaiin.point.Ipoint|null|undefined} tcp
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @instance
                     */
                    now_resp.prototype.tcp = null;

                    /**
                     * now_resp udp.
                     * @member {yuhaiin.point.Ipoint|null|undefined} udp
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @instance
                     */
                    now_resp.prototype.udp = null;

                    /**
                     * Creates a new now_resp instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @static
                     * @param {yuhaiin.protos.node.service.Inow_resp=} [properties] Properties to set
                     * @returns {yuhaiin.protos.node.service.now_resp} now_resp instance
                     */
                    now_resp.create = function create(properties) {
                        return new now_resp(properties);
                    };

                    /**
                     * Encodes the specified now_resp message. Does not implicitly {@link yuhaiin.protos.node.service.now_resp.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @static
                     * @param {yuhaiin.protos.node.service.Inow_resp} m now_resp message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    now_resp.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.tcp != null && Object.hasOwnProperty.call(m, "tcp"))
                            $root.yuhaiin.point.point.encode(m.tcp, w.uint32(10).fork()).ldelim();
                        if (m.udp != null && Object.hasOwnProperty.call(m, "udp"))
                            $root.yuhaiin.point.point.encode(m.udp, w.uint32(18).fork()).ldelim();
                        return w;
                    };

                    /**
                     * Decodes a now_resp message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.node.service.now_resp} now_resp
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    now_resp.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.node.service.now_resp();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    m.tcp = $root.yuhaiin.point.point.decode(r, r.uint32());
                                    break;
                                }
                            case 2: {
                                    m.udp = $root.yuhaiin.point.point.decode(r, r.uint32());
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
                     * Creates a now_resp message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.node.service.now_resp} now_resp
                     */
                    now_resp.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.node.service.now_resp)
                            return d;
                        var m = new $root.yuhaiin.protos.node.service.now_resp();
                        if (d.tcp != null) {
                            if (typeof d.tcp !== "object")
                                throw TypeError(".yuhaiin.protos.node.service.now_resp.tcp: object expected");
                            m.tcp = $root.yuhaiin.point.point.fromObject(d.tcp);
                        }
                        if (d.udp != null) {
                            if (typeof d.udp !== "object")
                                throw TypeError(".yuhaiin.protos.node.service.now_resp.udp: object expected");
                            m.udp = $root.yuhaiin.point.point.fromObject(d.udp);
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a now_resp message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @static
                     * @param {yuhaiin.protos.node.service.now_resp} m now_resp
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    now_resp.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            d.tcp = null;
                            d.udp = null;
                        }
                        if (m.tcp != null && m.hasOwnProperty("tcp")) {
                            d.tcp = $root.yuhaiin.point.point.toObject(m.tcp, o);
                        }
                        if (m.udp != null && m.hasOwnProperty("udp")) {
                            d.udp = $root.yuhaiin.point.point.toObject(m.udp, o);
                        }
                        return d;
                    };

                    /**
                     * Converts this now_resp to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.node.service.now_resp
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    now_resp.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return now_resp;
                })();

                service.use_req = (function() {

                    /**
                     * Properties of a use_req.
                     * @memberof yuhaiin.protos.node.service
                     * @interface Iuse_req
                     * @property {boolean|null} [tcp] use_req tcp
                     * @property {boolean|null} [udp] use_req udp
                     * @property {string|null} [hash] use_req hash
                     */

                    /**
                     * Constructs a new use_req.
                     * @memberof yuhaiin.protos.node.service
                     * @classdesc Represents a use_req.
                     * @implements Iuse_req
                     * @constructor
                     * @param {yuhaiin.protos.node.service.Iuse_req=} [p] Properties to set
                     */
                    function use_req(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * use_req tcp.
                     * @member {boolean} tcp
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @instance
                     */
                    use_req.prototype.tcp = false;

                    /**
                     * use_req udp.
                     * @member {boolean} udp
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @instance
                     */
                    use_req.prototype.udp = false;

                    /**
                     * use_req hash.
                     * @member {string} hash
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @instance
                     */
                    use_req.prototype.hash = "";

                    /**
                     * Creates a new use_req instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Iuse_req=} [properties] Properties to set
                     * @returns {yuhaiin.protos.node.service.use_req} use_req instance
                     */
                    use_req.create = function create(properties) {
                        return new use_req(properties);
                    };

                    /**
                     * Encodes the specified use_req message. Does not implicitly {@link yuhaiin.protos.node.service.use_req.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Iuse_req} m use_req message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    use_req.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.tcp != null && Object.hasOwnProperty.call(m, "tcp"))
                            w.uint32(8).bool(m.tcp);
                        if (m.udp != null && Object.hasOwnProperty.call(m, "udp"))
                            w.uint32(16).bool(m.udp);
                        if (m.hash != null && Object.hasOwnProperty.call(m, "hash"))
                            w.uint32(26).string(m.hash);
                        return w;
                    };

                    /**
                     * Decodes a use_req message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.node.service.use_req} use_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    use_req.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.node.service.use_req();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    m.tcp = r.bool();
                                    break;
                                }
                            case 2: {
                                    m.udp = r.bool();
                                    break;
                                }
                            case 3: {
                                    m.hash = r.string();
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
                     * Creates a use_req message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.node.service.use_req} use_req
                     */
                    use_req.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.node.service.use_req)
                            return d;
                        var m = new $root.yuhaiin.protos.node.service.use_req();
                        if (d.tcp != null) {
                            m.tcp = Boolean(d.tcp);
                        }
                        if (d.udp != null) {
                            m.udp = Boolean(d.udp);
                        }
                        if (d.hash != null) {
                            m.hash = String(d.hash);
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a use_req message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @static
                     * @param {yuhaiin.protos.node.service.use_req} m use_req
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    use_req.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            d.tcp = false;
                            d.udp = false;
                            d.hash = "";
                        }
                        if (m.tcp != null && m.hasOwnProperty("tcp")) {
                            d.tcp = m.tcp;
                        }
                        if (m.udp != null && m.hasOwnProperty("udp")) {
                            d.udp = m.udp;
                        }
                        if (m.hash != null && m.hasOwnProperty("hash")) {
                            d.hash = m.hash;
                        }
                        return d;
                    };

                    /**
                     * Converts this use_req to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.node.service.use_req
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    use_req.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return use_req;
                })();

                service.save_link_req = (function() {

                    /**
                     * Properties of a save_link_req.
                     * @memberof yuhaiin.protos.node.service
                     * @interface Isave_link_req
                     * @property {Array.<yuhaiin.subscribe.Ilink>|null} [links] save_link_req links
                     */

                    /**
                     * Constructs a new save_link_req.
                     * @memberof yuhaiin.protos.node.service
                     * @classdesc Represents a save_link_req.
                     * @implements Isave_link_req
                     * @constructor
                     * @param {yuhaiin.protos.node.service.Isave_link_req=} [p] Properties to set
                     */
                    function save_link_req(p) {
                        this.links = [];
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * save_link_req links.
                     * @member {Array.<yuhaiin.subscribe.Ilink>} links
                     * @memberof yuhaiin.protos.node.service.save_link_req
                     * @instance
                     */
                    save_link_req.prototype.links = $util.emptyArray;

                    /**
                     * Creates a new save_link_req instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.node.service.save_link_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Isave_link_req=} [properties] Properties to set
                     * @returns {yuhaiin.protos.node.service.save_link_req} save_link_req instance
                     */
                    save_link_req.create = function create(properties) {
                        return new save_link_req(properties);
                    };

                    /**
                     * Encodes the specified save_link_req message. Does not implicitly {@link yuhaiin.protos.node.service.save_link_req.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.node.service.save_link_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Isave_link_req} m save_link_req message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    save_link_req.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.links != null && m.links.length) {
                            for (var i = 0; i < m.links.length; ++i)
                                $root.yuhaiin.subscribe.link.encode(m.links[i], w.uint32(10).fork()).ldelim();
                        }
                        return w;
                    };

                    /**
                     * Decodes a save_link_req message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.node.service.save_link_req
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.node.service.save_link_req} save_link_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    save_link_req.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.node.service.save_link_req();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    if (!(m.links && m.links.length))
                                        m.links = [];
                                    m.links.push($root.yuhaiin.subscribe.link.decode(r, r.uint32()));
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
                     * Creates a save_link_req message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.node.service.save_link_req
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.node.service.save_link_req} save_link_req
                     */
                    save_link_req.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.node.service.save_link_req)
                            return d;
                        var m = new $root.yuhaiin.protos.node.service.save_link_req();
                        if (d.links) {
                            if (!Array.isArray(d.links))
                                throw TypeError(".yuhaiin.protos.node.service.save_link_req.links: array expected");
                            m.links = [];
                            for (var i = 0; i < d.links.length; ++i) {
                                if (typeof d.links[i] !== "object")
                                    throw TypeError(".yuhaiin.protos.node.service.save_link_req.links: object expected");
                                m.links[i] = $root.yuhaiin.subscribe.link.fromObject(d.links[i]);
                            }
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a save_link_req message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.node.service.save_link_req
                     * @static
                     * @param {yuhaiin.protos.node.service.save_link_req} m save_link_req
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    save_link_req.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.arrays || o.defaults) {
                            d.links = [];
                        }
                        if (m.links && m.links.length) {
                            d.links = [];
                            for (var j = 0; j < m.links.length; ++j) {
                                d.links[j] = $root.yuhaiin.subscribe.link.toObject(m.links[j], o);
                            }
                        }
                        return d;
                    };

                    /**
                     * Converts this save_link_req to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.node.service.save_link_req
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    save_link_req.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return save_link_req;
                })();

                service.link_req = (function() {

                    /**
                     * Properties of a link_req.
                     * @memberof yuhaiin.protos.node.service
                     * @interface Ilink_req
                     * @property {Array.<string>|null} [names] link_req names
                     */

                    /**
                     * Constructs a new link_req.
                     * @memberof yuhaiin.protos.node.service
                     * @classdesc Represents a link_req.
                     * @implements Ilink_req
                     * @constructor
                     * @param {yuhaiin.protos.node.service.Ilink_req=} [p] Properties to set
                     */
                    function link_req(p) {
                        this.names = [];
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * link_req names.
                     * @member {Array.<string>} names
                     * @memberof yuhaiin.protos.node.service.link_req
                     * @instance
                     */
                    link_req.prototype.names = $util.emptyArray;

                    /**
                     * Creates a new link_req instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.node.service.link_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Ilink_req=} [properties] Properties to set
                     * @returns {yuhaiin.protos.node.service.link_req} link_req instance
                     */
                    link_req.create = function create(properties) {
                        return new link_req(properties);
                    };

                    /**
                     * Encodes the specified link_req message. Does not implicitly {@link yuhaiin.protos.node.service.link_req.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.node.service.link_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Ilink_req} m link_req message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    link_req.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.names != null && m.names.length) {
                            for (var i = 0; i < m.names.length; ++i)
                                w.uint32(10).string(m.names[i]);
                        }
                        return w;
                    };

                    /**
                     * Decodes a link_req message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.node.service.link_req
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.node.service.link_req} link_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    link_req.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.node.service.link_req();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    if (!(m.names && m.names.length))
                                        m.names = [];
                                    m.names.push(r.string());
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
                     * Creates a link_req message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.node.service.link_req
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.node.service.link_req} link_req
                     */
                    link_req.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.node.service.link_req)
                            return d;
                        var m = new $root.yuhaiin.protos.node.service.link_req();
                        if (d.names) {
                            if (!Array.isArray(d.names))
                                throw TypeError(".yuhaiin.protos.node.service.link_req.names: array expected");
                            m.names = [];
                            for (var i = 0; i < d.names.length; ++i) {
                                m.names[i] = String(d.names[i]);
                            }
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a link_req message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.node.service.link_req
                     * @static
                     * @param {yuhaiin.protos.node.service.link_req} m link_req
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    link_req.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.arrays || o.defaults) {
                            d.names = [];
                        }
                        if (m.names && m.names.length) {
                            d.names = [];
                            for (var j = 0; j < m.names.length; ++j) {
                                d.names[j] = m.names[j];
                            }
                        }
                        return d;
                    };

                    /**
                     * Converts this link_req to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.node.service.link_req
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    link_req.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return link_req;
                })();

                service.get_links_resp = (function() {

                    /**
                     * Properties of a get_links_resp.
                     * @memberof yuhaiin.protos.node.service
                     * @interface Iget_links_resp
                     * @property {Object.<string,yuhaiin.subscribe.Ilink>|null} [links] get_links_resp links
                     */

                    /**
                     * Constructs a new get_links_resp.
                     * @memberof yuhaiin.protos.node.service
                     * @classdesc Represents a get_links_resp.
                     * @implements Iget_links_resp
                     * @constructor
                     * @param {yuhaiin.protos.node.service.Iget_links_resp=} [p] Properties to set
                     */
                    function get_links_resp(p) {
                        this.links = {};
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * get_links_resp links.
                     * @member {Object.<string,yuhaiin.subscribe.Ilink>} links
                     * @memberof yuhaiin.protos.node.service.get_links_resp
                     * @instance
                     */
                    get_links_resp.prototype.links = $util.emptyObject;

                    /**
                     * Creates a new get_links_resp instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.node.service.get_links_resp
                     * @static
                     * @param {yuhaiin.protos.node.service.Iget_links_resp=} [properties] Properties to set
                     * @returns {yuhaiin.protos.node.service.get_links_resp} get_links_resp instance
                     */
                    get_links_resp.create = function create(properties) {
                        return new get_links_resp(properties);
                    };

                    /**
                     * Encodes the specified get_links_resp message. Does not implicitly {@link yuhaiin.protos.node.service.get_links_resp.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.node.service.get_links_resp
                     * @static
                     * @param {yuhaiin.protos.node.service.Iget_links_resp} m get_links_resp message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    get_links_resp.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.links != null && Object.hasOwnProperty.call(m, "links")) {
                            for (var ks = Object.keys(m.links), i = 0; i < ks.length; ++i) {
                                w.uint32(10).fork().uint32(10).string(ks[i]);
                                $root.yuhaiin.subscribe.link.encode(m.links[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                            }
                        }
                        return w;
                    };

                    /**
                     * Decodes a get_links_resp message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.node.service.get_links_resp
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.node.service.get_links_resp} get_links_resp
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    get_links_resp.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.node.service.get_links_resp(), k, value;
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    if (m.links === $util.emptyObject)
                                        m.links = {};
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
                                            value = $root.yuhaiin.subscribe.link.decode(r, r.uint32());
                                            break;
                                        default:
                                            r.skipType(tag2 & 7);
                                            break;
                                        }
                                    }
                                    m.links[k] = value;
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
                     * Creates a get_links_resp message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.node.service.get_links_resp
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.node.service.get_links_resp} get_links_resp
                     */
                    get_links_resp.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.node.service.get_links_resp)
                            return d;
                        var m = new $root.yuhaiin.protos.node.service.get_links_resp();
                        if (d.links) {
                            if (typeof d.links !== "object")
                                throw TypeError(".yuhaiin.protos.node.service.get_links_resp.links: object expected");
                            m.links = {};
                            for (var ks = Object.keys(d.links), i = 0; i < ks.length; ++i) {
                                if (typeof d.links[ks[i]] !== "object")
                                    throw TypeError(".yuhaiin.protos.node.service.get_links_resp.links: object expected");
                                m.links[ks[i]] = $root.yuhaiin.subscribe.link.fromObject(d.links[ks[i]]);
                            }
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a get_links_resp message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.node.service.get_links_resp
                     * @static
                     * @param {yuhaiin.protos.node.service.get_links_resp} m get_links_resp
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    get_links_resp.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.objects || o.defaults) {
                            d.links = {};
                        }
                        var ks2;
                        if (m.links && (ks2 = Object.keys(m.links)).length) {
                            d.links = {};
                            for (var j = 0; j < ks2.length; ++j) {
                                d.links[ks2[j]] = $root.yuhaiin.subscribe.link.toObject(m.links[ks2[j]], o);
                            }
                        }
                        return d;
                    };

                    /**
                     * Converts this get_links_resp to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.node.service.get_links_resp
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    get_links_resp.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return get_links_resp;
                })();

                service.save_tag_req = (function() {

                    /**
                     * Properties of a save_tag_req.
                     * @memberof yuhaiin.protos.node.service
                     * @interface Isave_tag_req
                     * @property {string|null} [tag] save_tag_req tag
                     * @property {yuhaiin.tag.tag_type|null} [type] save_tag_req type
                     * @property {string|null} [hash] save_tag_req hash
                     */

                    /**
                     * Constructs a new save_tag_req.
                     * @memberof yuhaiin.protos.node.service
                     * @classdesc Represents a save_tag_req.
                     * @implements Isave_tag_req
                     * @constructor
                     * @param {yuhaiin.protos.node.service.Isave_tag_req=} [p] Properties to set
                     */
                    function save_tag_req(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * save_tag_req tag.
                     * @member {string} tag
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @instance
                     */
                    save_tag_req.prototype.tag = "";

                    /**
                     * save_tag_req type.
                     * @member {yuhaiin.tag.tag_type} type
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @instance
                     */
                    save_tag_req.prototype.type = 0;

                    /**
                     * save_tag_req hash.
                     * @member {string} hash
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @instance
                     */
                    save_tag_req.prototype.hash = "";

                    /**
                     * Creates a new save_tag_req instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Isave_tag_req=} [properties] Properties to set
                     * @returns {yuhaiin.protos.node.service.save_tag_req} save_tag_req instance
                     */
                    save_tag_req.create = function create(properties) {
                        return new save_tag_req(properties);
                    };

                    /**
                     * Encodes the specified save_tag_req message. Does not implicitly {@link yuhaiin.protos.node.service.save_tag_req.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @static
                     * @param {yuhaiin.protos.node.service.Isave_tag_req} m save_tag_req message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    save_tag_req.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.tag != null && Object.hasOwnProperty.call(m, "tag"))
                            w.uint32(10).string(m.tag);
                        if (m.hash != null && Object.hasOwnProperty.call(m, "hash"))
                            w.uint32(18).string(m.hash);
                        if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                            w.uint32(24).int32(m.type);
                        return w;
                    };

                    /**
                     * Decodes a save_tag_req message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.node.service.save_tag_req} save_tag_req
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    save_tag_req.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.node.service.save_tag_req();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    m.tag = r.string();
                                    break;
                                }
                            case 3: {
                                    m.type = r.int32();
                                    break;
                                }
                            case 2: {
                                    m.hash = r.string();
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
                     * Creates a save_tag_req message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.node.service.save_tag_req} save_tag_req
                     */
                    save_tag_req.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.node.service.save_tag_req)
                            return d;
                        var m = new $root.yuhaiin.protos.node.service.save_tag_req();
                        if (d.tag != null) {
                            m.tag = String(d.tag);
                        }
                        switch (d.type) {
                        default:
                            if (typeof d.type === "number") {
                                m.type = d.type;
                                break;
                            }
                            break;
                        case "node":
                        case 0:
                            m.type = 0;
                            break;
                        case "mirror":
                        case 1:
                            m.type = 1;
                            break;
                        }
                        if (d.hash != null) {
                            m.hash = String(d.hash);
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a save_tag_req message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @static
                     * @param {yuhaiin.protos.node.service.save_tag_req} m save_tag_req
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    save_tag_req.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            d.tag = "";
                            d.hash = "";
                            d.type = o.enums === String ? "node" : 0;
                        }
                        if (m.tag != null && m.hasOwnProperty("tag")) {
                            d.tag = m.tag;
                        }
                        if (m.hash != null && m.hasOwnProperty("hash")) {
                            d.hash = m.hash;
                        }
                        if (m.type != null && m.hasOwnProperty("type")) {
                            d.type = o.enums === String ? $root.yuhaiin.tag.tag_type[m.type] === undefined ? m.type : $root.yuhaiin.tag.tag_type[m.type] : m.type;
                        }
                        return d;
                    };

                    /**
                     * Converts this save_tag_req to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.node.service.save_tag_req
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    save_tag_req.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return save_tag_req;
                })();

                return service;
            })();

            return node;
        })();

        protos.statistic = (function() {

            /**
             * Namespace statistic.
             * @memberof yuhaiin.protos
             * @namespace
             */
            const statistic = {};

            statistic.service = (function() {

                /**
                 * Namespace service.
                 * @memberof yuhaiin.protos.statistic
                 * @namespace
                 */
                const service = {};

                service.total_flow = (function() {

                    /**
                     * Properties of a total_flow.
                     * @memberof yuhaiin.protos.statistic.service
                     * @interface Itotal_flow
                     * @property {number|Long|null} [download] total_flow download
                     * @property {number|Long|null} [upload] total_flow upload
                     */

                    /**
                     * Constructs a new total_flow.
                     * @memberof yuhaiin.protos.statistic.service
                     * @classdesc Represents a total_flow.
                     * @implements Itotal_flow
                     * @constructor
                     * @param {yuhaiin.protos.statistic.service.Itotal_flow=} [p] Properties to set
                     */
                    function total_flow(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * total_flow download.
                     * @member {number|Long} download
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @instance
                     */
                    total_flow.prototype.download = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                    /**
                     * total_flow upload.
                     * @member {number|Long} upload
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @instance
                     */
                    total_flow.prototype.upload = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                    /**
                     * Creates a new total_flow instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Itotal_flow=} [properties] Properties to set
                     * @returns {yuhaiin.protos.statistic.service.total_flow} total_flow instance
                     */
                    total_flow.create = function create(properties) {
                        return new total_flow(properties);
                    };

                    /**
                     * Encodes the specified total_flow message. Does not implicitly {@link yuhaiin.protos.statistic.service.total_flow.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Itotal_flow} m total_flow message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    total_flow.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.download != null && Object.hasOwnProperty.call(m, "download"))
                            w.uint32(8).uint64(m.download);
                        if (m.upload != null && Object.hasOwnProperty.call(m, "upload"))
                            w.uint32(16).uint64(m.upload);
                        return w;
                    };

                    /**
                     * Decodes a total_flow message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.statistic.service.total_flow} total_flow
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    total_flow.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.statistic.service.total_flow();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    m.download = r.uint64();
                                    break;
                                }
                            case 2: {
                                    m.upload = r.uint64();
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
                     * Creates a total_flow message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.statistic.service.total_flow} total_flow
                     */
                    total_flow.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.statistic.service.total_flow)
                            return d;
                        var m = new $root.yuhaiin.protos.statistic.service.total_flow();
                        if (d.download != null) {
                            if ($util.Long)
                                (m.download = $util.Long.fromValue(d.download)).unsigned = true;
                            else if (typeof d.download === "string")
                                m.download = parseInt(d.download, 10);
                            else if (typeof d.download === "number")
                                m.download = d.download;
                            else if (typeof d.download === "object")
                                m.download = new $util.LongBits(d.download.low >>> 0, d.download.high >>> 0).toNumber(true);
                        }
                        if (d.upload != null) {
                            if ($util.Long)
                                (m.upload = $util.Long.fromValue(d.upload)).unsigned = true;
                            else if (typeof d.upload === "string")
                                m.upload = parseInt(d.upload, 10);
                            else if (typeof d.upload === "number")
                                m.upload = d.upload;
                            else if (typeof d.upload === "object")
                                m.upload = new $util.LongBits(d.upload.low >>> 0, d.upload.high >>> 0).toNumber(true);
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a total_flow message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @static
                     * @param {yuhaiin.protos.statistic.service.total_flow} m total_flow
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    total_flow.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            if ($util.Long) {
                                var n = new $util.Long(0, 0, true);
                                d.download = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                            } else
                                d.download = o.longs === String ? "0" : 0;
                            if ($util.Long) {
                                var n = new $util.Long(0, 0, true);
                                d.upload = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                            } else
                                d.upload = o.longs === String ? "0" : 0;
                        }
                        if (m.download != null && m.hasOwnProperty("download")) {
                            if (typeof m.download === "number")
                                d.download = o.longs === String ? String(m.download) : m.download;
                            else
                                d.download = o.longs === String ? $util.Long.prototype.toString.call(m.download) : o.longs === Number ? new $util.LongBits(m.download.low >>> 0, m.download.high >>> 0).toNumber(true) : m.download;
                        }
                        if (m.upload != null && m.hasOwnProperty("upload")) {
                            if (typeof m.upload === "number")
                                d.upload = o.longs === String ? String(m.upload) : m.upload;
                            else
                                d.upload = o.longs === String ? $util.Long.prototype.toString.call(m.upload) : o.longs === Number ? new $util.LongBits(m.upload.low >>> 0, m.upload.high >>> 0).toNumber(true) : m.upload;
                        }
                        return d;
                    };

                    /**
                     * Converts this total_flow to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.statistic.service.total_flow
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    total_flow.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return total_flow;
                })();

                service.notify_data = (function() {

                    /**
                     * Properties of a notify_data.
                     * @memberof yuhaiin.protos.statistic.service
                     * @interface Inotify_data
                     * @property {yuhaiin.protos.statistic.service.Itotal_flow|null} [total_flow] notify_data total_flow
                     * @property {yuhaiin.protos.statistic.service.Inotify_new_connections|null} [notify_new_connections] notify_data notify_new_connections
                     * @property {yuhaiin.protos.statistic.service.Inotify_remove_connections|null} [notify_remove_connections] notify_data notify_remove_connections
                     */

                    /**
                     * Constructs a new notify_data.
                     * @memberof yuhaiin.protos.statistic.service
                     * @classdesc Represents a notify_data.
                     * @implements Inotify_data
                     * @constructor
                     * @param {yuhaiin.protos.statistic.service.Inotify_data=} [p] Properties to set
                     */
                    function notify_data(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * notify_data total_flow.
                     * @member {yuhaiin.protos.statistic.service.Itotal_flow|null|undefined} total_flow
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @instance
                     */
                    notify_data.prototype.total_flow = null;

                    /**
                     * notify_data notify_new_connections.
                     * @member {yuhaiin.protos.statistic.service.Inotify_new_connections|null|undefined} notify_new_connections
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @instance
                     */
                    notify_data.prototype.notify_new_connections = null;

                    /**
                     * notify_data notify_remove_connections.
                     * @member {yuhaiin.protos.statistic.service.Inotify_remove_connections|null|undefined} notify_remove_connections
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @instance
                     */
                    notify_data.prototype.notify_remove_connections = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * notify_data data.
                     * @member {"total_flow"|"notify_new_connections"|"notify_remove_connections"|undefined} data
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @instance
                     */
                    Object.defineProperty(notify_data.prototype, "data", {
                        get: $util.oneOfGetter($oneOfFields = ["total_flow", "notify_new_connections", "notify_remove_connections"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new notify_data instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Inotify_data=} [properties] Properties to set
                     * @returns {yuhaiin.protos.statistic.service.notify_data} notify_data instance
                     */
                    notify_data.create = function create(properties) {
                        return new notify_data(properties);
                    };

                    /**
                     * Encodes the specified notify_data message. Does not implicitly {@link yuhaiin.protos.statistic.service.notify_data.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Inotify_data} m notify_data message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    notify_data.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.notify_new_connections != null && Object.hasOwnProperty.call(m, "notify_new_connections"))
                            $root.yuhaiin.protos.statistic.service.notify_new_connections.encode(m.notify_new_connections, w.uint32(10).fork()).ldelim();
                        if (m.notify_remove_connections != null && Object.hasOwnProperty.call(m, "notify_remove_connections"))
                            $root.yuhaiin.protos.statistic.service.notify_remove_connections.encode(m.notify_remove_connections, w.uint32(18).fork()).ldelim();
                        if (m.total_flow != null && Object.hasOwnProperty.call(m, "total_flow"))
                            $root.yuhaiin.protos.statistic.service.total_flow.encode(m.total_flow, w.uint32(26).fork()).ldelim();
                        return w;
                    };

                    /**
                     * Decodes a notify_data message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.statistic.service.notify_data} notify_data
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    notify_data.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.statistic.service.notify_data();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 3: {
                                    m.total_flow = $root.yuhaiin.protos.statistic.service.total_flow.decode(r, r.uint32());
                                    break;
                                }
                            case 1: {
                                    m.notify_new_connections = $root.yuhaiin.protos.statistic.service.notify_new_connections.decode(r, r.uint32());
                                    break;
                                }
                            case 2: {
                                    m.notify_remove_connections = $root.yuhaiin.protos.statistic.service.notify_remove_connections.decode(r, r.uint32());
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
                     * Creates a notify_data message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.statistic.service.notify_data} notify_data
                     */
                    notify_data.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.statistic.service.notify_data)
                            return d;
                        var m = new $root.yuhaiin.protos.statistic.service.notify_data();
                        if (d.total_flow != null) {
                            if (typeof d.total_flow !== "object")
                                throw TypeError(".yuhaiin.protos.statistic.service.notify_data.total_flow: object expected");
                            m.total_flow = $root.yuhaiin.protos.statistic.service.total_flow.fromObject(d.total_flow);
                        }
                        if (d.notify_new_connections != null) {
                            if (typeof d.notify_new_connections !== "object")
                                throw TypeError(".yuhaiin.protos.statistic.service.notify_data.notify_new_connections: object expected");
                            m.notify_new_connections = $root.yuhaiin.protos.statistic.service.notify_new_connections.fromObject(d.notify_new_connections);
                        }
                        if (d.notify_remove_connections != null) {
                            if (typeof d.notify_remove_connections !== "object")
                                throw TypeError(".yuhaiin.protos.statistic.service.notify_data.notify_remove_connections: object expected");
                            m.notify_remove_connections = $root.yuhaiin.protos.statistic.service.notify_remove_connections.fromObject(d.notify_remove_connections);
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a notify_data message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @static
                     * @param {yuhaiin.protos.statistic.service.notify_data} m notify_data
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    notify_data.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (m.notify_new_connections != null && m.hasOwnProperty("notify_new_connections")) {
                            d.notify_new_connections = $root.yuhaiin.protos.statistic.service.notify_new_connections.toObject(m.notify_new_connections, o);
                            if (o.oneofs)
                                d.data = "notify_new_connections";
                        }
                        if (m.notify_remove_connections != null && m.hasOwnProperty("notify_remove_connections")) {
                            d.notify_remove_connections = $root.yuhaiin.protos.statistic.service.notify_remove_connections.toObject(m.notify_remove_connections, o);
                            if (o.oneofs)
                                d.data = "notify_remove_connections";
                        }
                        if (m.total_flow != null && m.hasOwnProperty("total_flow")) {
                            d.total_flow = $root.yuhaiin.protos.statistic.service.total_flow.toObject(m.total_flow, o);
                            if (o.oneofs)
                                d.data = "total_flow";
                        }
                        return d;
                    };

                    /**
                     * Converts this notify_data to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.statistic.service.notify_data
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    notify_data.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return notify_data;
                })();

                service.notify_new_connections = (function() {

                    /**
                     * Properties of a notify_new_connections.
                     * @memberof yuhaiin.protos.statistic.service
                     * @interface Inotify_new_connections
                     * @property {Array.<yuhaiin.statistic.Iconnection>|null} [connections] notify_new_connections connections
                     */

                    /**
                     * Constructs a new notify_new_connections.
                     * @memberof yuhaiin.protos.statistic.service
                     * @classdesc Represents a notify_new_connections.
                     * @implements Inotify_new_connections
                     * @constructor
                     * @param {yuhaiin.protos.statistic.service.Inotify_new_connections=} [p] Properties to set
                     */
                    function notify_new_connections(p) {
                        this.connections = [];
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * notify_new_connections connections.
                     * @member {Array.<yuhaiin.statistic.Iconnection>} connections
                     * @memberof yuhaiin.protos.statistic.service.notify_new_connections
                     * @instance
                     */
                    notify_new_connections.prototype.connections = $util.emptyArray;

                    /**
                     * Creates a new notify_new_connections instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.statistic.service.notify_new_connections
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Inotify_new_connections=} [properties] Properties to set
                     * @returns {yuhaiin.protos.statistic.service.notify_new_connections} notify_new_connections instance
                     */
                    notify_new_connections.create = function create(properties) {
                        return new notify_new_connections(properties);
                    };

                    /**
                     * Encodes the specified notify_new_connections message. Does not implicitly {@link yuhaiin.protos.statistic.service.notify_new_connections.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.statistic.service.notify_new_connections
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Inotify_new_connections} m notify_new_connections message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    notify_new_connections.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.connections != null && m.connections.length) {
                            for (var i = 0; i < m.connections.length; ++i)
                                $root.yuhaiin.statistic.connection.encode(m.connections[i], w.uint32(10).fork()).ldelim();
                        }
                        return w;
                    };

                    /**
                     * Decodes a notify_new_connections message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.statistic.service.notify_new_connections
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.statistic.service.notify_new_connections} notify_new_connections
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    notify_new_connections.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.statistic.service.notify_new_connections();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    if (!(m.connections && m.connections.length))
                                        m.connections = [];
                                    m.connections.push($root.yuhaiin.statistic.connection.decode(r, r.uint32()));
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
                     * Creates a notify_new_connections message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.statistic.service.notify_new_connections
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.statistic.service.notify_new_connections} notify_new_connections
                     */
                    notify_new_connections.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.statistic.service.notify_new_connections)
                            return d;
                        var m = new $root.yuhaiin.protos.statistic.service.notify_new_connections();
                        if (d.connections) {
                            if (!Array.isArray(d.connections))
                                throw TypeError(".yuhaiin.protos.statistic.service.notify_new_connections.connections: array expected");
                            m.connections = [];
                            for (var i = 0; i < d.connections.length; ++i) {
                                if (typeof d.connections[i] !== "object")
                                    throw TypeError(".yuhaiin.protos.statistic.service.notify_new_connections.connections: object expected");
                                m.connections[i] = $root.yuhaiin.statistic.connection.fromObject(d.connections[i]);
                            }
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a notify_new_connections message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.statistic.service.notify_new_connections
                     * @static
                     * @param {yuhaiin.protos.statistic.service.notify_new_connections} m notify_new_connections
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    notify_new_connections.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.arrays || o.defaults) {
                            d.connections = [];
                        }
                        if (m.connections && m.connections.length) {
                            d.connections = [];
                            for (var j = 0; j < m.connections.length; ++j) {
                                d.connections[j] = $root.yuhaiin.statistic.connection.toObject(m.connections[j], o);
                            }
                        }
                        return d;
                    };

                    /**
                     * Converts this notify_new_connections to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.statistic.service.notify_new_connections
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    notify_new_connections.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return notify_new_connections;
                })();

                service.notify_remove_connections = (function() {

                    /**
                     * Properties of a notify_remove_connections.
                     * @memberof yuhaiin.protos.statistic.service
                     * @interface Inotify_remove_connections
                     * @property {Array.<number|Long>|null} [ids] notify_remove_connections ids
                     */

                    /**
                     * Constructs a new notify_remove_connections.
                     * @memberof yuhaiin.protos.statistic.service
                     * @classdesc Represents a notify_remove_connections.
                     * @implements Inotify_remove_connections
                     * @constructor
                     * @param {yuhaiin.protos.statistic.service.Inotify_remove_connections=} [p] Properties to set
                     */
                    function notify_remove_connections(p) {
                        this.ids = [];
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }

                    /**
                     * notify_remove_connections ids.
                     * @member {Array.<number|Long>} ids
                     * @memberof yuhaiin.protos.statistic.service.notify_remove_connections
                     * @instance
                     */
                    notify_remove_connections.prototype.ids = $util.emptyArray;

                    /**
                     * Creates a new notify_remove_connections instance using the specified properties.
                     * @function create
                     * @memberof yuhaiin.protos.statistic.service.notify_remove_connections
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Inotify_remove_connections=} [properties] Properties to set
                     * @returns {yuhaiin.protos.statistic.service.notify_remove_connections} notify_remove_connections instance
                     */
                    notify_remove_connections.create = function create(properties) {
                        return new notify_remove_connections(properties);
                    };

                    /**
                     * Encodes the specified notify_remove_connections message. Does not implicitly {@link yuhaiin.protos.statistic.service.notify_remove_connections.verify|verify} messages.
                     * @function encode
                     * @memberof yuhaiin.protos.statistic.service.notify_remove_connections
                     * @static
                     * @param {yuhaiin.protos.statistic.service.Inotify_remove_connections} m notify_remove_connections message or plain object to encode
                     * @param {$protobuf.Writer} [w] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    notify_remove_connections.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.ids != null && m.ids.length) {
                            w.uint32(10).fork();
                            for (var i = 0; i < m.ids.length; ++i)
                                w.uint64(m.ids[i]);
                            w.ldelim();
                        }
                        return w;
                    };

                    /**
                     * Decodes a notify_remove_connections message from the specified reader or buffer.
                     * @function decode
                     * @memberof yuhaiin.protos.statistic.service.notify_remove_connections
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
                     * @param {number} [l] Message length if known beforehand
                     * @returns {yuhaiin.protos.statistic.service.notify_remove_connections} notify_remove_connections
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    notify_remove_connections.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.protos.statistic.service.notify_remove_connections();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                            case 1: {
                                    if (!(m.ids && m.ids.length))
                                        m.ids = [];
                                    if ((t & 7) === 2) {
                                        var c2 = r.uint32() + r.pos;
                                        while (r.pos < c2)
                                            m.ids.push(r.uint64());
                                    } else
                                        m.ids.push(r.uint64());
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
                     * Creates a notify_remove_connections message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof yuhaiin.protos.statistic.service.notify_remove_connections
                     * @static
                     * @param {Object.<string,*>} d Plain object
                     * @returns {yuhaiin.protos.statistic.service.notify_remove_connections} notify_remove_connections
                     */
                    notify_remove_connections.fromObject = function fromObject(d) {
                        if (d instanceof $root.yuhaiin.protos.statistic.service.notify_remove_connections)
                            return d;
                        var m = new $root.yuhaiin.protos.statistic.service.notify_remove_connections();
                        if (d.ids) {
                            if (!Array.isArray(d.ids))
                                throw TypeError(".yuhaiin.protos.statistic.service.notify_remove_connections.ids: array expected");
                            m.ids = [];
                            for (var i = 0; i < d.ids.length; ++i) {
                                if ($util.Long)
                                    (m.ids[i] = $util.Long.fromValue(d.ids[i])).unsigned = true;
                                else if (typeof d.ids[i] === "string")
                                    m.ids[i] = parseInt(d.ids[i], 10);
                                else if (typeof d.ids[i] === "number")
                                    m.ids[i] = d.ids[i];
                                else if (typeof d.ids[i] === "object")
                                    m.ids[i] = new $util.LongBits(d.ids[i].low >>> 0, d.ids[i].high >>> 0).toNumber(true);
                            }
                        }
                        return m;
                    };

                    /**
                     * Creates a plain object from a notify_remove_connections message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof yuhaiin.protos.statistic.service.notify_remove_connections
                     * @static
                     * @param {yuhaiin.protos.statistic.service.notify_remove_connections} m notify_remove_connections
                     * @param {$protobuf.IConversionOptions} [o] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    notify_remove_connections.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.arrays || o.defaults) {
                            d.ids = [];
                        }
                        if (m.ids && m.ids.length) {
                            d.ids = [];
                            for (var j = 0; j < m.ids.length; ++j) {
                                if (typeof m.ids[j] === "number")
                                    d.ids[j] = o.longs === String ? String(m.ids[j]) : m.ids[j];
                                else
                                    d.ids[j] = o.longs === String ? $util.Long.prototype.toString.call(m.ids[j]) : o.longs === Number ? new $util.LongBits(m.ids[j].low >>> 0, m.ids[j].high >>> 0).toNumber(true) : m.ids[j];
                            }
                        }
                        return d;
                    };

                    /**
                     * Converts this notify_remove_connections to JSON.
                     * @function toJSON
                     * @memberof yuhaiin.protos.statistic.service.notify_remove_connections
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    notify_remove_connections.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return notify_remove_connections;
                })();

                return service;
            })();

            return statistic;
        })();

        return protos;
    })();

    yuhaiin.latency = (function() {

        /**
         * Namespace latency.
         * @memberof yuhaiin
         * @namespace
         */
        const latency = {};

        latency.http = (function() {

            /**
             * Properties of a http.
             * @memberof yuhaiin.latency
             * @interface Ihttp
             * @property {string|null} [url] http url
             */

            /**
             * Constructs a new http.
             * @memberof yuhaiin.latency
             * @classdesc Represents a http.
             * @implements Ihttp
             * @constructor
             * @param {yuhaiin.latency.Ihttp=} [p] Properties to set
             */
            function http(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * http url.
             * @member {string} url
             * @memberof yuhaiin.latency.http
             * @instance
             */
            http.prototype.url = "";

            /**
             * Creates a new http instance using the specified properties.
             * @function create
             * @memberof yuhaiin.latency.http
             * @static
             * @param {yuhaiin.latency.Ihttp=} [properties] Properties to set
             * @returns {yuhaiin.latency.http} http instance
             */
            http.create = function create(properties) {
                return new http(properties);
            };

            /**
             * Encodes the specified http message. Does not implicitly {@link yuhaiin.latency.http.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.latency.http
             * @static
             * @param {yuhaiin.latency.Ihttp} m http message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            http.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.url != null && Object.hasOwnProperty.call(m, "url"))
                    w.uint32(10).string(m.url);
                return w;
            };

            /**
             * Decodes a http message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.latency.http
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.latency.http} http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            http.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.latency.http();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.url = r.string();
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
             * @memberof yuhaiin.latency.http
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.latency.http} http
             */
            http.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.latency.http)
                    return d;
                var m = new $root.yuhaiin.latency.http();
                if (d.url != null) {
                    m.url = String(d.url);
                }
                return m;
            };

            /**
             * Creates a plain object from a http message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.latency.http
             * @static
             * @param {yuhaiin.latency.http} m http
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            http.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.url = "";
                }
                if (m.url != null && m.hasOwnProperty("url")) {
                    d.url = m.url;
                }
                return d;
            };

            /**
             * Converts this http to JSON.
             * @function toJSON
             * @memberof yuhaiin.latency.http
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            http.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return http;
        })();

        latency.dns = (function() {

            /**
             * Properties of a dns.
             * @memberof yuhaiin.latency
             * @interface Idns
             * @property {string|null} [host] dns host
             * @property {string|null} [target_domain] dns target_domain
             */

            /**
             * Constructs a new dns.
             * @memberof yuhaiin.latency
             * @classdesc Represents a dns.
             * @implements Idns
             * @constructor
             * @param {yuhaiin.latency.Idns=} [p] Properties to set
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
             * @memberof yuhaiin.latency.dns
             * @instance
             */
            dns.prototype.host = "";

            /**
             * dns target_domain.
             * @member {string} target_domain
             * @memberof yuhaiin.latency.dns
             * @instance
             */
            dns.prototype.target_domain = "";

            /**
             * Creates a new dns instance using the specified properties.
             * @function create
             * @memberof yuhaiin.latency.dns
             * @static
             * @param {yuhaiin.latency.Idns=} [properties] Properties to set
             * @returns {yuhaiin.latency.dns} dns instance
             */
            dns.create = function create(properties) {
                return new dns(properties);
            };

            /**
             * Encodes the specified dns message. Does not implicitly {@link yuhaiin.latency.dns.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.latency.dns
             * @static
             * @param {yuhaiin.latency.Idns} m dns message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            dns.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.target_domain != null && Object.hasOwnProperty.call(m, "target_domain"))
                    w.uint32(18).string(m.target_domain);
                return w;
            };

            /**
             * Decodes a dns message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.latency.dns
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.latency.dns} dns
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            dns.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.latency.dns();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.target_domain = r.string();
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
             * @memberof yuhaiin.latency.dns
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.latency.dns} dns
             */
            dns.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.latency.dns)
                    return d;
                var m = new $root.yuhaiin.latency.dns();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.target_domain != null) {
                    m.target_domain = String(d.target_domain);
                }
                return m;
            };

            /**
             * Creates a plain object from a dns message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.latency.dns
             * @static
             * @param {yuhaiin.latency.dns} m dns
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            dns.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.target_domain = "";
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.target_domain != null && m.hasOwnProperty("target_domain")) {
                    d.target_domain = m.target_domain;
                }
                return d;
            };

            /**
             * Converts this dns to JSON.
             * @function toJSON
             * @memberof yuhaiin.latency.dns
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            dns.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return dns;
        })();

        latency.dns_over_quic = (function() {

            /**
             * Properties of a dns_over_quic.
             * @memberof yuhaiin.latency
             * @interface Idns_over_quic
             * @property {string|null} [host] dns_over_quic host
             * @property {string|null} [target_domain] dns_over_quic target_domain
             */

            /**
             * Constructs a new dns_over_quic.
             * @memberof yuhaiin.latency
             * @classdesc Represents a dns_over_quic.
             * @implements Idns_over_quic
             * @constructor
             * @param {yuhaiin.latency.Idns_over_quic=} [p] Properties to set
             */
            function dns_over_quic(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * dns_over_quic host.
             * @member {string} host
             * @memberof yuhaiin.latency.dns_over_quic
             * @instance
             */
            dns_over_quic.prototype.host = "";

            /**
             * dns_over_quic target_domain.
             * @member {string} target_domain
             * @memberof yuhaiin.latency.dns_over_quic
             * @instance
             */
            dns_over_quic.prototype.target_domain = "";

            /**
             * Creates a new dns_over_quic instance using the specified properties.
             * @function create
             * @memberof yuhaiin.latency.dns_over_quic
             * @static
             * @param {yuhaiin.latency.Idns_over_quic=} [properties] Properties to set
             * @returns {yuhaiin.latency.dns_over_quic} dns_over_quic instance
             */
            dns_over_quic.create = function create(properties) {
                return new dns_over_quic(properties);
            };

            /**
             * Encodes the specified dns_over_quic message. Does not implicitly {@link yuhaiin.latency.dns_over_quic.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.latency.dns_over_quic
             * @static
             * @param {yuhaiin.latency.Idns_over_quic} m dns_over_quic message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            dns_over_quic.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.host != null && Object.hasOwnProperty.call(m, "host"))
                    w.uint32(10).string(m.host);
                if (m.target_domain != null && Object.hasOwnProperty.call(m, "target_domain"))
                    w.uint32(18).string(m.target_domain);
                return w;
            };

            /**
             * Decodes a dns_over_quic message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.latency.dns_over_quic
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.latency.dns_over_quic} dns_over_quic
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            dns_over_quic.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.latency.dns_over_quic();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.host = r.string();
                            break;
                        }
                    case 2: {
                            m.target_domain = r.string();
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
             * Creates a dns_over_quic message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.latency.dns_over_quic
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.latency.dns_over_quic} dns_over_quic
             */
            dns_over_quic.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.latency.dns_over_quic)
                    return d;
                var m = new $root.yuhaiin.latency.dns_over_quic();
                if (d.host != null) {
                    m.host = String(d.host);
                }
                if (d.target_domain != null) {
                    m.target_domain = String(d.target_domain);
                }
                return m;
            };

            /**
             * Creates a plain object from a dns_over_quic message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.latency.dns_over_quic
             * @static
             * @param {yuhaiin.latency.dns_over_quic} m dns_over_quic
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            dns_over_quic.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.host = "";
                    d.target_domain = "";
                }
                if (m.host != null && m.hasOwnProperty("host")) {
                    d.host = m.host;
                }
                if (m.target_domain != null && m.hasOwnProperty("target_domain")) {
                    d.target_domain = m.target_domain;
                }
                return d;
            };

            /**
             * Converts this dns_over_quic to JSON.
             * @function toJSON
             * @memberof yuhaiin.latency.dns_over_quic
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            dns_over_quic.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return dns_over_quic;
        })();

        latency.protocol = (function() {

            /**
             * Properties of a protocol.
             * @memberof yuhaiin.latency
             * @interface Iprotocol
             * @property {yuhaiin.latency.Ihttp|null} [http] protocol http
             * @property {yuhaiin.latency.Idns|null} [dns] protocol dns
             * @property {yuhaiin.latency.Idns_over_quic|null} [dns_over_quic] protocol dns_over_quic
             */

            /**
             * Constructs a new protocol.
             * @memberof yuhaiin.latency
             * @classdesc Represents a protocol.
             * @implements Iprotocol
             * @constructor
             * @param {yuhaiin.latency.Iprotocol=} [p] Properties to set
             */
            function protocol(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * protocol http.
             * @member {yuhaiin.latency.Ihttp|null|undefined} http
             * @memberof yuhaiin.latency.protocol
             * @instance
             */
            protocol.prototype.http = null;

            /**
             * protocol dns.
             * @member {yuhaiin.latency.Idns|null|undefined} dns
             * @memberof yuhaiin.latency.protocol
             * @instance
             */
            protocol.prototype.dns = null;

            /**
             * protocol dns_over_quic.
             * @member {yuhaiin.latency.Idns_over_quic|null|undefined} dns_over_quic
             * @memberof yuhaiin.latency.protocol
             * @instance
             */
            protocol.prototype.dns_over_quic = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * protocol protocol.
             * @member {"http"|"dns"|"dns_over_quic"|undefined} protocol
             * @memberof yuhaiin.latency.protocol
             * @instance
             */
            Object.defineProperty(protocol.prototype, "protocol", {
                get: $util.oneOfGetter($oneOfFields = ["http", "dns", "dns_over_quic"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new protocol instance using the specified properties.
             * @function create
             * @memberof yuhaiin.latency.protocol
             * @static
             * @param {yuhaiin.latency.Iprotocol=} [properties] Properties to set
             * @returns {yuhaiin.latency.protocol} protocol instance
             */
            protocol.create = function create(properties) {
                return new protocol(properties);
            };

            /**
             * Encodes the specified protocol message. Does not implicitly {@link yuhaiin.latency.protocol.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.latency.protocol
             * @static
             * @param {yuhaiin.latency.Iprotocol} m protocol message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            protocol.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.http != null && Object.hasOwnProperty.call(m, "http"))
                    $root.yuhaiin.latency.http.encode(m.http, w.uint32(10).fork()).ldelim();
                if (m.dns != null && Object.hasOwnProperty.call(m, "dns"))
                    $root.yuhaiin.latency.dns.encode(m.dns, w.uint32(18).fork()).ldelim();
                if (m.dns_over_quic != null && Object.hasOwnProperty.call(m, "dns_over_quic"))
                    $root.yuhaiin.latency.dns_over_quic.encode(m.dns_over_quic, w.uint32(26).fork()).ldelim();
                return w;
            };

            /**
             * Decodes a protocol message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.latency.protocol
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.latency.protocol} protocol
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            protocol.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.latency.protocol();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.http = $root.yuhaiin.latency.http.decode(r, r.uint32());
                            break;
                        }
                    case 2: {
                            m.dns = $root.yuhaiin.latency.dns.decode(r, r.uint32());
                            break;
                        }
                    case 3: {
                            m.dns_over_quic = $root.yuhaiin.latency.dns_over_quic.decode(r, r.uint32());
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
             * @memberof yuhaiin.latency.protocol
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.latency.protocol} protocol
             */
            protocol.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.latency.protocol)
                    return d;
                var m = new $root.yuhaiin.latency.protocol();
                if (d.http != null) {
                    if (typeof d.http !== "object")
                        throw TypeError(".yuhaiin.latency.protocol.http: object expected");
                    m.http = $root.yuhaiin.latency.http.fromObject(d.http);
                }
                if (d.dns != null) {
                    if (typeof d.dns !== "object")
                        throw TypeError(".yuhaiin.latency.protocol.dns: object expected");
                    m.dns = $root.yuhaiin.latency.dns.fromObject(d.dns);
                }
                if (d.dns_over_quic != null) {
                    if (typeof d.dns_over_quic !== "object")
                        throw TypeError(".yuhaiin.latency.protocol.dns_over_quic: object expected");
                    m.dns_over_quic = $root.yuhaiin.latency.dns_over_quic.fromObject(d.dns_over_quic);
                }
                return m;
            };

            /**
             * Creates a plain object from a protocol message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.latency.protocol
             * @static
             * @param {yuhaiin.latency.protocol} m protocol
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            protocol.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (m.http != null && m.hasOwnProperty("http")) {
                    d.http = $root.yuhaiin.latency.http.toObject(m.http, o);
                    if (o.oneofs)
                        d.protocol = "http";
                }
                if (m.dns != null && m.hasOwnProperty("dns")) {
                    d.dns = $root.yuhaiin.latency.dns.toObject(m.dns, o);
                    if (o.oneofs)
                        d.protocol = "dns";
                }
                if (m.dns_over_quic != null && m.hasOwnProperty("dns_over_quic")) {
                    d.dns_over_quic = $root.yuhaiin.latency.dns_over_quic.toObject(m.dns_over_quic, o);
                    if (o.oneofs)
                        d.protocol = "dns_over_quic";
                }
                return d;
            };

            /**
             * Converts this protocol to JSON.
             * @function toJSON
             * @memberof yuhaiin.latency.protocol
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            protocol.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return protocol;
        })();

        latency.request = (function() {

            /**
             * Properties of a request.
             * @memberof yuhaiin.latency
             * @interface Irequest
             * @property {string|null} [id] request id
             * @property {string|null} [hash] request hash
             * @property {yuhaiin.latency.Iprotocol|null} [protocol] request protocol
             */

            /**
             * Constructs a new request.
             * @memberof yuhaiin.latency
             * @classdesc Represents a request.
             * @implements Irequest
             * @constructor
             * @param {yuhaiin.latency.Irequest=} [p] Properties to set
             */
            function request(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * request id.
             * @member {string} id
             * @memberof yuhaiin.latency.request
             * @instance
             */
            request.prototype.id = "";

            /**
             * request hash.
             * @member {string} hash
             * @memberof yuhaiin.latency.request
             * @instance
             */
            request.prototype.hash = "";

            /**
             * request protocol.
             * @member {yuhaiin.latency.Iprotocol|null|undefined} protocol
             * @memberof yuhaiin.latency.request
             * @instance
             */
            request.prototype.protocol = null;

            /**
             * Creates a new request instance using the specified properties.
             * @function create
             * @memberof yuhaiin.latency.request
             * @static
             * @param {yuhaiin.latency.Irequest=} [properties] Properties to set
             * @returns {yuhaiin.latency.request} request instance
             */
            request.create = function create(properties) {
                return new request(properties);
            };

            /**
             * Encodes the specified request message. Does not implicitly {@link yuhaiin.latency.request.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.latency.request
             * @static
             * @param {yuhaiin.latency.Irequest} m request message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            request.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.hash != null && Object.hasOwnProperty.call(m, "hash"))
                    w.uint32(10).string(m.hash);
                if (m.protocol != null && Object.hasOwnProperty.call(m, "protocol"))
                    $root.yuhaiin.latency.protocol.encode(m.protocol, w.uint32(18).fork()).ldelim();
                if (m.id != null && Object.hasOwnProperty.call(m, "id"))
                    w.uint32(26).string(m.id);
                return w;
            };

            /**
             * Decodes a request message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.latency.request
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.latency.request} request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            request.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.latency.request();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 3: {
                            m.id = r.string();
                            break;
                        }
                    case 1: {
                            m.hash = r.string();
                            break;
                        }
                    case 2: {
                            m.protocol = $root.yuhaiin.latency.protocol.decode(r, r.uint32());
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
             * Creates a request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.latency.request
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.latency.request} request
             */
            request.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.latency.request)
                    return d;
                var m = new $root.yuhaiin.latency.request();
                if (d.id != null) {
                    m.id = String(d.id);
                }
                if (d.hash != null) {
                    m.hash = String(d.hash);
                }
                if (d.protocol != null) {
                    if (typeof d.protocol !== "object")
                        throw TypeError(".yuhaiin.latency.request.protocol: object expected");
                    m.protocol = $root.yuhaiin.latency.protocol.fromObject(d.protocol);
                }
                return m;
            };

            /**
             * Creates a plain object from a request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.latency.request
             * @static
             * @param {yuhaiin.latency.request} m request
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            request.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.hash = "";
                    d.protocol = null;
                    d.id = "";
                }
                if (m.hash != null && m.hasOwnProperty("hash")) {
                    d.hash = m.hash;
                }
                if (m.protocol != null && m.hasOwnProperty("protocol")) {
                    d.protocol = $root.yuhaiin.latency.protocol.toObject(m.protocol, o);
                }
                if (m.id != null && m.hasOwnProperty("id")) {
                    d.id = m.id;
                }
                return d;
            };

            /**
             * Converts this request to JSON.
             * @function toJSON
             * @memberof yuhaiin.latency.request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            request.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return request;
        })();

        latency.requests = (function() {

            /**
             * Properties of a requests.
             * @memberof yuhaiin.latency
             * @interface Irequests
             * @property {Array.<yuhaiin.latency.Irequest>|null} [requests] requests requests
             */

            /**
             * Constructs a new requests.
             * @memberof yuhaiin.latency
             * @classdesc Represents a requests.
             * @implements Irequests
             * @constructor
             * @param {yuhaiin.latency.Irequests=} [p] Properties to set
             */
            function requests(p) {
                this.requests = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * requests requests.
             * @member {Array.<yuhaiin.latency.Irequest>} requests
             * @memberof yuhaiin.latency.requests
             * @instance
             */
            requests.prototype.requests = $util.emptyArray;

            /**
             * Creates a new requests instance using the specified properties.
             * @function create
             * @memberof yuhaiin.latency.requests
             * @static
             * @param {yuhaiin.latency.Irequests=} [properties] Properties to set
             * @returns {yuhaiin.latency.requests} requests instance
             */
            requests.create = function create(properties) {
                return new requests(properties);
            };

            /**
             * Encodes the specified requests message. Does not implicitly {@link yuhaiin.latency.requests.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.latency.requests
             * @static
             * @param {yuhaiin.latency.Irequests} m requests message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            requests.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.requests != null && m.requests.length) {
                    for (var i = 0; i < m.requests.length; ++i)
                        $root.yuhaiin.latency.request.encode(m.requests[i], w.uint32(10).fork()).ldelim();
                }
                return w;
            };

            /**
             * Decodes a requests message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.latency.requests
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.latency.requests} requests
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            requests.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.latency.requests();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            if (!(m.requests && m.requests.length))
                                m.requests = [];
                            m.requests.push($root.yuhaiin.latency.request.decode(r, r.uint32()));
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
             * Creates a requests message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.latency.requests
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.latency.requests} requests
             */
            requests.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.latency.requests)
                    return d;
                var m = new $root.yuhaiin.latency.requests();
                if (d.requests) {
                    if (!Array.isArray(d.requests))
                        throw TypeError(".yuhaiin.latency.requests.requests: array expected");
                    m.requests = [];
                    for (var i = 0; i < d.requests.length; ++i) {
                        if (typeof d.requests[i] !== "object")
                            throw TypeError(".yuhaiin.latency.requests.requests: object expected");
                        m.requests[i] = $root.yuhaiin.latency.request.fromObject(d.requests[i]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a requests message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.latency.requests
             * @static
             * @param {yuhaiin.latency.requests} m requests
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            requests.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                    d.requests = [];
                }
                if (m.requests && m.requests.length) {
                    d.requests = [];
                    for (var j = 0; j < m.requests.length; ++j) {
                        d.requests[j] = $root.yuhaiin.latency.request.toObject(m.requests[j], o);
                    }
                }
                return d;
            };

            /**
             * Converts this requests to JSON.
             * @function toJSON
             * @memberof yuhaiin.latency.requests
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            requests.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return requests;
        })();

        latency.response = (function() {

            /**
             * Properties of a response.
             * @memberof yuhaiin.latency
             * @interface Iresponse
             * @property {Object.<string,google.protobuf.IDuration>|null} [id_latency_map] response id_latency_map
             */

            /**
             * Constructs a new response.
             * @memberof yuhaiin.latency
             * @classdesc Represents a response.
             * @implements Iresponse
             * @constructor
             * @param {yuhaiin.latency.Iresponse=} [p] Properties to set
             */
            function response(p) {
                this.id_latency_map = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * response id_latency_map.
             * @member {Object.<string,google.protobuf.IDuration>} id_latency_map
             * @memberof yuhaiin.latency.response
             * @instance
             */
            response.prototype.id_latency_map = $util.emptyObject;

            /**
             * Creates a new response instance using the specified properties.
             * @function create
             * @memberof yuhaiin.latency.response
             * @static
             * @param {yuhaiin.latency.Iresponse=} [properties] Properties to set
             * @returns {yuhaiin.latency.response} response instance
             */
            response.create = function create(properties) {
                return new response(properties);
            };

            /**
             * Encodes the specified response message. Does not implicitly {@link yuhaiin.latency.response.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.latency.response
             * @static
             * @param {yuhaiin.latency.Iresponse} m response message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            response.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.id_latency_map != null && Object.hasOwnProperty.call(m, "id_latency_map")) {
                    for (var ks = Object.keys(m.id_latency_map), i = 0; i < ks.length; ++i) {
                        w.uint32(10).fork().uint32(10).string(ks[i]);
                        $root.google.protobuf.Duration.encode(m.id_latency_map[ks[i]], w.uint32(18).fork()).ldelim().ldelim();
                    }
                }
                return w;
            };

            /**
             * Decodes a response message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.latency.response
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.latency.response} response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            response.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.latency.response(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            if (m.id_latency_map === $util.emptyObject)
                                m.id_latency_map = {};
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
                                    value = $root.google.protobuf.Duration.decode(r, r.uint32());
                                    break;
                                default:
                                    r.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            m.id_latency_map[k] = value;
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
             * Creates a response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.latency.response
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.latency.response} response
             */
            response.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.latency.response)
                    return d;
                var m = new $root.yuhaiin.latency.response();
                if (d.id_latency_map) {
                    if (typeof d.id_latency_map !== "object")
                        throw TypeError(".yuhaiin.latency.response.id_latency_map: object expected");
                    m.id_latency_map = {};
                    for (var ks = Object.keys(d.id_latency_map), i = 0; i < ks.length; ++i) {
                        if (typeof d.id_latency_map[ks[i]] !== "object")
                            throw TypeError(".yuhaiin.latency.response.id_latency_map: object expected");
                        m.id_latency_map[ks[i]] = $root.google.protobuf.Duration.fromObject(d.id_latency_map[ks[i]]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.latency.response
             * @static
             * @param {yuhaiin.latency.response} m response
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            response.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.objects || o.defaults) {
                    d.id_latency_map = {};
                }
                var ks2;
                if (m.id_latency_map && (ks2 = Object.keys(m.id_latency_map)).length) {
                    d.id_latency_map = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.id_latency_map[ks2[j]] = $root.google.protobuf.Duration.toObject(m.id_latency_map[ks2[j]], o);
                    }
                }
                return d;
            };

            /**
             * Converts this response to JSON.
             * @function toJSON
             * @memberof yuhaiin.latency.response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            response.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return response;
        })();

        return latency;
    })();

    yuhaiin.statistic = (function() {

        /**
         * Namespace statistic.
         * @memberof yuhaiin
         * @namespace
         */
        const statistic = {};

        /**
         * type enum.
         * @name yuhaiin.statistic.type
         * @enum {number}
         * @property {number} unknown=0 unknown value
         * @property {number} tcp=1 tcp value
         * @property {number} tcp4=2 tcp4 value
         * @property {number} tcp6=3 tcp6 value
         * @property {number} udp=4 udp value
         * @property {number} udp4=5 udp4 value
         * @property {number} udp6=6 udp6 value
         * @property {number} ip=7 ip value
         * @property {number} ip4=8 ip4 value
         * @property {number} ip6=9 ip6 value
         * @property {number} unix=10 unix value
         * @property {number} unixgram=11 unixgram value
         * @property {number} unixpacket=12 unixpacket value
         */
        statistic.type = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "unknown"] = 0;
            values[valuesById[1] = "tcp"] = 1;
            values[valuesById[2] = "tcp4"] = 2;
            values[valuesById[3] = "tcp6"] = 3;
            values[valuesById[4] = "udp"] = 4;
            values[valuesById[5] = "udp4"] = 5;
            values[valuesById[6] = "udp6"] = 6;
            values[valuesById[7] = "ip"] = 7;
            values[valuesById[8] = "ip4"] = 8;
            values[valuesById[9] = "ip6"] = 9;
            values[valuesById[10] = "unix"] = 10;
            values[valuesById[11] = "unixgram"] = 11;
            values[valuesById[12] = "unixpacket"] = 12;
            return values;
        })();

        statistic.net_type = (function() {

            /**
             * Properties of a net_type.
             * @memberof yuhaiin.statistic
             * @interface Inet_type
             * @property {yuhaiin.statistic.type|null} [conn_type] net_type conn_type
             * @property {yuhaiin.statistic.type|null} [underlying_type] net_type underlying_type
             */

            /**
             * Constructs a new net_type.
             * @memberof yuhaiin.statistic
             * @classdesc Represents a net_type.
             * @implements Inet_type
             * @constructor
             * @param {yuhaiin.statistic.Inet_type=} [p] Properties to set
             */
            function net_type(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * net_type conn_type.
             * @member {yuhaiin.statistic.type} conn_type
             * @memberof yuhaiin.statistic.net_type
             * @instance
             */
            net_type.prototype.conn_type = 0;

            /**
             * net_type underlying_type.
             * @member {yuhaiin.statistic.type} underlying_type
             * @memberof yuhaiin.statistic.net_type
             * @instance
             */
            net_type.prototype.underlying_type = 0;

            /**
             * Creates a new net_type instance using the specified properties.
             * @function create
             * @memberof yuhaiin.statistic.net_type
             * @static
             * @param {yuhaiin.statistic.Inet_type=} [properties] Properties to set
             * @returns {yuhaiin.statistic.net_type} net_type instance
             */
            net_type.create = function create(properties) {
                return new net_type(properties);
            };

            /**
             * Encodes the specified net_type message. Does not implicitly {@link yuhaiin.statistic.net_type.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.statistic.net_type
             * @static
             * @param {yuhaiin.statistic.Inet_type} m net_type message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            net_type.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.conn_type != null && Object.hasOwnProperty.call(m, "conn_type"))
                    w.uint32(8).int32(m.conn_type);
                if (m.underlying_type != null && Object.hasOwnProperty.call(m, "underlying_type"))
                    w.uint32(16).int32(m.underlying_type);
                return w;
            };

            /**
             * Decodes a net_type message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.statistic.net_type
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.statistic.net_type} net_type
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            net_type.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.statistic.net_type();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.conn_type = r.int32();
                            break;
                        }
                    case 2: {
                            m.underlying_type = r.int32();
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
             * Creates a net_type message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.statistic.net_type
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.statistic.net_type} net_type
             */
            net_type.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.statistic.net_type)
                    return d;
                var m = new $root.yuhaiin.statistic.net_type();
                switch (d.conn_type) {
                default:
                    if (typeof d.conn_type === "number") {
                        m.conn_type = d.conn_type;
                        break;
                    }
                    break;
                case "unknown":
                case 0:
                    m.conn_type = 0;
                    break;
                case "tcp":
                case 1:
                    m.conn_type = 1;
                    break;
                case "tcp4":
                case 2:
                    m.conn_type = 2;
                    break;
                case "tcp6":
                case 3:
                    m.conn_type = 3;
                    break;
                case "udp":
                case 4:
                    m.conn_type = 4;
                    break;
                case "udp4":
                case 5:
                    m.conn_type = 5;
                    break;
                case "udp6":
                case 6:
                    m.conn_type = 6;
                    break;
                case "ip":
                case 7:
                    m.conn_type = 7;
                    break;
                case "ip4":
                case 8:
                    m.conn_type = 8;
                    break;
                case "ip6":
                case 9:
                    m.conn_type = 9;
                    break;
                case "unix":
                case 10:
                    m.conn_type = 10;
                    break;
                case "unixgram":
                case 11:
                    m.conn_type = 11;
                    break;
                case "unixpacket":
                case 12:
                    m.conn_type = 12;
                    break;
                }
                switch (d.underlying_type) {
                default:
                    if (typeof d.underlying_type === "number") {
                        m.underlying_type = d.underlying_type;
                        break;
                    }
                    break;
                case "unknown":
                case 0:
                    m.underlying_type = 0;
                    break;
                case "tcp":
                case 1:
                    m.underlying_type = 1;
                    break;
                case "tcp4":
                case 2:
                    m.underlying_type = 2;
                    break;
                case "tcp6":
                case 3:
                    m.underlying_type = 3;
                    break;
                case "udp":
                case 4:
                    m.underlying_type = 4;
                    break;
                case "udp4":
                case 5:
                    m.underlying_type = 5;
                    break;
                case "udp6":
                case 6:
                    m.underlying_type = 6;
                    break;
                case "ip":
                case 7:
                    m.underlying_type = 7;
                    break;
                case "ip4":
                case 8:
                    m.underlying_type = 8;
                    break;
                case "ip6":
                case 9:
                    m.underlying_type = 9;
                    break;
                case "unix":
                case 10:
                    m.underlying_type = 10;
                    break;
                case "unixgram":
                case 11:
                    m.underlying_type = 11;
                    break;
                case "unixpacket":
                case 12:
                    m.underlying_type = 12;
                    break;
                }
                return m;
            };

            /**
             * Creates a plain object from a net_type message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.statistic.net_type
             * @static
             * @param {yuhaiin.statistic.net_type} m net_type
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            net_type.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.conn_type = o.enums === String ? "unknown" : 0;
                    d.underlying_type = o.enums === String ? "unknown" : 0;
                }
                if (m.conn_type != null && m.hasOwnProperty("conn_type")) {
                    d.conn_type = o.enums === String ? $root.yuhaiin.statistic.type[m.conn_type] === undefined ? m.conn_type : $root.yuhaiin.statistic.type[m.conn_type] : m.conn_type;
                }
                if (m.underlying_type != null && m.hasOwnProperty("underlying_type")) {
                    d.underlying_type = o.enums === String ? $root.yuhaiin.statistic.type[m.underlying_type] === undefined ? m.underlying_type : $root.yuhaiin.statistic.type[m.underlying_type] : m.underlying_type;
                }
                return d;
            };

            /**
             * Converts this net_type to JSON.
             * @function toJSON
             * @memberof yuhaiin.statistic.net_type
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            net_type.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return net_type;
        })();

        statistic.connection = (function() {

            /**
             * Properties of a connection.
             * @memberof yuhaiin.statistic
             * @interface Iconnection
             * @property {string|null} [addr] connection addr
             * @property {number|Long|null} [id] connection id
             * @property {yuhaiin.statistic.Inet_type|null} [type] connection type
             * @property {Object.<string,string>|null} [extra] connection extra
             */

            /**
             * Constructs a new connection.
             * @memberof yuhaiin.statistic
             * @classdesc Represents a connection.
             * @implements Iconnection
             * @constructor
             * @param {yuhaiin.statistic.Iconnection=} [p] Properties to set
             */
            function connection(p) {
                this.extra = {};
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * connection addr.
             * @member {string} addr
             * @memberof yuhaiin.statistic.connection
             * @instance
             */
            connection.prototype.addr = "";

            /**
             * connection id.
             * @member {number|Long} id
             * @memberof yuhaiin.statistic.connection
             * @instance
             */
            connection.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * connection type.
             * @member {yuhaiin.statistic.Inet_type|null|undefined} type
             * @memberof yuhaiin.statistic.connection
             * @instance
             */
            connection.prototype.type = null;

            /**
             * connection extra.
             * @member {Object.<string,string>} extra
             * @memberof yuhaiin.statistic.connection
             * @instance
             */
            connection.prototype.extra = $util.emptyObject;

            /**
             * Creates a new connection instance using the specified properties.
             * @function create
             * @memberof yuhaiin.statistic.connection
             * @static
             * @param {yuhaiin.statistic.Iconnection=} [properties] Properties to set
             * @returns {yuhaiin.statistic.connection} connection instance
             */
            connection.create = function create(properties) {
                return new connection(properties);
            };

            /**
             * Encodes the specified connection message. Does not implicitly {@link yuhaiin.statistic.connection.verify|verify} messages.
             * @function encode
             * @memberof yuhaiin.statistic.connection
             * @static
             * @param {yuhaiin.statistic.Iconnection} m connection message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            connection.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.addr != null && Object.hasOwnProperty.call(m, "addr"))
                    w.uint32(10).string(m.addr);
                if (m.id != null && Object.hasOwnProperty.call(m, "id"))
                    w.uint32(16).uint64(m.id);
                if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                    $root.yuhaiin.statistic.net_type.encode(m.type, w.uint32(26).fork()).ldelim();
                if (m.extra != null && Object.hasOwnProperty.call(m, "extra")) {
                    for (var ks = Object.keys(m.extra), i = 0; i < ks.length; ++i) {
                        w.uint32(34).fork().uint32(10).string(ks[i]).uint32(18).string(m.extra[ks[i]]).ldelim();
                    }
                }
                return w;
            };

            /**
             * Decodes a connection message from the specified reader or buffer.
             * @function decode
             * @memberof yuhaiin.statistic.connection
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {yuhaiin.statistic.connection} connection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            connection.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.yuhaiin.statistic.connection(), k, value;
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.addr = r.string();
                            break;
                        }
                    case 2: {
                            m.id = r.uint64();
                            break;
                        }
                    case 3: {
                            m.type = $root.yuhaiin.statistic.net_type.decode(r, r.uint32());
                            break;
                        }
                    case 4: {
                            if (m.extra === $util.emptyObject)
                                m.extra = {};
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
                            m.extra[k] = value;
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
             * Creates a connection message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof yuhaiin.statistic.connection
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {yuhaiin.statistic.connection} connection
             */
            connection.fromObject = function fromObject(d) {
                if (d instanceof $root.yuhaiin.statistic.connection)
                    return d;
                var m = new $root.yuhaiin.statistic.connection();
                if (d.addr != null) {
                    m.addr = String(d.addr);
                }
                if (d.id != null) {
                    if ($util.Long)
                        (m.id = $util.Long.fromValue(d.id)).unsigned = true;
                    else if (typeof d.id === "string")
                        m.id = parseInt(d.id, 10);
                    else if (typeof d.id === "number")
                        m.id = d.id;
                    else if (typeof d.id === "object")
                        m.id = new $util.LongBits(d.id.low >>> 0, d.id.high >>> 0).toNumber(true);
                }
                if (d.type != null) {
                    if (typeof d.type !== "object")
                        throw TypeError(".yuhaiin.statistic.connection.type: object expected");
                    m.type = $root.yuhaiin.statistic.net_type.fromObject(d.type);
                }
                if (d.extra) {
                    if (typeof d.extra !== "object")
                        throw TypeError(".yuhaiin.statistic.connection.extra: object expected");
                    m.extra = {};
                    for (var ks = Object.keys(d.extra), i = 0; i < ks.length; ++i) {
                        m.extra[ks[i]] = String(d.extra[ks[i]]);
                    }
                }
                return m;
            };

            /**
             * Creates a plain object from a connection message. Also converts values to other types if specified.
             * @function toObject
             * @memberof yuhaiin.statistic.connection
             * @static
             * @param {yuhaiin.statistic.connection} m connection
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            connection.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.objects || o.defaults) {
                    d.extra = {};
                }
                if (o.defaults) {
                    d.addr = "";
                    if ($util.Long) {
                        var n = new $util.Long(0, 0, true);
                        d.id = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                    } else
                        d.id = o.longs === String ? "0" : 0;
                    d.type = null;
                }
                if (m.addr != null && m.hasOwnProperty("addr")) {
                    d.addr = m.addr;
                }
                if (m.id != null && m.hasOwnProperty("id")) {
                    if (typeof m.id === "number")
                        d.id = o.longs === String ? String(m.id) : m.id;
                    else
                        d.id = o.longs === String ? $util.Long.prototype.toString.call(m.id) : o.longs === Number ? new $util.LongBits(m.id.low >>> 0, m.id.high >>> 0).toNumber(true) : m.id;
                }
                if (m.type != null && m.hasOwnProperty("type")) {
                    d.type = $root.yuhaiin.statistic.net_type.toObject(m.type, o);
                }
                var ks2;
                if (m.extra && (ks2 = Object.keys(m.extra)).length) {
                    d.extra = {};
                    for (var j = 0; j < ks2.length; ++j) {
                        d.extra[ks2[j]] = m.extra[ks2[j]];
                    }
                }
                return d;
            };

            /**
             * Converts this connection to JSON.
             * @function toJSON
             * @memberof yuhaiin.statistic.connection
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            connection.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return connection;
        })();

        return statistic;
    })();

    return yuhaiin;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.Empty = (function() {

            /**
             * Properties of an Empty.
             * @memberof google.protobuf
             * @interface IEmpty
             */

            /**
             * Constructs a new Empty.
             * @memberof google.protobuf
             * @classdesc Represents an Empty.
             * @implements IEmpty
             * @constructor
             * @param {google.protobuf.IEmpty=} [p] Properties to set
             */
            function Empty(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Creates a new Empty instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty=} [properties] Properties to set
             * @returns {google.protobuf.Empty} Empty instance
             */
            Empty.create = function create(properties) {
                return new Empty(properties);
            };

            /**
             * Encodes the specified Empty message. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty} m Empty message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Empty.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                return w;
            };

            /**
             * Decodes an Empty message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Empty
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.Empty} Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Empty.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.Empty();
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
             * Creates an Empty message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Empty
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.Empty} Empty
             */
            Empty.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.Empty)
                    return d;
                return new $root.google.protobuf.Empty();
            };

            /**
             * Creates a plain object from an Empty message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.Empty} m Empty
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Empty.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this Empty to JSON.
             * @function toJSON
             * @memberof google.protobuf.Empty
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Empty.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Empty;
        })();

        protobuf.DoubleValue = (function() {

            /**
             * Properties of a DoubleValue.
             * @memberof google.protobuf
             * @interface IDoubleValue
             * @property {number|null} [value] DoubleValue value
             */

            /**
             * Constructs a new DoubleValue.
             * @memberof google.protobuf
             * @classdesc Represents a DoubleValue.
             * @implements IDoubleValue
             * @constructor
             * @param {google.protobuf.IDoubleValue=} [p] Properties to set
             */
            function DoubleValue(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * DoubleValue value.
             * @member {number} value
             * @memberof google.protobuf.DoubleValue
             * @instance
             */
            DoubleValue.prototype.value = 0;

            /**
             * Creates a new DoubleValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {google.protobuf.IDoubleValue=} [properties] Properties to set
             * @returns {google.protobuf.DoubleValue} DoubleValue instance
             */
            DoubleValue.create = function create(properties) {
                return new DoubleValue(properties);
            };

            /**
             * Encodes the specified DoubleValue message. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {google.protobuf.IDoubleValue} m DoubleValue message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DoubleValue.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(9).double(m.value);
                return w;
            };

            /**
             * Decodes a DoubleValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.DoubleValue} DoubleValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DoubleValue.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.DoubleValue();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.double();
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
             * Creates a DoubleValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.DoubleValue} DoubleValue
             */
            DoubleValue.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.DoubleValue)
                    return d;
                var m = new $root.google.protobuf.DoubleValue();
                if (d.value != null) {
                    m.value = Number(d.value);
                }
                return m;
            };

            /**
             * Creates a plain object from a DoubleValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {google.protobuf.DoubleValue} m DoubleValue
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DoubleValue.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.value = 0;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = o.json && !isFinite(m.value) ? String(m.value) : m.value;
                }
                return d;
            };

            /**
             * Converts this DoubleValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.DoubleValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DoubleValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return DoubleValue;
        })();

        protobuf.FloatValue = (function() {

            /**
             * Properties of a FloatValue.
             * @memberof google.protobuf
             * @interface IFloatValue
             * @property {number|null} [value] FloatValue value
             */

            /**
             * Constructs a new FloatValue.
             * @memberof google.protobuf
             * @classdesc Represents a FloatValue.
             * @implements IFloatValue
             * @constructor
             * @param {google.protobuf.IFloatValue=} [p] Properties to set
             */
            function FloatValue(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * FloatValue value.
             * @member {number} value
             * @memberof google.protobuf.FloatValue
             * @instance
             */
            FloatValue.prototype.value = 0;

            /**
             * Creates a new FloatValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {google.protobuf.IFloatValue=} [properties] Properties to set
             * @returns {google.protobuf.FloatValue} FloatValue instance
             */
            FloatValue.create = function create(properties) {
                return new FloatValue(properties);
            };

            /**
             * Encodes the specified FloatValue message. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {google.protobuf.IFloatValue} m FloatValue message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FloatValue.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(13).float(m.value);
                return w;
            };

            /**
             * Decodes a FloatValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.FloatValue} FloatValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FloatValue.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.FloatValue();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.float();
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
             * Creates a FloatValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.FloatValue} FloatValue
             */
            FloatValue.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.FloatValue)
                    return d;
                var m = new $root.google.protobuf.FloatValue();
                if (d.value != null) {
                    m.value = Number(d.value);
                }
                return m;
            };

            /**
             * Creates a plain object from a FloatValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {google.protobuf.FloatValue} m FloatValue
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FloatValue.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.value = 0;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = o.json && !isFinite(m.value) ? String(m.value) : m.value;
                }
                return d;
            };

            /**
             * Converts this FloatValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.FloatValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FloatValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return FloatValue;
        })();

        protobuf.Int64Value = (function() {

            /**
             * Properties of an Int64Value.
             * @memberof google.protobuf
             * @interface IInt64Value
             * @property {number|Long|null} [value] Int64Value value
             */

            /**
             * Constructs a new Int64Value.
             * @memberof google.protobuf
             * @classdesc Represents an Int64Value.
             * @implements IInt64Value
             * @constructor
             * @param {google.protobuf.IInt64Value=} [p] Properties to set
             */
            function Int64Value(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Int64Value value.
             * @member {number|Long} value
             * @memberof google.protobuf.Int64Value
             * @instance
             */
            Int64Value.prototype.value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Int64Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {google.protobuf.IInt64Value=} [properties] Properties to set
             * @returns {google.protobuf.Int64Value} Int64Value instance
             */
            Int64Value.create = function create(properties) {
                return new Int64Value(properties);
            };

            /**
             * Encodes the specified Int64Value message. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {google.protobuf.IInt64Value} m Int64Value message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Int64Value.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(8).int64(m.value);
                return w;
            };

            /**
             * Decodes an Int64Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.Int64Value} Int64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Int64Value.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.Int64Value();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.int64();
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
             * Creates an Int64Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.Int64Value} Int64Value
             */
            Int64Value.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.Int64Value)
                    return d;
                var m = new $root.google.protobuf.Int64Value();
                if (d.value != null) {
                    if ($util.Long)
                        (m.value = $util.Long.fromValue(d.value)).unsigned = false;
                    else if (typeof d.value === "string")
                        m.value = parseInt(d.value, 10);
                    else if (typeof d.value === "number")
                        m.value = d.value;
                    else if (typeof d.value === "object")
                        m.value = new $util.LongBits(d.value.low >>> 0, d.value.high >>> 0).toNumber();
                }
                return m;
            };

            /**
             * Creates a plain object from an Int64Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {google.protobuf.Int64Value} m Int64Value
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Int64Value.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    if ($util.Long) {
                        var n = new $util.Long(0, 0, false);
                        d.value = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                    } else
                        d.value = o.longs === String ? "0" : 0;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    if (typeof m.value === "number")
                        d.value = o.longs === String ? String(m.value) : m.value;
                    else
                        d.value = o.longs === String ? $util.Long.prototype.toString.call(m.value) : o.longs === Number ? new $util.LongBits(m.value.low >>> 0, m.value.high >>> 0).toNumber() : m.value;
                }
                return d;
            };

            /**
             * Converts this Int64Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.Int64Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Int64Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Int64Value;
        })();

        protobuf.UInt64Value = (function() {

            /**
             * Properties of a UInt64Value.
             * @memberof google.protobuf
             * @interface IUInt64Value
             * @property {number|Long|null} [value] UInt64Value value
             */

            /**
             * Constructs a new UInt64Value.
             * @memberof google.protobuf
             * @classdesc Represents a UInt64Value.
             * @implements IUInt64Value
             * @constructor
             * @param {google.protobuf.IUInt64Value=} [p] Properties to set
             */
            function UInt64Value(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * UInt64Value value.
             * @member {number|Long} value
             * @memberof google.protobuf.UInt64Value
             * @instance
             */
            UInt64Value.prototype.value = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new UInt64Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {google.protobuf.IUInt64Value=} [properties] Properties to set
             * @returns {google.protobuf.UInt64Value} UInt64Value instance
             */
            UInt64Value.create = function create(properties) {
                return new UInt64Value(properties);
            };

            /**
             * Encodes the specified UInt64Value message. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {google.protobuf.IUInt64Value} m UInt64Value message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UInt64Value.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(8).uint64(m.value);
                return w;
            };

            /**
             * Decodes a UInt64Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.UInt64Value} UInt64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UInt64Value.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.UInt64Value();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.uint64();
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
             * Creates a UInt64Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.UInt64Value} UInt64Value
             */
            UInt64Value.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.UInt64Value)
                    return d;
                var m = new $root.google.protobuf.UInt64Value();
                if (d.value != null) {
                    if ($util.Long)
                        (m.value = $util.Long.fromValue(d.value)).unsigned = true;
                    else if (typeof d.value === "string")
                        m.value = parseInt(d.value, 10);
                    else if (typeof d.value === "number")
                        m.value = d.value;
                    else if (typeof d.value === "object")
                        m.value = new $util.LongBits(d.value.low >>> 0, d.value.high >>> 0).toNumber(true);
                }
                return m;
            };

            /**
             * Creates a plain object from a UInt64Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {google.protobuf.UInt64Value} m UInt64Value
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UInt64Value.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    if ($util.Long) {
                        var n = new $util.Long(0, 0, true);
                        d.value = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                    } else
                        d.value = o.longs === String ? "0" : 0;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    if (typeof m.value === "number")
                        d.value = o.longs === String ? String(m.value) : m.value;
                    else
                        d.value = o.longs === String ? $util.Long.prototype.toString.call(m.value) : o.longs === Number ? new $util.LongBits(m.value.low >>> 0, m.value.high >>> 0).toNumber(true) : m.value;
                }
                return d;
            };

            /**
             * Converts this UInt64Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.UInt64Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UInt64Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return UInt64Value;
        })();

        protobuf.Int32Value = (function() {

            /**
             * Properties of an Int32Value.
             * @memberof google.protobuf
             * @interface IInt32Value
             * @property {number|null} [value] Int32Value value
             */

            /**
             * Constructs a new Int32Value.
             * @memberof google.protobuf
             * @classdesc Represents an Int32Value.
             * @implements IInt32Value
             * @constructor
             * @param {google.protobuf.IInt32Value=} [p] Properties to set
             */
            function Int32Value(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Int32Value value.
             * @member {number} value
             * @memberof google.protobuf.Int32Value
             * @instance
             */
            Int32Value.prototype.value = 0;

            /**
             * Creates a new Int32Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {google.protobuf.IInt32Value=} [properties] Properties to set
             * @returns {google.protobuf.Int32Value} Int32Value instance
             */
            Int32Value.create = function create(properties) {
                return new Int32Value(properties);
            };

            /**
             * Encodes the specified Int32Value message. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {google.protobuf.IInt32Value} m Int32Value message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Int32Value.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(8).int32(m.value);
                return w;
            };

            /**
             * Decodes an Int32Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.Int32Value} Int32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Int32Value.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.Int32Value();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.int32();
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
             * Creates an Int32Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.Int32Value} Int32Value
             */
            Int32Value.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.Int32Value)
                    return d;
                var m = new $root.google.protobuf.Int32Value();
                if (d.value != null) {
                    m.value = d.value | 0;
                }
                return m;
            };

            /**
             * Creates a plain object from an Int32Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {google.protobuf.Int32Value} m Int32Value
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Int32Value.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.value = 0;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = m.value;
                }
                return d;
            };

            /**
             * Converts this Int32Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.Int32Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Int32Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Int32Value;
        })();

        protobuf.UInt32Value = (function() {

            /**
             * Properties of a UInt32Value.
             * @memberof google.protobuf
             * @interface IUInt32Value
             * @property {number|null} [value] UInt32Value value
             */

            /**
             * Constructs a new UInt32Value.
             * @memberof google.protobuf
             * @classdesc Represents a UInt32Value.
             * @implements IUInt32Value
             * @constructor
             * @param {google.protobuf.IUInt32Value=} [p] Properties to set
             */
            function UInt32Value(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * UInt32Value value.
             * @member {number} value
             * @memberof google.protobuf.UInt32Value
             * @instance
             */
            UInt32Value.prototype.value = 0;

            /**
             * Creates a new UInt32Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {google.protobuf.IUInt32Value=} [properties] Properties to set
             * @returns {google.protobuf.UInt32Value} UInt32Value instance
             */
            UInt32Value.create = function create(properties) {
                return new UInt32Value(properties);
            };

            /**
             * Encodes the specified UInt32Value message. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {google.protobuf.IUInt32Value} m UInt32Value message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UInt32Value.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(8).uint32(m.value);
                return w;
            };

            /**
             * Decodes a UInt32Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.UInt32Value} UInt32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UInt32Value.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.UInt32Value();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.uint32();
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
             * Creates a UInt32Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.UInt32Value} UInt32Value
             */
            UInt32Value.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.UInt32Value)
                    return d;
                var m = new $root.google.protobuf.UInt32Value();
                if (d.value != null) {
                    m.value = d.value >>> 0;
                }
                return m;
            };

            /**
             * Creates a plain object from a UInt32Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {google.protobuf.UInt32Value} m UInt32Value
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UInt32Value.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.value = 0;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = m.value;
                }
                return d;
            };

            /**
             * Converts this UInt32Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.UInt32Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UInt32Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return UInt32Value;
        })();

        protobuf.BoolValue = (function() {

            /**
             * Properties of a BoolValue.
             * @memberof google.protobuf
             * @interface IBoolValue
             * @property {boolean|null} [value] BoolValue value
             */

            /**
             * Constructs a new BoolValue.
             * @memberof google.protobuf
             * @classdesc Represents a BoolValue.
             * @implements IBoolValue
             * @constructor
             * @param {google.protobuf.IBoolValue=} [p] Properties to set
             */
            function BoolValue(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * BoolValue value.
             * @member {boolean} value
             * @memberof google.protobuf.BoolValue
             * @instance
             */
            BoolValue.prototype.value = false;

            /**
             * Creates a new BoolValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {google.protobuf.IBoolValue=} [properties] Properties to set
             * @returns {google.protobuf.BoolValue} BoolValue instance
             */
            BoolValue.create = function create(properties) {
                return new BoolValue(properties);
            };

            /**
             * Encodes the specified BoolValue message. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {google.protobuf.IBoolValue} m BoolValue message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BoolValue.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(8).bool(m.value);
                return w;
            };

            /**
             * Decodes a BoolValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.BoolValue} BoolValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BoolValue.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.BoolValue();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.bool();
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
             * Creates a BoolValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.BoolValue} BoolValue
             */
            BoolValue.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.BoolValue)
                    return d;
                var m = new $root.google.protobuf.BoolValue();
                if (d.value != null) {
                    m.value = Boolean(d.value);
                }
                return m;
            };

            /**
             * Creates a plain object from a BoolValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {google.protobuf.BoolValue} m BoolValue
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            BoolValue.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.value = false;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = m.value;
                }
                return d;
            };

            /**
             * Converts this BoolValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.BoolValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BoolValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return BoolValue;
        })();

        protobuf.StringValue = (function() {

            /**
             * Properties of a StringValue.
             * @memberof google.protobuf
             * @interface IStringValue
             * @property {string|null} [value] StringValue value
             */

            /**
             * Constructs a new StringValue.
             * @memberof google.protobuf
             * @classdesc Represents a StringValue.
             * @implements IStringValue
             * @constructor
             * @param {google.protobuf.IStringValue=} [p] Properties to set
             */
            function StringValue(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * StringValue value.
             * @member {string} value
             * @memberof google.protobuf.StringValue
             * @instance
             */
            StringValue.prototype.value = "";

            /**
             * Creates a new StringValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.StringValue
             * @static
             * @param {google.protobuf.IStringValue=} [properties] Properties to set
             * @returns {google.protobuf.StringValue} StringValue instance
             */
            StringValue.create = function create(properties) {
                return new StringValue(properties);
            };

            /**
             * Encodes the specified StringValue message. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.StringValue
             * @static
             * @param {google.protobuf.IStringValue} m StringValue message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StringValue.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(10).string(m.value);
                return w;
            };

            /**
             * Decodes a StringValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.StringValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.StringValue} StringValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StringValue.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.StringValue();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.string();
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
             * Creates a StringValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.StringValue
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.StringValue} StringValue
             */
            StringValue.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.StringValue)
                    return d;
                var m = new $root.google.protobuf.StringValue();
                if (d.value != null) {
                    m.value = String(d.value);
                }
                return m;
            };

            /**
             * Creates a plain object from a StringValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.StringValue
             * @static
             * @param {google.protobuf.StringValue} m StringValue
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            StringValue.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.value = "";
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = m.value;
                }
                return d;
            };

            /**
             * Converts this StringValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.StringValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            StringValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return StringValue;
        })();

        protobuf.BytesValue = (function() {

            /**
             * Properties of a BytesValue.
             * @memberof google.protobuf
             * @interface IBytesValue
             * @property {Uint8Array|null} [value] BytesValue value
             */

            /**
             * Constructs a new BytesValue.
             * @memberof google.protobuf
             * @classdesc Represents a BytesValue.
             * @implements IBytesValue
             * @constructor
             * @param {google.protobuf.IBytesValue=} [p] Properties to set
             */
            function BytesValue(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * BytesValue value.
             * @member {Uint8Array} value
             * @memberof google.protobuf.BytesValue
             * @instance
             */
            BytesValue.prototype.value = $util.newBuffer([]);

            /**
             * Creates a new BytesValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {google.protobuf.IBytesValue=} [properties] Properties to set
             * @returns {google.protobuf.BytesValue} BytesValue instance
             */
            BytesValue.create = function create(properties) {
                return new BytesValue(properties);
            };

            /**
             * Encodes the specified BytesValue message. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {google.protobuf.IBytesValue} m BytesValue message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BytesValue.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(10).bytes(m.value);
                return w;
            };

            /**
             * Decodes a BytesValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.BytesValue} BytesValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BytesValue.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.BytesValue();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.value = r.bytes();
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
             * Creates a BytesValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.BytesValue} BytesValue
             */
            BytesValue.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.BytesValue)
                    return d;
                var m = new $root.google.protobuf.BytesValue();
                if (d.value != null) {
                    if (typeof d.value === "string")
                        $util.base64.decode(d.value, m.value = $util.newBuffer($util.base64.length(d.value)), 0);
                    else if (d.value.length >= 0)
                        m.value = d.value;
                }
                return m;
            };

            /**
             * Creates a plain object from a BytesValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {google.protobuf.BytesValue} m BytesValue
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            BytesValue.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    if (o.bytes === String)
                        d.value = "";
                    else {
                        d.value = [];
                        if (o.bytes !== Array)
                            d.value = $util.newBuffer(d.value);
                    }
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = o.bytes === String ? $util.base64.encode(m.value, 0, m.value.length) : o.bytes === Array ? Array.prototype.slice.call(m.value) : m.value;
                }
                return d;
            };

            /**
             * Converts this BytesValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.BytesValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BytesValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return BytesValue;
        })();

        protobuf.Duration = (function() {

            /**
             * Properties of a Duration.
             * @memberof google.protobuf
             * @interface IDuration
             * @property {number|Long|null} [seconds] Duration seconds
             * @property {number|null} [nanos] Duration nanos
             */

            /**
             * Constructs a new Duration.
             * @memberof google.protobuf
             * @classdesc Represents a Duration.
             * @implements IDuration
             * @constructor
             * @param {google.protobuf.IDuration=} [p] Properties to set
             */
            function Duration(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Duration seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Duration
             * @instance
             */
            Duration.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Duration nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Duration
             * @instance
             */
            Duration.prototype.nanos = 0;

            /**
             * Creates a new Duration instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration=} [properties] Properties to set
             * @returns {google.protobuf.Duration} Duration instance
             */
            Duration.create = function create(properties) {
                return new Duration(properties);
            };

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration} m Duration message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Duration.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds"))
                    w.uint32(8).int64(m.seconds);
                if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos"))
                    w.uint32(16).int32(m.nanos);
                return w;
            };

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Duration
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {google.protobuf.Duration} Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Duration.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.Duration();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.seconds = r.int64();
                            break;
                        }
                    case 2: {
                            m.nanos = r.int32();
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
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Duration
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {google.protobuf.Duration} Duration
             */
            Duration.fromObject = function fromObject(d) {
                if (d instanceof $root.google.protobuf.Duration)
                    return d;
                var m = new $root.google.protobuf.Duration();
                if (d.seconds != null) {
                    if ($util.Long)
                        (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
                    else if (typeof d.seconds === "string")
                        m.seconds = parseInt(d.seconds, 10);
                    else if (typeof d.seconds === "number")
                        m.seconds = d.seconds;
                    else if (typeof d.seconds === "object")
                        m.seconds = new $util.LongBits(d.seconds.low >>> 0, d.seconds.high >>> 0).toNumber();
                }
                if (d.nanos != null) {
                    m.nanos = d.nanos | 0;
                }
                return m;
            };

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.Duration} m Duration
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Duration.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    if ($util.Long) {
                        var n = new $util.Long(0, 0, false);
                        d.seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                    } else
                        d.seconds = o.longs === String ? "0" : 0;
                    d.nanos = 0;
                }
                if (m.seconds != null && m.hasOwnProperty("seconds")) {
                    if (typeof m.seconds === "number")
                        d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
                    else
                        d.seconds = o.longs === String ? $util.Long.prototype.toString.call(m.seconds) : o.longs === Number ? new $util.LongBits(m.seconds.low >>> 0, m.seconds.high >>> 0).toNumber() : m.seconds;
                }
                if (m.nanos != null && m.hasOwnProperty("nanos")) {
                    d.nanos = m.nanos;
                }
                return d;
            };

            /**
             * Converts this Duration to JSON.
             * @function toJSON
             * @memberof google.protobuf.Duration
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Duration.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Duration;
        })();

        return protobuf;
    })();

    return google;
})();

export { $root as default };
