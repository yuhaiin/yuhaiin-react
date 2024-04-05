"use client"

import { useContext, useState } from "react";
import { Button, Card, Form, ListGroup, OverlayTrigger, Popover, Spinner } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import Loading from "../common/loading";
import { SettingInputText } from "../config/components";
import { GlobalToastContext } from "../common/toast";
import useSWR from 'swr'
import { Fetch, ProtoESFetcher, } from '../common/proto';
import Error from 'next/error';
import { link, type } from "../pbes/node/subscribe/subscribe_pb";
import { get_links_resp, link_req, save_link_req } from "../pbes/node/grpc/node_pb";

function Subscribe() {
    const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
    const [updating, setUpdating] = useState({ value: false });
    const [addItem, setAddItem] = useState<link>(new link({ name: "", url: "", type: type.reserve }));
    const { data: links, error, isLoading, mutate } = useSWR("/sublist", ProtoESFetcher<get_links_resp>(new get_links_resp()))
    const ctx = useContext(GlobalToastContext);

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || links === undefined) return <Loading />


    return (
        <>
            <Card className="mb-3">

                <ListGroup variant="flush">
                    {
                        links.links !== null && Object.entries(links.links)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, vv]) => {
                                const v = new link(vv);
                                return (
                                    <ListGroup.Item
                                        style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                                        key={v.name}
                                        action
                                        as={"button"}
                                        onClick={() => {
                                            checked[v.name] = !checked[v.name]
                                            setChecked({ ...checked })
                                        }}
                                    >
                                        <Form.Check
                                            inline
                                            type="checkbox"
                                            checked={checked[v.name]}
                                        />

                                        <OverlayTrigger trigger="click" placement="auto-end" overlay={<Popover><Popover.Body>{v.url}</Popover.Body></Popover>}>
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
                                    body: new link_req({ names: Object.keys(checked).filter((i) => checked[i]) }).toBinary()
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
                                    body: new link_req({ names: Object.keys(checked).filter((i) => checked[i]) }).toBinary()
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
                        onChange={(e) => setAddItem(new link({ ...addItem, name: e }))}
                    />
                    <SettingInputText label="Link"
                        value={addItem.url}
                        onChange={(e) => setAddItem(new link({ ...addItem, url: e }))}
                    />

                    <Button
                        variant="outline-primary"
                        onClick={async () => {
                            if (addItem.name === "" || addItem.url === "") return
                            Fetch(`/sub`, { body: new save_link_req({ links: [addItem] }).toBinary(), })
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