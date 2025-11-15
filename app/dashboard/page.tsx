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
import { Users, Clock, MapPin, Trophy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'matched':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-400">View and manage your team requests</p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Requests Yet</h2>
            <p className="text-gray-400 mb-6">
              Start by finding teammates for your favorite game
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Find Teammates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request) => {
              const game = gameConfigs.find((g) => g.id === request.game);
              const teamOption = game?.teamSizes.find(
                (t) => t.size === request.teamSize
              );

              return (
                <div
                  key={request.id}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  {/* Game Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3
                        className="text-2xl font-bold mb-1"
                        style={{ color: game?.theme.primary }}
                      >
                        {game?.name}
                      </h3>
                      <p className="text-sm text-gray-400">{teamOption?.label}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Trophy className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">Rank:</span>
                      <span className="font-medium">{request.rank}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">Region:</span>
                      <span className="font-medium capitalize">
                        {request.region}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">Play Time:</span>
                      <span className="font-medium capitalize">
                        {request.preferredPlayTime}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">Team Size:</span>
                      <span className="font-medium">{teamOption?.slots} players</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: game?.theme.primary }}
                    >
                      ₹{request.price}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-500">
                        🔍 Looking for teammates... We'll notify you when we find a
                        match!
                      </p>
                    </div>
                  )}

                  {request.status === 'matched' && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-500">
                        ✅ Match found! Check your email for teammate details.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
