import { Card } from 'react-bootstrap';
import { APIUrl } from './apiurl';
import Loading from './common/loading';
import { now_resp as Now } from './protos/node/grpc/node';
import { point as Point } from './protos/node/point/point';
import useSWR from 'swr'
import { ProtoFetcher } from './common/proto';

function Index() {
    const { data, error, isLoading, } = useSWR(APIUrl + "/node/now", ProtoFetcher(Now))

    if (isLoading) return <Loading />

    if (error != undefined) return <Card className='mb-3'>{error.info}</Card>

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