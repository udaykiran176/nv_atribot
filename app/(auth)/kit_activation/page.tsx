"use client"
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
type ActivatedCourse = { id: number; title: string; description: string };
import { QrCode, Key, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import  Link  from 'next/link';

const ActivationContent = () => {
  const router = useRouter();
  const params = useSearchParams();
  const initialKey = params.get('key') || '';
  const [licenseKey, setLicenseKey] = useState(initialKey);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activatedCourse, setActivatedCourse] = useState<ActivatedCourse | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch('/api/licenses/me', { cache: 'no-store' });
        const data = await res.json();
        if (!mounted) return;
        if (data?.active) router.push('/learn');
      } catch {}
    };
    void check();
    return () => { mounted = false; };
  }, [router]);

  const formatLicenseKey = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Add dashes every 4 characters
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.slice(0, 4).join('-');
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setError(null);
  };

  const handleActivate = async () => {
    if (licenseKey.length !== 19) {
      setError('Please enter a valid 16-character license key');
      return;
    }

    setIsLoading(true);
    setError(null);
    const res = await fetch('/api/licenses/activate', { method: 'POST', body: JSON.stringify({ key: licenseKey }) });
    if (res.ok) {
      const data = await res.json() as { course: ActivatedCourse };
      setActivatedCourse(data.course);
      toast(`You've unlocked ${data.course.title}!`);
    } else {
      const msg = await res.json().catch(() => ({})) as { error?: string };
      setError(msg.error || 'Invalid or already used license key. Please check and try again.');
    }
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (activatedCourse) {
      router.push('/learn');
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    const res = await fetch('/api/licenses/deactivate', { method: 'POST' });
    setIsLoading(false);
    if (res.ok) {
      setActivatedCourse(null);
      toast('Your license has been deactivated.');
    } else {
      toast('Failed to deactivate license.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
  
      <main className="pt-10 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Activate Your Kit
              </h1>
              <p className="text-muted-foreground">
                Enter the license key from your Atribot kit card to unlock your courses
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!activatedCourse ? (
                <motion.div
                  key="activation-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <Key className="w-5 h-5 text-primary" />
                        Enter License Key
                      </CardTitle>
                      <CardDescription>
                        Find the 16-character key on your kit card
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="license-key">License Key</Label>
                        <Input
                          id="license-key"
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          value={licenseKey}
                          onChange={handleKeyChange}
                          className="text-center text-xl tracking-widest font-mono h-14"
                          maxLength={19}
                        />
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-destructive text-sm"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                          </motion.div>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        className="w-full"
                        size="lg"
                        onClick={handleActivate}
                        disabled={isLoading || licenseKey.length !== 19}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Activating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Activate Kit
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Scan QR from your kit card to autofill the key</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="border-secondary/50 glow-box">
                    <CardContent className="pt-8 text-center space-y-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                      >
                        <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                          <CheckCircle className="w-10 h-10 text-secondary" />
                        </div>
                      </motion.div>

                      <div>
                        <h2 className="font-display text-2xl font-bold mb-2">
                          Kit Activated Successfully! 🎉
                        </h2>
                        <p className="text-muted-foreground">
                          Welcome to Atribot! You&apos;ve unlocked:
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <QrCode className="w-5 h-5 mr-2" />
                        <span className="font-display text-lg">{activatedCourse.title}</span>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          {activatedCourse.description}
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        className="w-full"
                        size="lg"
                        onClick={handleContinue}
                      >
                        Start Learning
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={handleDeactivate}
                        disabled={isLoading}
                      >
                        Deactivate License
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center text-sm text-muted-foreground"
            >
              <p>
                Don’t have a kit yet?{' '}
                <Link href="/store" className="text-primary hover:underline">
                  Purchase here
                </Link>
              </p>
              <p className="mt-2">
                Having trouble?{' '}
                <a href="#" className="text-primary hover:underline">
                  Contact support
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default function KitActivation() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12" />}>
      <ActivationContent />
    </Suspense>
  )
}
