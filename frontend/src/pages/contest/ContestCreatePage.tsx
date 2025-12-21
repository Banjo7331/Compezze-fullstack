import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContestCreateForm } from '@/features/contest/components/ContestCreateForm';

const ContestCreatePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
            <ContestCreateForm 
                onCancel={() => navigate('/contest')} 
                onSuccess={() => navigate('/profile')}
            />
        </div>
    );
};

export default ContestCreatePage;