import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BountyCard } from '@/components/bounty/BountyCard';
import { Search, Filter, Target, User, Award, Clock } from 'lucide-react';

import { SolEarnProgram } from '@/lib/program';
import { useSolana } from '@/contexts/SolanaProvider';
import { useWallet } from '@solana/wallet-adapter-react';

import toast from 'react-hot-toast';
import { BountyAccount as FrontendBountyAccount, UserAccount } from '@/types/program';

// Real bounty data will be fetched from Solana program

export function UserDashboard() {
  const [bounties, setBounties] = useState<FrontendBountyAccount[]>([]);
  const [userProfile, setUserProfile] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { programInitialized } = useSolana();
  const { publicKey } = useWallet();


  // Load user profile and bounties
  useEffect(() => {
    const loadUserData = async () => {
      if (!programInitialized || !publicKey) return;
      
      setIsLoading(true);
      try {
        // Load user profile
        const profile = await SolEarnProgram.getUser(publicKey);
        setUserProfile(profile);
        
        // Load all bounties for browsing
        const allBounties = await SolEarnProgram.getAllBounties();
        setBounties(allBounties);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [programInitialized, publicKey]);

  // Get user-relevant skills (user's skills + skills from bounties they've submitted to)
  const userRelevantSkills = userProfile ? [
    ...userProfile.skills,
    ...Array.from(new Set(bounties.flatMap(bounty => bounty.skills)))
  ].filter((skill, index, arr) => arr.indexOf(skill) === index).sort() : [];

  const filteredBounties = bounties.filter(bounty => {
    const matchesSearch = searchTerm === '' || 
      bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bounty.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some(skill => bounty.skills.includes(skill));
    
    return matchesSearch && matchesSkills;
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {userProfile ? `Welcome back, ${userProfile.name}!` : 'Welcome to your dashboard'}
            </p>
            {userProfile && (
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{userProfile.email}</span>
                </div>
                {userProfile.bio && (
                  <div className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{userProfile.bio}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Stats */}
          {userProfile && (
            <div className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{userProfile.bountiesCompleted}</p>
                      <p className="text-sm text-gray-600">Bounties Won</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{userProfile.bountiesSubmitted}</p>
                      <p className="text-sm text-gray-600">Submissions Made</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{userProfile.skills.length}</p>
                      <p className="text-sm text-gray-600">Skills</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                        <span className="text-2xl font-bold text-yellow-600">₿</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{userProfile.earned.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">SOL Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}



          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search bounties by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Filter by skills:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userRelevantSkills.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSkills([])}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bounties Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Bounties
            </h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${filteredBounties.length} bounties found`}
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bounties...</p>
              </CardContent>
            </Card>
          ) : filteredBounties.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bounties found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSkills([]);
                  }}
                >
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBounties.map((bounty, index) => (
                <motion.div
                  key={`${bounty.creator}-${bounty.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BountyCard bounty={bounty} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}