export var APIUrl = ""

const RefreshUrl = () => {
    let url = localStorage.getItem("api_url")
    if (url !== null) APIUrl = url
    else APIUrl = ""
}

export const SetUrl = (url: string) => {
    if (url !== "") {
        localStorage.setItem("api_url", url);
    } else {
        localStorage.removeItem("api_url");
    }
    APIUrl = url
}

if (typeof window !== 'undefined') RefreshUrl()