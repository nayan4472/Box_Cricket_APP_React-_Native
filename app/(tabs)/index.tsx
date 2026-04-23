import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import LoginPage from '@/app/LoginPage';

const HomeScreen = () => {
  return (
    <StripeProvider publishableKey="pk_test_51QyZGWFEFmRRpSNlxfSNSZJWMhn24giINhmlTl31UWc80B4xd1QIMhPtW6GgLpVZ0ZFZXi7UzhLnueEOLejbQyE700EsZSEEkL">
      <LoginPage />
    </StripeProvider>
  );
};

export default HomeScreen;
