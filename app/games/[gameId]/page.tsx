'use client';

import { useParams, useRouter } from 'next/navigation';
import { gameConfigs } from '@/lib/gameConfigs';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Users, Clock, MapPin, Trophy, Crosshair, Zap, Shield, Target } from 'lucide-react';
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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'GameSquad',
        description: `${game.name} - ${selectedOption?.label}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
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
          } catch (error: any) {
            console.error('Error saving request:', error);
            const errorMsg = error?.message || error?.code || 'Unknown error';
            toast.error(`Payment successful! But couldn't save request: ${errorMsg}. Check console for details.`, {
              duration: 8000,
            });
            // Log detailed error for debugging
            console.error('Firestore Error Details:', {
              error,
              userId: user.uid,
              game: game.id,
              teamSize: selectedTeamSize,
            });
            alert(`IMPORTANT: Payment was successful!\n\nPayment ID: ${response.razorpay_payment_id}\n\nHowever, we couldn't save your request to the database.\n\nError: ${errorMsg}\n\nPlease contact support with your Payment ID and check the troubleshooting guide (SETUP_TROUBLESHOOTING.md)`);
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

  // VALORANT-specific layout
  if (game.id === 'valorant') {
    return (
      <div className="min-h-screen bg-black" style={{ fontFamily: game.font.body }}>
        <Navbar />

        {/* Aggressive angular background */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-red-600 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-red-600 to-transparent"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #FF4655 0px, #FF4655 2px, transparent 2px, transparent 20px)',
          }}></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-black via-red-950/30 to-black border-b-4 border-[#FF4655] py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-20 bg-[#FF4655]"></div>
                <div>
                  <h1 className="text-7xl font-black tracking-tighter text-[#FF4655] uppercase" style={{ fontFamily: game.font.display, letterSpacing: '0.05em' }}>
                    VALORANT
                  </h1>
                  <p className="text-gray-400 text-xl font-semibold uppercase tracking-widest mt-1">TACTICAL SHOOTER // 5V5</p>
                </div>
                <Crosshair className="h-16 w-16 text-[#FF4655] ml-auto" />
              </div>
            </div>
          </div>

          {/* Team Selection - Angular Cards */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-[#FF4655]"></div>
                <h2 className="text-3xl font-black uppercase tracking-wider" style={{ fontFamily: game.font.display }}>
                  SELECT MODE
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {game.teamSizes.map((team) => (
                <button
                  key={team.size}
                  onClick={() => setSelectedTeamSize(team.size)}
                  className={`relative group transition-all transform ${
                    selectedTeamSize === team.size ? 'scale-105' : ''
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
                  }}
                >
                  <div className={`p-8 ${
                    selectedTeamSize === team.size
                      ? 'bg-gradient-to-br from-[#FF4655] to-red-900'
                      : 'bg-gradient-to-br from-gray-900 to-gray-800 group-hover:from-gray-800 group-hover:to-gray-700'
                  } border-2 ${selectedTeamSize === team.size ? 'border-[#FF4655]' : 'border-gray-700'}`}>
                    <Target className={`h-12 w-12 mb-4 ${selectedTeamSize === team.size ? 'text-white' : 'text-gray-400'}`} />
                    <h3 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: game.font.display }}>
                      {team.label.replace('Find a ', '').replace('Find 1 in ', '').replace('Find 1 in ', '')}
                    </h3>
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Users className="h-4 w-4" />
                      <span>{team.slots} PLAYERS</span>
                    </div>
                    <div className="text-4xl font-black">₹{team.price}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Form */}
            {selectedTeamSize && (
              <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#FF4655] p-8"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-10 bg-[#FF4655]"></div>
                  <h2 className="text-4xl font-black uppercase" style={{ fontFamily: game.font.display }}>AGENT DATA</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-sm font-black uppercase tracking-wider text-[#FF4655] mb-3 block">RANK</label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="w-full px-4 py-4 bg-black border-2 border-[#FF4655]/30 focus:border-[#FF4655] outline-none text-lg uppercase font-semibold"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    >
                      <option value="">SELECT RANK</option>
                      {game.ranks.map((r) => (
                        <option key={r} value={r}>{r.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-black uppercase tracking-wider text-[#FF4655] mb-3 block">REGION</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-4 py-4 bg-black border-2 border-[#FF4655]/30 focus:border-[#FF4655] outline-none text-lg uppercase font-semibold"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    >
                      <option value="">SELECT REGION</option>
                      <option value="mumbai">MUMBAI</option>
                      <option value="singapore">SINGAPORE</option>
                      <option value="bahrain">BAHRAIN</option>
                      <option value="hong-kong">HONG KONG</option>
                      <option value="tokyo">TOKYO</option>
                      <option value="sydney">SYDNEY</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-black uppercase tracking-wider text-[#FF4655] mb-3 block">PLAY TIME</label>
                    <select
                      value={playTime}
                      onChange={(e) => setPlayTime(e.target.value)}
                      className="w-full px-4 py-4 bg-black border-2 border-[#FF4655]/30 focus:border-[#FF4655] outline-none text-lg uppercase font-semibold"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    >
                      <option value="">SELECT TIME</option>
                      <option value="morning">MORNING (6-12)</option>
                      <option value="afternoon">AFTERNOON (12-18)</option>
                      <option value="evening">EVENING (18-24)</option>
                      <option value="night">NIGHT (00-06)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-6 bg-[#FF4655] hover:bg-red-600 disabled:bg-gray-700 font-black text-2xl uppercase tracking-wider transition-all"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
                >
                  {loading ? 'PROCESSING...' : user ? `DEPLOY - ₹${selectedOption?.price}` : 'AUTHENTICATE'}
                </button>
              </div>
            )}
          </div>
        </div>

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </div>
    );
  }

  // APEX LEGENDS-specific layout
  if (game.id === 'apex') {
    return (
      <div className="min-h-screen bg-black" style={{ fontFamily: game.font.body }}>
        <Navbar />

        {/* Hexagonal tech pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                <polygon points="28,2 52,17 52,49 28,64 4,49 4,17" fill="none" stroke="#F89A1E" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header with hexagonal accent */}
          <div className="bg-gradient-to-r from-orange-950/50 via-red-950/50 to-black border-b-2 border-[#F89A1E] py-10">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F89A1E] blur-xl opacity-50"></div>
                  <Shield className="h-20 w-20 text-[#F89A1E] relative z-10" />
                </div>
                <div>
                  <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F89A1E] to-[#DA292E]"
                    style={{ fontFamily: game.font.display, letterSpacing: '0.1em' }}>
                    APEX LEGENDS
                  </h1>
                  <p className="text-[#F89A1E] text-xl font-bold tracking-[0.3em] mt-2">BATTLE ROYALE // SQUAD-BASED</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Selection - Hexagonal style */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-[#F89A1E] mb-2" style={{ fontFamily: game.font.display, letterSpacing: '0.15em' }}>
                CHOOSE YOUR SQUAD
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-[#F89A1E] to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {game.teamSizes.map((team) => (
                <button
                  key={team.size}
                  onClick={() => setSelectedTeamSize(team.size)}
                  className={`relative p-10 transition-all transform hover:scale-105 ${
                    selectedTeamSize === team.size
                      ? 'bg-gradient-to-br from-[#F89A1E] to-[#DA292E]'
                      : 'bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800'
                  } border-4 ${selectedTeamSize === team.size ? 'border-[#F89A1E]' : 'border-gray-700'}`}
                  style={{
                    clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
                  }}
                >
                  <div className="text-center">
                    <Users className={`h-16 w-16 mx-auto mb-4 ${selectedTeamSize === team.size ? 'text-white' : 'text-[#F89A1E]'}`} />
                    <h3 className="text-3xl font-black mb-3" style={{ fontFamily: game.font.display, letterSpacing: '0.1em' }}>
                      {team.label.toUpperCase()}
                    </h3>
                    <div className="text-5xl font-black">₹{team.price}</div>
                    <p className="text-sm mt-2 opacity-75">{team.slots} LEGENDS</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Form */}
            {selectedTeamSize && (
              <div className="bg-gradient-to-br from-gray-900/90 to-black border-4 border-[#F89A1E]/50 p-10"
                style={{ clipPath: 'polygon(3% 0%, 97% 0%, 100% 3%, 100% 97%, 97% 100%, 3% 100%, 0% 97%, 0% 3%)' }}>

                <h2 className="text-5xl font-black text-[#F89A1E] mb-8" style={{ fontFamily: game.font.display, letterSpacing: '0.15em' }}>
                  LEGEND PROFILE
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="text-sm font-bold text-[#F89A1E] mb-3 block tracking-wider">RANK TIER</label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="w-full px-5 py-4 bg-black/80 border-2 border-[#F89A1E]/30 focus:border-[#F89A1E] outline-none text-lg font-bold"
                      style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)' }}
                    >
                      <option value="">Select Rank</option>
                      {game.ranks.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#F89A1E] mb-3 block tracking-wider">SERVER REGION</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-5 py-4 bg-black/80 border-2 border-[#F89A1E]/30 focus:border-[#F89A1E] outline-none text-lg font-bold"
                      style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)' }}
                    >
                      <option value="">Select Region</option>
                      <option value="mumbai">Mumbai</option>
                      <option value="singapore">Singapore</option>
                      <option value="bahrain">Bahrain</option>
                      <option value="hong-kong">Hong Kong</option>
                      <option value="tokyo">Tokyo</option>
                      <option value="sydney">Sydney</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#F89A1E] mb-3 block tracking-wider">PLAYTIME</label>
                    <select
                      value={playTime}
                      onChange={(e) => setPlayTime(e.target.value)}
                      className="w-full px-5 py-4 bg-black/80 border-2 border-[#F89A1E]/30 focus:border-[#F89A1E] outline-none text-lg font-bold"
                      style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)' }}
                    >
                      <option value="">Select Time</option>
                      <option value="morning">Morning (6-12)</option>
                      <option value="afternoon">Afternoon (12-18)</option>
                      <option value="evening">Evening (18-24)</option>
                      <option value="night">Night (00-06)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-[#F89A1E] to-[#DA292E] hover:from-[#DA292E] hover:to-[#F89A1E] disabled:from-gray-700 disabled:to-gray-700 font-black text-2xl tracking-wider transition-all"
                  style={{ clipPath: 'polygon(2% 0%, 98% 0%, 100% 10%, 100% 100%, 0% 100%, 0% 10%)' }}
                >
                  {loading ? 'PROCESSING...' : user ? `DEPLOY - ₹${selectedOption?.price}` : 'AUTHENTICATE'}
                </button>
              </div>
            )}
          </div>
        </div>

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </div>
    );
  }

  // FORTNITE-specific layout
  if (game.id === 'fortnite') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-purple-950 to-black" style={{ fontFamily: game.font.body }}>
        <Navbar />

        {/* Playful animated background */}
        <div className="fixed inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Header - Playful style */}
          <div className="bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-cyan-500/30 backdrop-blur-sm border-b-8 border-[#7B3FF2] py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center">
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7B3FF2] via-blue-500 to-[#00D9FF] mb-4 drop-shadow-2xl"
                  style={{ fontFamily: game.font.display, letterSpacing: '0.05em' }}>
                  FORTNITE
                </h1>
                <p className="text-[#00D9FF] text-2xl font-bold tracking-wide">BATTLE ROYALE // BUILD & FIGHT</p>
              </div>
            </div>
          </div>

          {/* Team Selection - Rounded fun cards */}
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-white mb-3" style={{ fontFamily: game.font.display }}>
                PICK YOUR MODE
              </h2>
              <div className="h-2 w-48 mx-auto bg-gradient-to-r from-[#7B3FF2] via-blue-500 to-[#00D9FF] rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {game.teamSizes.map((team) => (
                <button
                  key={team.size}
                  onClick={() => setSelectedTeamSize(team.size)}
                  className={`relative p-12 rounded-3xl transition-all transform hover:scale-105 hover:rotate-1 ${
                    selectedTeamSize === team.size
                      ? 'bg-gradient-to-br from-[#7B3FF2] via-blue-600 to-[#00D9FF] shadow-2xl shadow-purple-500/50'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700'
                  } border-4 ${selectedTeamSize === team.size ? 'border-[#00D9FF]' : 'border-transparent'}`}
                >
                  <div className="text-center">
                    <div className={`inline-block p-6 rounded-full mb-6 ${
                      selectedTeamSize === team.size ? 'bg-white/20' : 'bg-purple-500/20'
                    }`}>
                      <Users className="h-14 w-14" />
                    </div>
                    <h3 className="text-4xl font-black mb-4" style={{ fontFamily: game.font.display }}>
                      {team.label}
                    </h3>
                    <div className="inline-block px-6 py-2 bg-white/10 rounded-full mb-4">
                      <span className="text-lg">{team.slots} Players</span>
                    </div>
                    <div className="text-6xl font-black">₹{team.price}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Form - Playful rounded design */}
            {selectedTeamSize && (
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-3xl border-4 border-[#7B3FF2] p-10 shadow-2xl shadow-purple-500/30">

                <h2 className="text-5xl font-black text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-[#7B3FF2] to-[#00D9FF]"
                  style={{ fontFamily: game.font.display }}>
                  Player Info
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="text-lg font-bold text-[#00D9FF] mb-3 block">Rank</label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="w-full px-6 py-4 bg-black/40 backdrop-blur-sm border-3 border-purple-500/50 focus:border-[#00D9FF] rounded-2xl outline-none text-lg font-bold"
                    >
                      <option value="">Choose Your Rank</option>
                      {game.ranks.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-lg font-bold text-[#00D9FF] mb-3 block">Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-6 py-4 bg-black/40 backdrop-blur-sm border-3 border-purple-500/50 focus:border-[#00D9FF] rounded-2xl outline-none text-lg font-bold"
                    >
                      <option value="">Choose Region</option>
                      <option value="mumbai">Mumbai</option>
                      <option value="singapore">Singapore</option>
                      <option value="bahrain">Bahrain</option>
                      <option value="hong-kong">Hong Kong</option>
                      <option value="tokyo">Tokyo</option>
                      <option value="sydney">Sydney</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-lg font-bold text-[#00D9FF] mb-3 block">Play Time</label>
                    <select
                      value={playTime}
                      onChange={(e) => setPlayTime(e.target.value)}
                      className="w-full px-6 py-4 bg-black/40 backdrop-blur-sm border-3 border-purple-500/50 focus:border-[#00D9FF] rounded-2xl outline-none text-lg font-bold"
                    >
                      <option value="">Choose Time</option>
                      <option value="morning">🌅 Morning</option>
                      <option value="afternoon">☀️ Afternoon</option>
                      <option value="evening">🌆 Evening</option>
                      <option value="night">🌙 Night</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-7 bg-gradient-to-r from-[#7B3FF2] via-blue-600 to-[#00D9FF] hover:from-[#00D9FF] hover:to-[#7B3FF2] disabled:from-gray-700 disabled:to-gray-700 font-black text-3xl rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                  style={{ fontFamily: game.font.display }}
                >
                  {loading ? 'Loading...' : user ? `Get Squad - ₹${selectedOption?.price}` : 'Sign In'}
                </button>
              </div>
            )}
          </div>
        </div>

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </div>
    );
  }

  // 2XKO-specific layout (Premium/Elegant)
  if (game.id === '2xko') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1428] via-blue-950 to-black" style={{ fontFamily: game.font.body }}>
        <Navbar />

        {/* Elegant golden accents */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-[#D4AF37] blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Header - Elegant style */}
          <div className="bg-gradient-to-b from-[#D4AF37]/10 to-transparent border-b-2 border-[#D4AF37]/30 py-16">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
                  <Zap className="h-10 w-10 text-[#D4AF37]" />
                  <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
                </div>
              </div>
              <h1 className="text-8xl font-black text-[#D4AF37] mb-4 tracking-wide"
                style={{ fontFamily: game.font.display }}>
                2XKO
              </h1>
              <p className="text-[#C89B3C] text-xl tracking-[0.5em] uppercase">Tag Team Fighter</p>
            </div>
          </div>

          {/* Team Selection - Premium card */}
          <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-[#D4AF37] mb-4" style={{ fontFamily: game.font.display }}>
                Find Your Partner
              </h2>
              <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            </div>

            {game.teamSizes.map((team) => (
              <button
                key={team.size}
                onClick={() => setSelectedTeamSize(team.size)}
                className={`w-full max-w-2xl mx-auto block mb-16 p-12 rounded-lg transition-all transform hover:scale-105 ${
                  selectedTeamSize === team.size
                    ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#C89B3C]/10 border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/30'
                    : 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-2 border-gray-700/50'
                }`}
              >
                <div className="text-center">
                  <div className="inline-block p-8 rounded-full bg-[#D4AF37]/10 mb-6">
                    <Users className="h-16 w-16 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-4xl font-bold mb-4 text-[#D4AF37]" style={{ fontFamily: game.font.display }}>
                    {team.label}
                  </h3>
                  <p className="text-gray-400 mb-6 text-lg">2v2 Tag Team Fighter</p>
                  <div className="text-6xl font-bold text-[#D4AF37]">₹{team.price}</div>
                </div>
              </button>
            ))}

            {/* Form - Elegant design */}
            {selectedTeamSize && (
              <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-900/80 to-blue-950/50 backdrop-blur-xl rounded-lg border border-[#D4AF37]/30 p-10">

                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-[#D4AF37] mb-2" style={{ fontFamily: game.font.display }}>
                    Fighter Profile
                  </h2>
                  <div className="h-px w-32 mx-auto bg-[#D4AF37]"></div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div>
                    <label className="text-base font-semibold text-[#C89B3C] mb-3 block tracking-wide">Rank Division</label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="w-full px-6 py-4 bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-lg outline-none text-lg"
                    >
                      <option value="">Select Your Rank</option>
                      {game.ranks.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-base font-semibold text-[#C89B3C] mb-3 block tracking-wide">Server Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-6 py-4 bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-lg outline-none text-lg"
                      >
                        <option value="">Select Region</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="singapore">Singapore</option>
                        <option value="bahrain">Bahrain</option>
                        <option value="hong-kong">Hong Kong</option>
                        <option value="tokyo">Tokyo</option>
                        <option value="sydney">Sydney</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-[#C89B3C] mb-3 block tracking-wide">Preferred Time</label>
                      <select
                        value={playTime}
                        onChange={(e) => setPlayTime(e.target.value)}
                        className="w-full px-6 py-4 bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-lg outline-none text-lg"
                      >
                        <option value="">Select Time</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-[#D4AF37] to-[#C89B3C] hover:from-[#C89B3C] hover:to-[#D4AF37] disabled:from-gray-700 disabled:to-gray-700 font-bold text-2xl rounded-lg transition-all shadow-lg shadow-[#D4AF37]/30"
                  style={{ fontFamily: game.font.display }}
                >
                  {loading ? 'Processing...' : user ? `Find Partner - ₹${selectedOption?.price}` : 'Sign In'}
                </button>
              </div>
            )}
          </div>
        </div>

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </div>
    );
  }

  return null;
}
