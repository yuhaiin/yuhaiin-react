import { Card } from 'react-bootstrap';
import Loading from './common/loading';
import useSWR from 'swr'
import { ProtoESFetcher3 } from './common/proto';
import Error from 'next/error';
import { node } from './pbes/node/grpc/node_pb';
import { create, toJsonString } from '@bufbuild/protobuf';
import { pointSchema } from './pbes/node/point/point_pb';

function Index() {
    const { data, error, isLoading, } = useSWR("/node/now", ProtoESFetcher3(node.method.now))


    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />

    return <div>
        <Card className='mb-3'>
            <Card.Header>TCP</Card.Header>
            <Card.Body>
                <pre>{toJsonString(pointSchema, data.tcp ?? create(pointSchema, {}), { prettySpaces: 2 })}</pre>
            </Card.Body>
        </Card>

        <Card className='mb-3'>
            <Card.Header>UDP</Card.Header>
            <Card.Body>
                <pre>{toJsonString(pointSchema, data.udp ?? create(pointSchema, {}), { prettySpaces: 2 })}</pre>
            </Card.Body>
        </Card>
    </div>
}

export default Index;