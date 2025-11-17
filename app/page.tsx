'use client';

import Navbar from '@/components/Navbar';
import { gameConfigs } from '@/lib/gameConfigs';
import { GameConfig } from '@/lib/types';
import Link from 'next/link';
import { Target, Users, Shield, Zap, Sparkles, Gamepad2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function GameCard({ game, index }: { game: GameConfig; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Link href={`/games/${game.id}`}>
      <div
        ref={cardRef}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 h-[420px] transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{
          transitionDelay: `${index * 150}ms`,
          animation: isVisible ? 'float 6s ease-in-out infinite' : 'none',
          animationDelay: `${index * 0.5}s`,
        }}
      >
        {/* Animated Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${game.theme.gradient} opacity-20 group-hover:opacity-40 transition-all duration-500`}
          style={{
            animation: 'gradient-shift 8s ease infinite',
          }}
        />

        {/* Rotating Border Gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${game.theme.primary} 90deg, transparent 180deg)`,
            animation: 'rotate 4s linear infinite',
            filter: 'blur(20px)',
          }}
        />

        {/* Particle Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: game.theme.primary,
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animation: `particle-float ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: `0 0 10px ${game.theme.primary}`,
              }}
            />
          ))}
        </div>

        {/* Scanline Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none"
          style={{
            background: 'linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            backgroundSize: '100% 4px',
            animation: 'scanline 2s linear infinite',
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6 z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg transform group-hover:rotate-12 transition-transform duration-500"
                style={{
                  backgroundColor: `${game.theme.primary}30`,
                  boxShadow: `0 0 20px ${game.theme.primary}40`,
                }}
              >
                <Gamepad2 className="h-6 w-6" style={{ color: game.theme.primary }} />
              </div>
              <h3
                className="text-4xl font-bold tracking-tight transform group-hover:scale-105 transition-transform duration-500"
                style={{
                  fontFamily: game.font.display,
                  color: game.theme.primary,
                  textShadow: `0 0 20px ${game.theme.primary}60`,
                }}
              >
                {game.name}
              </h3>
            </div>
            <div className="space-y-2">
              {game.teamSizes.map((team, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-black/40 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10 transform group-hover:translate-x-2 transition-all duration-300 hover:bg-black/60"
                  style={{
                    transitionDelay: `${idx * 50}ms`,
                    borderColor: `${game.theme.primary}20`,
                  }}
                >
                  <span className="text-sm font-semibold">{team.label}</span>
                  <span
                    className="text-lg font-black flex items-center gap-1"
                    style={{
                      color: game.theme.primary,
                      animation: 'pulse-glow 2s ease-in-out infinite',
                      animationDelay: `${idx * 0.3}s`,
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                    ₹{team.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
              <Users className="h-5 w-5" style={{ color: game.theme.accent }} />
              <span className="text-sm font-medium" style={{ color: game.theme.accent }}>
                {game.teamSizes.length} options
              </span>
            </div>
            <div
              className="px-5 py-2.5 rounded-lg font-bold transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 flex items-center gap-2"
              style={{
                backgroundColor: game.theme.primary,
                color: '#000',
                boxShadow: `0 0 20px ${game.theme.primary}60`,
              }}
            >
              Find Team
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Glowing Border Effect */}
        <div
          className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl pointer-events-none"
          style={{
            borderColor: game.theme.primary,
            boxShadow: `0 0 30px ${game.theme.primary}60, inset 0 0 30px ${game.theme.primary}20`,
          }}
        />

        {/* Corner Accent */}
        <div
          className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at top right, ${game.theme.primary}40, transparent 70%)`,
          }}
        />
      </div>
    </Link>
  );
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-flow 20s linear infinite',
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-rise ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Cursor Trail Effect */}
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none -z-10 blur-3xl transition-all duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Main Title with Animation */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight opacity-0 animate-slide-up">
                Find Your Perfect
              </h1>
              <h1
                className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight opacity-0 animate-slide-up animation-delay-300"
                style={{
                  background: 'linear-gradient(90deg, #A855F7, #EC4899, #3B82F6, #A855F7)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradient-x 5s linear infinite, slide-up 0.8s ease-out 0.3s forwards',
                  opacity: 0,
                  textShadow: '0 0 80px rgba(168, 85, 247, 0.5)',
                }}
              >
                Gaming Squad
              </h1>
            </div>

            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto opacity-0 animate-fade-in animation-delay-600 font-medium">
              Connect with skilled players for{' '}
              <span className="text-purple-400 font-bold">Valorant</span>,{' '}
              <span className="text-orange-400 font-bold">Apex Legends</span>,{' '}
              <span className="text-blue-400 font-bold">Fortnite</span>, and{' '}
              <span className="text-yellow-400 font-bold">2XKO</span>.
              <br />
              Build your dream team and dominate the competition.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center items-center opacity-0 animate-fade-in animation-delay-900">
              <Link href="#games">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/50">
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-spin-slow" />
                    Start Finding
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>
              <button className="px-8 py-4 bg-gray-900/80 backdrop-blur-sm border-2 border-gray-700 rounded-xl font-bold text-lg hover:border-purple-500 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
            {[
              {
                icon: Target,
                title: 'Skill Matching',
                desc: 'Find players at your level',
                color: 'from-purple-600 to-purple-800',
                delay: '0ms',
              },
              {
                icon: Zap,
                title: 'Instant Connect',
                desc: 'Quick team formation',
                color: 'from-pink-600 to-pink-800',
                delay: '150ms',
              },
              {
                icon: Shield,
                title: 'Verified Players',
                desc: 'Safe and secure',
                color: 'from-blue-600 to-blue-800',
                delay: '300ms',
              },
              {
                icon: Users,
                title: 'Active Community',
                desc: 'Thousands of players',
                color: 'from-indigo-600 to-indigo-800',
                delay: '450ms',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 opacity-0 animate-fade-in-up transform hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${1200 + index * 150}ms` }}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500`}
                />

                <div className="relative">
                  <div
                    className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}
                    style={{
                      boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-black text-xl mb-2 group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>

                {/* Shimmer Effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-6 py-2 bg-purple-600/20 border border-purple-500/50 rounded-full">
            <span className="text-purple-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 animate-pulse" />
              Popular Games
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Choose Your Game
          </h2>
          <p className="text-gray-400 text-xl">
            Select a game to find teammates and start your winning streak
          </p>

          {/* Decorative Line */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-purple-500" />
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-purple-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {gameConfigs.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl border border-purple-500/30 backdrop-blur-sm">
            <h3 className="text-3xl font-black mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Squad Up?
            </h3>
            <p className="text-gray-400 mb-6 text-lg">
              Join thousands of players finding their perfect teammates
            </p>
            <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black text-lg transform hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/50 flex items-center gap-3 mx-auto">
              <Users className="h-6 w-6" />
              Get Started Now
              <Zap className="h-5 w-5 animate-pulse" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-transparent to-gray-900/80 border-t border-gray-800/50 mt-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Gamepad2 className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                GameSquad
              </span>
            </div>
            <p className="text-gray-400 mb-2">Find your perfect teammates. Dominate together.</p>
            <p className="text-gray-600 text-sm">&copy; 2024 GameSquad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
