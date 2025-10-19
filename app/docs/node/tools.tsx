import { create } from "@bufbuild/protobuf"
import { FC } from "react"
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap"
import { Container, MoveUpDown, SettingInputText } from "../config/components"
import { host, hostSchema } from "../pbes/node/protocol_pb"

export type Props<T> = {
    value: T,
    onChange: (x: T) => void
}

export const NewAlternateHostList: FC<{ title: string, data: host[], onChange: (x: host[]) => void }> =
    ({ title, data, onChange }) => {
        return (
            <Form.Group as={Row} className='mb-3 flex-grow-1 overflow-auto'>
                <Form.Label column sm={2} className="nowrap">{title}</Form.Label>
                {
                    data && data.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Container
                                        moveUpDown={new MoveUpDown(data, index, onChange)}
                                        title="Host"
                                        className="flex-grow-1"
                                        onClose={() => {
                                            if (data) { onChange([...data.slice(0, index), ...data.slice(index + 1)]) }
                                        }}>
                                        <>
                                            <SettingInputText
                                                label="Host"
                                                value={v.host}
                                                onChange={(e: string) => { onChange([...data.slice(0, index), { ...v, host: e }, ...data.slice(index + 1)]) }}
                                            />

                                            <SettingInputText
                                                label="Port"
                                                value={v.port}
                                                onChange={(e) => {
                                                    if (isNaN(Number(e)) || Number(e) < 0 || Number(e) > 65535) return
                                                    onChange([...data.slice(0, index), { ...v, port: Number(e) }, ...data.slice(index + 1)])
                                                }}
                                            />

                                        </>
                                    </Container>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: data?.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2 justify-content-md-end" >
                        <Button variant='outline-success' onClick={() => { onChange([...data, create(hostSchema, {})]) }} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>

            </Form.Group>)
    }