import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminLogin: React.FC = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(id, password);
      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Administrator!',
        });
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          try {
            navigate('/admin');
          } catch (navError) {
            console.error('Navigation error:', navError);
            window.location.href = '/admin';
          }
        }, 100);
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card border-primary/30 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" showText={true} />
            </div>
            <CardTitle className="font-display text-2xl gradient-text-primary mb-2">Admin Login</CardTitle>
            <CardDescription className="text-base">
              Event Flow • Intelligent Crowd Management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Admin ID
                </Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="Enter your admin ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-xs text-muted-foreground"
              >
                ← Back to User View
              </Button>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p>ID: admin</p>
              <p>Password: eventflow2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

