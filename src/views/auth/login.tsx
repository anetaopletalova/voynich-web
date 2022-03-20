import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { object, string } from 'yup';
import { useAuth } from '../../context/auth';
import { useApi } from '../../api/restApi';
import { AxiosError } from 'axios';
import { Button, Theme, useTheme } from '@mui/material';

const validationSchema = object({
    email: string().required(),
    password: string().required(),
});

const initialValues = {
    email: '',
    password: '',
};

const LoginErrorMessages = {
    invalid: 'Login failed. Invalid credentials',
    error: 'Something went wrong. Please try again',
};

const Login = () => {
    const { authState, login } = useAuth();
    const history = useHistory();
    const [error, setError] = useState<string>('');
    const { authApi } = useApi();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

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

            if (response.data) {
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
        <div style={styles.loginContainer}>
            <Formik
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
                initialValues={initialValues}
            >
                {(errors) => (
                    <Form>
                        <span style={styles.label}>Email</span>
                        <div>
                            <Field name='email' placeholder='Email' className='text-field' />
                            <ErrorMessage name='email' className='error-message' component="div" />
                        </div>
                        <span style={styles.label}>Password</span>
                        <div>
                            <Field
                                name='password'
                                type='password'
                                placeholder="Password"
                                className='text-field'
                            />
                            <ErrorMessage name='password' className='error-message' component="div" />
                        </div>
                        <Button style={styles.submitButton} color='secondary' variant="contained" type='submit'>Log In</Button>
                    </Form>
                )}
            </Formik>
            <p>{error}</p>
        </div>
    );
};

const createStyles = (theme: Theme): { [key: string]: React.CSSProperties } => (
    {
        loginContainer: {
            padding: '30px',
            boxSizing: 'content-box',
            width: '350px',
            margin: 'auto',
            borderRadius: '5px',
            boxShadow: '#0002 0 0 30px',
            overflow: 'hidden',
            flexDirection: 'column',
        },
        label: {
            textAlign: 'left',
            marginLeft: '10px',
            marginTop: '20px',
        },
        submitButton: {
            margin: '25px 5px',
        }
    }
);

export default Login;
