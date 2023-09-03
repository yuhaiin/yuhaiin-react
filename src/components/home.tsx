import { useLayoutEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { APIUrl } from './apiurl';
import Loading from './loading';
import { now_resp as Now } from '../protos/node/grpc/node';
import { point as Point } from '../protos/node/point/point';

function Home() {
    const [data, setData] = useState<Now>({ tcp: undefined, udp: undefined })
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
                    setData(Now.decode(new Uint8Array(await resp.arrayBuffer())))
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
                            <pre>{data.tcp !== undefined && JSON.stringify(Point.toJSON(data.tcp), null, "  ")}</pre>
                        </Card.Body>
                    </Card>

                    <Card className='mb-3'>
                        <Card.Header>UDP</Card.Header>
                        <Card.Body>
                            <pre>{data.udp !== undefined && JSON.stringify(Point.toJSON(data.udp), null, "  ")}</pre>
                        </Card.Body>
                    </Card>
                </div>
            }

        </>

    );
}

export default Home;