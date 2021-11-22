import React, { createContext, useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import { deleteToken, setToken, useApi } from '../api/restApi';
import { useEffect } from 'react-router/node_modules/@types/react';
import { IDecodedToken, ILoginResponse } from '../types/general';
import { useMountEffect } from '../helpers/hooks';

interface IAuthState {
    userId: number;
    token: string;
    email: string;
}

interface IAuthLoginData extends IAuthState {
    refreshToken: string;
}

interface IRefreshResult {
    successful: boolean;
    accessToken?: string;
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
                    const { token, refreshToken } = response.data;
                    setToken(token);
                    console.log('fetched', response.data)
                    const decoded = decodeToken(token);
                    const d = decoded as IDecodedToken;
                    //const userResponse = await authApi.getStaff(d.uid);
                    //need to store token on BE to auto login the user?
                    //refresh token shoud be stored in local storage
                    login({
                        email: 'Sofik',
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
        console.log('login', token)

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
                console.log(refreshToken)
                const response = await authApi.refreshToken(refreshToken);
                console.log(response)
                if ([200, 201].includes(response.status)) {
                    const { accessToken, refreshToken } = response.data;
                    setToken(accessToken);
                    localStorage.setItem('refresh', refreshToken);
                    silentRefreshTimer = setTimeout(
                        refresh,
                        getTimeoutFromToken(accessToken)
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