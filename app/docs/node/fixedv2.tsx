import { create } from "@bufbuild/protobuf";
import { FC, useContext } from "react";
import { Button, InputGroup, Row } from "react-bootstrap";
import { InterfacesContext } from "../common/interfaces";
import { Container, MoveUpDown, Remind, SettingInputText } from "../config/components";
import { fixedv2, fixedv2_address, fixedv2_addressSchema } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Fixed: FC<Props<fixedv2>> = ({ value, onChange }) => {
    return <Hosts data={value.addresses} onChange={(x) => onChange({ ...value, addresses: x })} />
}

export const Hosts: FC<{ data: fixedv2_address[], onChange: (x: fixedv2_address[]) => void }> =
    ({ data, onChange }) => {
        const interfaces = useContext(InterfacesContext);

        const reminds = interfaces.map((v) => {
            if (!v.name) return undefined
            const r: Remind = {
                label: v.name,
                value: v.name,
                label_children: v.addresses?.map((vv) => !vv ? "" : vv)
            }
            return r
        })
            .filter((e): e is Exclude<Remind, null | undefined> => !!e)

        return <>
            {
                data && data.map((v, index) => {
                    return (
                        <Row key={index}>
                            <InputGroup className="mb-2" >
                                <Container
                                    moveUpDown={new MoveUpDown(data, index, onChange)}
                                    title={(index + 1).toString()}
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
                                            label="Network Interface"
                                            value={v.networkInterface}
                                            reminds={reminds}
                                            onChange={(e) => {
                                                onChange([...data.slice(0, index), { ...v, networkInterface: String(e) }, ...data.slice(index + 1)])
                                            }}
                                        />

                                    </>
                                </Container>
                            </InputGroup>
                        </Row>
                    )
                })
            }

            <Row>
                <InputGroup className="mb-2 justify-content-md-end" >
                    <Button variant='outline-success' onClick={() => {
                        onChange([...data, create(fixedv2_addressSchema, {
                            host: "",
                            networkInterface: ""
                        })])
                    }} >
                        <i className="bi bi-plus-lg" />
                    </Button>
                </InputGroup>
            </Row>
        </>
    }