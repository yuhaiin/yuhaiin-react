
import { create } from '@bufbuild/protobuf';
import { FC, useState } from 'react';
import { join as shlexJoin, split as shlexSplit } from 'shlex';
import { useProtoSWR } from '../common/proto';
import { SettingCheck, SettingSelect, SettingTypeSelect } from "../common/switch";
import { NewItemList, SettingInputText } from '../config/components';
import { inbound } from '../pbes/config/grpc/config_pb';
import { routeSchema, tun, tun_endpoint_driverSchema, tun_platfrom_platform_darwinSchema, tun_platfromSchema } from '../pbes/config/listener/listener_pb';


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

            <SettingInputText label='Name' value={tun.name} onChange={(e: string) => onChange({ ...tun, name: e })} />
            <SettingInputText label='MTU' value={tun.mtu} onChange={(e: string) => { if (!isNaN(Number(e))) onChange({ ...tun, mtu: Number(e) }) }} />
            <SettingInputText label='IPv4' value={tun.portal} onChange={(e: string) => onChange({ ...tun, portal: e })} />
            <SettingInputText label='IPv6' value={tun.portalV6} onChange={(e: string) => onChange({ ...tun, portalV6: e })} />

            {platform?.darwin && platform?.darwin?.networkServices &&
                <SettingSelect
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
            <SettingInputText label='Post Up' value={postUp}
                onChange={(e: string) => {
                    setPostUp(e)
                    try {
                        const cmds = shlexSplit(e)
                        onChange({ ...tun, postUp: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingInputText label='Post Down' value={postDown}
                onChange={(e: string) => {
                    setPostDown(e)
                    try {
                        const cmds = shlexSplit(e)
                        onChange({ ...tun, postDown: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingTypeSelect label='Stack' type={tun_endpoint_driverSchema} value={tun.driver} onChange={(e) => onChange({ ...tun, driver: e })} />

            <NewItemList
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