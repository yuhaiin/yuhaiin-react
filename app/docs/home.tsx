import { Card } from 'react-bootstrap';
import Loading from './common/loading';
import useSWR from 'swr'
import { ProtoTSFetcher, ToObjectOption } from './common/proto';
import Error from 'next/error';
import { yuhaiin } from './pbts/proto';

function Index() {
    const { data, error, isLoading, } = useSWR("/node/now", ProtoTSFetcher<yuhaiin.protos.node.service.now_resp>(yuhaiin.protos.node.service.now_resp))


    if (error != undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />


    return <div>
        <Card className='mb-3'>
            <Card.Header>TCP</Card.Header>
            <Card.Body>
                <pre>{JSON.stringify(yuhaiin.point.point.toObject(new yuhaiin.point.point(data?.tcp!!), ToObjectOption), null, "  ")}</pre>
            </Card.Body>
        </Card>

        <Card className='mb-3'>
            <Card.Header>UDP</Card.Header>
            <Card.Body>
                <pre>{JSON.stringify(yuhaiin.point.point.toObject(new yuhaiin.point.point(data?.udp!!), ToObjectOption), null, "  ")}</pre>
            </Card.Body>
        </Card>
    </div>
}

export default Index;