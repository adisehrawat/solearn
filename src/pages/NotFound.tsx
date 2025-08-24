// React import not needed with new JSX transform
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <Card>
            <CardHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4"
              >
                <Search className="h-10 w-10 text-white" />
              </motion.div>
              <CardTitle className="text-6xl font-bold text-gray-900 mb-2">404</CardTitle>
              <CardDescription className="text-lg">
                Oops! The page you're looking for doesn't exist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                The bounty you're hunting for might have moved or been completed. 
                Let's get you back on track.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/')} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}