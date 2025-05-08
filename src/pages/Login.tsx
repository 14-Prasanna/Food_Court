import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const { sendOTP, verifyOTP, checkUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const checkReturningUser = async () => {
      if (phone && phone.length >= 10) {
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
          formattedPhone = `+${phone}`;
        }
        try {
          const { exists, name: existingName } = await checkUser(formattedPhone, 'customer');
          if (exists) {
            setIsReturningUser(true);
            setName(existingName || '');
          } else {
            setIsReturningUser(false);
            setName('');
          }
        } catch (error) {
          console.error('Check returning user error:', error);
        }
      } else {
        setIsReturningUser(false);
        setName('');
      }
    };

    checkReturningUser();
  }, [phone, checkUser]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+${phone}`;
    }
    setPhone(formattedPhone);

    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone) || formattedPhone.length < 12 || formattedPhone.length > 15) {
      toast.error('Please enter a valid phone number (e.g., +919876543210, 10-14 digits after country code).');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOTP(formattedPhone, 'customer');
      setIsOtpSent(true);
    } catch (error) {
      // Error is handled in sendOTP
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOTP(phone, otp, isReturningUser ? undefined : name, 'customer');
      navigate('/');
    } catch (error) {
      // Error is handled in verifyOTP
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

          {!isOtpSent ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number (e.g., +919876543210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  pattern="^\+[1-9]\d{1,14}$"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you a one-time password to verify.
                </p>
              </div>
              <div className="mb-6">
                <Label htmlFor="name">Name {isReturningUser ? '' : '(Optional)'}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isReturningUser}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-foodcourt-red hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the OTP sent to {phone}.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-foodcourt-red hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;