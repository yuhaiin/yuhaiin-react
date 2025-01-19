"use client"

import { create, toJsonString } from "@bufbuild/protobuf"
import { StringValueSchema } from "@bufbuild/protobuf/wkt"
import { useContext, useState } from "react"
import { Button, Card, Form, InputGroup } from "react-bootstrap"
import { FetchProtobuf } from "../../common/proto"
import { GlobalToastContext } from "../../common/toast"
import { bypass, test_response, test_responseSchema } from "../../pbes/config/grpc/config_pb"

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
                    FetchProtobuf(
                        bypass,
                        bypass.method.test,
                        create(StringValueSchema, { value })
                    )
                        .then(async ({ data, error }) => {
                            if (error) ctx.Error(`test failed ${error.code}| ${error.msg}`)
                            else setResp(data)
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