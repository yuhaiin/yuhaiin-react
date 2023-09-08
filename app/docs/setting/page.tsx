"use client"

import React, { useState, useContext } from "react";
import { Button, Card } from "react-bootstrap";
import { APIUrl, SetUrl } from "../apiurl";
import { SettingInputText } from "../config/components";
import { GlobalToastContext } from "../common/toast";

function Setting() {
    const ctx = useContext(GlobalToastContext);
    const [url, setUrl] = useState(APIUrl);

    return <Card className="mb-3">
        <Card.Body>
            <SettingInputText label="API Url" value={url} onChange={(v) => { setUrl(v) }} />
            <hr />
            <Button
                onClick={() => {
                    SetUrl(url)
                    if (url !== "") ctx.Info(`Set API Url: ${url} success.`)
                    else ctx.Info(`Remove API Url success.`)
                }}
            >
                Save
            </Button>
        </Card.Body>
    </Card>
}

export default Setting;