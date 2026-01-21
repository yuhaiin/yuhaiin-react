"use client";

import { useLocalStorage } from "usehooks-ts";
import { APIUrlDefault, APIUrlKey } from "../../common/apiurl";
import { IFramePage } from "../../common/iframe";

const PprofPage = () => {
    const [apiUrl] = useLocalStorage<string>(APIUrlKey, APIUrlDefault);

    return (
        <>
            <IFramePage src={apiUrl + "/debug/pprof"} />
        </>
    )
}

export default PprofPage;
