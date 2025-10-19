import { create } from "@bufbuild/protobuf";
import { FC } from "react";
import { grpc, tls_configSchema } from "../pbes/node/protocol_pb";
import { TlsConfigv2 } from "./tls";
import { Props } from "./tools";

export const Grpcv2: FC<Props<grpc>> = ({ value, onChange }) => {
    return <TlsConfigv2 value={value.tls ?? create(tls_configSchema, {})} onChange={(x) => { onChange({ ...value, tls: x }) }} />
}