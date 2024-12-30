import { FC, JSX, useState } from "react";
import { Button, ButtonGroup, Card, Col, Collapse, Dropdown, DropdownItem, DropdownMenu, Form, InputGroup, Row } from "react-bootstrap";

export class Remind {
    label: string
    label_children?: (string[] | null)
    value: string

    constructor(data: { label: string, label_children?: (string[] | null), value: string }) {
        this.label = data.label;
        this.value = data.value;
        this.label_children = data.label_children
    }
}

export const SettingInputText: FC<{
    label: string,
    value: string | number,
    url?: string,
    plaintext?: boolean,
    onChange?: (x: string) => void,
    reminds?: Remind[] | null,
    placeholder?: string,
    errorMsg?: string,
    className?: string
}> = ({ label, value, url, plaintext, onChange, reminds, placeholder, errorMsg, className }) => {
    const dropdown = () => {
        if (!reminds || !reminds.length) return <></>

        return <Dropdown>
            <Dropdown.Toggle variant='outline-secondary' id="dropdown-basic" />
            <DropdownMenu style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {
                    reminds.map((v) => {
                        return <DropdownItem
                            key={v.value}
                            onClick={() => onChange && onChange(v.value)}>
                            <b>{v.label}</b>
                            {
                                v.label_children &&
                                v.label_children.map((vv) => {
                                    return <div key={vv}><span className="text-body-secondary">{vv}</span></div>
                                })
                            }
                        </DropdownItem>
                    })
                }
            </DropdownMenu>
        </Dropdown>
    }

    return (
        <Form.Group as={Row} className={className !== undefined ? className : "mb-2"}>
            <Form.Label column sm={2} className="nowrap">{label}</Form.Label>
            <Col sm={10}>
                <InputGroup hasValidation={errorMsg ? true : false}>
                    {dropdown()}
                    {url
                        ?
                        <a className="mt-1" href={url} target="_blank">{value}</a>
                        :
                        <>
                            <Form.Control
                                value={value}
                                plaintext={plaintext}
                                placeholder={placeholder}
                                isInvalid={errorMsg ? true : false}
                                onChange={(v) => { if (onChange) onChange(v.target.value) }}
                            />
                            {
                                errorMsg && <Form.Control.Feedback type="invalid">{errorMsg}</Form.Control.Feedback>
                            }
                        </>}

                </InputGroup>
            </Col>
        </Form.Group >
    )
}

export const SettingInputTextarea = (props: { label: string, value: string | number | undefined, onChange: (x: string) => void }) => {
    return (
        <Form.Group as={Row} className='mb-2'>
            <Form.Label column sm={2} className="nowrap">{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Control as="textarea" rows={5} value={props.value} onChange={(v) => props.onChange(v.target.value)} />
            </Col>
        </Form.Group>
    )
}

export const NewItemList: FC<{
    title: string,
    data: string[],
    onChange: (x: string[]) => void, errorMsgs?: { [key: string]: string },
    beforeContent?: JSX.Element
}> =
    ({ title, data, onChange, errorMsgs, beforeContent }) => {
        const [newData, setNewData] = useState({ value: "" });

        return (<Form.Group as={Row}>
            <Form.Label column sm={2} className="nowrap">{title}</Form.Label>

            {beforeContent &&
                <Col sm={{ span: 10 }} >
                    {beforeContent}
                </Col>
            }

            {
                data &&
                data.map((v, index) => {
                    return (
                        <Col sm={{ span: 10, offset: (beforeContent || index !== 0) ? 2 : 0 }} key={index} >
                            <InputGroup className="mb-2" hasValidation={errorMsgs && errorMsgs[v] ? true : false}>
                                <Form.Control
                                    onChange={(e) => { onChange([...data.slice(0, index), e.target.value, ...data.slice(index + 1)]) }}
                                    isInvalid={errorMsgs && errorMsgs[v] ? true : false}
                                    value={v}
                                />


                                <Button variant='outline-danger' onClick={() => { onChange([...data.slice(0, index), ...data.slice(index + 1)]) }}>
                                    <i className="bi bi-x-lg" ></i>
                                </Button>

                                {errorMsgs && errorMsgs[v] && <Form.Control.Feedback type="invalid">{errorMsgs[v]}</Form.Control.Feedback>}
                            </InputGroup>
                        </Col>
                    )
                })
            }


            <Col sm={{ span: 10, offset: (beforeContent || data?.length !== 0) ? 2 : 0 }}>
                <InputGroup>
                    <Form.Control value={newData.value} onChange={(e) => setNewData({ value: e.target.value })} />
                    <Button variant='outline-success' onClick={() => { onChange([...data, newData.value]) }} >
                        <i className="bi bi-plus-lg" />
                    </Button>
                </InputGroup>
            </Col>

        </Form.Group >)
    }


export const NewBytesItemList: FC<{ title: string, data?: Uint8Array[], onChange: (x: Uint8Array[]) => void, textarea?: boolean }> =
    ({ title, data, onChange, textarea }) => {
        const [newData, setNewData] = useState({ value: "" });

        return (<Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2} className="nowrap">{title}</Form.Label>


            {data && data.map((v, index) => {
                return (
                    <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={"bi-" + index} >
                        <InputGroup className="mb-2" >
                            <Form.Control
                                value={new TextDecoder().decode(v)}
                                as={textarea ? "textarea" : undefined}
                                onChange={(e) => { onChange([...data.slice(0, index), new TextEncoder().encode(e.target.value), ...data.slice(index + 1)]) }}
                            />
                            <Button
                                variant='outline-danger'
                                onClick={() => { onChange([...data.slice(0, index), ...data.slice(index + 1)]) }}>
                                <i className="bi bi-x-lg" ></i>
                            </Button>
                        </InputGroup>
                    </Col>
                )
            })
            }

            <Col sm={{ span: 10, offset: data?.length !== 0 ? 2 : 0 }}>
                <InputGroup className="mb-2" >
                    <Form.Control
                        as={textarea ? "textarea" : undefined}
                        value={newData.value}
                        onChange={(e) => setNewData({ value: e.target.value })}
                    />
                    <Button variant='outline-success' onClick={() => {
                        if (data) onChange([...data, new TextEncoder().encode(newData.value)])
                        else onChange([new TextEncoder().encode(newData.value)])
                    }} >
                        <i className="bi bi-plus-lg" />
                    </Button>
                </InputGroup>
            </Col>

        </Form.Group>)
    }

