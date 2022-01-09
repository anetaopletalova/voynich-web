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
    note: string;
    classificationId: number;
    pageId: number;
}

export interface IEditNotePost {
    note: string;
    id: number;
}

export interface IPagesResponse {
    pages: IPage[];
}

export interface IPage {
    id: number;
    name: string;
}

export interface IPageClassificationResponse {
    pageClassifications: IPageClassification[];
}

export interface IPageClassification {
    classificationId: number;
    note: string;
    description: string;
    markings: IMarking[];
    visited: boolean;
    favorite: number | null;
    createdAt: string;
    userName: string;
    userId: number;
}

export interface IClassificationDetailResponse {
   
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