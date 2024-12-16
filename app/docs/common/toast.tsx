import React, { createContext, useState, } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const initialState = {
    Info: (s: string) => { console.log(s) },
    Error: (s: string) => { console.error(s) }
};

export const GlobalToastContext = createContext(initialState);

export const GlobalToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [texts, setTexts] =
        useState<{ text: string, type: string }[]>([]);

    const msg = (text: string, type: string) => setTexts(prev => { return [...prev, { text: text, type: type }] });

    return (
        <GlobalToastContext.Provider value={{ Info: (text: string) => { console.log(text); msg(text, "success") }, Error: (text: string) => { console.error(text); msg(text, "danger") } }}>
            <ToastContainer
                className="p-3"
                position={"top-center"}
                containerPosition='fixed'
                style={{ zIndex: 999999 }}
            >
                {texts.map((v, i) => {
                    return <Toast
                        key={"toast" + i}
                        role='alert'
                        aria-live='assertive'
                        show={true}
                        bg={v.type}
                        onClose={() => { setTexts(prev => { return [...prev.slice(0, i), ...prev.slice(i + 1)] }) }}
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