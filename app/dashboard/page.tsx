'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { TeamRequest } from '@/lib/types';
import { gameConfigs } from '@/lib/gameConfigs';
import { Users, Clock, MapPin, Trophy, Loader2, Gamepad2, Search, CheckCircle, XCircle, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'matched' | 'completed'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      toast.error('Please sign in to view dashboard');
      return;
    }

    if (!user) return;

    const q = query(
      collection(db, 'teamRequests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const reqs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as TeamRequest[];
        setRequests(reqs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load requests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    matched: requests.filter(r => r.status === 'matched').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Search className="h-5 w-5" />;
      case 'matched':
        return <CheckCircle className="h-5 w-5" />;
      case 'completed':
        return <Target className="h-5 w-5" />;
      default:
        return <XCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'from-yellow-500/20 to-orange-500/10',
          border: 'border-yellow-500/40',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/20'
        };
      case 'matched':
        return {
          bg: 'from-green-500/20 to-emerald-500/10',
          border: 'border-green-500/40',
          text: 'text-green-400',
          glow: 'shadow-green-500/20'
        };
      case 'completed':
        return {
          bg: 'from-blue-500/20 to-cyan-500/10',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          glow: 'shadow-blue-500/20'
        };
      default:
        return {
          bg: 'from-red-500/20 to-pink-500/10',
          border: 'border-red-500/40',
          text: 'text-red-400',
          glow: 'shadow-red-500/20'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Navbar />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30">
              <Gamepad2 className="h-10 w-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Mission Control
              </h1>
              <p className="text-gray-400 text-lg mt-1">Track your teammate requests and squad status</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Requests', value: stats.total, icon: Users, color: 'from-purple-600 to-purple-800', glow: 'shadow-purple-500/50' },
            { label: 'Searching', value: stats.pending, icon: Search, color: 'from-yellow-600 to-orange-600', glow: 'shadow-yellow-500/50' },
            { label: 'Matched', value: stats.matched, icon: CheckCircle, color: 'from-green-600 to-emerald-600', glow: 'shadow-green-500/50' },
            { label: 'Completed', value: stats.completed, icon: Zap, color: 'from-blue-600 to-cyan-600', glow: 'shadow-blue-500/50' },
          ].map((stat, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white/10 shadow-xl ${stat.glow} transform hover:scale-105 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-white">{stat.value}</p>
                </div>
                <stat.icon className="h-12 w-12 text-white/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Searching' },
            { key: 'matched', label: 'Matched' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-full mb-6 border border-purple-500/30">
              <Users className="h-20 w-20 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              {filter === 'all' ? 'No Requests Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              {filter === 'all'
                ? 'Start your journey by finding teammates for your favorite game'
                : `You don't have any ${filter} requests at the moment`
              }
            </p>
            {filter === 'all' && (
              <Link href="/">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg shadow-purple-500/50 transform hover:scale-105">
                  Find Teammates
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request) => {
              const game = gameConfigs.find((g) => g.id === request.game);
              const teamOption = game?.teamSizes.find((t) => t.size === request.teamSize);
              const statusStyle = getStatusColor(request.status);

              return (
                <div
                  key={request.id}
                  className="relative group"
                  style={{ fontFamily: game?.font.body }}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: game?.theme.primary }}
                  ></div>

                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-800 hover:border-gray-700 transition-all shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${game?.theme.primary}20` }}
                        >
                          <Gamepad2 className="h-8 w-8" style={{ color: game?.theme.primary }} />
                        </div>
                        <div>
                          <h3
                            className="text-3xl font-black"
                            style={{
                              color: game?.theme.primary,
                              fontFamily: game?.font.display
                            }}
                          >
                            {game?.name}
                          </h3>
                          <p className="text-gray-400 font-semibold">{teamOption?.label}</p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${statusStyle.bg} border ${statusStyle.border} ${statusStyle.text} shadow-lg ${statusStyle.glow}`}
                      >
                        {getStatusIcon(request.status)}
                        <span className="font-bold uppercase text-xs">
                          {request.status}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/30 rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <Trophy className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Rank</span>
                        </div>
                        <p className="font-bold text-lg" style={{ color: game?.theme.accent }}>{request.rank}</p>
                      </div>

                      <div className="bg-black/30 rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Region</span>
                        </div>
                        <p className="font-bold text-lg capitalize" style={{ color: game?.theme.accent }}>{request.region}</p>
                      </div>

                      <div className="bg-black/30 rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Play Time</span>
                        </div>
                        <p className="font-bold text-lg capitalize" style={{ color: game?.theme.accent }}>
                          {request.preferredPlayTime}
                        </p>
                      </div>

                      <div className="bg-black/30 rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <Users className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Squad</span>
                        </div>
                        <p className="font-bold text-lg" style={{ color: game?.theme.accent }}>
                          {teamOption?.slots} Players
                        </p>
                      </div>
                    </div>

                    {/* Status Message */}
                    {request.status === 'pending' && (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Search className="h-5 w-5 text-yellow-400 animate-pulse" />
                          <p className="text-sm font-semibold text-yellow-400">
                            Searching for teammates... We'll notify you when we find a match!
                          </p>
                        </div>
                      </div>
                    )}

                    {request.status === 'matched' && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <p className="text-sm font-semibold text-green-400">
                            Match found! Check your email for teammate details.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between pt-4 border-t-2"
                      style={{ borderColor: `${game?.theme.primary}20` }}
                    >
                      <div className="text-sm text-gray-500 font-medium">
                        {new Date(request.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div
                        className="text-3xl font-black"
                        style={{ color: game?.theme.primary }}
                      >
                        ₹{request.price}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Action */}
        {requests.length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg shadow-purple-500/50 transform hover:scale-105">
                + Find More Teammates
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
