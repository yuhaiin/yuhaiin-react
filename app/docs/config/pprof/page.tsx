"use client";

import { useLocalStorage } from "usehooks-ts";
import { IFramePage } from "../../../component/iframe";
import { APIUrlDefault, APIUrlKey } from "../../common/apiurl";

const PprofPage = () => {
    const [apiUrl] = useLocalStorage<string>(APIUrlKey, APIUrlDefault);

    return (
        <>
            <IFramePage src={apiUrl + "/debug/pprof"} />
        </>
    )
}

export default PprofPage;
