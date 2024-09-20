import React, { createContext, useState, } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const initialState = {
    Info: (text: string) => { },
    Error: (text: string) => { }
};

export const GlobalToastContext = createContext(initialState);

export const GlobalToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [texts, setTexts] =
        useState<{ value: { [key: string]: { text: string, type: string } }, index: number }>({ value: {}, index: 0 });

    const msg = (text: string, type: string) =>
        setTexts(prev => { return { value: { ...prev.value, [prev.index]: { text: text, type: type } }, index: prev.index + 1 } });

    const info = (text: string) => {
        console.log(text);
        msg(text, "success")
    }
    
    const error = (text: string) => {
        console.error(text)
        msg(text, "danger")
    }

    return (
        <GlobalToastContext.Provider value={{ Info: info, Error: error }}>
            <ToastContainer
                className="p-3"
                position={"top-center"}
                containerPosition='fixed'
                style={{ zIndex: 999999 }}
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