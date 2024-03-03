/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots.statistic || ($protobuf.roots.statistic = {});

export const yuhaiin = $root.yuhaiin = (() => {

    /**
     * Namespace yuhaiin.
     * @exports yuhaiin
     * @namespace
     */
    const yuhaiin = {};

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

    yuhaiin.protos = (function() {

        /**
         * Namespace protos.
         * @memberof yuhaiin
         * @namespace
         */
        const protos = {};

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

        return protobuf;
    })();

    return google;
})();

export { $root as default };
