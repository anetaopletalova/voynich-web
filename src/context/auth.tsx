import React, { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import { deleteToken, setToken, useApi } from '../api/restApi';
import { IDecodedToken, ILoginResponse } from '../types/general';
import { useMountEffect } from '../helpers/hooks';

interface IAuthState {
    userId: number;
    token: string;
    email: string;
}

interface IAuthContext {
    authState: IAuthState | null;
    login: (loginData: ILoginResponse) => Promise<boolean>;
    logout: () => void;
    refresh: () => Promise<boolean>;
}

export const AuthContext = createContext<IAuthContext>({
    authState: null,
    login: () => Promise.resolve(false),
    logout: () => null,
    refresh: () => Promise.resolve(false),
});

let silentRefreshTimer;

const getTimeoutFromToken = (token: string) => {
    const decoded = decodeToken(token); // exp is in seconds-since-epoch (1970-01-01)
    const d = decoded as IDecodedToken;
    const msToExpiration = d.exp * 1000 - Date.now(); // needs converting to ms
    return msToExpiration - 5000; // we'll want to refresh 5s before expiration
};


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [authState, setAuthState] = useState<IAuthState | null>(null);
    const { authApi } = useApi();
    const history = useHistory();

    useMountEffect(() => {
        //used when refresh token is expired
        const fetchData = async token => {
            try {
                const response = await authApi.refreshToken(token);
                console.log(response.status)
                if (response.status === 200) {
                    const { token, refreshToken, user } = response.data;
                    setToken(token);
                    const decoded = decodeToken(token);
                    const d = decoded as IDecodedToken;
                    login({
                        email: user.email,
                        token,
                        refreshToken,
                        userId: d.uid,
                    });
                }
                setIsLoading(false);
            } catch (e) {
                setIsLoading(false);
            }
        };

        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken && !isExpired(refreshToken)) fetchData(refreshToken);
        else setIsLoading(false);
    });

    const login = async (data: ILoginResponse) => {
        const { token, refreshToken } = data;
        if (!token || isExpired(token)) return false;

        localStorage.setItem('refresh', refreshToken);
        setToken(token);
        setAuthState(data);

        silentRefreshTimer = setTimeout(refresh, getTimeoutFromToken(token));
        return true;
    };

    const refresh = async () => {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken || isExpired(refreshToken)) {
            logout();
            return false;
        } else {
            try {
                const response = await authApi.refreshToken(refreshToken);
                if ([200, 201].includes(response.status)) {
                    const { token, refreshToken } = response.data;
                    setToken(token);
                    localStorage.setItem('refresh', refreshToken);
                    silentRefreshTimer = setTimeout(
                        refresh,
                        getTimeoutFromToken(token)
                    );
                    return true;
                } else {
                    logout();
                    return false;
                }
            } catch (e) {
                logout();
                return false;
            }
        }
    };

    const logout = () => {
        deleteToken();
        setAuthState(null);
        localStorage.removeItem('refresh');
        clearTimeout(silentRefreshTimer);
        history.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{ authState, login, logout, refresh }}
        >
            {children}
        </AuthContext.Provider>
    );
};
