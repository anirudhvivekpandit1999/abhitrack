import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material';
import { config } from '../../config';

const loadRazorpay = () => new Promise((resolve) => {
  if (document.getElementById('razorpay-sdk')) return resolve(true);
  const script = document.createElement('script');
  script.id = 'razorpay-sdk';
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const createOrder = async () => {
    const res = await fetch(`${config.APIBaseURL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_rupees: 1, currency: 'INR', notes: { purpose: 'Non-Abhitech signup' } })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.message || 'Failed to create order');
    }
    return res.json();
  };

  const verifyPayment = async (payload) => {
    const res = await fetch(`${config.APIBaseURL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.message || 'Verification failed');
    }
    return res.json();
  };

  const startPayment = async () => {
    setError('');
    setSuccess(null);
    setLoading(true);
    try {
      const sdkOk = await loadRazorpay();
      if (!sdkOk) throw new Error('Failed to load Razorpay SDK');

      const { order, key_id } = await createOrder();

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Abhitech Statistical Tool',
        description: 'Signup Fee (₹1)',
        order_id: order.id,
        handler: async function (response) {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess(result);
          } catch (e) {
            setError(e.message);
          }
        },
        theme: { color: '#1976d2' },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
          emi: false,
          paylater: true
        },
        notes: { feature: 'non-abhitech-signup' },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', p: 2 }}>
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>Complete Signup</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Please pay ₹1 to activate your Non-Abhitech account.</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment verified. Payment ID: {success.payment?.id}
            </Alert>
          )}
          <Button variant="contained" onClick={startPayment} disabled={loading}>
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Pay ₹1 with Razorpay'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payment;
