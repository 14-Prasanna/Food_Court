import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to normalize phone number
const normalizePhone = (phone) => {
  let normalized = phone.replace(/\s+/g, '');
  if (!normalized.startsWith('+')) {
    normalized = `+91${normalized}`;
  }
  return normalized;
};

const Profile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrCode, setQrCode] = useState(null); // State for QR code (data URL)
  const [qrError, setQrError] = useState(null); // State for QR code errors

  const fetchOrders = useCallback(async () => {
    try {
      const normalizedPhone = normalizePhone(user?.phone || '');
      const response = await fetch(`${BASE_URL}orders?phone=${encodeURIComponent(normalizedPhone)}`, {
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result.status === "success") {
        setOrders(result.orders || []);
      } else {
        console.error('Fetch orders error:', result.error);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.phone]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.phone) {
      fetchOrders();
    }
  }, [isAuthenticated, navigate, user?.phone, fetchOrders]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setQrCode(null); // Reset QR code when opening modal
    setQrError(null); // Reset QR error
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/cancel-order`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
        setSelectedOrder(null);
      } else {
        console.error('Delete order error:', result.error);
      }
    } catch (error) {
      console.error('Delete order error:', error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchOrders();
  };

  const handleViewQrCode = async (orderId: string) => {
    try {
      const normalizedPhone = normalizePhone(user?.phone || '');
      const response = await fetch(`${BASE_URL}/customer/generate-qr`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone: normalizedPhone }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setQrCode(result.qrCode); // Set the data URL from the response
        setQrError(null);
      } else {
        setQrError(result.error || 'Failed to generate QR code');
        setQrCode(null);
      }
    } catch (error) {
      console.error('Fetch QR code error:', error);
      setQrError('Failed to generate QR code');
      setQrCode(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Header />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="text-gray-600">{user?.name || 'No name provided'}</p>
              <p className="text-gray-600">{user?.phone}</p>
            </div>
            <Button
              variant="outline"
              className="border-foodcourt-red text-foodcourt-red hover:bg-red-100"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order History</h2>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Orders'}
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p>You haven't placed any orders yet.</p>
            <Button
              className="mt-4 bg-foodcourt-red hover:bg-red-600 text-white"
              onClick={() => navigate('/')}
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt || Date.now()).toLocaleDateString()} {new Date(order.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.totalAmount || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'Placed' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                        onClick={() => handleViewDetails(order)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteOrder(order.orderId)}
                        disabled={order.status === 'Paid' || order.status === 'completed'}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Order Details */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.orderId}</DialogTitle>
              <DialogDescription>
                View the items and details of your order.
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div>
                  <p><strong>Student Name:</strong> {selectedOrder.studentName}</p>
                  <p><strong>Email:</strong> {selectedOrder.studentEmail}</p>
                  <p><strong>Phone:</strong> {selectedOrder.studentPhone}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Total Amount:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Items:</h3>
                  <ul className="list-disc pl-5">
                    {selectedOrder.items.map((item, index) => (
                      <li key={index}>
                        {item.name} - {formatCurrency(item.price)} x {item.quantity} ({item.serviceType})
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedOrder.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => handleViewQrCode(selectedOrder.orderId)}
                    disabled={qrCode || qrError}
                  >
                    View QR Code
                  </Button>
                )}
                {qrError && (
                  <p className="text-red-600">{qrError}</p>
                )}
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="Order QR Code" className="w-48 h-48" />
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;