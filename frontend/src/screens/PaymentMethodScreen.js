import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';
import { toast } from 'react-toastify';

export default function PaymentMethodScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'zarinpal'
  );

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);
  const submitHandler = (e) => {
    e.preventDefault();
    if (!paymentMethodName) {
      toast.warning('لطفا یک روش پرداخت فعال را انتخاب کنید');
    } else {
      ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
      localStorage.setItem('paymentMethod', paymentMethodName);
      navigate('/placeorder');
    }
  };
  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className='container small-container'>
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className='my-5'>Payment Method</h1>
        <Form onSubmit={submitHandler}>
          <div className='mb-3'>
            <Form.Check
              type='radio'
              id='zarinpal'
              label='ZarinPal Getway'
              value='zarinpal'
              checked={paymentMethodName === 'zarinpal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className='mb-3'>
            <Form.Check
              type='radio'
              id='cash'
              label='Cash payment'
              value='cash'
              checked={paymentMethodName === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className='mb-3'>
            <Button type='submit'>Continue</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
