"use client"

import { FetchProtobuf } from "@/common/proto"
import { Button } from "@/component/v2/button"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Spinner } from "@/component/v2/spinner"
import { GlobalToastContext } from "@/component/v2/toast"
import { ConnectionInfo } from "@/docs/connections/components"
import { connections, notify_remove_connectionsSchema } from "@/docs/pbes/api/statistic_pb"
import { connection } from "@/docs/pbes/statistic/config_pb"
import { create } from "@bufbuild/protobuf"
import { Power } from 'lucide-react'
import React, { FC, useCallback, useContext, useState } from "react"

export const InfoModal: FC<{
    data: connection,
    show: boolean,
    onClose: () => void,
    showNodeModal?: (hash: string) => void
}> = React.memo(({ data, show, onClose: handleClose, showNodeModal }) => {
    const ctx = useContext(GlobalToastContext);
    const [closing, setClosing] = useState(false);

    const closeConnection = useCallback(() => {
        setClosing(true)
        FetchProtobuf(
            connections.method.close_conn,
            create(notify_remove_connectionsSchema, { ids: [data.id] }),
        ).then(({ error }) => {
            if (error) ctx.Error(`code ${data.id} failed, ${error.code}| ${error.msg}`)
            else handleClose()
        }).finally(() => { setClosing(false) })
    }, [setClosing, data.id, ctx])

    return (
        <Modal open={show} onOpenChange={(open) => !open && handleClose()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle className="h5 fw-bold">
                        Connection Details
                    </ModalTitle>
                </ModalHeader>

                <ModalBody className="pt-2">
                    <ConnectionInfo value={data} showNodeModal={showNodeModal} />
                </ModalBody>

                <ModalFooter className="border-top-0 pt-0 pb-3 px-3">
                    <Button
                        variant="danger"
                        className="w-100 py-2 d-flex align-items-center justify-content-center notranslate"
                        disabled={closing}
                        onClick={closeConnection}
                    >
                        {closing ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="me-2"
                                />
                                Disconnecting...
                            </>
                        ) : (
                            <>
                                <Power className="fs-5 me-2" />
                                <span className="fw-bold">Disconnect</span>
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
})