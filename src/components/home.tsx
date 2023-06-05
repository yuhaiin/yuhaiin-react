import React, { useState } from 'react';
import { Card } from 'react-bootstrap';

function Home() {
    return (
        <div>
            <Card className='mb-3'>
                <Card.Header>TCP</Card.Header>
                <Card.Body>
                    <pre></pre>
                </Card.Body>
            </Card>

            <Card className='mb-3'>
                <Card.Header>UDP</Card.Header>
                <Card.Body>
                    <pre></pre>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Home;