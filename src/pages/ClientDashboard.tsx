import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BountyCard } from '@/components/bounty/BountyCard';
import { CreateBountyForm } from '@/components/forms/CreateBountyForm';
import { BountyEditForm } from '@/components/forms/BountyEditForm';
import { SolEarnProgram } from '@/lib/program';
import { Plus, Target, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSolana } from '@/contexts/SolanaProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { UserAnalytics } from '@/components/analytics/UserAnalytics';
import { BountyAccount as FrontendBountyAccount } from '@/types/program';

// Using real data from Solana program instead of mock data

export function ClientDashboard() {
  const [bounties, setBounties] = useState<FrontendBountyAccount[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBounty, setEditingBounty] = useState<FrontendBountyAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingBountyId, setDeletingBountyId] = useState<string | null>(null);
  const [loadingBounties, setLoadingBounties] = useState(true);
  const { programInitialized } = useSolana();
  const { publicKey } = useWallet();

  // Load bounties on component mount
  useEffect(() => {
    const loadBounties = async () => {
      if (!programInitialized || !publicKey) return;
      
      try {
        setLoadingBounties(true);
        const allBounties = await SolEarnProgram.getAllBounties();
        // Filter bounties created by current user
        const userBounties = allBounties.filter(bounty => 
          bounty.creator === publicKey.toString()
        );
        setBounties(userBounties);
      } catch (error) {
        console.error('Error loading bounties:', error);
        toast.error('Failed to load bounties');
      } finally {
        setLoadingBounties(false);
      }
    };

    loadBounties();
  }, [programInitialized, publicKey]);

  const refreshBounties = async () => {
    if (!programInitialized || !publicKey) return;
    
    try {
      setLoadingBounties(true);
      const allBounties = await SolEarnProgram.getAllBounties();
      const userBounties = allBounties.filter(bounty => 
        bounty.creator === publicKey.toString()
      );
      setBounties(userBounties);
      toast.success('Bounties refreshed successfully');
    } catch (error) {
      console.error('Error refreshing bounties:', error);
      toast.error('Failed to refresh bounties');
    } finally {
      setLoadingBounties(false);
    }
  };

  const handleEditBounty = (bounty: FrontendBountyAccount) => {
    setEditingBounty(bounty);
    setShowEditForm(true);
  };

  const handleUpdateBounty = async (data: {
    newTitle: string;
    newDescription: string;
    newDeadline: string;
    newSkills: string[];
  }) => {
    if (!editingBounty || !programInitialized || !publicKey) return;

    setIsEditing(true);
    try {
      const result = await SolEarnProgram.updateBounty(
        editingBounty.title, // original title
        data.newTitle,
        data.newDescription,
        new Date(data.newDeadline)
      );

      toast.success(result.message);
      setShowEditForm(false);
      setEditingBounty(null);

      // Reload bounties to reflect changes
      await refreshBounties();

    } catch (error: unknown) {
      console.error('Error updating bounty:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bounty';
      toast.error(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteBounty = async (bounty: FrontendBountyAccount) => {
    if (!programInitialized || !publicKey) return;

    if (!confirm(`Are you sure you want to delete "${bounty.title}"? This action cannot be undone and will refund the reward to your wallet.`)) {
      return;
    }

    setIsDeleting(true);
    setDeletingBountyId(bounty.id);
    try {
      const result = await SolEarnProgram.deleteBounty(bounty.title);
      
      toast.success(result.message);
      
      // Reload bounties after deletion
      await refreshBounties();

    } catch (error: unknown) {
      console.error('Error deleting bounty:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bounty';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeletingBountyId(null);
    }
  };

  const handleCreateBounty = async (data: { title: string; description: string; reward: number; deadline: string; skills: string[] }) => {
    if (!programInitialized || !publicKey) {
      toast.error('Program not initialized or wallet not connected');
      return;
    }

    setIsLoading(true);
    try {
      const result = await SolEarnProgram.createBounty(
        data.title,
        data.description,
        data.reward,
        new Date(data.deadline),
        data.skills
      );
      
      setShowCreateForm(false);
      toast.success(result.message);
      
      // Reload bounties after creation
      const allBounties = await SolEarnProgram.getAllBounties();
      
      const userBounties = allBounties.filter(bounty => 
        bounty.creator === publicKey.toString()
      );
      setBounties(userBounties);
    } catch (error: unknown) {
      console.error('Error creating bounty:', error);
      
      let errorMessage = 'Failed to create bounty';
      
      // Handle specific Anchor errors
      if (error && typeof error === 'object' && 'error' in error) {
        const anchorError = (error as { error: { errorCode: { code: number } } }).error;
        if (anchorError && anchorError.errorCode) {
          switch (anchorError.errorCode.code) {
            case 6008: // InsufficientSolBalance
              errorMessage = 'Insufficient SOL balance for bounty reward. Please check your wallet balance.';
              break;
            case 6000: // InsufficientFunds
              errorMessage = 'Insufficient funds to create bounty. Please add more SOL to your wallet.';
              break;
            default:
              errorMessage = `Program error: ${anchorError.errorCode.code}`;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

// Stats moved to UserAnalytics component

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your bounties and track progress</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 sm:mt-0"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Bounty
            </Button>
          </div>

          {/* Client Analytics */}
          <div className="mb-8">
            <UserAnalytics userRole="client" />
          </div>
        </motion.div>

        {showCreateForm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CreateBountyForm
              onSubmit={handleCreateBounty}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isLoading}
            />
          </motion.div>
        ) : showEditForm && editingBounty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Bounty</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingBounty(null);
                }}
                disabled={isEditing}
              >
                ×
              </Button>
            </div>
            <BountyEditForm
              bounty={editingBounty}
              onSubmit={handleUpdateBounty}
              onCancel={() => {
                setShowEditForm(false);
                setEditingBounty(null);
              }}
              isLoading={isEditing}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Bounties</h2>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">{bounties.length} total</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshBounties}
                  disabled={loadingBounties}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingBounties ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {loadingBounties ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading bounties...</h3>
                  <p className="text-gray-600">Please wait while we fetch your bounties</p>
                </CardContent>
              </Card>
            ) : bounties.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bounties yet</h3>
                  <p className="text-gray-600 mb-4">Create your first bounty to start finding talent</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Bounty
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bounties.map((bounty, index) => (
                  <motion.div
                    key={bounty.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BountyCard
                      bounty={bounty}
                      showActions={true}
                      onEdit={() => handleEditBounty(bounty)}
                      onDelete={() => handleDeleteBounty(bounty)}
                      isEditing={isEditing && editingBounty?.id === bounty.id}
                      isDeleting={isDeleting && deletingBountyId === bounty.id}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}