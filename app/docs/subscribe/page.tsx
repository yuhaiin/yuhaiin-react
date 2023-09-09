"use client"

import { useContext, useState } from "react";
import { Button, Card, Form, ListGroup, OverlayTrigger, Popover, Spinner } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import Loading from "../common/loading";
import { SettingInputText } from "../config/components";
import { GlobalToastContext } from "../common/toast";
import { save_link_req as SaveLink, get_links_resp as GetLinks, link_req as LinkReq } from "../protos/node/grpc/node";
import { type as LinkType, link as Link } from "../protos/node/subscribe/subscribe";
import useSWR from 'swr'
import { Fetch, ProtoFetcher } from '../common/proto';
import Error from 'next/error';

function Subscribe() {
    const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
    const [updating, setUpdating] = useState({ value: false });
    const [addItem, setAddItem] = useState<Link>({ name: "", url: "", type: LinkType.reserve });
    const { data: links, error, isLoading, mutate } = useSWR("/sublist", ProtoFetcher(GetLinks))
    const ctx = useContext(GlobalToastContext);

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || links === undefined) return <Loading />


    return (
        <>
            <Card className="mb-3">

                <ListGroup variant="flush">
                    {
                        Object.entries(links.links)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, v]) => {
                                return (
                                    <ListGroup.Item as={"label"} style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={v.name}>
                                        <Form.Check
                                            inline
                                            type="checkbox"
                                            checked={checked[v.name] !== undefined && checked[v.name]}
                                            onChange={(e) => {
                                                setChecked((c) => {
                                                    c[v.name] = e.target.checked
                                                    return { ...c }
                                                });
                                            }}
                                        />

                                        <OverlayTrigger overlay={<Popover><Popover.Body>{v.url}</Popover.Body></Popover>}>
                                            <span>{v.name}</span>
                                        </OverlayTrigger>
                                    </ListGroup.Item>
                                )
                            })
                    }
                </ListGroup>
                <CardHeader>
                    <Button
                        variant="outline-primary"
                        className="me-1"
                        disabled={updating.value}
                        onClick={() => {
                            setUpdating({ value: true });
                            Fetch(
                                `/sub`,
                                {
                                    method: "PATCH",
                                    body: LinkReq
                                        .encode({ names: Object.keys(checked).filter((i) => checked[i]) })
                                        .finish()
                                }
                            ).then(async ({ error }) => {
                                if (error !== undefined) ctx.Error(`Update failed ${error.code}| ${await error.msg}`)
                                else ctx.Info(`Update successfully`);
                                setUpdating({ value: false });
                            })
                        }}
                    >
                        {updating.value && <Spinner animation="border" size="sm" />}UPDATE
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={() => {
                            Fetch(`/sub`,
                                {
                                    method: "DELETE",
                                    body: LinkReq
                                        .encode({ names: Object.keys(checked).filter((i) => checked[i]) })
                                        .finish()
                                }
                            ).then(async ({ error }) => {
                                if (error !== undefined) ctx.Error(`delete ${Object.keys(checked)} failed, ${error.code}| ${await error.msg}`)
                                else mutate()
                            })
                        }}
                    >
                        DELETE
                    </Button>
                </CardHeader>
            </Card>

            <Card>
                <Card.Body>
                    <SettingInputText label="Name"
                        value={addItem.name}
                        onChange={(e) => setAddItem({ ...addItem, name: e })}
                    />
                    <SettingInputText label="Link"
                        value={addItem.url}
                        onChange={(e) => setAddItem({ ...addItem, url: e })}
                    />

                    <Button
                        variant="outline-primary"
                        onClick={async () => {
                            if (addItem.name === "" || addItem.url === "") return
                            Fetch(`/sub`, { body: SaveLink.encode({ links: [addItem] }).finish(), })
                                .then(async ({ error }) => {
                                    if (error !== undefined) ctx.Error(`save link ${addItem.url} failed, ${error.code}| ${await error.msg}`)
                                    else mutate()
                                })

                        }}
                    >
                        ADD
                    </Button>
                </Card.Body>
            </Card>
        </>
    )
}


export default Subscribe;