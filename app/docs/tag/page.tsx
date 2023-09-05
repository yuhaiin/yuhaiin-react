"use client"

import { useEffect, useState } from "react";
import { Badge, Button, Card, FloatingLabel, Form, InputGroup, ListGroup } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import Loading from "../common/loading";
import { save_tag_req as SaveTag } from "../protos/node/grpc/node";
import { tag_type as TagType, tags as Tag } from "../protos/node/tag/tag";
import { manager as Manager } from "../protos/node/node";

function Tags() {
    const [data, setData] = useState<Manager>({ tags: {}, groupsV2: {}, nodes: {} });
    const [currentGroup, setCurrentGroup] = useState("");
    const [saveTag, setSaveTag] = useState<SaveTag>({ tag: "", hash: "", type: TagType.node });
    const [loading, setLoading] = useState({ value: true })

    const updateSaveTag = (modify: (g: SaveTag) => void) => {
        let st = saveTag;
        modify(st);
        setSaveTag({ ...st });
    }

    const refresh = async () => {
        try {
            const resp = await fetch(
                APIUrl + "/taglist",
                {
                    method: "GET",
                },
            )

            if (!resp.ok) return

            setData(Manager.decode(new Uint8Array(await resp.arrayBuffer())))
            setLoading({ value: false })
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => { (async () => await refresh())() }, [])


    const TagItem = (k: string, v: Tag) => {
        return (
            <ListGroup.Item style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={k}>
                <div className="d-flex flex-wrap">
                    <a className="text-decoration-none"
                        href="#empty"
                        onClick={(e) => {
                            e.preventDefault();
                            updateSaveTag((x) => x.tag = k);
                        }}
                    >{k}</a>
                    <Badge className="rounded-pill bg-light text-dark text-truncate ms-1">
                        {v.hash.length === 0 || v.hash[0] === ""
                            ?
                            <>Fallback <i className="bi bi-heart-arrow"></i> Global</>
                            :
                            v.type === TagType.mirror
                                ?
                                <>Mirror <i className="bi bi-arrow-right"></i> {v.hash}</>
                                :
                                <>Target <i className="bi bi-arrow-right"></i> <a href='#empty' className="text-truncate" >{v.hash}</a></>
                        }
                    </Badge>

                    <a
                        className="text-decoration-none ms-auto text-truncate"
                        href='#empty'
                        onClick={async (e) => {
                            e.preventDefault();
                            const resp = await fetch(APIUrl + "/tag?tag=" + k,
                                {
                                    method: "DELETE"
                                }
                            )

                            if (!resp.ok) console.log(await resp.text())
                            else {
                                console.log("delete successful");
                                await refresh();
                            }
                        }}
                    >
                        <i className="bi-trash"></i>DELETE
                    </a>
                </div>
            </ListGroup.Item>
        )
    }

    return (
        <>
            {loading.value && <Loading />}
            {!loading.value &&
                <>
                    <Card className="mb-3">

                        <ListGroup variant="flush">
                            {
                                Object
                                    .entries(data.tags)
                                    .sort((a, b) => { return a <= b ? -1 : 1 })
                                    .map(([k, v]) => { return TagItem(k, v) })
                            }
                        </ListGroup>
                    </Card >

                    < Card className="mb-3" >
                        <Card.Body>
                            <InputGroup className="mb-3">
                                <Form.Check inline
                                    type="radio"
                                    onChange={() => {
                                        updateSaveTag((x) => {
                                            x.type = TagType.node
                                            x.hash = ""
                                        })
                                    }}
                                    checked={saveTag.type === TagType.node}
                                    label="Node"
                                />
                                <Form.Check inline
                                    type="radio"
                                    onChange={() => {
                                        updateSaveTag((x) => {
                                            x.type = TagType.mirror
                                            x.hash = ""
                                        })
                                    }}
                                    checked={saveTag.type === TagType.mirror}
                                    label="Mirror"
                                />
                            </InputGroup>

                            <FloatingLabel label="Tag" className="mb-2" >
                                <Form.Control placeholder="Tag" aria-label="Tag" aria-describedby="basic-addon1"
                                    value={saveTag.tag} onChange={(e) => updateSaveTag((x) => x.tag = e.target.value)}></Form.Control>
                            </FloatingLabel>

                            {saveTag.type === TagType.node ?
                                <>
                                    <FloatingLabel label="Group" className="mb-2" >
                                        <Form.Select defaultValue={""}
                                            onChange={(e) => setCurrentGroup(e.target.value)}>
                                            <option>Choose...</option>
                                            {
                                                Object
                                                    .keys(data.groupsV2)
                                                    .sort((a, b) => { return a <= b ? -1 : 1 })
                                                    .map((k) => {
                                                        return (<option value={k} key={k}>{k}</option>)
                                                    })
                                            }
                                        </Form.Select>
                                    </FloatingLabel>

                                    <FloatingLabel label="Node" className="mb-2" >
                                        <Form.Select defaultValue={""} onChange={(e) => { updateSaveTag((x) => x.hash = e.target.value) }}>
                                            <option value="">Choose...</option>
                                            {
                                                Object
                                                    .entries(data.groupsV2[currentGroup] !== null && data.groupsV2[currentGroup] !== undefined ? data.groupsV2[currentGroup].nodesV2 : {})
                                                    .sort((a, b) => { return a <= b ? -1 : 1 })
                                                    .map(([k, v]) => {
                                                        return (<option value={v} key={k}>{k}</option>)
                                                    })
                                            }
                                        </Form.Select>
                                    </FloatingLabel>
                                </>
                                :
                                <FloatingLabel label="Mirror" className="mb-2" >
                                    <Form.Select defaultValue={""}
                                        onChange={(e) => {
                                            updateSaveTag((x) => x.hash = e.target.value)
                                        }}
                                    >
                                        <option value="">Choose...</option>
                                        {
                                            Object
                                                .keys(data.tags)
                                                .sort((a, b) => { return a <= b ? -1 : 1 })
                                                .map((k) => {
                                                    return (<option value={k} key={k}>{k}</option>)
                                                })
                                        }
                                    </Form.Select>
                                </FloatingLabel>
                            }
                            <Button
                                variant="outline-secondary"
                                onClick={async () => {
                                    if (saveTag.tag === "" || saveTag.hash === "") return

                                    const resp = await fetch(
                                        APIUrl + "/tag",
                                        {
                                            method: "POST",
                                            body: SaveTag.encode(saveTag).finish(),
                                        }
                                    )
                                    if (!resp.ok) console.log(await resp.text())
                                    else {
                                        console.log("add successful");
                                        await refresh();
                                    }
                                }}
                            >
                                Save
                            </Button>

                        </Card.Body>
                    </Card >
                </>
            }
        </>
    )
}

export default Tags;