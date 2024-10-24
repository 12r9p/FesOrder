"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Circle } from '@/types/interfaces';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export interface Event {
    eventName: string;
    circles: Circle[];
}

const CircleCard: React.FC<Circle & { eventName: string }> = ({
    id,
    name,
    description,
    iconImagePath,
    backgroundImagePath,
    eventName,
}) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/${eventName}/${name}/menus`);
    };

    return (
        <Card
            className="mb-4 cursor-pointer transition-shadow hover:shadow-lg"
            onClick={handleClick}
        >
            <CardHeader className="relative p-0 overflow-hidden h-40">
                {backgroundImagePath ? (
                    <img
                        src={backgroundImagePath}
                        alt={`${name} background`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <CardTitle className="text-white text-2xl font-bold">{name}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex items-center mb-4">
                    {iconImagePath ? (
                        <img
                            src={iconImagePath}
                            alt={`${name} icon`}
                            className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full mr-4 bg-gray-300" />
                    )}
                    <Badge variant="secondary">{name}</Badge>
                </div>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
};

const CirclesPage = () => {
    const { eventName } = useParams();
    const [circles, setCircles] = useState<Circle[][]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCircles = async () => {
            if (typeof eventName !== 'string') {
                setError('Invalid event name');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/events?eventName=${encodeURIComponent(eventName)}`);
                const data = await response.json();
                if (response.ok) {
                    const circleDetails = await Promise.all(
                        data.map(async (circle: { circleId: string }) => {
                            const circleResponse = await fetch(`/api/circles?circleId=${encodeURIComponent(circle.circleId)}`);
                            if (!circleResponse.ok) {
                                throw new Error(`Failed to fetch circle details for ${circle.circleId}`);
                            }
                            return await circleResponse.json();
                        })
                    );
                    setCircles(circleDetails);
                } else {
                    throw new Error(data.error || 'Failed to fetch circles');
                }
            } catch (error) {
                console.error('Error fetching circles:', error);
                setError('Failed to load circles. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCircles();
    }, [eventName]);

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="bg-primary text-primary-foreground p-4">
                <h1 className="text-2xl font-bold">Circles for {eventName}</h1>
            </header>
            <main className="flex-1 overflow-hidden p-4">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Circle List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100vh-16rem)]">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <Card key={index} className="mb-4">
                                        <CardHeader className="p-0">
                                            <Skeleton className="h-40 w-full" />
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center mb-4">
                                                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                            <Skeleton className="h-4 w-full mb-2" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : circles.length === 0 ? (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>No Circles Found</AlertTitle>
                                    <AlertDescription>There are no circles available for this event.</AlertDescription>
                                </Alert>
                            ) : (
                                circles.map(circle => (
                                    <CircleCard
                                        key={circle[0].id}
                                        {...circle[0]}
                                        eventName={eventName as string}
                                    />
                                ))
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default CirclesPage;