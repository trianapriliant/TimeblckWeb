
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { loginWithGoogle, getRedirectResultFromGoogle, signUpWithEmailPassword, signInWithEmailPassword } from '@/lib/firebase/auth';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.98-4.32 1.98-3.36 0-6.21-2.82-6.21-6.18s2.85-6.18 6.21-6.18c1.8 0 3.06.72 3.96 1.62l2.64-2.64C18.01 2.49 15.48 1 12.48 1 5.88 1 1 5.98 1 12s4.88 11 11.48 11c3.03 0 5.45-1 7.25-2.73 1.94-1.85 2.58-4.38 2.58-6.88 0-.63-.05-1.22-.16-1.78Z" />
    </svg>
);

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isProcessingAuth, setIsProcessingAuth] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);


    React.useEffect(() => {
        // This effect will run only once on mount, handling the redirect result.
        const handleAuthFlow = async () => {
            if (!auth) {
                setIsProcessingAuth(false);
                return;
            }

            try {
                const result = await getRedirectResultFromGoogle();
                if (result) {
                    // If we get a result, the user is logged in, and the auth state will update.
                    // The other effect will then handle redirection.
                    router.push('/');
                } else {
                    // No redirect result, which is normal on first load or refresh.
                    // Now, we can safely check the existing auth state.
                    if (!loading && user) {
                         router.push('/');
                    } else {
                         setIsProcessingAuth(false);
                    }
                }
            } catch (error) {
                console.error("Error processing redirect result:", error);
                setIsProcessingAuth(false);
            }
        };

        handleAuthFlow();

    }, []); // Empty dependency array ensures it runs only once.

     React.useEffect(() => {
        // This effect reacts to changes in auth state AFTER the initial check.
        if (!loading && user) {
            router.push('/');
        }
     }, [user, loading, router]);


    const handleGoogleLogin = async () => {
        if (!auth) {
            alert("Firebase is not configured. Please check your environment variables.");
            return;
        }
        setIsProcessingAuth(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Login failed:", error);
            setIsProcessingAuth(false);
        }
    };

    const handleEmailAuth = async (action: 'signIn' | 'signUp') => {
        if (!auth) {
            alert("Firebase is not configured. Please check your environment variables.");
            return;
        }
        if (!email || !password) {
            toast({ variant: 'destructive', title: 'Error', description: 'Email and password cannot be empty.' });
            return;
        }
        setIsProcessingAuth(true);
        try {
            if (action === 'signUp') {
                await signUpWithEmailPassword(email, password);
            } else {
                await signInWithEmailPassword(email, password);
            }
            router.push('/');
        } catch (error: any) {
            console.error(`${action} failed:`, error);
            toast({ variant: 'destructive', title: 'Authentication Failed', description: error.message });
            setIsProcessingAuth(false);
        }
    };
    
    if (loading || isProcessingAuth) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen items-start justify-center bg-muted/50 p-4 pt-24">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                         <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            fill="none"
                            className="h-12 w-12"
                        >
                            <rect x="2" y="2" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="12" y="2" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="22" y="2" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="2" y="12" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="12" y="12" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
                            <rect x="22" y="12" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="2" y="22" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="12" y="22" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
                            <rect x="22" y="22" width="8" height="8" rx="2" fill="currentColor" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl">Selamat Datang di Timeblck</CardTitle>
                    <CardDescription>
                        Masuk atau buat akun untuk menyinkronkan data Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                            />
                            <Button 
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="flex w-full gap-2">
                        <Button onClick={() => handleEmailAuth('signUp')} variant="secondary" className="w-full" disabled={isProcessingAuth}>
                            Sign Up
                        </Button>
                        <Button onClick={() => handleEmailAuth('signIn')} className="w-full" disabled={isProcessingAuth}>
                            Sign In
                        </Button>
                    </div>

                    <div className="relative w-full">
                        <Separator className="absolute top-1/2 -translate-y-1/2" />
                        <span className="relative bg-card px-2 text-xs uppercase text-muted-foreground">Or</span>
                    </div>

                    <Button onClick={handleGoogleLogin} variant="outline" className="w-full" disabled={isProcessingAuth}>
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Masuk dengan Google
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
