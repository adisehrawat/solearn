import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useApp } from '@/contexts/AppContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolana } from '@/contexts/SolanaProvider';
import { User, Building, Edit, Save, X, DollarSign, Target, Trophy, Trash2 } from 'lucide-react';
import { SolEarnProgram } from '@/lib/program';
import toast from 'react-hot-toast';

export function Profile() {
  const { userRole, clientAccount, userAccount, isLoading: contextLoading, refreshProfile } = useApp();
  const { publicKey } = useWallet();
  const { programInitialized } = useSolana();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: [] as string[],
    companyName: '',
    companyEmail: '',
    companyLink: '',
    companyBio: '',
  });

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (userRole === 'user' && userAccount) {
      setFormData({
        name: userAccount.name,
        email: userAccount.email,
        bio: userAccount.bio,
        skills: [...userAccount.skills],
        companyName: '',
        companyEmail: '',
        companyLink: '',
        companyBio: '',
      });
    } else if (userRole === 'client' && clientAccount) {
      setFormData({
        name: '',
        email: '',
        bio: '',
        skills: [],
        companyName: clientAccount.companyName,
        companyEmail: clientAccount.companyEmail,
        companyLink: clientAccount.companyLink,
        companyBio: clientAccount.companyBio,
      });
    }
  }, [userRole, userAccount, clientAccount]);

  const profile = userRole === 'client' ? clientAccount : userAccount;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (userRole === 'user') {
        await SolEarnProgram.updateUser(
          formData.name,
          formData.email,
          formData.bio,
          formData.skills
        );
      } else if (userRole === 'client') {
        // TODO: Implement client update method
        // Client update not yet implemented
        toast.error('Client profile updates not yet implemented');
        return;
      }
      
      // Refresh profile data from blockchain
      await refreshProfile();
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Failed to update profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (userRole === 'user' && skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (userRole === 'user') {
      setFormData({
        ...formData,
        skills: formData.skills.filter(skill => skill !== skillToRemove),
      });
    }
  };

  const handleDeleteProfile = async () => {
    if (!publicKey || !programInitialized) return;
    
    const confirmMessage = userRole === 'client' 
      ? 'Are you sure you want to delete your client profile? This action cannot be undone.'
      : 'Are you sure you want to delete your user profile? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) return;
    
    setIsDeleting(true);
    try {
      if (userRole === 'client') {
        await SolEarnProgram.deleteClient();
        toast.success('Client profile deleted successfully');
        // Redirect to sign in page
        window.location.href = '/signin';
      } else if (userRole === 'user') {
        await SolEarnProgram.deleteUser();
        toast.success('User profile deleted successfully');
        // Redirect to sign in page
        window.location.href = '/signin';
      }
    } catch (error: unknown) {
      console.error('Failed to delete profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete profile');
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = userRole === 'client' && clientAccount
    ? [
        { title: 'Total Bounties', value: clientAccount.bountiesPosted, icon: Target, color: 'text-blue-600' },
        { title: 'Total Spent', value: `${clientAccount.rewarded.toFixed(2)} SOL`, icon: DollarSign, color: 'text-green-600' },
        { title: 'Member Since', value: clientAccount.joinedAt.getFullYear().toString(), icon: Building, color: 'text-purple-600' },
      ]
    : userRole === 'user' && userAccount
    ? [
        { title: 'Completed Bounties', value: userAccount.bountiesCompleted, icon: Trophy, color: 'text-yellow-600' },
        { title: 'Total Earnings', value: `${userAccount.earned.toFixed(2)} SOL`, icon: DollarSign, color: 'text-green-600' },
        { title: 'Member Since', value: userAccount.joinedAt.getFullYear().toString(), icon: User, color: 'text-blue-600' },
      ]
    : [];

  // Show loading state when profile data is being fetched
  if (contextLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={isEditing ? 'ghost' : 'outline'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="flex items-center"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {userRole === 'client' ? (
                    <Building className="h-8 w-8 text-white" />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {userRole === 'client' && clientAccount ? clientAccount.companyName : 
                     userRole === 'user' && userAccount ? userAccount.name : 
                     'Unknown'}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <span className="capitalize">{userRole}</span>
                    <span>•</span>
                    <span>{publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      {userRole === 'client' ? 'Company Name' : 'Full Name'}
                    </Label>
                    <Input
                      id="name"
                      value={userRole === 'client' ? formData.companyName : formData.name}
                      disabled={!isEditing}
                      onChange={(e) => {
                        if (userRole === 'client') {
                          setFormData({ ...formData, companyName: e.target.value });
                        } else {
                          setFormData({ ...formData, name: e.target.value });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">
                      {userRole === 'client' ? 'Company Email' : 'Email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userRole === 'client' ? formData.companyEmail : formData.email}
                      disabled={!isEditing}
                      onChange={(e) => {
                        if (userRole === 'client') {
                          setFormData({ ...formData, companyEmail: e.target.value });
                        } else {
                          setFormData({ ...formData, email: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>

                {userRole === 'client' && (
                  <div>
                    <Label htmlFor="companyLink">Company Website</Label>
                    <Input
                      id="companyLink"
                      value={formData.companyLink}
                      disabled={!isEditing}
                      placeholder="https://company.com"
                      onChange={(e) => setFormData({ ...formData, companyLink: e.target.value })}
                    />
                  </div>
                )}

                {userRole === 'user' && (
                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    {isEditing && (
                      <div className="flex space-x-2 mb-3">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Add a skill"
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
                    )}
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{skill}</span>
                          {isEditing && (
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSkill(skill)}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="bio">
                    {userRole === 'client' ? 'Company Bio' : 'Bio'}
                  </Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={userRole === 'client' ? formData.companyBio : formData.bio}
                    disabled={!isEditing}
                    onChange={(e) => {
                      if (userRole === 'client') {
                        setFormData({ ...formData, companyBio: e.target.value });
                      } else {
                        setFormData({ ...formData, bio: e.target.value });
                      }
                    }}
                    placeholder={userRole === 'client' ? 'Tell us about your company...' : 'Tell us about yourself...'}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}