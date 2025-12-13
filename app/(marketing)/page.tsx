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
import { Loader, Rocket, ShoppingBag, BookOpen, Key, Bot, Cpu, Lightbulb, Users, Target, Zap, Award, AlertCircle, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion'

const stats = [
  { value: '10K+', label: 'Happy Students', gradient: 'from-violet-500 to-purple-600' },
  { value: '50+', label: 'Projects', gradient: 'from-blue-500 to-cyan-600' },
  { value: '100+', label: 'Video Lessons', gradient: 'from-emerald-500 to-teal-600' },
  { value: '5', label: 'Skill Levels', gradient: 'from-orange-500 to-pink-600' },
]

const features = [
  { icon: Bot, title: 'Hands-On Learning', description: 'Build real robots with our carefully designed STEM kits', gradient: 'from-indigo-500 to-purple-600', iconBg: 'bg-gradient-to-br from-indigo-400 to-purple-500' },
  { icon: Cpu, title: 'Progressive Levels', description: '5 levels from beginner to advanced robotics', gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
  { icon: Lightbulb, title: 'Video Lessons', description: 'Step-by-step video tutorials for each project', gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { icon: Users, title: 'For Kids 6-16', description: 'Age-appropriate content that grows with your child', gradient: 'from-pink-500 to-rose-600', iconBg: 'bg-gradient-to-br from-pink-400 to-rose-500' },
]


const steps = [
  {
    step: "01",
    title: "Get Your Kit",
    description: "Order your Atribot STEM kit with all components included.",
    gradient: "from-violet-500 to-fuchsia-600",
    iconBg: "bg-gradient-to-br from-violet-400 to-fuchsia-500"
  },
  {
    step: "02",
    title: "Scan & Activate",
    description: "Scan the QR code and enter your unique license key.",
    gradient: "from-sky-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-sky-400 to-indigo-500"
  },
  {
    step: "03",
    title: "Start Learning",
    description: "Access video lessons and build your first robot!",
    gradient: "from-emerald-500 to-cyan-600",
    iconBg: "bg-gradient-to-br from-emerald-400 to-cyan-500"
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
        <div className="relative mb-8 h-[250px] w-[300px] lg:mb-0 lg:h-[424px] lg:w-[424px]">
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
                className={`text-center p-6 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/90 font-medium">{stat.label}</div>
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
              Our platform combines physical robotics kits with digital courses for a complete learning experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${feature.gradient} border border-white/20 rounded-2xl p-6 card-hover shadow-lg hover:shadow-xl transition-all`}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-md`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/90 text-sm">{feature.description}</p>
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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in 3 simple steps and begin your robotics journey today.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className={`relative p-8 rounded-3xl bg-gradient-to-br ${step.gradient} border border-white/20 shadow-lg hover:shadow-2xl`}
              >
                <span className="text-7xl font-bold font-display text-white/20 absolute top-4 right-6">
                  {step.step}
                </span>
                <div className="relative z-10 space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.15 + 0.2, type: "spring", stiffness: 200 }}
                    className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center shadow-md`}
                  >
                    {index === 0 && <Rocket className="w-6 h-6 text-white" />}
                    {index === 1 && <Target className="w-6 h-6 text-white" />}
                    {index === 2 && <Zap className="w-6 h-6 text-white" />}
                  </motion.div>
                  <h3 className="text-2xl font-bold font-display text-white">{step.title}</h3>
                  <p className="text-white/90">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* what inside the course Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card w-full max-w-[988px]">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              5 Ways of Learning at <span className="text-primary">Atribot</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hands-on robotics education designed for curious minds. Build, experiment, and learn through interactive experiences.
            </p>
          </motion.div>

          {/* Learning Method 1: Video Lessons - Image Left, Text Right */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="/video_lessons.png"
                alt="Video Lessons"
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg"
              >
                <BookOpen className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-display text-3xl md:text-4xl font-bold">Video Lessons</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Watch step-by-step video tutorials that guide you through each project. Learn at your own pace with clear instructions designed for young builders.
              </p>
            </div>
          </motion.div>

          {/* Learning Method 2: Swipe Cards - Text Left, Image Right */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl order-1 md:order-2"
            >
              <Image
                src="/swipe_cards.png"
                alt="Swipe Cards"
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="space-y-4 order-2 md:order-1">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-display text-3xl md:text-4xl font-bold">Swipe Cards</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Discover concepts through interactive swipe cards. Explore robotics fundamentals with engaging visuals and bite-sized information perfect for young learners.
              </p>
            </div>
          </motion.div>

          {/* Learning Method 3: Interactive Games - Image Left, Text Right */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="/interactive_games.png"
                alt="Interactive Games"
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
              >
                <Target className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-display text-3xl md:text-4xl font-bold">Interactive Games</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Learn through play with fun, educational games. Practice problem-solving and critical thinking while having a blast with robotics challenges.
              </p>
            </div>
          </motion.div>

          {/* Learning Method 4: Step-by-Step Builds - Text Left, Image Right */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl order-1 md:order-2"
            >
              <Image
                src="/step_by_step_builds.png"
                alt="Step-by-Step Builds"
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="space-y-4 order-2 md:order-1">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg"
              >
                <Cpu className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-display text-3xl md:text-4xl font-bold">Step-by-Step Builds</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Follow detailed build instructions to create real robots. Get hands-on experience assembling components and bringing your projects to life.
              </p>
            </div>
          </motion.div>

          {/* Learning Method 5: MCQs & Challenges - Image Left, Text Right */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="/mcqs_and_challenges.png"
                alt="MCQs & Challenges"
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg"
              >
                <Zap className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-display text-3xl md:text-4xl font-bold">MCQs & Challenges</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Test your knowledge with quizzes and exciting challenges. Track your progress and earn achievements as you master robotics concepts.
              </p>
            </div>
          </motion.div>
        </div>
      </section>




      <section className="py-20 relative overflow-hidden w-full max-w-[988px]">
        {/* Circular Gradient Backgrounds */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 blur-xl"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.2 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 blur-xl"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.25 }}
            transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
            className="absolute w-[200px] h-[200px] rounded-full bg-gradient-to-br from-orange-500 to-pink-600 blur-xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
              >
                <Award className="w-16 h-16 text-primary mx-auto mb-6" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-display text-3xl md:text-5xl font-bold mb-4"
              >
                Ready to Start Building?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-muted-foreground text-lg mb-8"
              >
                Get your Atribot kit, scan the QR code, and begin your robotics adventure today!
              </motion.p>

              <SignedIn>
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="primary" onClick={() => router.push('/learn')}>
                      <span className="mr-2"> <BookOpen className="h-5 w-5" /> </span>Continue Learning
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 items-center justify-center ">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link href="/kit_activation">
                          <Button size="lg" variant="primary">
                            <span className="mr-2"> <Key className="h-5 w-5" /> </span>Activate the Kit
                          </Button>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
                        whileHover={{ scale: 1.05, rotate: [0, 2, -2, 0] }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link href="/store">
                          <Button size="lg" variant="primaryOutline" >
                            <span className="mr-2"> <ShoppingBag className="h-5 w-5" /> </span>Buy the Kit
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </>
                )}
              </SignedIn>
              <SignedOut>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: [0, -2, 2, -2, 0] }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="primary" size="lg" asChild>
                      <Link href="/kit_activation">
                        <Rocket className="w-5 h-5" />
                        Activate Kit Now
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </SignedOut>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
