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
import { useToast } from "@/components/ui/use-toast";

const BASE_URL = "https://server-food-court.onrender.com";

const normalizePhone = (phone: string): string => {
  let normalized = phone.replace(/\s+/g, '');
  if (!normalized.startsWith('+')) {
    normalized = `+91${normalized}`;
  }
  return normalized;
};

const Profile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrError, setQrError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.phone) {
      toast({
        title: "Error",
        description: "User phone number not found. Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    try {
      const normalizedPhone = normalizePhone(user.phone);
      const response = await fetch(`${BASE_URL}/orders?phone=${encodeURIComponent(normalizedPhone)}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status === "success") {
        setOrders(result.orders || []);
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.phone, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.phone) {
      fetchOrders();
    } else {
      toast({
        title: "Error",
        description: "User phone number not found. Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, user?.phone, fetchOrders, toast]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setQrCode(null);
    setQrError(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/cancel-order`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setOrders((prevOrders: any[]) => prevOrders.filter((order) => order.orderId !== orderId));
        setSelectedOrder(null);
        toast({
          title: "Success",
          description: "Order deleted successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Delete order error:', error);
      toast({
        title: "Error",
        description: "Failed to delete order.",
        variant: "destructive",
      });
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
        setQrCode(result.qrCode);
        setQrError(null);
      } else {
        throw new Error(result.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Fetch QR code error:', error);
      setQrError(error.message || 'Failed to generate QR code');
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
                {orders.map((order: any) => (
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

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {(selectedOrder as any)?.orderId}</DialogTitle>
              <DialogDescription>
                View the items and details of your order.
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div>
                  <p><strong>Student Name:</strong> {(selectedOrder as any).studentName}</p>
                  <p><strong>Email:</strong> {(selectedOrder as any).studentEmail}</p>
                  <p><strong>Phone:</strong> {(selectedOrder as any).studentPhone}</p>
                  <p><strong>Payment Method:</strong> {(selectedOrder as any).paymentMethod}</p>
                  <p><strong>Total Amount:</strong> {formatCurrency((selectedOrder as any).totalAmount)}</p>
                  <p><strong>Status:</strong> {(selectedOrder as any).status}</p>
                  <p><strong>Date:</strong> {new Date((selectedOrder as any).createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Items:</h3>
                  <ul className="list-disc pl-5">
                    {(selectedOrder as any).items.map((item: any, index: number) => (
                      <li key={index}>
                        {item.name} - {formatCurrency(item.price)} x {item.quantity} ({item.serviceType})
                      </li>
                    ))}
                  </ul>
                </div>
                {(selectedOrder as any).status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => handleViewQrCode((selectedOrder as any).orderId)}
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
