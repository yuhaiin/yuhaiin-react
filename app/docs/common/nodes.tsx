import { create } from "@bufbuild/protobuf";
import { createContext } from "react";
import { nodes_response, nodes_responseSchema } from "../pbes/node/grpc/node_pb";

export const NodesContext = createContext<nodes_response>(create(nodes_responseSchema, {}))
