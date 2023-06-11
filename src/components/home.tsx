import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { APIUrl } from './apiurl';

function Home() {
    const [data, setData] = useState({ tcp: "", udp: "" })


    const refresh = async () => {
        try {
            await fetch(
                APIUrl + "/node/now",
                {
                    method: "get",
                },
            ).then(async (resp) => {
                setData(await resp.json())
            })

        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => { (async () => { await refresh(); })() }, [])

    return (
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
    );
}

export default Home;