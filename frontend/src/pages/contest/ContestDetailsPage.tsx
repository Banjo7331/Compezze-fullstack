import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, message } from 'antd';

import { contestService } from '@/features/contest/api/contestService';
import type { ContestDetailsDto } from '@/features/contest/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

import { ContestHeader } from '@/features/contest/components/ContestHeader';
import { ContestStagesStepper } from '@/features/contest/components/ContestStagesStepper';
import { StaffActionCard } from '@/features/contest/components/StaffActionCard';
import { ParticipantActionCard } from '@/features/contest/components/ParticipantActionCard';
import { GuestActionCard } from '@/features/contest/components/GuestActionCard';

const ContestDetailsPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();

  const [contest, setContest] = useState<ContestDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await contestService.getContestDetails(contestId!);
      data.stages.sort((a, b) => a.position - b.position);
      setContest(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contestId) fetchDetails();
  }, [contestId]);

  const handleJoin = async () => {
    setIsProcessing(true);
    try {
      await contestService.joinContest(contestId!);
      showSuccess("Successfully joined!");
      fetchDetails();
    } catch (e: any) {
      showError("Failed to join. " + (e.response?.data?.detail || "Check limits."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSubmissions = async () => {
    if (!window.confirm("Close submissions? Verification phase will start.")) return;
    
    setIsProcessing(true);
    try {
      await contestService.closeSubmissions(contestId!);
      showSuccess("Submissions closed. Status: Verification.");
      fetchDetails();
    } catch (e) {
      showError("Error closing submissions.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenLobby = async () => {
    if (contest?.organizer) {
      setIsProcessing(true);
      try {
        await contestService.createRoom(contestId!);
        showSuccess("Connecting to Lobby...");
        navigate(`/contest/${contestId}/live`);
      } catch (e) {
        showError("Failed to open Lobby.");
      } finally {
        setIsProcessing(false);
      }
    } else {
       navigate(`/contest/${contestId}/live`);
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  
  if (!contest) return (
    <Result
      status="404"
      title="Contest not found"
      extra={<Button type="primary" onClick={() => navigate('/contest')}>Back to List</Button>}
    />
  );

  const myRoles = contest.myRoles || [];
  const isOrganizer = contest.organizer;
  const isModerator = myRoles.includes('MODERATOR');
  const isStaff = isOrganizer || isModerator;
  const isParticipant = contest.participant;
  const isCompetitor = myRoles.includes('COMPETITOR');

  const isFull = contest.participantLimit > 0 && contest.currentParticipantsCount >= contest.participantLimit;
  const isClosed = contest.status === 'FINISHED';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      
      <ContestHeader contest={contest} />
      
      <ContestStagesStepper contest={contest} />

      <div style={{ marginTop: 24 }}>

        {isParticipant ? (
          <ParticipantActionCard 
            contestId={contest.id}
            status={contest.status}
            isCompetitor={isCompetitor}
            onRefresh={fetchDetails}
            onOpenLobby={handleOpenLobby}
          />
        ) : !isStaff && (
          <GuestActionCard 
            onJoin={handleJoin}
            isProcessing={isProcessing}
            isFull={isFull}
            isClosed={isClosed}
          />
        )}

        {isStaff && (
          <StaffActionCard 
            onManage={() => navigate(`/contest/${contestId}/manage`)}
            onReview={() => navigate(`/contest/${contestId}/review`)}
            onCloseSubmissions={handleCloseSubmissions}
            onOpenLobby={handleOpenLobby}
            isProcessing={isProcessing}
            status={contest.status}
          />
        )}
      </div>
    </div>
  );
};

export default ContestDetailsPage;