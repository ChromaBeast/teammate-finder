'use client';

import Navbar from '@/components/Navbar';
import { gameConfigs } from '@/lib/gameConfigs';
import { GameConfig } from '@/lib/types';
import Link from 'next/link';
import { Target, Users, Shield, Zap } from 'lucide-react';

function GameCard({ game }: { game: GameConfig }) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 game-card-hover h-[400px]">
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${game.theme.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6">
          <div>
            <h3 className="text-4xl font-bold mb-4 tracking-tight">{game.name}</h3>
            <div className="space-y-2">
              {game.teamSizes.map((team, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10"
                >
                  <span className="text-sm font-medium">{team.label}</span>
                  <span className="text-sm font-bold" style={{ color: game.theme.primary }}>
                    ₹{team.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">
                {game.teamSizes.length} options
              </span>
            </div>
            <div
              className="px-4 py-2 rounded-lg font-semibold group-hover:translate-x-1 transition-transform"
              style={{
                backgroundColor: `${game.theme.primary}20`,
                color: game.theme.primary,
                borderColor: game.theme.primary,
                borderWidth: '1px',
              }}
            >
              Find Team →
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div
          className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"
          style={{ borderColor: game.theme.primary }}
        />
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Gaming Squad
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect with skilled players for Valorant, Apex Legends, Fortnite, and 2XKO.
              Build your dream team and dominate the competition.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: Target,
                title: 'Skill Matching',
                desc: 'Find players at your level',
              },
              {
                icon: Zap,
                title: 'Instant Connect',
                desc: 'Quick team formation',
              },
              {
                icon: Shield,
                title: 'Verified Players',
                desc: 'Safe and secure',
              },
              {
                icon: Users,
                title: 'Active Community',
                desc: 'Thousands of players',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Game</h2>
          <p className="text-gray-400">Select a game to find teammates and start playing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {gameConfigs.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 GameSquad. Find your perfect teammates.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
