import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace yuhaiin. */
export namespace yuhaiin {

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

    /** Namespace protos. */
    namespace protos {

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
    }
}
