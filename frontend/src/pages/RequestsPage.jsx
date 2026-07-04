import { useState, useEffect, useRef } from 'react';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const fetchRequestsRef = useRef(null);

  useEffect(() => {
    const doFetch = async () => {
      try {
        const data = await requestService.getMyRequests();
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestsRef.current = doFetch;
    doFetch();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await requestService.acceptRequest(requestId);
      fetchRequestsRef.current?.();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to accept request');
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await requestService.completeRequest(requestId);
      fetchRequestsRef.current?.();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to complete request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Requests</h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{request.category?.icon || '🔧'}</span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.category?.name || 'Service'}
                      </h3>
                    </div>
                    <p className="text-gray-700 mb-2">{request.description}</p>
                    <p className="text-sm text-gray-600 mb-2">📍 {request.address}</p>
                    {user?.role === 'provider' && request.customer && (
                      <p className="text-sm text-gray-600">👤 Customer: {request.customer.full_name}</p>
                    )}
                    {user?.role === 'customer' && request.provider && (
                      <p className="text-sm text-gray-600">👤 Provider: {request.provider.full_name}</p>
                    )}
                    {request.final_price && (
                      <p className="text-sm font-semibold text-green-600">💰 KES {request.final_price}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {user?.role === 'provider' && request.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Accept Request
                    </button>
                  )}
                  {(user?.role === 'customer' || user?.role === 'provider') && request.status === 'accepted' && (
                    <button
                      onClick={() => handleComplete(request.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestsPage;
