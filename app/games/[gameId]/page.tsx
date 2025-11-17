'use client';

import { useParams, useRouter } from 'next/navigation';
import { gameConfigs } from '@/lib/gameConfigs';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Users, Clock, MapPin, Trophy, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { TeamSize } from '@/lib/types';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const gameId = params?.gameId as string;

  const game = gameConfigs.find((g) => g.id === gameId);
  const [selectedTeamSize, setSelectedTeamSize] = useState<TeamSize | null>(null);
  const [rank, setRank] = useState('');
  const [region, setRegion] = useState('');
  const [playTime, setPlayTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const selectedOption = game.teamSizes.find((t) => t.size === selectedTeamSize);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      try {
        await signInWithGoogle();
      } catch (error) {
        return;
      }
      return;
    }

    if (!selectedTeamSize || !rank || !region || !playTime) {
      toast.error('Please fill all the details');
      return;
    }

    setLoading(true);

    try {
      // Create order on backend
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedOption?.price,
          game: game.id,
          teamSize: selectedTeamSize,
        }),
      });

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'GameSquad',
        description: `${game.name} - ${selectedOption?.label}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Save to Firestore
            await addDoc(collection(db, 'teamRequests'), {
              userId: user.uid,
              userName: user.displayName || 'Anonymous',
              userEmail: user.email,
              game: game.id,
              teamSize: selectedTeamSize,
              price: selectedOption?.price,
              rank,
              region,
              preferredPlayTime: playTime,
              status: 'pending',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              createdAt: serverTimestamp(),
            });

            toast.success('Payment successful! Request created.');
            router.push('/dashboard');
          } catch (error) {
            console.error('Error saving request:', error);
            toast.error('Payment successful but failed to save request');
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: game.theme.primary,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  // Game-specific styling
  const gameStyles = {
    valorant: {
      containerClass: 'bg-gradient-to-br from-red-950/40 via-gray-950 to-black',
      accentGlow: 'shadow-[0_0_30px_rgba(255,70,85,0.3)]',
      borderGlow: `border-[${game.theme.primary}] shadow-[0_0_20px_rgba(255,70,85,0.2)]`,
    },
    apex: {
      containerClass: 'bg-gradient-to-br from-orange-950/40 via-red-950/30 to-gray-950',
      accentGlow: 'shadow-[0_0_30px_rgba(218,41,46,0.3)]',
      borderGlow: `border-[${game.theme.primary}] shadow-[0_0_20px_rgba(218,41,46,0.2)]`,
    },
    fortnite: {
      containerClass: 'bg-gradient-to-br from-purple-950/40 via-blue-950/30 to-gray-950',
      accentGlow: 'shadow-[0_0_30px_rgba(123,63,242,0.3)]',
      borderGlow: `border-[${game.theme.primary}] shadow-[0_0_20px_rgba(123,63,242,0.2)]`,
    },
    '2xko': {
      containerClass: 'bg-gradient-to-br from-yellow-950/40 via-amber-950/30 to-gray-950',
      accentGlow: 'shadow-[0_0_30px_rgba(212,175,55,0.3)]',
      borderGlow: `border-[${game.theme.primary}] shadow-[0_0_20px_rgba(212,175,55,0.2)]`,
    },
  };

  const currentStyle = gameStyles[game.id as keyof typeof gameStyles];

  return (
    <div className={`min-h-screen ${currentStyle.containerClass}`}>
      <Navbar />

      {/* Hero Section with Game Theme */}
      <section className="relative py-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: game.theme.primary }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: game.theme.accent }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Game Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 mr-3" style={{ color: game.theme.primary }} />
              <h1
                className="text-6xl md:text-7xl font-black tracking-tighter"
                style={{
                  color: game.theme.primary,
                  textShadow: `0 0 40px ${game.theme.primary}40`,
                }}
              >
                {game.name}
              </h1>
              <Sparkles className="h-8 w-8 ml-3" style={{ color: game.theme.primary }} />
            </div>
            <p className="text-xl text-gray-300 font-medium">
              Find your perfect squad and climb the ranks together
            </p>
          </div>

          {/* Team Size Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {game.teamSizes.map((team) => (
              <button
                key={team.size}
                onClick={() => setSelectedTeamSize(team.size)}
                className={`relative p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  selectedTeamSize === team.size
                    ? 'scale-105'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                style={{
                  borderColor:
                    selectedTeamSize === team.size ? game.theme.primary : undefined,
                  backgroundColor:
                    selectedTeamSize === team.size
                      ? `${game.theme.primary}15`
                      : '#1a1a1a80',
                  boxShadow:
                    selectedTeamSize === team.size
                      ? `0 0 30px ${game.theme.primary}40`
                      : undefined,
                }}
              >
                {/* Glow effect when selected */}
                {selectedTeamSize === team.size && (
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                    style={{ backgroundColor: game.theme.primary }}
                  />
                )}

                <div className="relative text-center">
                  <Users
                    className="h-16 w-16 mx-auto mb-4"
                    style={{
                      color:
                        selectedTeamSize === team.size
                          ? game.theme.primary
                          : '#9ca3af',
                    }}
                  />
                  <h3 className="text-2xl font-bold mb-2">{team.label}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-400">{team.slots} Players</p>
                  </div>
                  <div
                    className="text-4xl font-black"
                    style={{
                      color:
                        selectedTeamSize === team.size ? game.theme.primary : '#fff',
                    }}
                  >
                    ₹{team.price}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Details Form */}
      {selectedTeamSize && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div
            className="rounded-3xl p-8 md:p-10 border-2"
            style={{
              backgroundColor: '#0a0a0a90',
              borderColor: `${game.theme.primary}40`,
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${game.theme.primary}20` }}
              >
                <Zap className="h-6 w-6" style={{ color: game.theme.primary }} />
              </div>
              <h2 className="text-3xl font-bold">Player Details</h2>
            </div>

            <div className="space-y-6">
              {/* Rank Dropdown */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold mb-3 uppercase tracking-wide">
                  <Trophy className="h-5 w-5" style={{ color: game.theme.primary }} />
                  <span style={{ color: game.theme.primary }}>Current Rank</span>
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-900/80 border-2 border-gray-700 rounded-xl focus:outline-none transition-all text-lg font-medium"
                  onFocus={(e) => {
                    e.target.style.borderColor = game.theme.primary;
                  }}
                  onBlur={(e) => {
                    if (!rank) e.target.style.borderColor = '#374151';
                  }}
                >
                  <option value="">Select Your Rank</option>
                  {game.ranks.map((rankOption) => (
                    <option key={rankOption} value={rankOption}>
                      {rankOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold mb-3 uppercase tracking-wide">
                  <MapPin className="h-5 w-5" style={{ color: game.theme.primary }} />
                  <span style={{ color: game.theme.primary }}>Region</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-900/80 border-2 border-gray-700 rounded-xl focus:outline-none transition-all text-lg font-medium"
                  onFocus={(e) => {
                    e.target.style.borderColor = game.theme.primary;
                  }}
                  onBlur={(e) => {
                    if (!region) e.target.style.borderColor = '#374151';
                  }}
                >
                  <option value="">Select Region</option>
                  <option value="mumbai">Mumbai (Asia South)</option>
                  <option value="singapore">Singapore (SEA)</option>
                  <option value="bahrain">Bahrain (Middle East)</option>
                  <option value="hong-kong">Hong Kong (Asia East)</option>
                  <option value="tokyo">Tokyo (Japan)</option>
                  <option value="sydney">Sydney (Oceania)</option>
                </select>
              </div>

              {/* Play Time */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold mb-3 uppercase tracking-wide">
                  <Clock className="h-5 w-5" style={{ color: game.theme.primary }} />
                  <span style={{ color: game.theme.primary }}>Preferred Play Time</span>
                </label>
                <select
                  value={playTime}
                  onChange={(e) => setPlayTime(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-900/80 border-2 border-gray-700 rounded-xl focus:outline-none transition-all text-lg font-medium"
                  onFocus={(e) => {
                    e.target.style.borderColor = game.theme.primary;
                  }}
                  onBlur={(e) => {
                    if (!playTime) e.target.style.borderColor = '#374151';
                  }}
                >
                  <option value="">Select Time</option>
                  <option value="morning">🌅 Morning (6 AM - 12 PM)</option>
                  <option value="afternoon">☀️ Afternoon (12 PM - 6 PM)</option>
                  <option value="evening">🌆 Evening (6 PM - 12 AM)</option>
                  <option value="night">🌙 Night (12 AM - 6 AM)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-5 rounded-xl font-black text-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8 relative overflow-hidden group"
                style={{
                  backgroundColor: game.theme.primary,
                  color: '#fff',
                  boxShadow: `0 10px 40px ${game.theme.primary}40`,
                }}
              >
                {/* Button glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                  style={{ backgroundColor: game.theme.primary }}
                />
                <span className="relative z-10">
                  {loading
                    ? 'PROCESSING...'
                    : user
                    ? `PAY ₹${selectedOption?.price} & FIND TEAMMATES`
                    : 'SIGN IN TO CONTINUE'}
                </span>
              </button>

              {/* Info Text */}
              <div
                className="text-center p-4 rounded-xl border"
                style={{
                  backgroundColor: `${game.theme.primary}10`,
                  borderColor: `${game.theme.primary}30`,
                }}
              >
                <p className="text-sm font-medium" style={{ color: game.theme.primary }}>
                  ⚡ You will be matched with skilled teammates after successful payment
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
