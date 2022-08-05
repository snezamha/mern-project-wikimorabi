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

export default function VerifyScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  const mobile = new URLSearchParams(search).get('number');
  const [code, setCode] = useState('');
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post('/api/users/verify', {
        mobile,
        code,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('با موفقیت وارد شده اید');
      navigate(redirect || '/');
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
        <title>Verify User</title>
      </Helmet>
      <h1 className='my-5'>Verify User</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='code'>
          <Form.Label>Code</Form.Label>
          <Form.Control
            type='text'
            required
            onChange={(e) => setCode(e.target.value)}
          />
        </Form.Group>
        <div className='mb-3'>
          <Button type='submit'>Sign In</Button>
        </div>
      </Form>
    </Container>
  );
}
