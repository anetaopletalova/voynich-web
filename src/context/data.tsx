import React, { createContext, useCallback, useContext } from 'react';
import { useApi } from '../api/restApi';
import { IPage } from '../types/general';

const CACHE_KEYS = {
    pages: 'CACHE_PAGES',
};

const InMemoryCache: Record<string, unknown> = {};

interface ILookupContext {
    getPages(): Promise<IPage[]>;
}

export const LookupContext = createContext<ILookupContext>({
    getPages: () => Promise.resolve([]),
});

export const useLookup = (): ILookupContext => useContext<ILookupContext>(LookupContext);

export const LookupProvider = ({ children }) => {
    const { pagesApi } = useApi();

    const getFromCache = useCallback(key => {
        if (InMemoryCache[key]) {
            return InMemoryCache[key];
        }

        const cache = localStorage.getItem(key);

        if (cache) {
            const { data } = JSON.parse(cache);
            InMemoryCache[key] = data;
            return data;

        }

        return null;
    }, []);

    const saveToCache = useCallback((key, data) => {
        const toCache = { timestamp: Date.now(), data };
        localStorage.setItem(key, JSON.stringify(toCache));
        InMemoryCache[key] = data;
    }, []);

    const getPages = useCallback(async () => {
        const cached = getFromCache(CACHE_KEYS.pages);

        if (cached) {
            return cached;
        }

        const res = await pagesApi.getAll();

        if (res.ok) {
            saveToCache(CACHE_KEYS.pages, res.data);
            return res.data;
        }

        return null;
    }, [pagesApi, getFromCache, saveToCache]);

    return (
        <LookupContext.Provider
            value={{
                getPages
            }}
        >
            {children}
        </LookupContext.Provider>
    );
};
