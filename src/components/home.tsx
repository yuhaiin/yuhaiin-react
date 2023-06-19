import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Button, Card, Spinner } from 'react-bootstrap';
import { APIUrl } from './apiurl';
import Loading from './loading';
import { GlobalToastContext } from './toast';

function Home() {
    const [data, setData] = useState({ tcp: "", udp: "" })
    const [loading, setLoading] = useState({ value: true })

    const refresh = async () => {
        try {
            await fetch(
                APIUrl + "/node/now",
                {
                    method: "GET",
                },
            ).then(async (resp) => {
                if (resp.ok) {
                    setData(await resp.json())
                    setLoading({ value: false })
                }
            })

        } catch (e) {
            console.log(e)
        }
    }
    useLayoutEffect(() => { (async () => { await refresh(); })() }, [])

    return (
        <>
            {loading.value && <Loading />}
            {!loading.value &&
                <div>
                    <Card className='mb-3'>
                        <Card.Header>TCP</Card.Header>
                        <Card.Body>
                            <pre>{data.tcp}</pre>
                        </Card.Body>
                    </Card>

                    <Card className='mb-3'>
                        <Card.Header>UDP</Card.Header>
                        <Card.Body>
                            <pre>{data.udp}</pre>
                        </Card.Body>
                    </Card>
                </div>
            }

        </>

    );
}

export default Home;