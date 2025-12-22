import React from 'react';
import { Modal, Typography } from 'antd';
import { AllQuizTemplatesList } from './AllQuizTemplatesList';

const { Title } = Typography;

interface AllQuizFormsDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AllQuizFormsDialog: React.FC<AllQuizFormsDialogProps> = ({ open, onClose }) => {
    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>All Available Quizzes</Title>}
            open={open}
            onCancel={onClose}
            width={800}
            footer={null}
            centered
            bodyStyle={{ 
                padding: 0,
                maxHeight: '70vh', 
                overflowY: 'auto' 
            }}
        >
            <div style={{ padding: 24 }}>
                <AllQuizTemplatesList />
            </div>
        </Modal>
    );
};