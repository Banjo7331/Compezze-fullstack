import React from 'react';
import { Button, Result, Spin, Card } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

interface Props {
    isOrganizer: boolean;
    onStart: () => void;
}

export const ContestLobbyView: React.FC<Props> = ({ isOrganizer, onStart }) => {
    return (
        <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Result
                icon={isOrganizer 
                    ? <PlayCircleOutlined style={{ color: '#1890ff' }} /> 
                    : <Spin size="large" />
                }
                title="Contest Lobby"
                subTitle={isOrganizer 
                    ? "You are the organizer. Start the contest when everyone is ready." 
                    : "Waiting for the organizer to start the contest..."
                }
                extra={isOrganizer && (
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlayCircleOutlined />} 
                        onClick={onStart}
                        style={{ padding: '0 40px', height: '50px', fontSize: '18px' }}
                    >
                        START CONTEST
                    </Button>
                )}
            />
        </Card>
    );
};