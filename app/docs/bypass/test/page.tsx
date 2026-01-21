"use client"

import { create, toJsonString } from "@bufbuild/protobuf"
import { StringValueSchema } from "@bufbuild/protobuf/wkt"
import { useCallback, useContext, useState } from "react"
import { Button, Card, Form, InputGroup, Spinner } from "react-bootstrap"
import Loading from "../../common/loading"
import { FetchProtobuf } from "../../common/proto"
import { GlobalToastContext } from "../../common/toast"
import { rules, test_response, test_responseSchema } from "../../pbes/api/config_pb"

function Test() {
    const ctx = useContext(GlobalToastContext);

    const [value, setValue] = useState("")
    const [resp, setResp] = useState<test_response | undefined>(undefined)
    const [testing, setTesting] = useState(false)

    const test = useCallback(() => {
        setTesting(true)
        setResp(undefined)
        FetchProtobuf(
            rules.method.test,
            create(StringValueSchema, { value })
        )
            .then(async ({ data, error }) => {
                if (error) ctx.Error(`test failed ${error.code}| ${error.msg}`)
                else setResp(data)
            })
            .finally(() => setTesting(false))
    }, [value, ctx, setResp])

    return (
        <div className="d-flex flex-column gap-3">
            <Card>
                <Card.Body>
                    <InputGroup className="mb-3">
                        <Form.Control
                            placeholder="www.example.com"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    test();
                                }
                            }}
                        />
                        <Button variant="primary" onClick={test} disabled={testing}>
                            {testing ? <Spinner as="span" animation="border" size="sm" /> : <i className="bi bi-play-fill me-2"></i>}
                            Test
                        </Button>
                    </InputGroup>
                    {testing && <Loading />}
                </Card.Body>
            </Card>

            {
                resp && <Card className="mb-3">
                    <Card.Header>
                        <h5 className="mb-0">Test Result</h5>
                    </Card.Header>
                    <Card.Body>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{toJsonString(test_responseSchema, resp, { prettySpaces: 2 })}</pre>
                    </Card.Body>
                </Card>
            }
        </div>
    )
}

export default Test