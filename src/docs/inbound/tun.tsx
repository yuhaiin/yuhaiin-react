import { SettingCheck, SettingInputVertical, SettingSelectVertical, SettingTypeSelect } from "@/component/v2/forms";
import { InputList } from '@/component/v2/listeditor';
import { create } from '@/common/plain';
import { FC, useMemo, useState } from 'react';
import { join as shlexJoin, split as shlexSplit } from 'shlex';
import { useHttpSWR } from '../../common/http';
import { inbound } from "@/common/api";
import { routeSchema, tun, tun_endpoint_driverSchema, tun_platfrom_platform_darwinSchema, tun_platfromSchema } from '../schema/config/inbound';

export const normalizeTun = (value: tun): tun => ({
    ...(value ?? {}),
    skipMulticast: value?.skipMulticast ?? value?.skip_multicast ?? false,
    forceFakeip: value?.forceFakeip ?? value?.force_fakeip ?? false,
    portalV6: value?.portalV6 ?? value?.portal_v6 ?? "",
    postUp: Array.isArray(value?.postUp) ? value.postUp : Array.isArray(value?.post_up) ? value.post_up : [],
    postDown: Array.isArray(value?.postDown) ? value.postDown : Array.isArray(value?.post_down) ? value.post_down : [],
    route: {
        ...(value?.route ?? {}),
        routes: Array.isArray(value?.route?.routes) ? value.route.routes : [],
        excludes: Array.isArray(value?.route?.excludes) ? value.route.excludes : [],
    },
});

export const toPlainTun = (value: tun): tun => {
    const current = normalizeTun(value);
    const {
        skipMulticast,
        forceFakeip,
        portalV6,
        postUp,
        postDown,
        skip_multicast,
        force_fakeip,
        portal_v6,
        post_up,
        post_down,
        ...rest
    } = current;
    return {
        ...rest,
        skip_multicast: skipMulticast,
        force_fakeip: forceFakeip,
        portal_v6: portalV6,
        post_up: postUp,
        post_down: postDown,
        route: create(routeSchema, {
            routes: current.route?.routes ?? [],
            excludes: current.route?.excludes ?? [],
        }),
    };
};

export const Tun: FC<{ tun: tun, onChange: (x: tun) => void }> = ({ tun, onChange }) => {
    const current = useMemo(() => normalizeTun(tun), [tun]);
    const [postUp, setPostUp] = useState(shlexJoin(current.postUp))
    const [postDown, setPostDown] = useState(shlexJoin(current.postDown))

    const { data: platform } = useHttpSWR(inbound.method.platform_info)

    return (
        <>
            <SettingCheck
                checked={current.skipMulticast}
                onChange={() => onChange({ ...current, skipMulticast: !current.skipMulticast })}
                label="Skip Multicast"
            />

            <SettingInputVertical label='Name' value={current.name ?? ""} onChange={(e: string) => onChange({ ...current, name: e })} />
            <SettingInputVertical label='MTU' value={(current.mtu ?? 0).toString()} onChange={(e: string) => { if (!isNaN(Number(e))) onChange({ ...current, mtu: Number(e) }) }} />
            <SettingInputVertical label='IPv4' value={current.portal ?? ""} onChange={(e: string) => onChange({ ...current, portal: e })} />
            <SettingInputVertical label='IPv6' value={current.portalV6} onChange={(e: string) => onChange({ ...current, portalV6: e })} />

            {platform?.darwin && platform?.darwin?.networkServices &&
                <SettingSelectVertical
                    label='DNS Network Service'
                    emptyChoose
                    emptyChooseName="Default"
                    value={current.platform?.darwin?.networkService ?? current.platform?.darwin?.network_service ?? ""}
                    values={platform.darwin.networkServices}
                    onChange={(e) => onChange({
                        ...current, platform: create(tun_platfromSchema,
                            { darwin: create(tun_platfrom_platform_darwinSchema, { networkService: e }) })
                    })}
                />
            }
            <SettingInputVertical label='Post Up' value={postUp}
                onChange={(e: string) => {
                    setPostUp(e)
                    try {
                        const cmds = shlexSplit(e)
                        onChange({ ...current, postUp: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingInputVertical label='Post Down' value={postDown}
                onChange={(e: string) => {
                    setPostDown(e)
                    try {
                        const cmds = shlexSplit(e)
                        onChange({ ...current, postDown: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingTypeSelect label='Stack' type={tun_endpoint_driverSchema} value={current.driver} onChange={(e) => onChange({ ...current, driver: e })} />

            <InputList
                title='Routes'
                textarea
                dump
                data={current.route?.routes ?? []}
                onChange={(e) => {
                    onChange({ ...current, route: { ...(current.route ? current.route : create(routeSchema, {})), routes: e ? e : [] } })
                }}
            />
        </>
    )
}
