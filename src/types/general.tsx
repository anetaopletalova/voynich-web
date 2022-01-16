export type StringStringObject = {
    [key: string]: string;
};

export interface ILoginData {
    username: string;
    password: string;
}

export interface ILoginResponse {
    token: string;
    userId: number;
    email: string;
    refreshToken: string;
}

export interface IApiResponse<T = unknown> {
    ok: boolean;
    data?: T;
    error?: IApiError;
}

export interface IApiError {
    error: string;
    statusCode: number;
    message: string;
}

export interface IDecodedToken {
    exp: number;
    uid: number;
    type: string;
}

export interface IAddNotePost {
    text: string;
    classificationId: number;
    pageId: number;
}

export interface IEditNotePost {
    text: string;
    noteId: number;
}

export interface IPagesResponse {
    pages: IPage[];
}

export interface IPage {
    id: number;
    name: string;
}

export interface IPageClassificationResponse {
    items: IPageClassification[];
    totalItems: number;
}

export interface IPageClassification {
    classificationId: number;
    note: INote | null;
    description: string;
    markings: IMarking[];
    visited: boolean;
    favorite: number | null;
    createdAt: string;
    userName: string;
    userId: number;
    pageId: number;
}

export interface INote {
    classificationId: number;
    id: number;
    text: string;
    pageId: number;
}

export interface IMarking {
    classificationId: number;
    description: string; 
    height: number;
    id: number;
    pageId: number;
    width: number;
    x: number;
    y: number;
}

export interface IAddToFavoritesResponse {
    favoriteId: number;
}

export interface IClassificationParameters {
    page: number; 
    pageId?: number; 
    dateTo?: string; 
    withNote?: boolean; 
    favorite?: boolean;
    userName?: string;
}
