import { Card } from 'react-bootstrap';
import Loading from './common/loading';
import { now_resp as Now } from './protos/node/grpc/node';
import { point as Point } from './protos/node/point/point';
import useSWR from 'swr'
import { ProtoFetcher } from './common/proto';
import Error from 'next/error';

function Index() {
    const { data, error, isLoading, } = useSWR("/node/now", ProtoFetcher(Now))


    if (error != undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />


    return <div>
        <Card className='mb-3'>
            <Card.Header>TCP</Card.Header>
            <Card.Body>
                <pre>{JSON.stringify(Point.toJSON(data?.tcp!!), null, "  ")}</pre>
            </Card.Body>
        </Card>

        <Card className='mb-3'>
            <Card.Header>UDP</Card.Header>
            <Card.Body>
                <pre>{JSON.stringify(Point.toJSON(data?.udp!!), null, "  ")}</pre>
            </Card.Body>
        </Card>
    </div>
}

export default Index;