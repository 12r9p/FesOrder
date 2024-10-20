"use client";

import { useParams } from 'next/navigation';

const EventCirclePage = () => {
    const params = useParams();
    const { eventName, circleName } = params;

    return (
        <div>
            <h1>Event: {eventName}</h1>
            <h2>Circle: {circleName}</h2>
        </div>
    );
};

export default EventCirclePage;