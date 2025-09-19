"use client"

import { FC } from "react"
import { ListGroup, Tab, Tabs } from "react-bootstrap"
import Loading, { Error } from "../../common/loading"
import { useProtoSWR } from "../../common/proto"
import { License, tools } from "../../pbes/tools/tools_pb"

export default function Licenses() {
    const { data, isLoading, isValidating, error } = useProtoSWR(tools.method.licenses, { revalidateOnFocus: false })

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || isValidating || !data) return <Loading />

    return <>
        {/* <Tab.Container defaultActiveKey="yuhaiin">
            <Row>
                <Col sm={2}>
                    <Nav variant="pills" className="flex-column mt-2">
                        <Nav.Item>
                            <Nav.Link eventKey="yuhaiin">Yuhaiin</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="android">Android</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
                <Col sm={9}>
                    <Tab.Content className="mt-2">
                        <Tab.Pane eventKey="yuhaiin"><LicensesList value={data.yuhaiin} /></Tab.Pane>
                        <Tab.Pane eventKey="android"><LicensesList value={data.android} /></Tab.Pane>
                    </Tab.Content>
                </Col>
            </Row>
        </Tab.Container> */}

        <Tabs defaultActiveKey={"yuhaiin"}>
            <Tab title="Yuhaiin" eventKey="yuhaiin">
                <LicensesList value={data.yuhaiin} />
            </Tab>
            <Tab title="Android" eventKey="android">
                <LicensesList value={data.android} />
            </Tab>
        </Tabs>
    </>
}


const LicensesList: FC<{ value: License[] }> = ({ value }) => {
    return <>
        <ListGroup>
            {value.map((v, i) => {
                return <ListGroup.Item key={i}>
                    {i + 1}. <a className="text-break" href={v.url}>{v.name}</a> (<a className="text-break" href={v.licenseUrl}>{v.license}</a>)
                </ListGroup.Item>
            })}
        </ListGroup>
    </>
}