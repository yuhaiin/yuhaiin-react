import { useEffect, useState } from "react";
import { Badge, Button, Card, Form, InputGroup, ListGroup } from "react-bootstrap";
import { APIUrl } from "./apiurl";


function Tags() {
    const [currentGroup, setCurrentGroup] = useState("");
    let tags: { [k: string]: { hash: string, type: string } } = {};
    let groups: { [k: string]: { [k: string]: string } } = {};
    const [data, setData] = useState({ tags: tags, groups: groups });
    const [addType, setAddType] = useState("Node");
    const [addTag, setAddTag] = useState("");

    useEffect(() => {
        (async () => {
            try {
                await fetch(
                    APIUrl + "/taglist",
                    {
                        method: "get",
                    },
                ).then(async (resp) => {
                    setData(await resp.json())
                })

            } catch (e) {
                console.log(e)
            }
        })()

    }, [])


    const TagItem = ({ k = "", v = { hash: "", type: "" } }) => {
        return (
            <ListGroup.Item style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={k}>
                <div className="d-flex flex-wrap">
                    <a className="text-decoration-none" href="#" onClick={(e) => { e.preventDefault(); setAddTag(k) }}>{k}</a>
                    <Badge className="rounded-pill bg-light text-dark text-truncate ms-1">
                        {v.hash == ""
                            ?
                            <>Fallback &rarr; Global</>
                            :
                            v.type == "mirror"
                                ?
                                <>Mirror &rarr; {v.hash}</>
                                :
                                <>Target &rarr; <a href='#' className="text-truncate" >{v.hash}</a></>

                        }
                    </Badge>

                    <a className="text-decoration-none ms-auto text-truncate" href='#'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash"
                            viewBox="0 0 16 16">
                            <path
                                d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path fillRule="evenodd"
                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                        </svg>DELETE
                    </a>
                </div>
            </ListGroup.Item>
        )
    }

    return (
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
                        <Form.Check inline type="radio" onChange={() => setAddType("Node")} checked={addType == "Node"} label="Node" />
                        <Form.Check inline type="radio" onChange={() => setAddType("Mirror")} checked={addType == "Mirror"} label="Mirror" />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">Tag</InputGroup.Text>
                        <Form.Control placeholder="Tag" aria-label="Tag" aria-describedby="basic-addon1" defaultValue={addTag}></Form.Control>
                    </InputGroup>

                    {addType == "Node" ?
                        <>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>Group</InputGroup.Text>
                                <Form.Select defaultValue={""} onChange={(e) => setCurrentGroup(e.target.value)}>
                                    <option>Choose...</option>
                                    {
                                        Object.keys(data.groups).map((k) => {
                                            return (<option value={k} key={k}>{k}</option>)
                                        })
                                    }
                                </Form.Select>
                            </InputGroup>

                            <InputGroup className="mb-3">
                                <InputGroup.Text>Node</InputGroup.Text>
                                <Form.Select defaultValue={""}>
                                    <option value="">Choose...</option>
                                    {
                                        Object.entries(data.groups[currentGroup] != null ? data.groups[currentGroup] : {}).map(([k, v]) => {
                                            return (<option value={v} key={k}>{k}</option>)
                                        })
                                    }
                                </Form.Select>
                            </InputGroup>
                        </>
                        :
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Mirror</InputGroup.Text>
                            <Form.Select defaultValue={""}>
                                <option value="">Choose...</option>
                                {
                                    Object.keys(data.tags).map((k) => {
                                        return (<option value={k} key={k}>{k}</option>)
                                    })
                                }
                            </Form.Select>
                        </InputGroup>
                    }
                    <Button variant="outline-secondary">Save</Button>

                </Card.Body>
            </Card >
        </>
    )
}

export default Tags;