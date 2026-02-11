import { FC, useContext } from "react";
import { Node, NodesContext } from "../../common/nodes";
import { point_as_endpoint } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const PointAsEndpoint: FC<Props<point_as_endpoint>> = ({ value, onChange, editable = true }) => {
    const nodes = useContext(NodesContext);

    return (
        <Node
            disabled={!editable}
            hash={value.hash}
            data={nodes}
            onChangeNode={(hash) => onChange({ ...value, hash })}
        />
    );
};
