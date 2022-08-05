import Axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import {
  TableContainer,
  Table,
  Typography,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CardMedia,
  Box,
} from '@mui/material';
import MessageBox from '../components/MessageBox';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};
export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const round = (num) => Math.round(num);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const itemsPrice = cart.cartItems.reduce(
    (a, c) => a + c.price * c.quantity,
    0
  );
  const shippingPrice = itemsPrice > 2000000 ? 0 : 150000;
  const taxPrice = itemsPrice * 0.09;
  const totalPrice = round(itemsPrice + shippingPrice + taxPrice);

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: itemsPrice,
          shippingPrice: shippingPrice,
          taxPrice: taxPrice,
          totalPrice: totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };
  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className='my-5'>Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Address: </strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to='/shipping'>Edit</Link>
            </Card.Body>
          </Card>

          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to='/payment'>Edit</Link>
            </Card.Body>
          </Card>

          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <TableContainer className='mt-5'>
                <Table className='mb-4'>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>Image</TableCell>
                      <TableCell align='center'>Name</TableCell>
                      <TableCell align='center'>Quantity</TableCell>
                      <TableCell align='center'>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.cartItems.length === 0 ? (
                      <TableRow>
                        <TableCell align='center' colSpan='4'>
                          <MessageBox>
                            Cart is empty. <Link to='/'>Go Shopping</Link>
                          </MessageBox>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {cart.cartItems.map((item) => (
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
                                  alt={item.name}
                                  sx={{ width: 100 }}
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
                              Rial
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
                <Link to='/cart'>Edit</Link>
              </TableContainer>
            </Card.Body>
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
                    <Col>{itemsPrice.toLocaleString()} Rail</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>{shippingPrice.toLocaleString()} Rial</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>{taxPrice.toLocaleString()} Rial</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>{totalPrice.toLocaleString()} Rial</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item align='center'>
                  <div className='d-grid my-3'>
                    <Button
                      type='button'
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Description :</Card.Title>
              <Typography>برای سفارشات بیش از مبلغ ۲.۰۰۰.۰۰۰ ریال هزینه ارسال رایگان محاسبه خواهد شد. در غیر اینصورت هرینه ۱۵۰.۰۰۰ ریال جهت ارسال لحاظ خواهد شد.</Typography>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
