import axios, { AxiosError, AxiosResponse } from 'axios';
import { snakeCase } from 'snake-case';
import { camelCase } from 'camel-case';
import applyCaseMiddleware from 'axios-case-converter';
import { getKeyByValue } from '../utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/auth';
import { IApiResponse, ILoginData, ILoginResponse } from '../types/general';

const baseURL = 'http://127.0.0.1:5000/';

// BE uses snake_case and FE camelCase. We translate that using the middleware.
// These are the exceptions we want to translate as well.
const customTransformations = {
    firstname: 'firstName',
    lastname: 'lastName',
    middlename: 'middleName',
    guardianname: 'guardianName',
    guardianrole: 'guardianRole',
};

const customCamel = input => {
    const result =
        customTransformations[input] || // If there's a record in the list above, use that
        (input.includes('_') ? camelCase(input) : input); // If not, translate incoming property names from snake to camel (only if it's really snake_case, i.e. look for the "_" character)
    return result;
};

export const instance = applyCaseMiddleware(
    axios.create({
        baseURL,
        timeout: 5000,
    }),
    {
        ignoreHeaders: true,
        caseFunctions: {
            camel: customCamel,
            snake: input => getKeyByValue(customTransformations, input) || snakeCase(input),
        },
    }
);

export const setToken = (token: string) =>
    (instance.defaults.headers.common['Authorization'] = `Bearer ${token}`);

export const deleteToken = () =>
    (instance.defaults.headers.common['Authorization'] = '');

export const useApi = () => {
    const { refresh } = useAuth();

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    const handleRequest = async <T>(request: Promise<AxiosResponse<T>>): Promise<IApiResponse<T>> => {
        try {
            const response = await request;
            console.log(response.data)
            return { ok: true, data: response.data };
        } catch (e) {
            const error = e as AxiosError;
            if (error.response?.status === 401)
                console.log(error)
            try {
                const didRefresh = await refresh();
                if (didRefresh) {
                    const response = await request;
                    return { ok: true, data: response.data };
                }
            } catch (err) {
                const error = err as AxiosError;
                return handleError(error);
            }
            return handleError(error);
        }
    };

    const handleError = (e: AxiosError, useSnackbar = true) => {
        if (useSnackbar) {
            if (
                e.response?.data?.message &&
                process.env.NODE_ENV !== 'production'
            )
                toast.error(e.response.data.message);
            else if (e.response && process.env.NODE_ENV !== 'production')
                toast.error(`${e.response.status}: ${e.response.statusText}`);
            else toast.error('Something went wrong.');
        }

        if (process.env.NODE_ENV === 'development')
            console.error(e.response || e);

        return { ok: false, data: e.response?.data };
    };

    // const authApi = {
    //     logIn: (data: ILogInData) =>
    //         handleRequest<ILogInDataResponse>(instance.post('client/token/', {}, { auth: data })),
    //     signUp: (data: ISignUpData) => handleRequest<ISignUpDataResponse>(instance.post('user/client/', data)),
    //     refreshToken: (refreshToken: string) =>
    //         instance.post<IRefreshTokenResponse>('user/token/refresh', {}, { params: { refreshToken } }),
    // };

    const authApi = {
        logIn: (data: ILoginData) =>
            handleRequest(instance.post<ILoginResponse>('/login', {}, { auth: data })),
        //signUp: (data: any) => handleRequest(instance.post('user/client', data)),
        refreshToken: (refreshToken: string) =>
            instance.post<any>('/refresh', { refreshToken }),
    };

    const pagesApi = {
        getAll: () => handleRequest(instance.get('/pages')),
    }

    return { authApi, pagesApi }

}