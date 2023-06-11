import React, { useEffect, useState } from "react";
import { Button, Card, FloatingLabel, Form, InputGroup, ListGroup, OverlayTrigger, Popover, Spinner, Tooltip } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { APIUrl } from "./apiurl";

function Subscribe() {
    let linksList: { name: string, url: string }[] = [];
    const [links, setLinks] = useState({ value: linksList });
    let checkedObj: { [key: string]: boolean } = {};
    const [checked, setChecked] = useState({ value: checkedObj });
    const [updating, setUpdating] = useState({ value: false });
    const [addItem, setAddItem] = useState({ name: "", link: "" });

    const refresh = async () => {
        try {
            await fetch(
                APIUrl + "/sublist",
                {
                    method: "get",
                },
            ).then(async (resp) => {
                setLinks({ value: await resp.json() })
            })
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => { (async () => { await refresh(); })() }, [])

    return (
        <>
            <Card className="mb-3">
                {
                    links.value.map((k) => {
                        return (
                            <ListGroup.Item as={"label"} style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={k.name}>
                                <Form.Check
                                    inline
                                    type="checkbox"
                                    checked={checked.value[k.name] != undefined && checked.value[k.name]}
                                    onChange={(e) => {
                                        let v = checked.value;
                                        v[k.name] = e.target.checked
                                        setChecked({ value: v });
                                    }}
                                />

                                <OverlayTrigger overlay={<Popover><Popover.Body>{k.url}</Popover.Body></Popover>}>
                                    <span>{k.name}</span>
                                </OverlayTrigger>
                            </ListGroup.Item>
                        )
                    })
                }

                <CardHeader>
                    <Button
                        variant="outline-primary"
                        className="me-1"
                        disabled={updating.value}
                        onClick={async () => {
                            setUpdating({ value: true });
                            let data = Object.keys(checked.value).filter((i) => checked.value[i]);
                            console.log(data);

                            const resp = await fetch(
                                `${APIUrl}/sub?links=${encodeURIComponent(JSON.stringify(data))}`,
                                {
                                    method: "PATCH"
                                }
                            )
                            setUpdating({ value: false });
                            if (!resp.ok) console.log(await resp.text())
                            else {
                                console.log("update successful");
                            }
                        }}
                    >
                        {updating.value && <Spinner animation="border" size="sm" />}UPDATE
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={async () => {
                            let data = Object.keys(checked.value).filter((i) => checked.value[i]);
                            console.log(data);

                            const resp = await fetch(
                                `${APIUrl}/sub?links=${encodeURIComponent(JSON.stringify(data))}`,
                                {
                                    method: "DELETE"
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
                    <FloatingLabel label="Name" className="mb-2" >
                        <
                            Form.Control
                            placeholder="name"
                            value={addItem.name}
                            onChange={(e) => setAddItem({ ...addItem, name: e.target.value })}
                        />
                    </FloatingLabel>

                    <FloatingLabel label="Link" className="mb-2" >
                        <Form.Control
                            placeholder="http://...|https://...|vmess://...|ssr://...|ss://...|trojan://..."
                            value={addItem.link}
                            onChange={(e) => setAddItem({ ...addItem, link: e.target.value })}
                        />
                    </FloatingLabel>

                    <Button
                        variant="outline-primary"
                        onClick={async () => {
                            if (addItem.name == "" || addItem.link == "") return
                            const resp = await fetch(
                                `${APIUrl}/sub?name=${encodeURIComponent(addItem.name)}&link=${encodeURIComponent(addItem.link)}`,
                                {
                                    method: "POST"
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

            {/*
<div class="card mb-3">

    {{range .LS}}
    <label class="list-group-item" style="border: 0ch; border-bottom: 1px solid #dee2e6;">
        <input class="form-check-input me-1" type="checkbox" name="links" value="{{ (index $.Links .).Name }}" />
        <a href='#' data-bs-toggle="modal" data-bs-target="#linkModal" data-bs-whatever="{{ (index $.Links .).Url }}">
            {{ (index $.Links .).Name }}
        </a>
    </label>
    {{end}}

    <div class="card-header">
        <a class="btn btn-outline-primary" role="button" id="update_button" href=' javascript:update()'>UPDATE</a>
        <a class="btn btn-outline-danger" role="button" href='javascript:delSubs()'>DELETE</a>
    </div>

</div>

<div class="card mb-3">
    <div class="card-body">

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Name</span>
            <input type="text" id="name" class="form-control" placeholder="Name" aria-label="Name"
                aria-describedby="basic-addon1">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Link</span>
            <input type="text" id="link" class="form-control"
                placeholder="http://...|https://...|vmess://...|ssr://...|ss://...|trojan://..." aria-label="Link"
                aria-describedby="basic-addon1">
        </div>

        <button class="btn btn-outline-primary" type="button" onclick="add();">ADD</button>
    </div>
</div>
         */}
        </>
    )
}


export default Subscribe;