export var APIUrl = ""
export var RemoteBypass = "https://raw.githubusercontent.com/yuhaiin/yuhaiin/ACL/yuhaiin/yuhaiin.conf"

const RefreshUrl = () => {
    let url = localStorage.getItem("api_url")
    if (url !== null) APIUrl = url
    else APIUrl = ""


    url = localStorage.getItem("remote_bypass")
    if (url !== null) RemoteBypass = url
}

export const SetUrl = (url: string) => {
    if (url !== "") {
        localStorage.setItem("api_url", url);
    } else {
        localStorage.removeItem("api_url");
    }
    APIUrl = url
}

export const SetRemoteBypass = (url: string) => {
    if (url !== "") {
        localStorage.setItem("remote_bypass", url);
    } else {
        localStorage.removeItem("remote_bypass");
    }
    RemoteBypass = url
}

if (typeof window !== 'undefined') RefreshUrl()