import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { cartItems, totalAmount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [isAuthenticated, cartItems, navigate, user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!name || !email || !phone) {
      alert("Please fill in all customer details.");
      return;
    }

    if (!/^\+[1-9]\d{1,14}$/.test(phone) || phone.length < 12 || phone.length > 15) {
      alert("Please enter a valid phone number (e.g., +919876543210, 10-14 digits after country code).");
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === "cash") {
      // Handle Cash on Delivery
      const orderId = `ORDER-${Date.now().toString().slice(-6)}`;
      try {
        const response = await fetch(`${BASE_URL}/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: "cash_order",
            razorpay_payment_id: "cash_payment",
            razorpay_signature: "cash_signature",
            studentName: name,
            studentEmail: email,
            studentPhone: phone,
            items: cartItems,
            totalAmount,
            orderId,
            paymentMethod: "cash",
          }),
        });

        const result = await response.json();
        if (result.status === "success") {
          clearCart();
          localStorage.setItem("currentOrder", orderId);
          navigate('/success');
        } else {
          alert(result.error || "Failed to place order.");
        }
      } catch (error) {
        console.error("Cash on Delivery error:", error);
        alert("Failed to place order.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Handle Razorpay Payment (for both "card" and "upi")
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please try again.");
        setIsProcessing(false);
        return;
      }

      try {
        // Step 1: Create order
        const orderResponse = await fetch(`${BASE_URL}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount }),
        });

        const order = await orderResponse.json();
        if (!order.id) {
          alert("Failed to create order.");
          setIsProcessing(false);
          return;
        }

        // Step 2: Open Razorpay modal
        const options = {
          key: "rzp_test_qjAIjIEbpg4MCt",
          amount: order.amount,
          currency: order.currency,
          name: "Food Court",
          description: "Order Payment",
          order_id: order.id,
          handler: async (response) => {
            // Step 3: Verify payment
            const orderId = `ORDER-${Date.now().toString().slice(-6)}`;
            const verifyResponse = await fetch(`${BASE_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                studentName: name,
                studentEmail: email,
                studentPhone: phone,
                items: cartItems,
                totalAmount,
                orderId,
                paymentMethod: paymentMethod === "card" ? "Card" : "UPI",
              }),
            });

            const verifyResult = await verifyResponse.json();
            if (verifyResult.status === "success") {
              clearCart();
              localStorage.setItem("currentOrder", orderId);
              navigate('/success');
            } else {
              alert(verifyResult.error || "Payment verification failed.");
            }
          },
          prefill: {
            name,
            email,
            contact: phone,
          },
          theme: {
            color: "#F37254",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Payment error:", error);
        alert("Payment failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Checkout</h1>

        {/* Customer Details Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Customer Details</h2>
          <div className="grid gap-6">
            <div>
              <Label htmlFor="name" className="text-gray-600">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border-gray-300 focus:border-foodcourt-red focus:ring-foodcourt-red"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-600">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-gray-300 focus:border-foodcourt-red focus:ring-foodcourt-red"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-600">Phone Number</Label>
              <Input
  id="phone"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className="mt-1 border-gray-300 focus:border-foodcourt-red focus:ring-foodcourt-red"
  required
  pattern="^\+[1-9]\d{1,14}$"
/>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between py-3 border-b border-gray-200">
                <div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-sm text-gray-500 block">
                    {item.serviceType === 'dine-in' ? 'Dine-in' : 'Takeaway'} × {item.quantity}
                  </span>
                </div>
                <span className="text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-bold text-gray-800">
              <span>Total</span>
              <span className="text-2xl text-foodcourt-red">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Payment Method</h2>
          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="grid gap-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="upi" id="upi" className="text-foodcourt-red" />
              <Label htmlFor="upi" className="text-gray-600">UPI Payment</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Pay Button */}
        <Button
          className="w-full bg-foodcourt-red hover:bg-red-600 text-white py-6 text-lg rounded-lg transition duration-300"
          disabled={isProcessing}
          onClick={handlePayment}
        >
          {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(totalAmount)}`}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;