"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader, Rocket, ShoppingBag, BookOpen, Key, Bot, Cpu, Lightbulb, Users,Target, Zap,Award, AlertCircle, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion'

const stats = [
  { value: '10K+', label: 'Happy Students' },
  { value: '50+', label: 'Projects' },
  { value: '100+', label: 'Video Lessons' },
  { value: '5', label: 'Skill Levels' },
]

const features = [
  { icon: Bot, title: 'Hands-On Learning', description: 'Build real robots with our carefully designed STEM kits' },
  { icon: Cpu, title: 'Progressive Levels', description: '5 levels from beginner to advanced robotics' },
  { icon: Lightbulb, title: 'Video Lessons', description: 'Step-by-step video tutorials for each project' },
  { icon: Users, title: 'For Kids 6-16', description: 'Age-appropriate content that grows with your child' },
]


 const steps = [
    {
      step: "01",
      title: "Get Your Kit",
      description: "Order your Atribot STEM kit with all components included.",
    },
    {
      step: "02",
      title: "Scan & Activate",
      description: "Scan the QR code and enter your unique license key.",
    },
    {
      step: "03",
      title: "Start Learning",
      description: "Access video lessons and build your first robot!",
    },
  ];



export default function Home() {
  const router = useRouter();
  const [activateOpen, setActivateOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const formatLicenseKey = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.slice(0, 4).join('-');
  };

  const handleActivate = async () => {
    if (licenseKey.length !== 19) {
      setError('Please enter a valid 16-character license key');
      return;
    }
    setIsLoading(true);
    setError(null);
    const res = await fetch('/api/licenses/activate', { method: 'POST', body: JSON.stringify({ key: licenseKey }) });
    setIsLoading(false);
    if (res.ok) {
      const data = await res.json();
      toast(`Youve unlocked ${data?.course?.title || 'your course'}!`);
      setActivateOpen(false);
      setLicenseKey("");
      router.push('/learn');
    } else {
      const msg = await res.json().catch(() => ({}));
      setError(msg?.error || 'Invalid or already used license key. Please check and try again.');
    }
  };

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch('/api/licenses/me', { cache: 'no-store' });
        const data = await res.json();
        if (!mounted) return;
        setIsActive(Boolean(data?.active));
      } catch {
        if (!mounted) return;
        setIsActive(false);
      }
    };
    void check();
    return () => { mounted = false; };
  }, []);
  return (
  <>
    <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col items-center justify-center gap-2 p-4  lg:flex-row lg:pt-4">
      <div className="relative mb-8 h-[240px] w-[240px] lg:mb-0 lg:h-[424px] lg:w-[424px]">
        <Image src="/hero_image.svg" alt="Hero" fill />
      </div>

      <div className="flex flex-col items-center gap-y-4">
        <h1 className="max-w-[480px] text-center text-xl font-bold text-neutral-600 lg:text-3xl">
          Build the Future with Robotics
        </h1>
        <p className="max-w-[480px] text-center text-sm text-neutral-500 lg:text-lg ">
          Empower your child with hands-on robotics education.<b> one level at a time.</b>
        </p>

        <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
          <ClerkLoading>
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </ClerkLoading>

          <ClerkLoaded>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" variant="primary" className="w-full">
                 <span className="mr-2"> <Rocket className="h-5 w-5" /> </span>Get Started
                </Button>
              </SignInButton>
              <Link href="/store" className="w-full">
                <Button size="lg" variant="primaryOutline" className="w-full">
                  <span className="mr-2"> <ShoppingBag className="h-5 w-5" /> </span>Buy the Kit
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              {isActive ? (
                <Button size="lg" variant="primary" className="w-full" onClick={() => router.push('/learn')}>
                  <span className="mr-2"> <BookOpen className="h-5 w-5" /> </span>Continue Learning
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="primary" className="w-full" onClick={() => setActivateOpen(true)}>
                    <span className="mr-2"> <Key className="h-5 w-5" /> </span>Activate the Kit
                  </Button>
                  <Link href="/store" className="w-full">
                  <Button size="lg" variant="primaryOutline" className="w-full">
                    <span className="mr-2"> <ShoppingBag className="h-5 w-5" /> </span>Buy the Kit
                  </Button>
                  </Link>
                </>
              )}
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </div>
     {/* stats Section */}
    <section className="py-16 bg-card border-y border-border w-full max-w-[988px]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-bold glow-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <Dialog open={activateOpen} onOpenChange={setActivateOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Activate Your Kit</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => { setLicenseKey(formatLicenseKey(e.target.value)); setError(null); }}
              className="text-center text-xl tracking-widest font-mono h-14"
              maxLength={19}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
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
          <p className="text-center text-xs text-muted-foreground">Scan QR from your kit card to autofill the key</p>
        </div>
      </DialogContent>
    </Dialog>
    {/* features Section */}
    <section className="py-20 max-w-[988px]">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">Atribot</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform combines physical STEM kits with digital courses for a complete learning experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 card-hover"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    {/* How It Works Section */}
    <section className="py-24 bg-atribot-navy  relative overflow-hidden max-w-[988px]">
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold font-display mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-primary-foreground/70">
            Get started in 3 simple steps and begin your robotics journey today.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-8 rounded-3xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors"
            >
              <span className="text-7xl font-bold font-display text-primary/30 absolute top-4 right-6">
                {step.step}
              </span>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  {index === 0 && <Rocket className="w-6 h-6 text-accent-foreground" />}
                  {index === 1 && <Target className="w-6 h-6 text-accent-foreground" />}
                  {index === 2 && <Zap className="w-6 h-6 text-accent-foreground" />}
                </div>
                <h3 className="text-2xl font-bold font-display">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 relative overflow-hidden w-full max-w-[988px]">
      
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
              <Award className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Ready to Start Building?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Get your Atribot kit, scan the QR code, and begin your robotics adventure today!
              </p>
                <SignedIn>
              {isActive ? (
                <Button size="lg" variant="primary" onClick={() => router.push('/learn')}>
                  <span className="mr-2"> <BookOpen className="h-5 w-5" /> </span>Continue Learning
                </Button>
              ) : (
                <>
                <div className="flex flex-col gap-4 items-center justify-center ">
                  <Link href="/kit_activation">
                  <Button size="lg" variant="primary">
                    <span className="mr-2"> <Key className="h-5 w-5" /> </span>Activate the Kit
                  </Button>
                  </Link>
                  <Link href="/store">
                  <Button size="lg" variant="primaryOutline" >
                    <span className="mr-2"> <ShoppingBag className="h-5 w-5" /> </span>Buy the Kit
                  </Button>
                  </Link>
                  </div>
                </>
              )}
            </SignedIn>
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg" asChild>
                  <Link href="/kit_activation">
                    <Rocket className="w-5 h-5" />
                    Activate Kit Now
                  </Link>
                </Button>
              </div>
              </SignedOut>
            </motion.div>
          </div>
        </div>
      </section>
  </>
  );
}
