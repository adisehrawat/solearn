import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubmissionCard } from '@/components/submission/SubmissionCard';
import { BountyEditForm } from '@/components/forms/BountyEditForm';
import { SolEarnProgram } from '@/lib/program';
import { convertSubmissionAccount } from '@/lib/anchor-client';
import { UserAccount, FrontendSubmissionAccount, BountyAccount as FrontendBountyAccount } from '@/types/program';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolana } from '@/contexts/SolanaProvider';
import { useApp } from '@/contexts/AppContext';
import { PublicKey } from '@solana/web3.js';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  ArrowLeft, 
  Send,
  Clock,
  Eye,
  EyeOff,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BountyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { programInitialized } = useSolana();
  const { userRole } = useApp();

  const [bounty, setBounty] = useState<FrontendBountyAccount | null>(null);
  const [submissions, setSubmissions] = useState<FrontendSubmissionAccount[]>([]);
  const [submissionUsers, setSubmissionUsers] = useState<Map<string, UserAccount>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [selectingWinner, setSelectingWinner] = useState<string | null>(null);

  // Submission form state
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    description: '',
    workUrl: ''
  });

  // Edit and delete state
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Role-based access control
  const isOwner = !!(bounty && publicKey && bounty.creator === publicKey.toString());
  const hasSubmitted = submissions.some(sub => 
    publicKey && sub.userWalletKey === publicKey.toString()
  );
  const canViewSubmissions = userRole === 'client' && isOwner; // Only bounty creator (client) can view submissions
  const canSubmit = userRole === 'user' && !hasSubmitted && bounty?.status === 'active'; // Only users can submit, and only once

  useEffect(() => {
    const loadBountyData = async () => {
      if (!programInitialized || !id || !publicKey) {
        return;
      }

      try {
        setLoading(true);
        
        // Parse bounty ID (format: creator-title)
        // Get all bounties and find the matching one
        const allBounties = await SolEarnProgram.getAllBounties();
        
        const targetBounty = allBounties.find(b => 
          `${b.creator}-${b.title}` === id
        );

        if (!targetBounty) {
          toast.error('Bounty not found');
          navigate('/');
          return;
        }

        setBounty(targetBounty);

        // Only load submissions if user can view them (client and bounty owner)
        if (userRole === 'client' && targetBounty.creator === publicKey.toString()) {
          // Load submissions for this bounty and convert them
          const rawSubmissions = await SolEarnProgram.getSubmissionsForBounty(
            targetBounty.title,
            new PublicKey(targetBounty.creator)
          );
          
          // Convert submissions to frontend format
          const convertedSubmissions = rawSubmissions.map(sub => convertSubmissionAccount(sub));
          setSubmissions(convertedSubmissions);

          // Load user data for each submission
          const userMap = new Map<string, UserAccount>();
          for (const submission of convertedSubmissions) {
            try {
              // Convert string back to PublicKey for getUser call
              const userPublicKey = new PublicKey(submission.userWalletKey);
              const userData = await SolEarnProgram.getUser(userPublicKey);
              if (userData) {
                userMap.set(submission.userWalletKey, userData);
              }
            } catch {
              // Could not load user data for submission
            }
          }
          setSubmissionUsers(userMap);
        }

      } catch (err) {
        console.error('Error loading bounty data:', err);
        toast.error('Failed to load bounty data');
      } finally {
        setLoading(false);
      }
    };

    loadBountyData();
  }, [programInitialized, id, publicKey, navigate, userRole]);

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bounty || !publicKey || !programInitialized) return;

    setSubmissionLoading(true);
    try {
      const result = await SolEarnProgram.createSubmission(
        bounty.title,
        new PublicKey(bounty.creator),
        submissionData.workUrl,
        submissionData.description
      );

      toast.success(result.message);
      setShowSubmissionForm(false);
      setSubmissionData({ description: '', workUrl: '' });

      // Reload submissions if user can view them
      if (canViewSubmissions) {
        const rawSubmissions = await SolEarnProgram.getSubmissionsForBounty(
          bounty.title,
          new PublicKey(bounty.creator)
        );
        
        // Convert submissions to frontend format
        const convertedSubmissions = rawSubmissions.map(sub => convertSubmissionAccount(sub));
        setSubmissions(convertedSubmissions);
      }

    } catch (error: unknown) {
      console.error('Error submitting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit work';
      toast.error(errorMessage);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleSelectWinner = async (submission: FrontendSubmissionAccount) => {
    if (!bounty || !publicKey || !programInitialized) return;

    setSelectingWinner(submission.userWalletKey);
    try {
      const result = await SolEarnProgram.selectSubmission(
        bounty.title,
        new PublicKey(submission.userWalletKey)
      );

      toast.success(result.message);
      
      // Reload bounty data to reflect the winner
      const allBounties = await SolEarnProgram.getAllBounties();
      const updatedBounty = allBounties.find(b => 
        `${b.creator}-${b.title}` === id
      );
      if (updatedBounty) {
        setBounty(updatedBounty);
      }

    } catch (error: unknown) {
      console.error('Error selecting winner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to select winner';
      toast.error(errorMessage);
    } finally {
      setSelectingWinner(null);
    }
  };

  const handleEditBounty = async (data: {
    newTitle: string;
    newDescription: string;
    newDeadline: string;
    newSkills: string[];
  }) => {
    if (!bounty || !publicKey || !programInitialized) return;

    setIsEditing(true);
    try {
      const result = await SolEarnProgram.updateBounty(
        bounty.title, // original title
        data.newTitle,
        data.newDescription,
        new Date(data.newDeadline)
      );

      toast.success(result.message);
      setShowEditForm(false);

      // Reload bounty data to reflect changes
      const allBounties = await SolEarnProgram.getAllBounties();
      const updatedBounty = allBounties.find(b => 
        `${b.creator}-${b.title}` === id
      );
      if (updatedBounty) {
        setBounty(updatedBounty);
      }

    } catch (error: unknown) {
      console.error('Error updating bounty:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bounty';
      toast.error(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteBounty = async () => {
    if (!bounty || !publicKey || !programInitialized) return;

    if (!confirm('Are you sure you want to delete this bounty? This action cannot be undone and will refund the reward to your wallet.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await SolEarnProgram.deleteBounty(bounty.title);
      
      toast.success(result.message);
      navigate('/client-dashboard'); // Redirect to client dashboard after deletion

    } catch (error: unknown) {
      console.error('Error deleting bounty:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bounty';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bounty...</p>
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Bounty not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bounty.title}</h1>
              <p className="text-gray-600 mt-1">Bounty Details</p>
            </div>
          </div>

          {/* Bounty Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{bounty.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {bounty.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={bounty.status === 'active' ? 'default' : 'secondary'}>
                    {bounty.status}
                  </Badge>
                  {isOwner && (
                    <Badge variant="outline" className="text-xs">
                      Your Bounty
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Reward</p>
                    <p className="font-semibold text-lg">{bounty.reward} SOL</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-semibold">
                      {new Date(bounty.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Submissions</p>
                    <p className="font-semibold">{bounty.submissionCount}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {bounty.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {canSubmit && (
              <Button
                onClick={() => setShowSubmissionForm(true)}
                className="flex items-center space-x-2"
                disabled={submissionLoading}
              >
                <Send className="h-4 w-4" />
                <span>Submit Work</span>
              </Button>
            )}
            
            {canViewSubmissions && (
              <Button
                variant="outline"
                onClick={() => setShowSubmissionForm(false)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Submissions ({submissions.length})</span>
              </Button>
            )}

            {/* Edit and Delete buttons - only for bounty owner */}
            {isOwner && bounty.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowEditForm(true)}
                  className="flex items-center space-x-2"
                  disabled={isEditing || isDeleting}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Bounty</span>
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleDeleteBounty}
                  className="flex items-center space-x-2"
                  disabled={isEditing || isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Bounty'}</span>
                </Button>
              </>
            )}
          </div>

          {/* Edit Form */}
          {showEditForm && isOwner && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Bounty</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditForm(false)}
                    disabled={isEditing}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <BountyEditForm
                  bounty={bounty}
                  onSubmit={handleEditBounty}
                  onCancel={() => setShowEditForm(false)}
                  isLoading={isEditing}
                />
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {showSubmissionForm && canSubmit && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
                <CardDescription>
                  Provide a description and link to your work for this bounty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmissionSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={submissionData.description}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your work..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="workUrl">Work URL</Label>
                    <Input
                      id="workUrl"
                      type="url"
                      value={submissionData.workUrl}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, workUrl: e.target.value }))}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      disabled={submissionLoading}
                      className="flex-1"
                    >
                      {submissionLoading ? 'Submitting...' : 'Submit Work'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSubmissionForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Submissions Section - Only visible to clients who own the bounty */}
          {canViewSubmissions && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
                <Badge variant="outline">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {submissions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                    <p className="text-gray-600">Users will submit their work here once they start working on your bounty.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      userAccount={submissionUsers.get(submission.userWalletKey)}
                      isOwner={isOwner && bounty.status === 'active'}
                      onSelectWinner={() => handleSelectWinner(submission)}
                      isLoading={selectingWinner === submission.userWalletKey}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role-based Information */}
          {!canViewSubmissions && userRole === 'user' && (
            <Card className="mb-8">
              <CardContent className="text-center py-8">
                <EyeOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Submissions Hidden</h3>
                <p className="text-gray-600">
                  Only the bounty creator (client) can view submissions. 
                  {hasSubmitted ? ' You have already submitted to this bounty.' : ' Submit your work to get started!'}
                </p>
              </CardContent>
            </Card>
          )}

          {!canSubmit && userRole === 'user' && (
            <Card className="mb-8">
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasSubmitted ? 'Already Submitted' : 'Cannot Submit'}
                </h3>
                <p className="text-gray-600">
                  {hasSubmitted 
                    ? 'You have already submitted your work to this bounty. Wait for the client to review and select a winner.'
                    : 'This bounty is not active or you are not eligible to submit.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}