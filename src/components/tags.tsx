import { useEffect, useState } from "react";
import { Badge, Button, Card, FloatingLabel, Form, InputGroup, ListGroup } from "react-bootstrap";
import { APIUrl } from "./apiurl";
import Loading from "./loading";


function Tags() {
    let tags: { [k: string]: { hash: string, type: string } } = {};
    let groups: { [k: string]: { [k: string]: string } } = {};
    const [data, setData] = useState({ tags: tags, groups: groups });
    const [currentGroup, setCurrentGroup] = useState("");
    const [addType, setAddType] = useState("node");
    const [addTag, setAddTag] = useState({ tag: "" });
    const [addHash, setAddHash] = useState({ hash: "" });
    const [loading, setLoading] = useState({ value: true })

    const refresh = async () => {
        try {
            const resp = await fetch(
                APIUrl + "/taglist",
                {
                    method: "get",
                },
            )

            if (!resp.ok) return

            setData(await resp.json())
            setLoading({ value: false })
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => { (async () => await refresh())() }, [])


    const TagItem = ({ k = "", v = { hash: "", type: "" } }) => {
        return (
            <ListGroup.Item style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={k}>
                <div className="d-flex flex-wrap">
                    <a className="text-decoration-none" href="#" onClick={(e) => { e.preventDefault(); setAddTag({ tag: k }) }}>{k}</a>
                    <Badge className="rounded-pill bg-light text-dark text-truncate ms-1">
                        {v.hash == ""
                            ?
                            <>Fallback <i className="bi bi-heart-arrow"></i> Global</>
                            :
                            v.type == "mirror"
                                ?
                                <>Mirror <i className="bi bi-arrow-right"></i> {v.hash}</>
                                :
                                <>Target <i className="bi bi-arrow-right"></i> <a href='#' className="text-truncate" >{v.hash}</a></>

                        }
                    </Badge>

                    <a
                        className="text-decoration-none ms-auto text-truncate"
                        href='#'
                        onClick={async (e) => {
                            e.preventDefault();
                            const resp = await fetch(APIUrl + "/tag?tag=" + k,
                                {
                                    method: "delete"
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
                        {
                            Object.entries(data.tags).map(([k, v]) => {
                                return (<TagItem v={v} k={k} key={k} />)
                            })
                        }
                    </Card >

                    < Card className="mb-3" >
                        <Card.Body>
                            <InputGroup className="mb-3">
                                <Form.Check inline type="radio" onChange={() => { setAddType("node"); setAddHash({ hash: "" }) }} checked={addType == "node"} label="Node" />
                                <Form.Check inline type="radio" onChange={() => { setAddType("mirror"); setAddHash({ hash: "" }) }} checked={addType == "mirror"} label="Mirror" />
                            </InputGroup>

                            <FloatingLabel label="Tag" className="mb-2" >
                                <Form.Control placeholder="Tag" aria-label="Tag" aria-describedby="basic-addon1"
                                    value={addTag.tag} onChange={(e) => setAddTag({ tag: e.target.value })}></Form.Control>
                            </FloatingLabel>

                            {addType == "node" ?
                                <>
                                    <FloatingLabel label="Group" className="mb-2" >
                                        <Form.Select defaultValue={""} onChange={(e) => setCurrentGroup(e.target.value)}>
                                            <option>Choose...</option>
                                            {
                                                Object.keys(data.groups).map((k) => {
                                                    return (<option value={k} key={k}>{k}</option>)
                                                })
                                            }
                                        </Form.Select>
                                    </FloatingLabel>

                                    <FloatingLabel label="Node" className="mb-2" >
                                        <Form.Select defaultValue={""} onChange={(e) => setAddHash({ hash: e.target.value })}>
                                            <option value="">Choose...</option>
                                            {
                                                Object.entries(data.groups[currentGroup] != null ? data.groups[currentGroup] : {}).map(([k, v]) => {
                                                    return (<option value={v} key={k}>{k}</option>)
                                                })
                                            }
                                        </Form.Select>
                                    </FloatingLabel>
                                </>
                                :
                                <FloatingLabel label="Mirror" className="mb-2" >
                                    <Form.Select defaultValue={""} onChange={(e) => setAddHash({ hash: e.target.value })}>
                                        <option value="">Choose...</option>
                                        {
                                            Object.keys(data.tags).map((k) => {
                                                return (<option value={k} key={k}>{k}</option>)
                                            })
                                        }
                                    </Form.Select>
                                </FloatingLabel>
                            }
                            <Button
                                variant="outline-secondary"
                                onClick={async () => {
                                    if (addTag.tag == "" || addHash.hash == "") return

                                    const resp = await fetch(
                                        APIUrl + "/tag",
                                        {
                                            method: "post",
                                            body: `{"tag":"${addTag.tag}","hash":"${addHash.hash}","type":"${addType}"}`,
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