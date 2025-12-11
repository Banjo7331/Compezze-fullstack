import { useState, useEffect, useCallback } from 'react';
import { contestService } from '../api/contestService';
import type { UpcomingContestDto } from '../model/types'; // Używamy tego DTO, bo pasuje strukturą (id, name, start, category)

export const usePublicContests = () => {
    const [contests, setContests] = useState<UpcomingContestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Paginacja
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 5;

    const fetchContests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Zakładamy, że ta metoda istnieje w serwisie (GET /api/v1/contest/public)
            const response = await contestService.getPublicContests({ 
                page, 
                size: PAGE_SIZE, 
                sort: 'startDate,asc' 
            });
            
            setContests(response.content);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error(err);
            setError("Nie udało się pobrać listy konkursów.");
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchContests();
    }, [fetchContests]);

    return { 
        contests, 
        isLoading, 
        error, 
        page, 
        totalPages, 
        setPage,
        refresh: fetchContests 
    };
};