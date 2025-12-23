import React from 'react';
import { Modal, Typography } from 'antd';
import { SurveyFormList } from './SurveyFormList'; 

const { Title } = Typography;

interface AllTemplatesDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AllFormsDialog: React.FC<AllTemplatesDialogProps> = ({ open, onClose }) => {
    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>All Survey Templates</Title>}
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
                <SurveyFormList />
            </div>
        </Modal>
    );
};