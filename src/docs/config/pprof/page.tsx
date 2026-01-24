"use client";

import { useLocalStorage } from "usehooks-ts";
import { APIUrlDefault, APIUrlKey } from "../../../common/apiurl";
import { IFramePage } from "../../../component/v2/iframe";

import { MainContainer } from "@/component/v2/card";

const PprofPage = () => {
    const [apiUrl] = useLocalStorage<string>(APIUrlKey, APIUrlDefault);

    return (
        <MainContainer>
            <IFramePage src={apiUrl + "/debug/pprof"} />
        </MainContainer>
    )
}

export default PprofPage;
