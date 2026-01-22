"use client"

import { Card, CardBody, CardHeader, IconBox, ListItem, MainContainer } from '@/app/component/cardlist';
import { FC } from "react";
import { Badge, Nav, Tab } from "react-bootstrap";
import Loading, { Error } from "../../../component/loading";
import { useProtoSWR } from "../../common/proto";
import { tools } from "../../pbes/api/tools_pb";
import { License } from "../../pbes/tools/tools_pb";

const LicenseItem: FC<{ item: License, index: number }> = ({ item, index }) => {
    return (
        <div className="col-12">
            <ListItem style={{ cursor: 'default' }}>
                <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3">
                    {/* Index or Icon */}
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '32px', height: '32px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {index + 1}
                    </div>

                    {/* Content */}
                    <div className="d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-truncate">{item.name}</span>
                            <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 py-1 px-2" style={{ fontSize: '0.65rem' }}>
                                {item.license}
                            </Badge>
                        </div>

                        <div className="d-flex flex-column gap-1">
                            <a href={item.url} target="_blank" rel="noreferrer"
                                className="text-muted small text-truncate text-decoration-none font-monospace opacity-75 hover-opacity-100">
                                <i className="bi bi-link-45deg me-1"></i>{item.url}
                            </a>
                            <a href={item.licenseUrl} target="_blank" rel="noreferrer"
                                className="text-muted small text-truncate text-decoration-none font-monospace opacity-75">
                                <i className="bi bi-shield-check me-1"></i>License Source
                            </a>
                        </div>
                    </div>
                </div>
            </ListItem>
        </div>
    );
};

const LicensesList: FC<{ value: License[] }> = ({ value }) => {
    return (
        <div className="row g-2">
            {value.map((v, i) => (
                <LicenseItem key={i} item={v} index={i} />
            ))}
        </div>
    );
};

export default function Licenses() {
    const { data, isLoading, isValidating, error } = useProtoSWR(tools.method.licenses, { revalidateOnFocus: false });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || isValidating || !data) return <Loading />

    return (
        <MainContainer>
            <Card>
                <CardHeader>
                    <IconBox icon="file-earmark-medical" color="#10b981" title="Open Source Licenses" description="Third-party credits and legal info" />
                </CardHeader>

                <Tab.Container defaultActiveKey="yuhaiin">
                    <CardBody className="p-4">
                        {/* Top-mounted Tab Navigation styled as a modern toggle bar */}
                        <div className="bg-light bg-opacity-5 p-1 rounded-3 mb-4 d-inline-flex shadow-sm border border-secondary border-opacity-10" style={{ minWidth: '240px' }}>
                            <Nav variant="pills" className="w-100">
                                <Nav.Item className="flex-grow-1">
                                    <Nav.Link eventKey="yuhaiin" className="text-center py-2">
                                        Core (Yuhaiin)
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className="flex-grow-1">
                                    <Nav.Link eventKey="android" className="text-center py-2">
                                        Android UI
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>

                        {/* List Content */}
                        <Tab.Content>
                            <Tab.Pane eventKey="yuhaiin">
                                <LicensesList value={data.yuhaiin} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="android">
                                <LicensesList value={data.android} />
                            </Tab.Pane>
                        </Tab.Content>
                    </CardBody>
                </Tab.Container>
            </Card>

            <div className="text-center mt-4 opacity-50 pb-5">
                <small className="text-muted">
                    <i className="bi bi-heart-fill text-danger me-1"></i>
                    Built with love and open-source software.
                </small>
            </div>
        </MainContainer>
    );
}