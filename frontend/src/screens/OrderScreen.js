import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';

import {
  TableContainer,
  Table,
  Typography,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CardMedia,
  Box
} from '@mui/material';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
    loadingDeliver: false,
  });
  const { search } = useLocation();
  const status = new URLSearchParams(search).get('Status');
  const authority = new URLSearchParams(search).get('Authority');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        if (status && !data.isPaid) {
          dispatch({ type: 'PAY_REQUEST' });
          const amount = data.totalPrice;
          if (status === 'NOK') {
            dispatch({ type: 'PAY_FAIL' });
            toast.error('پرداخت  ناموفق بود');
          } else {
            const { data } = await axios.post(
              '/api/payment/zarinpal/verify',
              {
                amount: amount,
                authority: authority,
              },
              {
                headers: {
                  authorization: `Bearer ${userInfo.token}`,
                },
              }
            );
            try {
              dispatch({ type: 'PAY_REQUEST' });
              await axios.put(
                `/api/orders/${orderId}/pay`,
                {
                  id: data.ref_id,
                  status: 'OK',
                  update_time: Date.now(),
                  mobile: '',
                },
                {
                  headers: { authorization: `Bearer ${userInfo.token}` },
                }
              );
              dispatch({ type: 'PAY_SUCCESS', payload: data });
              toast.success('پرداخت انجام شد.');
            } catch (err) {
              dispatch({ type: 'PAY_FAIL', payload: getError(err) });
              toast.error(getError(err));
            }
          }
        }
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
    }
  }, [
    order,
    userInfo,
    orderId,
    status,
    authority,
    navigate,
    successPay,
    successDeliver,
  ]);
  function createOrder(data, actions) {
    if (order.paymentMethod === 'zarinpal') {
      const loadZarinPalScript = async () => {
        try {
          const { data } = await axios.post(
            '/api/payment/zarinpal/request',
            {
              amount: order.totalPrice,
              orderId: orderId,
            },
            {
              headers: {
                authorization: `Bearer ${userInfo.token}`,
              },
            }
          );
          toast.promise(fetch('/api/payment/zarinpal/request'), {
            pending: 'در حال اتصال به درگاه بانک',
            success: 'با موفقیت در حال انتقال به درگاه بانک ...',
            error: 'انتقال به درگاه انجام نشد',
          });
          window.location.href = 'https://www.zarinpal.com/pg/StartPay/' + data;
          dispatch({ type: 'PAY_REQUEST' });
        } catch (err) {
          toast.error(getError(err));
        }
      };
      loadZarinPalScript();
    }
  }
  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order</title>
      </Helmet>
      <h1 className='my-5'>Order Number : {order.orderNumber}</h1>
      <Row>
        <Col md={8}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                <strong>Address: </strong> {order.shippingAddress.address},
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant='success'>
                  Delivered at {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant='danger'>Not Delivered</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {order.paymentMethod}
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant='success'>
                  Paid at {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant='danger'>Not Paid</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className='mb-3'>
            <TableContainer className='my-5'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Image</TableCell>
                    <TableCell align='center'>Name</TableCell>
                    <TableCell align='center'>Quantity</TableCell>
                    <TableCell align='center'>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell align='center'>
                      <Box
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                              >
                        <CardMedia
                          component='img'
                          image={item.image}
                          sx={{ width: 100 }}
                          alt={item.name}
                        />
                        </Box>
                      </TableCell>

                      <TableCell align='center'>
                        <Typography>{item.name}</Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <div style={{ display: 'inline-flex' }}>
                          <span>{item.quantity}</span>
                        </div>
                      </TableCell>
                      <TableCell align='center'>
                        {item.price.toLocaleString()}
                        {'  '} Rial
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item align='center'>
                  <div className='d-grid my-3'>
                    {!order.isPaid && (
                      <Button type='button' onClick={createOrder}>
                        Pay
                      </Button>
                    )}
                  </div>
                  {loadingPay && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
