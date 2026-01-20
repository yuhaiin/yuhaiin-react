import { create, toJsonString } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import React, { FC, useContext, useEffect } from "react";
import { Button, ButtonGroup, Dropdown, DropdownButton, Modal } from "react-bootstrap";
import useSWR from 'swr';
import { useClipboard } from '../common/clipboard';
import { InterfacesContext, useInterfaces } from "../common/interfaces";
import Loading, { Error } from "../common/loading";
import { FetchProtobuf, ProtoESFetcher, ProtoPath } from '../common/proto';
import { GlobalToastContext } from "../common/toast";
import { node } from "../pbes/api/node_pb";
import { point, pointSchema } from "../pbes/node/point_pb";
import { Point } from "./protocol";

const NodeModalComponent: FC<{
    hash: string,
    point?: point,
    editable?: boolean,
    show: boolean,
    onHide: () => void,
    onSave?: () => void,
    groups?: string[],
    onDelete?: () => void,
    isNew?: boolean
}> =
    ({ hash, point, editable, show, onHide, onSave, groups, onDelete, isNew }) => {
        const ctx = useContext(GlobalToastContext);

        const interfaces = useInterfaces();
        const { copy } = useClipboard({
            onCopyError: (e) => ctx.Error(`Failed to copy JSON: ${e.message}`),
            usePromptAsFallback: true, // Use prompt as fallback for older browsers or if clipboard access is denied
        });

        // isValidating becomes true whenever there is an ongoing request whether the data is loaded or not
        // isLoading becomes true when there is an ongoing request and data is not loaded yet.
        const { data: nodes, error, isLoading, isValidating, mutate } = useSWR(
            hash === "" ? null : ProtoPath(node.method.get),
            ProtoESFetcher(node.method.get, create(StringValueSchema, { value: hash }), point),
            {
                shouldRetryOnError: false,
                keepPreviousData: false,
                revalidateOnFocus: false,
            })

        useEffect(() => { mutate(); }, [hash, mutate])

        const SaveButton = () => {
            if (!editable) return <></>

            return <Button
                variant="outline-primary"
                disabled={isValidating || isLoading || error || !editable}
                onClick={() => {
                    if (!nodes) return
                    if (isNew) nodes.hash = ""
                    FetchProtobuf(node.method.save, nodes)
                        .then(async ({ error }) => {
                            if (!error) {
                                ctx.Info("save successful")
                                if (onSave) onSave();
                            } else ctx.Error(error.msg)
                        })
                }}
            >
                Save
            </Button >
        }

        const handleCopyJson = () => {
            if (nodes) {
                const jsonString = toJsonString(pointSchema, nodes, { prettySpaces: 2 });
                copy(jsonString);
            }
        };

        return (
            <>
                <Modal
                    show={show}
                    scrollable
                    aria-labelledby="contained-modal-title-vcenter"
                    size='xl'
                    onHide={() => { onHide() }}
                    centered
                >
                    <Modal.Body>

                        <InterfacesContext value={interfaces}>
                            <fieldset disabled={!editable}>
                                {error ?
                                    <>
                                        <Error statusCode={error.code} title={error.msg} raw={error.raw} />
                                    </> :
                                    isValidating || isLoading || !nodes ? <Loading /> :
                                        <Point
                                            value={nodes}
                                            groups={groups}
                                            onChange={(e) => {
                                                if (!editable) return
                                                mutate(prev => { return { ...prev, ...e } }, false)
                                            }}
                                        />
                                }
                            </fieldset>
                        </InterfacesContext>
                    </Modal.Body>

                    <Modal.Footer>
                        {onDelete &&
                            <DropdownButton
                                onSelect={(event) => {
                                    if (event === "ok" && onDelete) {
                                        onHide();
                                        onDelete();
                                    }
                                }}
                                as={ButtonGroup}
                                variant="outline-danger" // Keep variant for now, will remove if custom styling is enough
                                title="Remove"
                            >
                                <Dropdown.Item eventKey={"ok"}>OK</Dropdown.Item>
                                <Dropdown.Item eventKey={"cancel"}>Cancel</Dropdown.Item>
                            </DropdownButton>
                        }
                        {(!error && !isValidating && !isLoading && nodes) &&
                            <Button
                                variant="outline-primary"
                                onClick={handleCopyJson}
                            >
                                Copy JSON
                            </Button>
                        }
                        <Button variant="outline-primary" onClick={onHide}>Close</Button>
                        <SaveButton />
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

export const NodeModal = React.memo(NodeModalComponent)
