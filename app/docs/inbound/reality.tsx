
import { FC, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { SettingInputText } from '../config/components';
import { reality } from '../pbes/config/inbound_pb';

export const Reality: FC<{ reality: reality, onChange: (x: reality) => void }> = ({ reality, onChange }) => {
    const [newShortID, setNewShortID] = useState({ value: "" });
    const [newServerName, setNewServerName] = useState({ value: "" });

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Reality"} />

            <SettingInputText label='Dest' value={reality.dest} onChange={(e: string) => onChange({ ...reality, dest: e })} />
            <SettingInputText label='Private Key' value={reality.privateKey} onChange={(e: string) => onChange({ ...reality, privateKey: e })} />

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Short ID</Form.Label>


                {
                    reality.shortId.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v}
                                        onChange={(e) => onChange({ ...reality, shortId: [...reality.shortId.slice(0, index), e.target.value, ...reality.shortId.slice(index + 1)] })} />
                                    <Button variant='outline-danger' onClick={() => onChange({ ...reality, shortId: [...reality.shortId.slice(0, index), ...reality.shortId.slice(index + 1)] })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: reality.shortId.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newShortID.value} onChange={(e) => setNewShortID({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => onChange({ ...reality, shortId: [...reality.shortId, newShortID.value] })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>


            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Server Name</Form.Label>
                {
                    reality.serverName.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v}
                                        onChange={(e) => onChange({ ...reality, serverName: [...reality.serverName.slice(0, index), e.target.value, ...reality.serverName.slice(index + 1)] })} />
                                    <Button variant='outline-danger'
                                        onClick={() => onChange({ ...reality, serverName: [...reality.serverName.slice(0, index), ...reality.serverName.slice(index + 1)] })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: reality.serverName.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newServerName.value} onChange={(e) => setNewServerName({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => onChange({ ...reality, serverName: [...reality.serverName, newServerName.value] })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>
        </>
    )
}
