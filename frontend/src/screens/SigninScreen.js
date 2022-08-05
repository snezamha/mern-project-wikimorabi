import Axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [mobile, setMobile] = useState('');

  const { state } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await Axios.post('/api/users/login', {
        mobile,
      });
      navigate('/verify?number=' + mobile + '&redirect=' + redirect);
    } catch (err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);
  return (
    <Container className='small-container'>
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <h1 className='my-5'>Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='mobile'>
          <Form.Label>Mobile</Form.Label>
          <Form.Control
            type='text'
            required
            onChange={(e) => setMobile(e.target.value)}
          />
        </Form.Group>
        <div className='mb-3'>
          <Button type='submit'>Send Verify Code</Button>
        </div>
      </Form>
    </Container>
  );
}
