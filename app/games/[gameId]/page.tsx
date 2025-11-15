'use client';

import { useParams, useRouter } from 'next/navigation';
import { gameConfigs } from '@/lib/gameConfigs';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Users, Clock, MapPin, Trophy } from 'lucide-react';
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

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section with Game Theme */}
      <section
        className="relative py-20 overflow-hidden"
        style={{
          background: `linear-gradient(to bottom right, ${game.theme.primary}15, ${game.theme.secondary})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1
              className="text-6xl font-bold mb-4 tracking-tight"
              style={{ color: game.theme.primary }}
            >
              {game.name}
            </h1>
            <p className="text-xl text-gray-400">
              Find your perfect teammates and dominate the competition
            </p>
          </div>

          {/* Team Size Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {game.teamSizes.map((team) => (
              <button
                key={team.size}
                onClick={() => setSelectedTeamSize(team.size)}
                className={`relative p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  selectedTeamSize === team.size
                    ? 'bg-opacity-20 shadow-xl'
                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                }`}
                style={{
                  borderColor:
                    selectedTeamSize === team.size ? game.theme.primary : undefined,
                  backgroundColor:
                    selectedTeamSize === team.size
                      ? `${game.theme.primary}20`
                      : undefined,
                }}
              >
                <div className="text-center">
                  <Users
                    className="h-12 w-12 mx-auto mb-4"
                    style={{
                      color:
                        selectedTeamSize === team.size
                          ? game.theme.primary
                          : '#9ca3af',
                    }}
                  />
                  <h3 className="text-xl font-bold mb-2">{team.label}</h3>
                  <p className="text-sm text-gray-400 mb-4">{team.slots} players</p>
                  <div
                    className="text-3xl font-bold"
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
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
            <h2 className="text-3xl font-bold mb-8">Player Details</h2>

            <div className="space-y-6">
              {/* Rank */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                  <Trophy className="h-4 w-4" style={{ color: game.theme.primary }} />
                  <span>Current Rank</span>
                </label>
                <input
                  type="text"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder={`e.g., ${
                    game.id === 'valorant'
                      ? 'Gold 2'
                      : game.id === 'apex'
                      ? 'Platinum'
                      : 'Division 5'
                  }`}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-opacity-50"
                />
              </div>

              {/* Region */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4" style={{ color: game.theme.primary }} />
                  <span>Region</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-opacity-50"
                >
                  <option value="">Select Region</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="singapore">Singapore</option>
                  <option value="bahrain">Bahrain</option>
                  <option value="hong-kong">Hong Kong</option>
                  <option value="tokyo">Tokyo</option>
                </select>
              </div>

              {/* Play Time */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                  <Clock className="h-4 w-4" style={{ color: game.theme.primary }} />
                  <span>Preferred Play Time</span>
                </label>
                <select
                  value={playTime}
                  onChange={(e) => setPlayTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-opacity-50"
                >
                  <option value="">Select Time</option>
                  <option value="morning">Morning (6 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                  <option value="evening">Evening (6 PM - 12 AM)</option>
                  <option value="night">Night (12 AM - 6 AM)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  backgroundColor: game.theme.primary,
                  color: '#fff',
                }}
              >
                {loading
                  ? 'Processing...'
                  : user
                  ? `Pay ₹${selectedOption?.price} & Find Teammates`
                  : 'Sign In to Continue'}
              </button>

              <p className="text-sm text-gray-400 text-center">
                You will be matched with teammates after successful payment
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Add Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
