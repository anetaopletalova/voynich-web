import React, { createContext, useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import { deleteToken, setToken, useApi } from '../api/restApi';
import { useEffect } from 'react-router/node_modules/@types/react';
import { ILoginResponse } from '../types/general';




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
}

export const AuthContext = createContext<IAuthContext>({
    authState: null,
    login: () => Promise.resolve(false),
    logout: () => Promise.resolve(),
});

let silentRefreshTimer;

const getTimeoutFromToken = token => {
    const decoded = decodeToken(token); // exp is in seconds-since-epoch (1970-01-01)
    console.log('decoded', decoded)
    // const msToExpiration = exp * 1000 - Date.now(); // needs converting to ms
    // return msToExpiration - 5000; // we'll want to refresh 5s before expiration
};


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [authState, setAuthState] = useState<IAuthState | null>(null);
    const [rolesLookup, setRolesLookup] = useState([]);
    const { authApi } = useApi();
    const history = useHistory();

    // useEffect(() => {
    //     const fetchData = async token => {
    //         try {
    //             const response = await userApi.refreshToken(token);
    //             if (response.status === 201) {
    //                 const { accessToken, refreshToken } = response.data;
    //                 setToken(accessToken);
    //                 const { uid } = decodeToken(accessToken);
    //                 const userResponse = await userApi.getStaff(uid);
    //                 const { staffInfo, userInfo } = userResponse.data;
    //                 login({
    //                     email: userInfo.email,
    //                     firstName: userInfo.firstName,
    //                     lastName: userInfo.lastName,
    //                     accessRoles: staffInfo.accessRoles,
    //                     token: accessToken,
    //                     refreshToken,
    //                     userId: uid,
    //                 });
    //             }
    //             setIsLoading(false);
    //         } catch (e) {
    //             setIsLoading(false);
    //         }
    //     };

    //     const refreshToken = localStorage.getItem('refresh');
    //     if (refreshToken && !isExpired(refreshToken)) fetchData(refreshToken);
    //     else setIsLoading(false);
    // }, []);

    const login = async (data: ILoginResponse) => {
        const { token } = data;
        if (!token || isExpired(token)) return false;
        //localStorage.setItem('refresh', refreshToken);
        setToken(token);

        //tady musi byt jmeno a id uzivatele
        setAuthState(data);


        //silentRefreshTimer = setTimeout(refresh, getTimeoutFromToken(token));
        return true;
    };

    // const refresh = async () => {
    //     const refreshToken = localStorage.getItem('refresh');
    //     if (!refreshToken || isExpired(refreshToken)) {
    //         logout();
    //         return false;
    //     } else {
    //         try {
    //             const response = await userApi.refreshToken(refreshToken);
    //             if ([200, 201].includes(response.status)) {
    //                 const { accessToken, refreshToken } = response.data;
    //                 // setAuthState(prevState => ({
    //                 //     ...prevState,
    //                 //     token: accessToken,
    //                 // }));
    //                 setToken(accessToken);
    //                 localStorage.setItem('refresh', refreshToken);
    //                 silentRefreshTimer = setTimeout(
    //                     refresh,
    //                     getTimeoutFromToken(accessToken)
    //                 );
    //                 return true;
    //             } else {
    //                 logout();
    //                 return false;
    //             }
    //         } catch (e) {
    //             logout();
    //             return false;
    //         }
    //     }
    // };

    const logout = () => {
        deleteToken();
        localStorage.removeItem('refresh');
        clearTimeout(silentRefreshTimer);
        //history.push(PATHS.login + (reason ? `?reason=${reason}` : ''));
    };

    return (
        <AuthContext.Provider
            value={{ authState, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