export function ItemList(props: {
    title: string,
    mb?: string,
    data: string[] | null | undefined,
}) {

    return <Form.Group as={Row} className={props.mb ? props.mb : "mb-2"}>

        <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>

        <Col sm={{ span: 10, offset: 0 }}>
            <InputGroup className={props.mb ? props.mb : "mb-2"} ></InputGroup>
        </Col>

        {
            props.data && props.data
                .map((v, index) => {
                    return (
                        <Col sm={{ span: 10, offset: 2 }} className="mt-0" key={index} >
                            <InputGroup className={props.mb ? props.mb : "mb-2"} >
                                {v}
                            </InputGroup>
                        </Col>
                    )
                })
        }

    </Form.Group>
}

export type Drag = {
    draggable: boolean
    onDragStart: (i: number) => void
    onDrop: (i: number) => void
}

export class MoveUpDown<T> {
    current: number
    elems: T[]
    onmove: (x: T[]) => void
    drag?: Drag

    move = (up: boolean) => {
        if (this.elems.length <= 1) return
        if (up && this.current === 0) return
        if (!up && this.current === this.elems.length - 1) return
        const rules = [...this.elems]
        const tmp = rules[this.current]
        rules[this.current] = rules[this.current + (up ? -1 : 1)]
        rules[this.current + (up ? -1 : 1)] = tmp
        this.onmove(rules)
    }

    length = () => this.elems.length

    isTop = () => this.current === 0
    isBottom = () => this.current === this.elems.length - 1

    constructor(elems: T[], current: number, onmove: (x: T[]) => void, drag?: Drag) {
        this.current = current
        this.elems = elems
        this.onmove = onmove
        this.drag = drag
    }
}


export function Container<T>(props: {
    title: string,
    onClose?: () => void,
    hideClose?: boolean,
    moveUpDown?: MoveUpDown<T>,
    children: JSX.Element,
    fold?: boolean,
    as?: React.ElementType,
    className?: string
}) {
    const [fold, setFold] = useState({ value: false })
    const [dragOvering, setDragOvering] = useState(false)
    const [clicking, setClicking] = useState(false)

    const getBorderColor = () => {
        if (dragOvering) return "success"
        if (clicking) return "primary"
        return undefined
    }

    return <>
        <Card
            as={props.as}
            border={getBorderColor()}
            className={"flex-grow-1 form-floating" + props.className ? " " + props.className : ""}
            onDragOver={(e) => {
                e.preventDefault()
                setDragOvering(true)
            }}
            onDragLeave={(e) => {
                e.preventDefault()
                setDragOvering(false)
            }}
            onDragEnd={() => {
                setDragOvering(false)
            }}
            onDrop={() => {
                setDragOvering(false)
                props.moveUpDown?.drag?.onDrop(props.moveUpDown.current)
            }}
        >
            <Card.Header
                draggable={props.moveUpDown?.drag?.draggable}
                onDragEnd={() => {
                    setDragOvering(false)
                }}
                onDragStart={() => {
                    setClicking(false)
                    if (props.moveUpDown && props.moveUpDown.drag) props.moveUpDown.drag.onDragStart(props.moveUpDown.current)
                }}
                style={props.fold ? { cursor: 'pointer', backgroundColor: "#00000000", borderBottom: "0px", padding: "0px" } : {}}
                className={"d-flex justify-content-between align-items-center"}
                onClick={() => props.fold && setFold(prev => { return { value: !prev.value } })}
                onMouseDown={() => {
                    setClicking(true)
                }}
                onMouseUp={() => {
                    setClicking(false)
                }}
                aria-controls={"example-collapse-text"}
                aria-expanded={fold.value}
            >
                {props.title}
                {
                    (!props.hideClose || props.moveUpDown) &&
                    <ButtonGroup>
                        {!props.moveUpDown?.isTop() &&
                            <Button variant="outline-primary" size="sm" onClick={(e) => {
                                e.stopPropagation()
                                props.moveUpDown?.move(true)
                            }}>
                                <i className="bi bi-arrow-up"></i>
                            </Button>}
                        {!props.moveUpDown?.isBottom() &&
                            <Button variant="outline-primary" size="sm" onClick={(e) => {
                                e.stopPropagation()
                                props.moveUpDown?.move(false)
                            }}>
                                <i className="bi bi-arrow-down"></i>
                            </Button>}
                        {!props.hideClose &&
                            <Button variant='outline-danger' size="sm" onClick={(e) => {
                                e.stopPropagation()
                                props.onClose()
                            }}>
                                <i className="bi bi-x-lg"></i>
                            </Button>
                        }
                    </ButtonGroup>
                }
            </Card.Header>

            {props.fold && <Collapse in={fold.value}><div id="example-collapse-text"><Card.Body>{props.children}</Card.Body></div></Collapse>}
            {!props.fold && <Card.Body>{props.children}</Card.Body>}

        </Card>
    </>
}

