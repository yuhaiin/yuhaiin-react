import React, { useEffect, useState } from "react";
import { Button, Card, FloatingLabel, Form, InputGroup, ListGroup, OverlayTrigger, Popover, Spinner, Tooltip } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { APIUrl } from "./apiurl";
import Loading from "./loading";
import { SettingInputText } from "./config/components";

function Subscribe() {
    let linksList: { name: string, url: string }[] = [];
    const [links, setLinks] = useState({ value: linksList });
    let checkedObj: { [key: string]: boolean } = {};
    const [checked, setChecked] = useState({ value: checkedObj });
    const [updating, setUpdating] = useState({ value: false });
    const [addItem, setAddItem] = useState({ name: "", link: "" });
    const [loading, setLoading] = useState({ value: true })

    const refresh = async () => {
        try {
            const resp = await fetch(
                APIUrl + "/sublist",
                {
                    method: "GET",
                },
            )
            if (!resp.ok) return

            setLinks({ value: await resp.json() })
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
                        </ListGroup>
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
                            <SettingInputText label="Name"
                                value={addItem.name}
                                onChange={(e) => setAddItem({ ...addItem, name: e })}
                            />
                            <SettingInputText label="Link"
                                value={addItem.link}
                                onChange={(e) => setAddItem({ ...addItem, link: e })}
                            />

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
                </>
            }
        </>
    )
}


export default Subscribe;