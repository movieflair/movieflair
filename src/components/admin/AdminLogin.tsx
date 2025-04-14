
import { useState, FormEvent } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // In a real app, this would be an API call to verify credentials
    setTimeout(() => {
      // Mock credentials for demo purposes only
      if (username === 'admin' && password === 'password') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        onLogin();
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="text-muted-foreground mt-2">Sign in to access the admin panel</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium block">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium block">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full button-primary"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Demo credentials: admin / password</p>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
