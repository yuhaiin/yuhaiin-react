"use client"

import { useContext, useState } from "react"
import { Button, Card, Form, InputGroup } from "react-bootstrap"
import { Fetch } from "../../common/proto"
import { create, fromBinary, toBinary, toJson, toJsonString } from "@bufbuild/protobuf"
import { StringValueSchema } from "@bufbuild/protobuf/wkt"
import { test_response, test_responseSchema } from "../../pbes/config/grpc/config_pb"
import { GlobalToastContext } from "../../common/toast"

function Test() {
    const ctx = useContext(GlobalToastContext);

    const [value, setValue] = useState("")
    const [resp, setResp] = useState<test_response | undefined>(undefined)

    return <>
        <InputGroup className="mb-3">
            <Form.Control placeholder="www.example.com" value={value} onChange={(e) => setValue(e.target.value)} />
            <Button
                variant="outline-primary"
                onClick={() => {
                    if (value === "") return
                    let resp = Fetch("/bypass/test", {
                        method: "POST",
                        body: toBinary(StringValueSchema, create(StringValueSchema, { value })),
                        process: async (r) => { return fromBinary(test_responseSchema, new Uint8Array(await r.arrayBuffer())) }
                    })

                    resp.then(async ({ data, error }) => {
                        if (error) ctx.Error(`test failed ${error.code}| ${await error.msg}`)
                        else setResp(await data)
                    })
                }}
            >
                Test
            </Button>
        </InputGroup>

        {
            resp && <Card className="mb-3">
                <Card.Body>
                    <pre>{toJsonString(test_responseSchema, resp, { prettySpaces: 2 })}</pre>
                </Card.Body>
            </Card>
        }
    </>
}

export default Test