import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { object, string } from 'yup';
import { useAuth } from '../../context/auth';
import { useApi } from '../../api/restApi';
import './login.scss';
import { AxiosError } from 'axios';
import { useMountEffect } from '../../helpers/hooks';
import { Button } from '@mui/material';

const validationSchema = object({
    //add email() validation
    email: string().required(),
    password: string().required(),
});

const initialValues = {
    email: '',
    password: '',
};

// const LogoutReasonMessages = {
//     [LOGOUT_REASONS.expired]: 'You have been logged out due to inactivity.',
//     [LOGOUT_REASONS.loggedOut]: 'You have successfully logged out.',
//     [LOGOUT_REASONS.error]:
//         'An error has occurred. Please try logging in again.',
//     [LOGOUT_REASONS.pwdChanged]: 'Password Successfully Reset!',
// };

const LoginErrorMessages = {
    invalid: 'Login failed. Invalid credentials',
    error: 'Something went wrong. Please try again',
};

const Login = () => {
    const { authState, login } = useAuth();
    const history = useHistory();
    const [error, setError] = useState<string>('');
    const { authApi } = useApi();

    useEffect(() => {
        // If logged in already, redirect to dashboard
        if (authState && authState.token) history.push('/');
        // Remove query params. We needed them only on mount, and we got them now.
        else window.history.replaceState(null, '', window.location.pathname);
    }, [authState, history]);

    const handleSubmit = async ({ email, password }) => {
        setError('');
        try {
            const response = await authApi.logIn({
                username: email,
                password,
            });

            if (response.data && response.ok) {
                login(response.data);
            }
            history.replace('/');
        } catch (e) {
            const error = e as AxiosError;
            if (error.response)
                switch (error.response.status) {
                    case 401:
                        setError(LoginErrorMessages.invalid);
                        return;
                    default:
                        setError(LoginErrorMessages.error);
                }
            else setError(LoginErrorMessages.error);
        }
    };
    return (
        <div className='login-container'>
            <Formik
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
                initialValues={initialValues}
            >
                {(errors) => (
                    <Form>
                        <span className='label'>Email</span>
                        <div>
                            <Field name='email' placeholder='Email' className='text-field' />
                            <ErrorMessage name='email' className='error-message' component="div" />
                        </div>
                        <span className='label'>Password</span>
                        <div>
                            <Field
                                name='password'
                                type='password'
                                placeholder="Password"
                                className='text-field'
                            />
                            <ErrorMessage name='password' className='error-message' component="div" />
                        </div>
                        {/* <Link to='/login/forgottenPassword'>
                            Forgot password
                        </Link> */}
                        <Button className='submit-button' color='secondary' variant="contained" type='submit'>Log In</Button>
                    </Form>
                )}
            </Formik>
            <p className='login-error'>{error}</p>
        </div>
    );
};

export default Login;
