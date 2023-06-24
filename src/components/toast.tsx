import React, { createContext, useState, } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
const initialState = {
    Info: (text: string) => { },
    Error: (text: string) => { }
};

export const GlobalToastContext = createContext(initialState);

export const GlobalToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let tts: { [key: string]: { text: string, type: string } } = {};
    const [texts, setTexts] = useState({ value: tts, index: 0 });
    const msg = (text: string, type: string) => {
        let tts = texts.value;
        tts[texts.index] = { text: text, type: type };
        setTexts({ value: tts, index: texts.index + 1 });
    }

    const info = (text: string) => { msg(text, "success") }
    const error = (text: string) => { msg(text, "danger") }

    return (
        <GlobalToastContext.Provider value={{ Info: info, Error: error }}>
            <ToastContainer
                className="p-3"
                position={"top-center"}
                containerPosition='fixed'
                style={{ zIndex: 1 }}
            >
                {
                    Object.entries(texts.value).map(([key, v]) => {

                        return <Toast
                            key={"toast" + key}
                            role='alert'
                            aria-live='assertive'
                            show={true}
                            bg={v.type}
                            onClose={
                                () => {
                                    let tts = texts.value;
                                    delete tts[key];
                                    setTexts({ ...texts, value: tts });
                                    console.log("close: " + key);
                                }
                            }
                            aria-atomic="true"
                            delay={4000}
                            autohide={true}
                            animation={true}
                        >
                            <Toast.Header>
                                <strong className="me-auto">Notification</strong>
                                <small className="text-muted">just now</small>
                            </Toast.Header>

                            <Toast.Body className='text-center'>{v.text}</Toast.Body>

                        </Toast>
                    })
                }
            </ToastContainer>

            {children}
        </GlobalToastContext.Provider>
    )
}