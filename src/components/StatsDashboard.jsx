import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, Timestamp, onSnapshot } from 'firebase/firestore';

const StatsDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalListings: 0,
    activeListings: 0,
    totalMessages: 0,
    newUsersThisWeek: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
    
    // Set up real-time listeners
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), () => {
      console.log('🔄 Users collection changed, refreshing stats...');
      fetchStats();
    });
    
    const unsubscribeItems = onSnapshot(collection(db, 'items'), () => {
      console.log('🔄 Items collection changed, refreshing stats...');
      fetchStats();
    });
    
    const unsubscribeConversations = onSnapshot(collection(db, 'conversations'), () => {
      console.log('🔄 Conversations collection changed, refreshing stats...');
      fetchStats();
    });
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeItems();
      unsubscribeConversations();
    };
  }, []);

  const fetchStats = async () => {
    try {
      console.log('🔍 Fetching stats from Firebase...');
      
      // Get total users from Firebase Auth (count all authenticated users)
      // Note: If you're storing user profiles in Firestore, update this
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      console.log('👥 Total users found:', totalUsers);
      
      // Count verified users
      const verifiedUsers = usersSnapshot.docs.filter(
        doc => doc.data().emailVerified === true
      ).length;
      console.log('✅ Verified users:', verifiedUsers);

      // Get total listings (your app uses "items" collection)
      const listingsSnapshot = await getDocs(collection(db, 'items'));
      const totalListings = listingsSnapshot.size;
      console.log('📦 Total items found:', totalListings);
      
      // Count active listings (not sold)
      const activeListings = listingsSnapshot.docs.filter(
        doc => doc.data().status !== 'sold'
      ).length;
      console.log('🛍️ Active items:', activeListings);

      // Get total messages/conversations
      const messagesSnapshot = await getDocs(collection(db, 'conversations'));
      const totalMessages = messagesSnapshot.size;
      console.log('💬 Total conversations:', totalMessages);

      // Get new users this week (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newUsersThisWeek = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt;
        if (!createdAt) return false;
        const userDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        return userDate >= oneWeekAgo;
      }).length;

      console.log('📊 Final stats:', {
        totalUsers,
        verifiedUsers,
        totalListings,
        activeListings,
        totalMessages,
        newUsersThisWeek
      });

      setStats({
        totalUsers,
        verifiedUsers,
        totalListings,
        activeListings,
        totalMessages,
        newUsersThisWeek,
        loading: false
      });
      
      console.log('✅ Stats updated successfully!');
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('Error details:', error.message);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading stats...</p>
        </div>
      </div>
    );
  }

  const verificationRate = stats.totalUsers > 0 
    ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) 
    : 0;

  const activeRate = stats.totalListings > 0
    ? Math.round((stats.activeListings / stats.totalListings) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            📊 CUNYswap Live Stats
          </h1>
          <p className="text-xl text-gray-600">
            Real-time platform metrics • Auto-updates live
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <span className="animate-pulse mr-2">🟢</span>
              <span className="font-semibold">Live & Active</span>
            </div>
            <button
              onClick={() => fetchStats()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              <span className="mr-2">🔄</span>
              <span className="font-semibold">Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Total Users Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                  Total Users
                </p>
                <h2 className="text-5xl font-bold text-gray-900 mt-2">
                  {stats.totalUsers}
                </h2>
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  +{stats.newUsersThisWeek} this week
                </p>
              </div>
              <div className="text-6xl">👥</div>
            </div>
          </div>

          {/* Verified Users Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                  Verified Students
                </p>
                <h2 className="text-5xl font-bold text-gray-900 mt-2">
                  {stats.verifiedUsers}
                </h2>
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  {verificationRate}% verified
                </p>
              </div>
              <div className="text-6xl">✅</div>
            </div>
          </div>

          {/* Total Listings Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-purple-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                  Total Listings
                </p>
                <h2 className="text-5xl font-bold text-gray-900 mt-2">
                  {stats.totalListings}
                </h2>
                <p className="text-purple-600 text-sm mt-2 font-semibold">
                  {stats.activeListings} active
                </p>
              </div>
              <div className="text-6xl">📦</div>
            </div>
          </div>

          {/* Active Listings Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-yellow-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                  Active Listings
                </p>
                <h2 className="text-5xl font-bold text-gray-900 mt-2">
                  {stats.activeListings}
                </h2>
                <p className="text-yellow-600 text-sm mt-2 font-semibold">
                  {activeRate}% available
                </p>
              </div>
              <div className="text-6xl">🛍️</div>
            </div>
          </div>

          {/* Conversations Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-pink-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                  Conversations
                </p>
                <h2 className="text-5xl font-bold text-gray-900 mt-2">
                  {stats.totalMessages}
                </h2>
                <p className="text-pink-600 text-sm mt-2 font-semibold">
                  Active chats
                </p>
              </div>
              <div className="text-6xl">💬</div>
            </div>
          </div>

          {/* Growth Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">
                  Weekly Growth
                </p>
                <h2 className="text-5xl font-bold mt-2">
                  +{stats.newUsersThisWeek}
                </h2>
                <p className="text-indigo-100 text-sm mt-2 font-semibold">
                  New users joined
                </p>
              </div>
              <div className="text-6xl">📈</div>
            </div>
          </div>

        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Platform Health */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              Platform Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600 font-medium">Verification Rate</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${verificationRate}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-green-600">{verificationRate}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600 font-medium">Active Listings</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${activeRate}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-purple-600">{activeRate}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Platform Status</span>
                <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                  ✓ Operational
                </span>
              </div>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">💡</span>
              Quick Facts
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🎓</span>
                <div>
                  <p className="font-semibold text-gray-900">CUNY Exclusive</p>
                  <p className="text-gray-600 text-sm">Only verified @cuny.edu emails</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🔒</span>
                <div>
                  <p className="font-semibold text-gray-900">Secure Marketplace</p>
                  <p className="text-gray-600 text-sm">Custom-built authentication system</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚡</span>
                <div>
                  <p className="font-semibold text-gray-900">Full-Stack App</p>
                  <p className="text-gray-600 text-sm">React + Node.js + SQLite3</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🚀</span>
                <div>
                  <p className="font-semibold text-gray-900">Production Ready</p>
                  <p className="text-gray-600 text-sm">Deployed on Vercel</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-3">🎯 Market Potential</h3>
          <p className="text-xl mb-6 text-blue-100">
            Serving the CUNY community of 250,000+ students across 25 campuses
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold">250K+</div>
              <div className="text-blue-100 mt-1">Potential Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold">25</div>
              <div className="text-blue-100 mt-1">CUNY Campuses</div>
            </div>
            <div>
              <div className="text-4xl font-bold">100%</div>
              <div className="text-blue-100 mt-1">Verified Community</div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Last updated: {new Date().toLocaleString()}
        </div>

      </div>
    </div>
  );
};

export default StatsDashboard;
