import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, DatePicker, Select, Switch, 
  Typography, Row, Col, Space, Divider, List, Tag, theme 
} from 'antd';
import { 
  SaveOutlined, PlusOutlined, DeleteOutlined, 
  ArrowUpOutlined, ArrowDownOutlined, 
  TrophyOutlined, BarChartOutlined, TeamOutlined 
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { contestService } from '../../api/contestService';
import { ContestCategory, type CreateContestRequest } from '../../model/types';

import { TemplateSelector } from './TemplateSelector';
import { StageConfigurationModal, type StageFormValues } from './StageConfigurationModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface StageDraft extends StageFormValues {
  tempId: number;
}

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export const ContestCreateForm: React.FC<Props> = ({ onCancel, onSuccess }) => {
  const { token } = theme.useToken();
  const { showSuccess, showError } = useSnackbar();
  const [form] = Form.useForm();
  
  const [stages, setStages] = useState<StageDraft[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const addStage = (values: StageFormValues) => {
    setStages([...stages, { ...values, tempId: Date.now() }]);
    setIsModalOpen(false);
  };

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const moveStage = (index: number, direction: -1 | 1) => {
    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[index + direction];
    newStages[index + direction] = temp;
    setStages(newStages);
  };

  const getStageIcon = (type: string) => {
    switch (type) {
      case 'QUIZ': return <TrophyOutlined style={{ color: token.colorWarning }} />;
      case 'SURVEY': return <BarChartOutlined style={{ color: token.colorInfo }} />;
      default: return <TeamOutlined style={{ color: token.colorTextSecondary }} />;
    }
  };

  const handleFinish = async (values: any) => {
    if (stages.length === 0) {
      showError("Musisz dodać przynajmniej jeden etap.");
      return;
    }
    if (!selectedTemplateKey) {
      showError("Wybierz motyw graficzny (tło) konkursu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateContestRequest = {
        name: values.name,
        description: values.description,
        location: values.location,
        contestCategory: values.category,
        
        startDate: values.dates[0].toISOString(),
        endDate: values.dates[1].toISOString(),
        
        participantLimit: values.participantLimit ? Number(values.participantLimit) : undefined,
        isPrivate: values.isPrivate,
        submissionMediaPolicy: values.mediaPolicy,
        
        hasPreliminaryStage: false,
        coverImageKey: selectedTemplateKey,
        
        stages: stages.map(s => {
          const base = { name: s.name, durationMinutes: s.durationMinutes };
          if (s.type === 'QUIZ') {
            return { 
              ...base, type: 'QUIZ', 
              quizFormId: s.referenceId!, 
              weight: s.weight, 
              maxParticipants: s.maxParticipants, 
              timePerQuestion: s.timePerQuestion 
            };
          }
          if (s.type === 'SURVEY') {
            return { ...base, type: 'SURVEY', surveyFormId: s.referenceId!, maxParticipants: s.maxParticipants };
          }
          return { 
            ...base, type: s.type, 
            weight: s.weight, 
            maxScore: s.maxScore,
            juryRevealMode: s.juryRevealMode || 'IMMEDIATE'
          } as any;
        })
      };

      await contestService.createContest(payload);
      showSuccess("Konkurs utworzony pomyślnie!");
      onSuccess();
    } catch (e) {
      showError("Nie udało się utworzyć konkursu.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card 
      bordered={false} 
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 16 }}
    >
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Contest Creator
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          participantLimit: 100,
          mediaPolicy: 'BOTH',
          category: 'Other',
          isPrivate: false
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Form.Item name="name" label="Contest Name" rules={[{ required: true, message: "Please enter a name" }]}>
              <Input size="large" placeholder="Enter event name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="category" label="Category">
              <Select size="large">
                {Object.keys(ContestCategory).map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description" rules={[{ required: true, message: "Description is required" }]}>
          <Input.TextArea rows={4} placeholder="What is this contest about?" />
        </Form.Item>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="dates" label="Duration" rules={[{ required: true, message: "Please select dates" }]}>
              <RangePicker 
                disabledDate={disabledDate} 
                showTime 
                format="YYYY-MM-DD HH:mm" 
                style={{ width: '100%' }} 
                size="large" 
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="participantLimit" label="Participant Limit">
              <Input type="number" size="large" min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
             <Form.Item name="location" label="Location (Optional)">
               <Input size="large" placeholder="Online or City" />
             </Form.Item>
          </Col>
        </Row>

        <Card size="small" style={{ background: '#fafafa', marginBottom: 24, borderColor: '#f0f0f0' }}>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="mediaPolicy" label="Allowed Submissions" style={{ marginBottom: 0 }}>
                <Select>
                  <Select.Option value="BOTH">Photos and Videos</Select.Option>
                  <Select.Option value="IMAGES_ONLY">Photos Only</Select.Option>
                  <Select.Option value="VIDEOS_ONLY">Videos Only</Select.Option>
                  <Select.Option value="NONE">None (Live Only)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
               <Form.Item name="isPrivate" label="Visibility" valuePropName="checked" style={{ marginBottom: 0 }}>
                 <Switch checkedChildren="Private" unCheckedChildren="Public" />
               </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <TemplateSelector 
          selectedKey={selectedTemplateKey} 
          onSelect={setSelectedTemplateKey} 
        />

        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Stages</Title>
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add Stage
          </Button>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={stages}
          renderItem={(stage, index) => (
            <List.Item
              style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8, marginBottom: 8, padding: 16, background: '#fff' }}
              actions={[
                 <Button key="up" size="small" type="text" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => moveStage(index, -1)} />,
                 <Button key="down" size="small" type="text" icon={<ArrowDownOutlined />} disabled={index === stages.length - 1} onClick={() => moveStage(index, 1)} />,
                 <Button key="del" size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeStage(index)} />
              ]}
            >
              <List.Item.Meta
                avatar={<div style={{ fontSize: 24, marginTop: 4 }}>{getStageIcon(stage.type)}</div>}
                title={
                  <Space>
                    <Tag color="orange">#{index + 1}</Tag>
                    <Text strong>{stage.name}</Text>
                    <Tag>{stage.type}</Tag>
                  </Space>
                }
                description={
                  <Space split="|">
                    <Text type="secondary">{stage.durationMinutes} min</Text>
                    {stage.referenceId && <Text type="secondary">Template ID: {stage.referenceId}</Text>}
                    {stage.weight !== 1 && <Text type="secondary">Weight: {stage.weight}x</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        
        {stages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', background: '#f5f5f5', borderRadius: 8, color: '#999' }}>
            No stages. Click "Add Stage" to get started.
          </div>
        )}

        <Divider style={{ margin: '32px 0' }} />

        <Row justify="end" gutter={16}>
          <Col>
            <Button size="large" onClick={onCancel}>Cancel</Button>
          </Col>
          <Col>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              icon={<SaveOutlined />} 
              loading={isSubmitting}
            >
              Create Contest
            </Button>
          </Col>
        </Row>
      </Form>

      <StageConfigurationModal 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        onAdd={addStage}
      />
    </Card>
  );
};