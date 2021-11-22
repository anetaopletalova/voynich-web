import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { isExpired } from 'react-jwt';
import { useAuth } from '../context/auth';

const AuthenticatedRoute = ({ component: Component, ...rest }) => {
    const { authState } = useAuth();
    const isAutenthicated = authState && authState.token && !isExpired(authState.token);

    return (
        <Route
            {...rest}
            render={(props) => isAutenthicated
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />}
        />
    )
}


export default AuthenticatedRoute;
