import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };

    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [fullName, setFullName] = useState(userInfo.fullName);

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          fullName,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('اطلاعات کاربر با موفقیت به روزرسانی شد');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return loadingUpdate ? (
    <LoadingBox></LoadingBox>
  ) : (
    <>
      <div className='container small-container'>
        <Helmet>
          <title>User Profile</title>
        </Helmet>
        <h1 className='my-5'>User Profile</h1>
        <form onSubmit={submitHandler}>
          <Form.Group className='mb-3' controlId='name'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='name'>
            <Form.Label>Mobile</Form.Label>
            <Form.Control
              type='mobile'
              value={userInfo.mobile}
              disabled={true}
              required
            />
          </Form.Group>

          <div className='mb-3'>
            <Button type='submit'>Update</Button>
          </div>
        </form>
      </div>
    </>
  );
}
