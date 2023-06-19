import React, { createContext, useContext, useState, } from 'react';
import { Button, CloseButton, Toast, ToastContainer } from 'react-bootstrap';
const initialState = {
    Info: (text: string) => { },
};

export const GlobalToastContext = createContext(initialState);

export const GlobalToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let tts: { [key: string]: string } = {};
    const [texts, setTexts] = useState({ value: tts, index: 0 });
    const info = (text: string) => {
        let tts = texts.value;
        tts[texts.index] = text;
        setTexts({ value: tts, index: texts.index + 1 });
    }

    return (
        <GlobalToastContext.Provider value={{ Info: info }}>
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
                            className='text-bg-primary'
                            role='alert'
                            aria-live='assertive'
                            show={true}
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

                            <Toast.Body>{v}</Toast.Body>

                        </Toast>
                    })
                }
            </ToastContainer>

            {children}
        </GlobalToastContext.Provider>
    )
}