import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolana } from '@/contexts/SolanaProvider';

const bountySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  reward: z.number().min(0.1, 'Reward must be at least 0.1 SOL'),
  deadline: z.string(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

type BountyFormData = z.infer<typeof bountySchema>;

interface CreateBountyFormProps {
  onSubmit: (data: BountyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateBountyForm({ onSubmit, onCancel, isLoading = false }: CreateBountyFormProps) {
  const [skillInput, setSkillInput] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const { publicKey } = useWallet();
  const { connection } = useSolana();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BountyFormData>({
    resolver: zodResolver(bountySchema),
    defaultValues: {
      skills: [],
    },
  });

  React.useEffect(() => {
    setValue('skills', skills);
  }, [skills, setValue]);

  // Check wallet balance
  useEffect(() => {
    const checkBalance = async () => {
      if (!publicKey || !connection) return;
      
      setIsCheckingBalance(true);
      try {
        const balance = await connection.getBalance(publicKey);
        setWalletBalance(balance / 1e9); // Convert lamports to SOL
      } catch (error) {
        console.error('Error checking wallet balance:', error);
      } finally {
        setIsCheckingBalance(false);
      }
    };

    checkBalance();
  }, [publicKey, connection]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleFormSubmit = async (data: BountyFormData) => {

    
    // Calculate total required SOL (reward + fees + buffer)
    const rewardAmount = data.reward;
    const accountCreationFee = 0.00203928; // Rent exemption for bounty account (~2.03928 SOL)
    const escrowAccountFee = 0.00203928; // Rent exemption for escrow account (~2.03928 SOL)
    const transactionFee = 0.001; // Estimated transaction fee
    const buffer = 0.001; // Additional buffer for safety
    
    const totalRequired = rewardAmount + accountCreationFee + escrowAccountFee + transactionFee + buffer;
    

    
    // Check if user has sufficient balance
    if (totalRequired > walletBalance) {
      const message = `Insufficient SOL balance for bounty creation.\n\nReward: ${rewardAmount} SOL\nAccount Creation: ${(accountCreationFee + escrowAccountFee).toFixed(6)} SOL\nTransaction Fee: ${transactionFee} SOL\nBuffer: ${buffer} SOL\nTotal Required: ${totalRequired.toFixed(6)} SOL\nYour Balance: ${walletBalance.toFixed(4)} SOL\n\nPlease add more SOL to your wallet or reduce the bounty reward.`;
  
      alert(message);
      return;
    }
    

    await onSubmit({
      ...data,
      skills,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Bounty</CardTitle>
        <CardDescription>
          Fill in the details to create a new bounty for your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Wallet Balance Display */}
        {publicKey && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Wallet Balance</span>
            </div>
            {isCheckingBalance ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">Checking balance...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-900">
                  {walletBalance.toFixed(4)} SOL
                </span>
                {walletBalance < 0.1 && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Low balance</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter bounty title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              {...register('description')}
              placeholder="Describe what you need done..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reward">Reward (SOL)</Label>
              <Input
                id="reward"
                type="number"
                step="0.1"
                {...register('reward', { valueAsNumber: true })}
                placeholder="0.0"
              />
              {errors.reward && (
                <p className="text-sm text-red-600 mt-1">{errors.reward.message}</p>
              )}
              {publicKey && (
                <p className="text-sm text-gray-600 mt-1">
                  Available: {walletBalance.toFixed(4)} SOL
                  {walletBalance < 0.1 && (
                    <span className="text-orange-600 ml-2">
                      • Consider getting an airdrop from the header
                    </span>
                  )}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                {...register('deadline')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.deadline && (
                <p className="text-sm text-red-600 mt-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex space-x-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Enter a skill and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            {errors.skills && (
              <p className="text-sm text-red-600 mt-1">{errors.skills.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Bounty'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}