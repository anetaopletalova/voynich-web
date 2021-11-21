import React, { useEffect, useState } from 'react';
import {
    useLocation,
    useHistory,
    Link,
    Switch,
    Route,
    withRouter,
} from 'react-router-dom';
import { decode } from 'querystring';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { object, string } from 'yup';
import { useAuth } from '../../context/auth';
import { useApi } from '../../api/restApi';
import './login.scss';
import { AxiosError } from 'axios';
import { Button } from '../../components/button';

const validationSchema = object({
    //add email
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
    const location = useLocation();
    const [error, setError] = useState<string>('');
    // const { from } = location.state || { from: { pathname: '/' } };
    const { reason } = decode(location.search.substring(1));
    const { authApi, pagesApi } = useApi();

    // useEffect(() => {
    //     // If logged in already, redirect to dashboard
    //     if (authState.token) history.push(from);
    //     // Remove query params. We needed them only on mount, and we got them now.
    //     else window.history.replaceState(null, null, window.location.pathname);
    // }, []);

    const getPages = async () => {
        const res = await pagesApi.getAll();
        console.log(res)

    }

    const handleSubmit = async ({ email, password }) => {
        setError('');
        try {
            const response = await authApi.logIn({
                username: email,
                password,
            });
            console.log(response)
            if (response.data && response.ok) {
                login(response.data);
            }
            // history.replace(from);
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
        <>
            <Formik
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
                initialValues={initialValues}
            >
                {(isSubmitting) => (
                    <Form>
                        <Field name='email' label='Email' />
                        <ErrorMessage name='email' />
                        <Field
                            name='password'
                            type='password'
                            label='Password'
                        />
                        <ErrorMessage name='password' />
                        {/* <Link to='/login/forgottenPassword'>
                            Forgot password
                        </Link> */}
                        <Button isSubmit >
                            Finish
                        </Button>
                    </Form>
                )}
            </Formik>
            <p className='login-error'>{error}</p>
            <Button onClick={getPages}>Get Pages</Button>
        </>
    );
};

export default Login;
