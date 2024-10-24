"use client";

import { useParams } from 'next/navigation';

const EventCirclePage = () => {
    const params = useParams();
    const { eventName, circleName } = params;

    return (
        <div>
            <h1>Event: {eventName}</h1>
            <h2>Circle: {circleName}</h2>
            <img src="https://static.zenn.studio/images/drawing/discussion.png" alt="logo" />
        </div>
    );
};

export default EventCirclePage;