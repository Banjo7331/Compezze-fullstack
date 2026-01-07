import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Divider, Row, Col, Typography, Spin } from 'antd';
import { useDebounce } from '@/shared/hooks/useDebounce'; 
import { quizService } from '@/features/quiz/api/quizService';
import { surveyService } from '@/features/survey/api/surveyService';
import type { StageType, JuryRevealMode } from '../../model/types';

const { Option } = Select;

export interface StageFormValues {
  name: string;
  type: StageType;
  durationMinutes: number;
  weight: number;
  referenceId?: number;
  maxParticipants?: number;
  timePerQuestion?: number;
  maxScore?: number;
  showJudgeNames?: boolean;
  juryRevealMode?: JuryRevealMode;
}

interface Props {
  open: boolean;
  onCancel: () => void;
  onAdd: (values: StageFormValues) => void;
}

export const StageConfigurationModal: React.FC<Props> = ({ open, onCancel, onAdd }) => {
  const [form] = Form.useForm();
  const [stageType, setStageType] = useState<StageType>('GENERIC');
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [options, setOptions] = useState<{ label: string, value: number }[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      if (!debouncedSearchTerm) { 
        setOptions([]); 
        return; 
      }
      
      setFetching(true);
      try {
        let results: any[] = [];
        if (stageType === 'QUIZ') {
           results = await quizService.searchForms(debouncedSearchTerm);
        } else if (stageType === 'SURVEY') {
           results = await surveyService.searchForms(debouncedSearchTerm);
        }
        
        setOptions(results.map(r => ({
          label: r.title,
          value: r.id || r.surveyFormId
        })));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setFetching(false);
      }
    };

    loadOptions();
  }, [debouncedSearchTerm, stageType]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onAdd(values);
      form.resetFields();
      setStageType('GENERIC');
      setSearchTerm('');
    } catch (e) {
    }
  };

  return (
    <Modal
      title="Configure New Stage"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
      okText="Add Stage"
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ 
          type: 'GENERIC', durationMinutes: 30, weight: 1, 
          timePerQuestion: 30, maxParticipants: 100,
          juryRevealMode: 'IMMEDIATE', maxScore: 10
        }}
      >
        <Form.Item name="name" label="Stage Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Grand Finale" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="type" label="Stage Type">
              <Select onChange={(val) => { 
                  setStageType(val); 
                  setOptions([]); 
                  setSearchTerm('');
                  form.setFieldValue('referenceId', null); 
              }}>
                <Option value="GENERIC">Other</Option>
                <Option value="QUIZ">Quiz Game</Option>
                <Option value="SURVEY">Survey Form</Option>
                <Option value="JURY_VOTE">Jury Voting</Option>
                <Option value="PUBLIC_VOTE">Public Voting</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="durationMinutes" label="Duration (min)" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        {(stageType === 'QUIZ' || stageType === 'SURVEY') && (
          <Form.Item 
            name="referenceId" 
            label={stageType === 'QUIZ' ? "Select Quiz Template" : "Select Survey Template"} 
            rules={[{ required: true, message: "Please select a template" }]}
          >
            <Select
              showSearch
              placeholder="Type to search..."
              notFoundContent={fetching ? <Spin size="small" /> : null}
              filterOption={false}
              onSearch={(val) => setSearchTerm(val)}
              options={options}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}

        {stageType === 'QUIZ' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="timePerQuestion" label="Seconds / Question">
                <InputNumber min={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxParticipants" label="Max Players">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {(stageType === 'JURY_VOTE' || stageType === 'PUBLIC_VOTE' || stageType === 'QUIZ') && (
           <Form.Item name="weight" label="Score Weight Multiplier">
             <InputNumber step={0.1} min={0.1} style={{ width: '100%' }} />
           </Form.Item>
        )}

        {(stageType === 'JURY_VOTE' || stageType === 'PUBLIC_VOTE') && (
            <Form.Item name="maxScore" label="Max Score (0-N)">
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
        )}
      </Form>
    </Modal>
  );
};