import { useState, useEffect } from 'react';

import type { Page, PageableParams } from '@/shared/api/types'; 
import type { SurveyFormResponse } from '../model/types'; 
import { surveyService } from '../api/surveyService';

interface UseUserSurveyFormsParams extends PageableParams {
    refreshTrigger?: number; 
}

const DEFAULT_PAGE_SIZE = 10;

export const useUserSurveyForms = (params: UseUserSurveyFormsParams = {}) => {
    const { 
        refreshTrigger = 0, 
        page: initialPage = 0,
        size = DEFAULT_PAGE_SIZE,
        sort = 'id,desc'
    } = params;

    const [data, setData] = useState<SurveyFormResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchForms = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiParams: PageableParams = {
                    page,
                    size,
                    sort
                };

                const response = await surveyService.getAllForms(apiParams) as Page<SurveyFormResponse>;
                
                setData(response.content);
                setTotalPages(response.totalPages);

            } catch (err: any) {
                console.error("Failed to fetch user survey forms:", err);
                setError(new Error(err.message || "Failed to load surveys."));
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, [page, size, sort, refreshTrigger]);

    return {
        data,
        isLoading,
        error,
        page,
        totalPages,
        setPage,
    };
};