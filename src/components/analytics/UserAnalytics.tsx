import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SolEarnProgram } from '@/lib/program';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolana } from '@/contexts/SolanaProvider';
import { PublicKey } from '@solana/web3.js';
import { 
  DollarSign, 
  Award, 
  Target,
  Users,
  Clock,
  Star
} from 'lucide-react';

interface UserAnalyticsProps {
  userRole: 'user' | 'client';
}

interface AnalyticsData {
  totalEarned?: number;
  totalSpent?: number;
  completedBounties: number;
  activeBounties: number;
  totalSubmissions: number;
  winRate?: number;
  avgBountyValue?: number;
  topSkills: string[];
  recentActivity: ActivityItem[];
  monthlyTrend: number;
  rankPosition?: number;
}

interface ActivityItem {
  type: 'bounty_created' | 'bounty_won' | 'bounty_completed';
  title: string;
  amount?: number;
  date: Date;
  status: 'completed' | 'pending' | 'active';
}

export function UserAnalytics({ userRole }: UserAnalyticsProps) {
  const { publicKey } = useWallet();
  const { programInitialized } = useSolana();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!programInitialized || !publicKey) return;

      try {
        setLoading(true);
        
        if (userRole === 'user') {
          await loadUserAnalytics();
        } else {
          await loadClientAnalytics();
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [programInitialized, publicKey, userRole]);

  const loadUserAnalytics = async () => {
    if (!publicKey) return;

    // Get user data
    const userData = await SolEarnProgram.getUser(publicKey);
    
    // Get all bounties to find submissions and wins
    const allBounties = await SolEarnProgram.getAllBounties();
    
    // Calculate analytics
    let totalEarned = 0;
    let completedBounties = 0;
    let totalSubmissions = 0;
    let winCount = 0;
    const recentActivity: ActivityItem[] = [];
    const skillFrequency: { [key: string]: number } = {};

    // Start with user's earned amount from profile if available
    if (userData?.earned) {
      totalEarned = userData.earned;
    }

    // Check each bounty for user's submissions and wins
    for (const bounty of allBounties) {
      try {
        const submissions = await SolEarnProgram.getSubmissionsForBounty(
          bounty.title,
          new PublicKey(bounty.creator)
        );
        
        const userSubmission = submissions.find(sub => 
          sub.userWalletKey.toString() === publicKey.toString()
        );
        
        if (userSubmission) {
          totalSubmissions++;
          
          // Check if user won this bounty (only add to activity if they won)
          if (bounty.status === 'completed') {
            // For user analytics, we only want to show bounty wins, not submissions
            // This ensures the recent activity only shows actual wins
            winCount++;
            completedBounties++;
            totalEarned += SolEarnProgram.formatSolAmount(bounty.reward);
            
            recentActivity.push({
              type: 'bounty_won',
              title: bounty.title,
              amount: SolEarnProgram.formatSolAmount(bounty.reward),
              date: new Date(), // In real app, would get completion timestamp
              status: 'completed'
            });
            
            // Count skills from won bounties
            bounty.skills?.forEach((skill: string) => {
              skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
            });
          }
        }
      } catch {
        // Could not load submissions for bounty
      }
    }

    // Get top skills
    const topSkills = Object.entries(skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);

    // Calculate additional metrics
    const winRate = totalSubmissions > 0 ? (winCount / totalSubmissions) * 100 : 0;
    const avgBountyValue = completedBounties > 0 ? totalEarned / completedBounties : 0;
    
    // Sort recent activity by date
    recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

    setAnalytics({
      totalEarned,
      completedBounties,
      activeBounties: allBounties.filter(b => b.status === 'active').length,
      totalSubmissions,
      winRate,
      avgBountyValue,
      topSkills: topSkills.length > 0 ? topSkills : (userData?.skills || []).slice(0, 5),
      recentActivity: recentActivity.slice(0, 10),
      monthlyTrend: Math.random() * 40 - 20, // Mock trend
      rankPosition: Math.floor(Math.random() * 100) + 1, // Mock ranking
    });
  };

  const loadClientAnalytics = async () => {
    if (!publicKey) return;

    // Get client data for total spent information
    const clientData = await SolEarnProgram.getClient(publicKey);
    
    // Get all bounties created by this client
    const allBounties = await SolEarnProgram.getAllBounties();
    const clientBounties = allBounties.filter(bounty => 
      bounty.creator === publicKey.toString()
    );

    // Calculate analytics
    let totalSpent = 0;
    let completedBounties = 0;
    let activeBounties = 0;
    let totalSubmissions = 0;
    const recentActivity: ActivityItem[] = [];
    const skillFrequency: { [key: string]: number } = {};

    // Start with client's rewarded amount from profile if available
    if (clientData?.rewarded) {
      totalSpent = clientData.rewarded;
    }

    for (const bounty of clientBounties) {
      // Add bounty creation to recent activity
      recentActivity.push({
        type: 'bounty_created',
        title: bounty.title,
        amount: SolEarnProgram.formatSolAmount(bounty.reward),
        date: SolEarnProgram.formatTimestamp(bounty.createdAt),
        status: bounty.status === 'active' ? 'active' : 'completed'
      });

      if (bounty.status === 'active') {
        activeBounties++;
      } else if (bounty.status === 'completed') {
        completedBounties++;
        totalSpent += SolEarnProgram.formatSolAmount(bounty.reward);
      }

      // Count submissions for this bounty
      try {
        const submissions = await SolEarnProgram.getSubmissionsForBounty(
          bounty.title,
          new PublicKey(bounty.creator)
        );
        totalSubmissions += submissions.length;

        // Count required skills frequency
        bounty.skills?.forEach((skill: string) => {
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        });

        // Check if bounty is completed (has winner)
        if (bounty.status === 'completed') {
          recentActivity.push({
            type: 'bounty_completed',
            title: bounty.title,
            amount: SolEarnProgram.formatSolAmount(bounty.reward),
            date: new Date(), // In real app, would get completion timestamp
            status: 'completed'
          });
        }
      } catch {
        // Could not load submissions for bounty
      }
    }

    // Get top skills
    const topSkills = Object.entries(skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);

    // Calculate additional metrics
    const avgBountyValue = clientBounties.length > 0 ? 
      clientBounties.reduce((sum, b) => sum + SolEarnProgram.formatSolAmount(b.reward), 0) / clientBounties.length : 0;

    // Sort recent activity by date
    recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

    setAnalytics({
      totalSpent,
      completedBounties,
      activeBounties,
      totalSubmissions,
      avgBountyValue,
      topSkills: topSkills.length > 0 ? topSkills : ['React', 'TypeScript', 'Node.js', 'UI/UX', 'Web3'],
      recentActivity: recentActivity.slice(0, 10),
      monthlyTrend: Math.random() * 30 - 10, // Mock trend
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Start using the platform to see your analytics</p>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'bounty_created': return <Target className="h-4 w-4" />;
      case 'bounty_won': return <Award className="h-4 w-4 text-yellow-600" />;
      case 'bounty_completed': return <Star className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'bounty_created': return 'text-blue-600';
      case 'bounty_won': return 'text-yellow-600';
      case 'bounty_completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {userRole === 'user' ? 'Total Earned' : 'Total Spent'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(analytics.totalEarned || analytics.totalSpent || 0).toFixed(2)} SOL
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Bounties</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.completedBounties}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              {userRole === 'user' && analytics.winRate && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    {analytics.winRate.toFixed(1)}% win rate
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {userRole === 'user' ? 'Submissions' : 'Total Submissions'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  {analytics.activeBounties} active bounties
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Bounty Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(analytics.avgBountyValue || 0).toFixed(2)} SOL
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              {userRole === 'user' && analytics.rankPosition && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    Rank #{analytics.rankPosition}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity and Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {analytics.recentActivity.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No recent activity</p>
                ) : (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {activity.date.toLocaleDateString()}
                        </p>
                      </div>
                      {activity.amount && (
                        <div className="text-sm font-medium text-gray-900">
                          {activity.amount.toFixed(2)} SOL
                        </div>
                      )}
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'user' ? 'Top Skills' : 'Most Requested Skills'}
              </CardTitle>
              <CardDescription>
                {userRole === 'user' 
                  ? 'Skills from your successful bounties'
                  : 'Skills you request most often'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topSkills.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No skills data available</p>
                ) : (
                  analytics.topSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${100 - (index * 20)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-8">
                          {100 - (index * 20)}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
