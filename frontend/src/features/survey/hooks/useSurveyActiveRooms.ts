import { useState, useEffect } from 'react';
import { surveyService } from '../api/surveyService';
import type { ActiveRoomResponse } from '../model/types'; 

const DEFAULT_PAGE_SIZE = 10;

export const useSurveyActiveRooms = (refreshTrigger = 0) => {
    const [rooms, setRooms] = useState<ActiveRoomResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoading(true);
            try {
                const response = await surveyService.getActiveRooms({ 
                    page, 
                    size: DEFAULT_PAGE_SIZE,
                    sort: 'createdAt,desc'
                }) as any;
                
                setRooms(response.content);
                setTotalPages(response.totalPages);
            } catch (err: any) {
                setError(err.message || "Failed to load active rooms");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRooms();
    }, [page, refreshTrigger]);

    return { rooms, isLoading, error, page, totalPages, setPage };
};