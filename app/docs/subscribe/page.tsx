"use client"

import { useContext, useEffect, useState } from "react";
import { Button, Card, Form, ListGroup, OverlayTrigger, Popover, Spinner } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { APIUrl } from "../apiurl";
import Loading from "../common/loading";
import { SettingInputText } from "../config/components";
import { GlobalToastContext } from "../common/toast";
import { save_link_req as SaveLink, get_links_resp as GetLinks, link_req as LinkReq } from "../protos/node/grpc/node";
import { type as LinkType, link as Link } from "../protos/node/subscribe/subscribe";

function Subscribe() {
    const [links, setLinks] = useState<GetLinks>({ links: {} });
    const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
    const [updating, setUpdating] = useState({ value: false });
    const [addItem, setAddItem] = useState<Link>({ name: "", url: "", type: LinkType.reserve });
    const [loading, setLoading] = useState({ value: true })

    const ctx = useContext(GlobalToastContext);

    const refresh = async () => {
        try {
            const resp = await fetch(
                APIUrl + "/sublist",
                {
                    method: "GET",
                },
            )
            if (!resp.ok) return

            setLinks(GetLinks.decode(new Uint8Array(await resp.arrayBuffer())))
            setLoading({ value: false })
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => { (async () => { await refresh(); })() }, [])

    return (
        <>
            {loading.value && <Loading />}
            {!loading.value &&
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
                                                        let c = checked;
                                                        c[v.name] = e.target.checked
                                                        setChecked({ ...c });
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
                                onClick={async () => {
                                    setUpdating({ value: true });
                                    const resp = await fetch(
                                        `${APIUrl}/sub`,
                                        {
                                            method: "PATCH",
                                            body: LinkReq
                                                .encode({ names: Object.keys(checked).filter((i) => checked[i]) })
                                                .finish()
                                        }
                                    )
                                    setUpdating({ value: false });
                                    if (!resp.ok) {
                                        let err = await resp.text();
                                        ctx.Error(`Update failed. ${err}`)
                                        console.log(err)
                                    } else {
                                        ctx.Info(`Update successfully`);
                                        console.log(`Update successfully`);
                                    }
                                }}
                            >
                                {updating.value && <Spinner animation="border" size="sm" />}UPDATE
                            </Button>
                            <Button
                                variant="outline-danger"
                                onClick={async () => {
                                    const resp = await fetch(
                                        `${APIUrl}/sub`,
                                        {
                                            method: "DELETE",
                                            body: LinkReq
                                                .encode({ names: Object.keys(checked).filter((i) => checked[i]) })
                                                .finish()
                                        }

                                    )
                                    if (!resp.ok) console.log(await resp.text())
                                    else {
                                        await refresh();
                                        console.log("delete successful");
                                    }
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
                                    const resp = await fetch(
                                        `${APIUrl}/sub`,
                                        {
                                            method: "POST",
                                            body: SaveLink.encode({ links: [addItem] }).finish(),
                                        }
                                    )
                                    if (!resp.ok) console.log(await resp.text())
                                    else {
                                        await refresh();
                                        console.log("add successful");
                                    }
                                }}
                            >
                                ADD
                            </Button>
                        </Card.Body>
                    </Card>
                </>
            }
        </>
    )
}


export default Subscribe;