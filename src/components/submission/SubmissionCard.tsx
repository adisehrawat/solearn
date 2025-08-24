// React import not needed with new JSX transform
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FrontendSubmissionAccount } from '@/types/program';
import { ExternalLink, Award, Clock } from 'lucide-react';

interface SubmissionCardProps {
  submission: FrontendSubmissionAccount;
  userAccount?: { name: string; email: string; bio?: string; skills?: string[] }; // User account data
  onSelectWinner?: () => void;
  isOwner?: boolean;
  isSelected?: boolean;
  isLoading?: boolean;
}

export function SubmissionCard({ 
  submission, 
  userAccount,
  onSelectWinner, 
  isOwner = false,
  isSelected = false,
  isLoading = false
}: SubmissionCardProps) {
  
  const truncateWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`h-full ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'} transition-all`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {userAccount?.name || 'Anonymous User'}
                {isSelected && <Award className="h-5 w-5 text-green-600" />}
              </CardTitle>
              <CardDescription className="mt-1">
                {truncateWallet(submission.userWalletKey)}
              </CardDescription>
            </div>
            {isSelected && (
              <Badge variant="default" className="bg-green-600">
                Winner
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Submission Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {submission.description}
              </p>
            </div>

            {submission.workUrl && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Work URL</h4>
                <a
                  href={submission.workUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Submission</span>
                </a>
              </div>
            )}

            {userAccount && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submitter Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {userAccount.skills?.slice(0, 3).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {userAccount.skills && userAccount.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{userAccount.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {isOwner && !isSelected && (
              <div className="pt-2">
                <Button
                  onClick={onSelectWinner}
                  disabled={isLoading}
                  className="w-full"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Selecting...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Select as Winner
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
