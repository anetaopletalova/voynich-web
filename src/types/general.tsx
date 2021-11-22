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