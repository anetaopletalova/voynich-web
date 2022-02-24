import { IMarkingResponse } from './../types/general';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { snakeCase } from 'snake-case';
import { camelCase } from 'camel-case';
import applyCaseMiddleware from 'axios-case-converter';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/auth';
import {
    IAddNotePost,
    IAddToFavoritesResponse,
    IApiResponse,
    IChangePassword,
    IClassificationParameters,
    ICoordinates,
    IEditNotePost,
    ILoginData,
    ILoginResponse,
    INote,
    IPage,
    IPageClassificationResponse
} from '../types/general';

const baseURL = 'http://127.0.0.1:5000/';


const customCamel = input => {
    const result =
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
            snake: input => snakeCase(input),
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

    const authApi = {
        logIn: (data: ILoginData) =>
            instance.post<ILoginResponse>('/login', {}, { auth: data }),
        refreshToken: (refreshToken: string) =>
            instance.post<any>('/refresh', { refreshToken }),
        changePassword: (userId: number, data: IChangePassword) =>
            handleRequest<ILoginResponse>(instance.post(`/passwordChange/${userId}`, data)),
    };

    const pagesApi = {
        getAll: () => handleRequest<IPage[]>(instance.get('/pages')),
    }

    const classificationApi = {
        getByPageId: (userId: number, params: IClassificationParameters) =>
            handleRequest<IPageClassificationResponse>(instance.get(`/classification/page/${userId}`, { params })),
        visit: (userId: number, classificationId: number) =>
            handleRequest(instance.post(`/visit/${userId}`, { classificationId })),
        favorites:
        {
            add: (userId: number, classificationId: number) =>
                handleRequest<IAddToFavoritesResponse>(instance.post(`/favorite/${userId}`, { classificationId })),
            remove: (userId: number, favoriteId: number) =>
                handleRequest(instance.delete(`/favorite/${userId}`, { params: { favoriteId } })),
        },
        getAll: (userId: number, params: IClassificationParameters) =>
            handleRequest<IPageClassificationResponse>(instance.get(`/classification/all/${userId}`, { params })),
    }

    const markingsApi = {
        getByCoordinates: (pageId: number, params: ICoordinates) =>
            handleRequest<IMarkingResponse>(instance.get(`/markings/${pageId}`, { params })),
    }

    const notesApi = {
        addNote: (userId: number, data: IAddNotePost) => handleRequest<INote>(instance.post(`/note/${userId}`, data)),
        editNote: (userId: number, data: IEditNotePost) => handleRequest<INote>(instance.put(`/note/${userId}`, data)),
        deleteNote: (userId: number, noteId: number) => handleRequest(instance.delete(`/note/${userId}`, { params: { noteId } })),
    }

    return { authApi, pagesApi, classificationApi, notesApi, markingsApi }

}