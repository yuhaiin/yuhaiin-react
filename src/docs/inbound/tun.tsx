import { SettingCheck, SettingInputVertical, SettingSelectVertical, SettingTypeSelect } from "@/component/v2/forms";
import { InputList } from '@/component/v2/listeditor';
import { create } from '@bufbuild/protobuf';
import { FC, useState } from 'react';
import { join as shlexJoin, split as shlexSplit } from 'shlex';
import { useProtoSWR } from '../../common/proto';
import { inbound } from '../pbes/api/config_pb';
import { routeSchema, tun, tun_endpoint_driverSchema, tun_platfrom_platform_darwinSchema, tun_platfromSchema } from '../pbes/config/inbound_pb';


export const Tun: FC<{ tun: tun, onChange: (x: tun) => void }> = ({ tun, onChange }) => {
    const [postUp, setPostUp] = useState(shlexJoin(tun.postUp))
    const [postDown, setPostDown] = useState(shlexJoin(tun.postDown))

    const { data: platform } = useProtoSWR(inbound.method.platform_info)

    return (
        <>
            <SettingCheck
                checked={tun.skipMulticast}
                onChange={() => onChange({ ...tun, skipMulticast: !tun.skipMulticast })}
                label="Skip Multicast"
            />

            <SettingInputVertical label='Name' value={tun.name} onChange={(e: string) => onChange({ ...tun, name: e })} />
            <SettingInputVertical label='MTU' value={tun.mtu.toString()} onChange={(e: string) => { if (!isNaN(Number(e))) onChange({ ...tun, mtu: Number(e) }) }} />
            <SettingInputVertical label='IPv4' value={tun.portal} onChange={(e: string) => onChange({ ...tun, portal: e })} />
            <SettingInputVertical label='IPv6' value={tun.portalV6} onChange={(e: string) => onChange({ ...tun, portalV6: e })} />

            {platform?.darwin && platform?.darwin?.networkServices &&
                <SettingSelectVertical
                    label='DNS Network Service'
                    emptyChoose
                    emptyChooseName="Default"
                    value={tun.platform?.darwin?.networkService ?? ""}
                    values={platform.darwin.networkServices}
                    onChange={(e) => onChange({
                        ...tun, platform: create(tun_platfromSchema,
                            { darwin: create(tun_platfrom_platform_darwinSchema, { networkService: e }) })
                    })}
                />
            }
            <SettingInputVertical label='Post Up' value={postUp}
                onChange={(e: string) => {
                    setPostUp(e)
                    try {
                        const cmds = shlexSplit(e)
                        onChange({ ...tun, postUp: cmds })
                    } catch {
                        // ignore
                    }
                }
                } />
            <SettingInputVertical label='Post Down' value={postDown}
                onChange={(e: string) => {
                    setPostDown(e)
                    try {
                        const cmds = shlexSplit(e)
                        onChange({ ...tun, postDown: cmds })
                    } catch {
                        // ignore
                    }
                }
                } />
            <SettingTypeSelect label='Stack' type={tun_endpoint_driverSchema} value={tun.driver} onChange={(e) => onChange({ ...tun, driver: e })} />

            <InputList
                title='Routes'
                textarea
                dump
                data={tun.route?.routes ?? []}
                onChange={(e) => {
                    onChange({ ...tun, route: { ...(tun.route ? tun.route : create(routeSchema, {})), routes: e ? e : [] } })
                }}
            />
        </>
    )
}