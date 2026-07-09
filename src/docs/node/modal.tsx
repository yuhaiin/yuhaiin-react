"use client"

import { Button } from "@/component/v2/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { clone, create, toJsonString } from "@/common/plain";
import { StringValueSchema } from "@/common/plain";
import { Clipboard, ClipboardCheck, Trash } from 'lucide-react';
import React, { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { InterfacesContext, useInterfaces } from "../../common/interfaces";
import { FetchHTTP, HttpFetcher, ApiPath } from '../../common/http';
import { useClipboard } from '../../component/v2/clipboard';
import Loading, { Error as ErrorDisplay } from "../../component/v2/loading";
import { node } from "@/common/api";
import { point, pointSchema } from "../schema/node/point";
import { Point, normalizePoint, toPlainPoint } from "./protocol";

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
        const { t } = useTranslation(['node', 'common']);
        const ctx = useContext(GlobalToastContext);
        const [draftPoint, setDraftPoint] = useState<point | undefined>(undefined);

        const interfaces = useInterfaces();
        const { copy, copied, manualCopyModal } = useClipboard({
            onCopyError: (e) => ctx.Error(t('copyFailed', { message: e.message })),
            usePromptAsFallback: true, // Use prompt as fallback for older browsers or if clipboard access is denied
        });

        useEffect(() => {
            if (copied) ctx.Info(t('copySuccess'))
        }, [copied, ctx, t])

        const hasLocalPoint = point !== undefined || isNew;
        const shouldFetch = show && !hasLocalPoint && hash !== "";

        // isValidating becomes true whenever there is an ongoing request whether the data is loaded or not
        // isLoading becomes true when there is an ongoing request and data is not loaded yet.
        const { data: rawNodes, error, isLoading, isValidating, mutate } = useSWR(
            shouldFetch ? `${ApiPath(node.method.get)}:${hash}` : null,
            shouldFetch ? HttpFetcher(node.method.get, create(StringValueSchema, { value: hash })) : null,
            {
                shouldRetryOnError: false,
                keepPreviousData: false,
                revalidateOnFocus: false,
            })
        const nodes = draftPoint ?? (rawNodes ? normalizePoint(rawNodes) : undefined);

        useEffect(() => {
            if (!hasLocalPoint) {
                setDraftPoint(undefined);
                return;
            }
            setDraftPoint(normalizePoint(point ?? create(pointSchema, {})));
        }, [hash, point, hasLocalPoint])

        useEffect(() => {
            if (shouldFetch) void mutate();
        }, [shouldFetch, mutate])

        const handleCopyJson = () => {
            if (nodes) {
                const jsonString = toJsonString(pointSchema, nodes, { prettySpaces: 2 });
                copy(jsonString);
            }
        };

        return (
            <>
                {manualCopyModal}

                <Modal open={show} onOpenChange={(open) => !open && onHide()}>
                    <ModalContent className="!max-w-[1000px] !w-fit md:min-w-[600px] min-w-[90vw]">
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
                                                    if (hasLocalPoint) {
                                                        setDraftPoint(prev => normalizePoint({ ...(prev ?? {}), ...e }));
                                                    } else {
                                                        mutate(prev => normalizePoint({ ...(prev ?? {}), ...e }), false)
                                                    }
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
                                            <Button variant="outline-danger"><Trash size={16} className="mr-2" />{t('common:action.remove')}</Button>
                                        </DropdownTrigger>
                                        <DropdownContent>
                                            <DropdownItem className="text-red-500 font-bold" onSelect={() => { onHide(); onDelete(); }}>{t('common:action.confirmDelete')}</DropdownItem>
                                            <DropdownItem>{t('common:action.cancel')}</DropdownItem>
                                        </DropdownContent>
                                    </Dropdown>
                                }
                            </div>
                            <div className="flex gap-2">
                                {(!error && !isValidating && !isLoading && nodes) &&
                                    <Button
                                        onClick={handleCopyJson}
                                    >
                                        {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                                    </Button>
                                }
                                <Button onClick={onHide}>{t('common:action.close')}</Button>
                                {editable && (
                                    <Button
                                        disabled={isValidating || isLoading || !!error}
                                        onClick={() => {
                                            if (!nodes) return
                                            const next = toPlainPoint(clone(pointSchema, nodes));
                                            if (isNew) next.hash = ""
                                            FetchHTTP(node.method.save, next)
                                                .then(async ({ error }) => {
                                                    if (!error) {
                                                        ctx.Info(t('saveSuccess'))
                                                        if (onSave) onSave();
                                                    } else ctx.Error(error.msg)
                                                })
                                        }}
                                    >
                                        {isValidating || isLoading ? <Spinner size="sm" /> : t('common:action.save')}
                                    </Button>
                                )}
                            </div>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        );
    }

export const NodeModal = React.memo(NodeModalComponent)
