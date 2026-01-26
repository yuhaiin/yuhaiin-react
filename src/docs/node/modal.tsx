"use client"

import { Button } from "@/component/v2/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { create, toJsonString } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { Clipboard, ClipboardCheck } from 'lucide-react';
import React, { FC, useContext, useEffect } from "react";
import useSWR from 'swr';
import { InterfacesContext, useInterfaces } from "../../common/interfaces";
import { FetchProtobuf, ProtoESFetcher, ProtoPath } from '../../common/proto';
import { useClipboard } from '../../component/v2/clipboard';
import Loading, { Error as ErrorDisplay } from "../../component/v2/loading";
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
    readOnly?: boolean,
    isNew?: boolean
}> =
    ({ hash, point, editable, show, onHide, onSave, groups, onDelete, isNew }) => {
        const ctx = useContext(GlobalToastContext);

        const interfaces = useInterfaces();
        const { copy, copied } = useClipboard({
            onCopyError: (e) => ctx.Error(`Failed to copy JSON: ${e.message}`),
            usePromptAsFallback: true, // Use prompt as fallback for older browsers or if clipboard access is denied
        });

        useEffect(() => {
            if (copied) ctx.Info("Copied JSON to clipboard")
        }, [copied])

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
                disabled={isValidating || isLoading || !!error || !editable}
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
                {isValidating || isLoading ? <Spinner size="sm" /> : "Save"}
            </Button >
        }

        const handleCopyJson = () => {
            if (nodes) {
                const jsonString = toJsonString(pointSchema, nodes, { prettySpaces: 2 });
                copy(jsonString);
            }
        };

        return (
            <Modal open={show} onOpenChange={(open) => !open && onHide()}>
                <ModalContent style={{ maxWidth: '1000px' }}>
                    <ModalHeader closeButton className="border-b-0 pb-0">
                        <ModalTitle className="font-bold">{nodes?.name || hash}</ModalTitle>
                    </ModalHeader>

                    <ModalBody className="pt-2">
                        <InterfacesContext.Provider value={interfaces}>
                            {error ?
                                <ErrorDisplay statusCode={error.code} title={error.msg} raw={error.raw} /> :
                                isValidating || isLoading || !nodes ? <Loading /> :
                                    <div className="p-1">
                                        <Point
                                            editable={editable}
                                            value={nodes}
                                            groups={groups}
                                            onChange={(e) => {
                                                if (!editable) return
                                                mutate(prev => { return { ...prev, ...e } }, false)
                                            }}
                                        />
                                    </div>
                            }
                        </InterfacesContext.Provider>
                    </ModalBody>

                    <ModalFooter className="flex justify-between">
                        <div>
                            {onDelete &&
                                <Dropdown>
                                    <DropdownTrigger asChild>
                                        <Button variant="outline-danger">Remove</Button>
                                    </DropdownTrigger>
                                    <DropdownContent>
                                        <DropdownItem className="text-danger font-bold" onSelect={() => { onHide(); onDelete(); }}>Confirm Delete</DropdownItem>
                                        <DropdownItem>Cancel</DropdownItem>
                                    </DropdownContent>
                                </Dropdown>
                            }
                        </div>
                        <div className="flex gap-2">
                            {(!error && !isValidating && !isLoading && nodes) &&
                                <Button
                                    onClick={handleCopyJson}
                                >
                                    {copied ? <ClipboardCheck /> : <Clipboard />}
                                </Button>
                            }
                            <Button onClick={onHide}>Close</Button>
                            <SaveButton />
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }

export const NodeModal = React.memo(NodeModalComponent)
