"use client"

import { create, toJsonString } from "@bufbuild/protobuf"
import { StringValueSchema } from "@bufbuild/protobuf/wkt"
import { useCallback, useContext, useState } from "react"
import { Button, Card, Form, InputGroup } from "react-bootstrap"
import { FetchProtobuf } from "../../common/proto"
import { GlobalToastContext } from "../../common/toast"
import { rules, test_response, test_responseSchema } from "../../pbes/api/config_pb"

function Test() {
    const ctx = useContext(GlobalToastContext);

    const [value, setValue] = useState("")
    const [resp, setResp] = useState<test_response | undefined>(undefined)

    const test = useCallback(() => {
        FetchProtobuf(
            rules.method.test,
            create(StringValueSchema, { value })
        )
            .then(async ({ data, error }) => {
                if (error) ctx.Error(`test failed ${error.code}| ${error.msg}`)
                else setResp(data)
            })
    }, [value, ctx, setResp])

    return <>
        <InputGroup className="mb-3">
            <Form.Control placeholder="www.example.com" value={value} onChange={(e) => setValue(e.target.value)} />
            <Button variant="outline-primary" onClick={test}>
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