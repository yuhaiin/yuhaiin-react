"use client"

import { useContext, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { GlobalToastContext } from "../common/toast";
import { Fetch } from "../common/proto";
import { origin, point } from "../pbes/node/point/point_pb";
import { Point } from "./protocol";

export default function NewNode() {
    const [newNode, setNewNode] = useState({
        value: new point({
            group: "template_group",
            name: "template_name",
            origin: origin.manual,
        })
    });

    const ctx = useContext(GlobalToastContext);

    return (
        <>
            <Card className="mb-3">
                <Card.Header>New Node</Card.Header>
                <Card.Body>
                    <Point point={newNode.value} onChange={(x) => setNewNode({ value: x })} />


                </Card.Body>
                <Card.Footer>
                    <Button
                        className="outline-primary me-2"
                        onClick={async () => {
                            const { error } = await Fetch("/node", { method: "PATCH", body: newNode.value.toBinary() })
                            if (error) ctx.Error(`Add new node failed ${error.code}| ${await error.msg}.`)
                            else ctx.Info(`Add New Node Successful`)
                        }}
                    >
                        Save
                    </Button>
                </Card.Footer>
            </Card>

        </>
    )
}
