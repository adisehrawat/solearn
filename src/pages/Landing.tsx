import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BountyCard } from '@/components/bounty/BountyCard';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Users, Zap } from 'lucide-react';
import { SolEarnProgram } from '@/lib/program';
import { useSolana } from '@/contexts/SolanaProvider';
import toast from 'react-hot-toast';
import { BountyAccount as FrontendBountyAccount } from '@/types/program';

// Real bounty data will be fetched from Solana program

export function Landing() {
  const navigate = useNavigate();
  const [recentBounties, setRecentBounties] = useState<FrontendBountyAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { programInitialized } = useSolana();

  // Fetch recent bounties from Solana program
  useEffect(() => {
    const loadRecentBounties = async () => {
      if (!programInitialized) return;
      
      setIsLoading(true);
      try {
        const allBounties = await SolEarnProgram.getAllBounties();
        // Show only the first 3 bounties for the landing page
        setRecentBounties(allBounties.slice(0, 3));
      } catch (error) {
        console.error('Error loading recent bounties:', error);
        toast.error('Failed to load recent bounties');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentBounties();
  }, [programInitialized]);

  const features = [
    {
      icon: Target,
      title: 'Post Bounties',
      description: 'Create detailed bounties with specific requirements and deadlines',
    },
    {
      icon: Users,
      title: 'Find Talent',
      description: 'Connect with skilled developers and creators in the Solana ecosystem',
    },
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Automated payments through smart contracts when work is completed',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Hunt Bounties,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Earn Rewards
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The premier bounty platform on Solana. Connect talented creators with exciting 
              projects and get paid instantly through smart contracts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/signin')}
                className="px-8 py-4 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById('bounties')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 text-lg"
              >
                Browse Bounties
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose solEARN?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built on Solana for fast, low-cost transactions and seamless user experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Bounties Section */}
      <section id="bounties" className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recent Bounties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover exciting opportunities and start earning today
            </p>
          </motion.div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading recent bounties...</p>
            </motion.div>
          ) : recentBounties.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recentBounties.map((bounty) => (
                <BountyCard key={`${bounty.creator}-${bounty.title}`} bounty={bounty} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center py-12"
            >
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bounties available</h3>
              <p className="text-gray-600">Be the first to post a bounty!</p>
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/signin')}
              className="px-8 py-4"
            >
              View All Bounties
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}