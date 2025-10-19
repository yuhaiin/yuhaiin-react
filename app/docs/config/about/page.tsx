"use client"

import { Card } from "react-bootstrap"
import Loading, { Error } from "../../common/loading"
import { useProtoSWR } from "../../common/proto"
import { config_service } from "../../pbes/api/config_pb"
import { ItemList, SettingInputText } from "../components"

export default function About() {
    const { data: info, isLoading, isValidating, error } = useProtoSWR(config_service.method.info)

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || isValidating || !info) return <Loading />

    return <>
        <Card>
            <Card.Body>
                <SettingInputText plaintext className='mb-0' label='Version' value={info?.version ?? ""} />
                <SettingInputText url={"https://github.com/yuhaiin/yuhaiin/commit/" + info?.commit} plaintext className='mb-0' label='Commit' value={info?.commit ?? ""} />
                <SettingInputText plaintext className='mb-0' label='Build Time' value={info?.buildTime ?? ""} />
                <SettingInputText plaintext className='mb-0' label='Go Version' value={info?.goVersion ?? ""} />
                <SettingInputText
                    url="https://github.com/yuhaiin/yuhaiin"
                    plaintext className='mb-0'
                    label='Github'
                    value={"yuhaiin/yuhaiin"}
                />
                <SettingInputText plaintext className='mb-0' label='OS' value={info?.os ?? ""} />
                <SettingInputText plaintext className='mb-0' label='Arch' value={info?.arch ?? ""} />
                <SettingInputText plaintext className='mb-0' label='Compiler' value={info?.compiler ?? ""} />
                <SettingInputText plaintext className='mb-0' label='Platform' value={info?.platform ?? ""} />
                <ItemList title='Build' data={info?.build} mb='mb-0 text-break' />
            </Card.Body>
        </Card>
    </>
}
