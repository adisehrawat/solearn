import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useWallet } from '@solana/wallet-adapter-react';
import { useApp } from '@/contexts/AppContext';
import { SolEarnProgram } from '@/lib/program';
import { UserRole } from '@/types/program';
import { useSolana } from '@/contexts/SolanaProvider';
import { Wallet, User, Building, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { WalletButton } from '@/components/solana/solana-provider'

export function SignIn() {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { setUserRole } = useApp();
  const { programInitialized } = useSolana();
  const [step, setStep] = useState<'connect' | 'role' | 'profile'>('connect');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: [] as string[],
    // Client-specific fields
    companyName: '',
    companyEmail: '',
    companyLink: '',
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (connected && programInitialized && publicKey) {
        try {
          // Check if user already has a profile
          const userProfile = await SolEarnProgram.getUser(publicKey);
          const clientProfile = await SolEarnProgram.getClient(publicKey);
          
          if (userProfile) {
            setUserRole('user');
            navigate('/user-dashboard');
            return;
          }
          
          if (clientProfile) {
            setUserRole('client');
            navigate('/client-dashboard');
            return;
          }
          
          // No existing profile found, show role selection
          setStep('role');
        } catch (error) {
          console.error('Error checking existing profile:', error);
          setStep('role');
        }
      }
    };

    checkExistingProfile();
  }, [connected, programInitialized, publicKey, navigate, setUserRole]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('profile');
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };



  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !selectedRole || !programInitialized) return;

    setIsLoading(true);
    try {
      if (selectedRole === 'client') {
        const result = await SolEarnProgram.createClient(
          formData.companyName,
          formData.companyEmail,
          formData.companyLink
        );
        toast.success(result.message);
      } else {
        const result = await SolEarnProgram.createUser(
          formData.name,
          formData.email,
          formData.skills,
          formData.bio
        );
        toast.success(result.message);
      }

      setUserRole(selectedRole);
      
      // Navigate to appropriate dashboard
      if (selectedRole === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error: unknown) {
      console.error(error);
      
      // Handle specific error messages
      if (error instanceof Error && error.message?.includes('already exists')) {
        toast.error('Profile already exists for this wallet. Redirecting to dashboard...');
        
        // Try to redirect to the appropriate dashboard
        try {
          const userProfile = await SolEarnProgram.getUser(publicKey);
          const clientProfile = await SolEarnProgram.getClient(publicKey);
          
          if (userProfile) {
            setUserRole('user');
            navigate('/user-dashboard');
          } else if (clientProfile) {
            setUserRole('client');
            navigate('/client-dashboard');
          }
        } catch (redirectError) {
          console.error('Error during redirect:', redirectError);
        }
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {step === 'connect' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Wallet className="h-6 w-6" />
                    <span>Connect Wallet</span>
                  </CardTitle>
                  <CardDescription>
                    Connect your Solana wallet to start using solEARN
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="wallet-button-container">
                    <WalletButton />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'role' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Choose Your Role</CardTitle>
                  <CardDescription>
                    Select how you want to use solEARN
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-6 flex-col space-y-2"
                    onClick={() => handleRoleSelect('client')}
                  >
                    <Building className="h-8 w-8 text-blue-600" />
                    <div className="text-center">
                      <div className="font-semibold">Client</div>
                      <div className="text-sm text-gray-600">
                        Post bounties and manage projects
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-auto p-6 flex-col space-y-2"
                    onClick={() => handleRoleSelect('user')}
                  >
                    <User className="h-8 w-8 text-green-600" />
                    <div className="text-center">
                      <div className="font-semibold">Creator</div>
                      <div className="text-sm text-gray-600">
                        Complete bounties and earn rewards
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>
                    {selectedRole === 'client' 
                      ? 'Set up your client profile to start posting bounties'
                      : 'Set up your creator profile to start earning'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {selectedRole === 'client' ? (
                      <>
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            required
                            value={formData.companyName}
                            placeholder="e.g., Acme Corporation"
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="companyEmail">Company Email</Label>
                          <Input
                            id="companyEmail"
                            type="email"
                            required
                            value={formData.companyEmail}
                            placeholder="e.g., contact@acme.com"
                            onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="companyLink">Company Website</Label>
                          <Input
                            id="companyLink"
                            type="url"
                            required
                            value={formData.companyLink}
                            placeholder="e.g., https://acme.com"
                            onChange={(e) => setFormData({ ...formData, companyLink: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            placeholder="e.g., John Doe"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            placeholder="e.g., john@example.com"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedRole === 'user' && (
                      <div>
                        <Label htmlFor="skills">Skills</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            placeholder="Enter a skill"
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
                          {formData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{skill}</span>
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRole === 'user' && (
                      <div>
                        <Label htmlFor="bio">Bio (Optional)</Label>
                        <Textarea
                          id="bio"
                          rows={3}
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Creating Profile...
                          </>
                        ) : (
                          'Create Profile'
                        )}
                      </Button>
                      

                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}