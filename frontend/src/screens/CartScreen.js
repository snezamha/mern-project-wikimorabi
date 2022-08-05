import { useContext } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
export default function CartScreen() {
  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };
  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>
      <h1 className='my-5'>Shopping Cart</h1>
      <Row>
        <Col md={9}>
          {cartItems.length === 0 ? (
            <MessageBox>
              Cart is empty. <Link to='/'>Go Shopping</Link>
            </MessageBox>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Image</TableCell>
                    <TableCell align='center'>Name</TableCell>
                    <TableCell align='center'>Quantity</TableCell>
                    <TableCell align='center'>Price</TableCell>
                    <TableCell align='center'>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan='5'>
                        <MessageBox variant='warning'>
                          Cart is empty. <Link to='/'>Go Shopping</Link>
                        </MessageBox>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {cartItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell align='center'>
                            <Link to={`/product/${item.slug}`}>
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
                            </Link>
                          </TableCell>

                          <TableCell align='center'>
                            <Link
                              style={{ textDecoration: 'none' }}
                              to={`/product/${item.slug}`}
                            >
                              <Typography>{item.name}</Typography>
                            </Link>
                          </TableCell>
                          <TableCell align='center'>
                            <div style={{ display: 'inline-flex' }}>
                              <Button
                                onClick={() =>
                                  updateCartHandler(item, item.quantity - 1)
                                }
                                variant='light'
                                disabled={item.quantity === 1}
                              >
                                <i className='fas fa-minus-circle'></i>
                              </Button>
                              <span className='m-2'>{item.quantity}</span>
                              <Button
                                variant='light'
                                onClick={() =>
                                  updateCartHandler(item, item.quantity + 1)
                                }
                                disabled={item.quantity === item.countInStock}
                              >
                                <i className='fas fa-plus-circle'></i>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell align='center'>
                            {item.price} Rial
                          </TableCell>
                          <TableCell align='center'>
                            <Button
                              onClick={() => removeItemHandler(item)}
                              variant='light'
                            >
                              <i className='fas fa-trash'></i>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h4>
                    Subtotal : ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items)
                  </h4>
                  <h4>
                    Price :{' '}
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}{' '}
                    Rial
                  </h4>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className='d-grid'>
                    <Button
                      type='button'
                      variant='primary'
                      disabled={cartItems.length === 0}
                      onClick={checkoutHandler}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
