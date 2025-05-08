
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { toast } from '@/components/ui/sonner';

const Success = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Get current order from localStorage
    const currentOrderId = localStorage.getItem('currentOrder');
    if (!currentOrderId) {
      navigate('/');
      return;
    }
    
    setOrderId(currentOrderId);
    
    // Clean up after 5 minutes to prevent revisiting
    const timer = setTimeout(() => {
      localStorage.removeItem('currentOrder');
    }, 5 * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);
  
  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    
    // Save feedback to localStorage for demo purposes
    const feedback = {
      orderId,
      rating,
      comment,
      date: new Date().toISOString()
    };
    
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    toast.success('Thank you for your feedback!');
    
    // Remove current order to prevent revisiting
    localStorage.removeItem('currentOrder');
    
    // Redirect to home
    navigate('/');
  };
  
  if (!isAuthenticated || !orderId) {
    return null; // We'll redirect, no need to render anything
  }
  
  return (
    <div>
      <Header />
      <div className="container max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
        <p className="text-gray-600 mb-8">Your order #{orderId} has been placed successfully!</p>
  
        <p className="text-gray-600 mb-8">Visit the KIOT Food Court to pick up your order.</p>
        <p className="text-gray-600 mb-8">
          A QR code has been sent to you. Scan it at the KIOT Food Court to collect your order and enjoy!
        </p>
  
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Share Your Feedback</h2>
          
          <div className="flex justify-center mb-4">
            <StarRating onRatingChange={setRating} />
          </div>
          
          <Textarea
            placeholder="Tell us about your experience (optional)"
            className="mb-4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          
          <Button 
            className="w-full bg-foodcourt-red hover:bg-red-600"
            onClick={handleSubmitFeedback}
          >
            Submit Feedback
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          className="border-foodcourt-red text-foodcourt-red"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Success;
