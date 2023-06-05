import React, { useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, ListGroup } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { APIUrl } from "./apiurl";

function Subscribe() {
    let linksList: { name: string, url: string }[] = [];
    const [links, setLinks] = useState({ value: linksList });

    useEffect(() => {
        (async () => {

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
        })()
    }, [])

    return (
        <>
            <Card className="mb-3">
                {
                    links.value.map((k) => {
                        return (
                            <ListGroup.Item as={"label"} style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={k.name}>
                                <input className="form-check-input me-1" type="checkbox" name="links" value={k.name} />
                                <a>{k.name}</a>
                            </ListGroup.Item>
                        )
                    })
                }

                <CardHeader>
                    <Button variant="outline-primary" className="me-1">UPDATE</Button>
                    <Button variant="outline-danger">DELETE</Button>
                </CardHeader>
            </Card>

            <Card>
                <Card.Body>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Name</InputGroup.Text>
                        <Form.Control placeholder="Name" aria-label="Name" aria-describedby="basic-addon1" />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Text>Link</InputGroup.Text>
                        <Form.Control placeholder="http://...|https://...|vmess://...|ssr://...|ss://...|trojan://..."
                            aria-label="Link" aria-describedby="basic-addon1" />
                    </InputGroup>

                    <Button variant="outline-primary">ADD</Button>
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