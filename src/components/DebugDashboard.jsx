import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// DEBUG DASHBOARD - Shows exactly what's in your Firebase
const DebugDashboard = () => {
  const [debug, setDebug] = useState({
    loading: true,
    collections: {},
    errors: [],
    authUser: null
  });

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    const debugInfo = {
      collections: {},
      errors: [],
      authUser: auth.currentUser
    };

    try {
      // Check Auth User
      console.log('🔐 Current Auth User:', auth.currentUser);
      
      // Test each collection
      const collectionsToTest = ['users', 'items', 'listings', 'conversations', 'messages'];
      
      for (const collectionName of collectionsToTest) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          debugInfo.collections[collectionName] = {
            exists: true,
            count: snapshot.size,
            docs: snapshot.docs.map(doc => ({
              id: doc.id,
              data: doc.data()
            }))
          };
          console.log(`✅ Collection "${collectionName}":`, snapshot.size, 'documents');
        } catch (error) {
          debugInfo.collections[collectionName] = {
            exists: false,
            error: error.message
          };
          debugInfo.errors.push(`Collection "${collectionName}": ${error.message}`);
          console.error(`❌ Error reading "${collectionName}":`, error);
        }
      }

      setDebug({
        ...debugInfo,
        loading: false
      });

    } catch (error) {
      console.error('❌ Fatal error:', error);
      setDebug({
        ...debugInfo,
        errors: [...debugInfo.errors, error.message],
        loading: false
      });
    }
  };

  if (debug.loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking Firebase collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          🔍 Firebase Debug Dashboard
        </h1>

        {/* Auth Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            🔐 Authentication Status
          </h2>
          {debug.authUser ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ User is logged in</p>
              <p className="text-sm"><strong>Email:</strong> {debug.authUser.email}</p>
              <p className="text-sm"><strong>UID:</strong> {debug.authUser.uid}</p>
              <p className="text-sm"><strong>Email Verified:</strong> {debug.authUser.emailVerified ? '✅ Yes' : '❌ No'}</p>
            </div>
          ) : (
            <p className="text-red-600 font-semibold">❌ No user logged in</p>
          )}
        </div>

        {/* Errors */}
        {debug.errors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              ⚠️ Errors Found
            </h2>
            <ul className="space-y-2">
              {debug.errors.map((error, i) => (
                <li key={i} className="text-red-700 text-sm font-mono">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Collections Info */}
        <div className="space-y-6">
          {Object.entries(debug.collections).map(([name, info]) => (
            <div key={name} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                {info.exists ? '✅' : '❌'} Collection: <code className="ml-2 text-blue-600">{name}</code>
              </h2>
              
              {info.exists ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {info.count} {info.count === 1 ? 'document' : 'documents'}
                  </p>
                  
                  {info.count > 0 ? (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Documents:</h3>
                      <div className="space-y-2 max-h-96 overflow-auto">
                        {info.docs.map((doc, i) => (
                          <details key={i} className="bg-gray-50 rounded p-3">
                            <summary className="cursor-pointer font-medium text-gray-800">
                              📄 {doc.id}
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-800 text-green-400 p-3 rounded overflow-auto">
                              {JSON.stringify(doc.data, null, 2)}
                            </pre>
                          </details>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-yellow-600 bg-yellow-50 p-3 rounded">
                      ⚠️ Collection exists but is empty. Add some data!
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-700 font-semibold">Collection does not exist or cannot be accessed</p>
                  {info.error && (
                    <p className="text-sm text-red-600 mt-2 font-mono">{info.error}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            📋 Summary
          </h2>
          <ul className="space-y-2 text-blue-900">
            <li>✅ <strong>users:</strong> {debug.collections.users?.count || 0} documents</li>
            <li>✅ <strong>items:</strong> {debug.collections.items?.count || 0} documents</li>
            <li>✅ <strong>conversations:</strong> {debug.collections.conversations?.count || 0} documents</li>
          </ul>
          
          <div className="mt-4 p-4 bg-white rounded">
            <p className="font-semibold text-gray-800 mb-2">💡 Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>If collections are empty, sign up with a test account</li>
              <li>Create a listing to populate "items" collection</li>
              <li>Send a message to create "conversations"</li>
              <li>Refresh this page to see updated counts</li>
              <li>Then check the main stats dashboard at <code className="bg-gray-200 px-1">/stats</code></li>
            </ol>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            🔄 Refresh Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugDashboard;
