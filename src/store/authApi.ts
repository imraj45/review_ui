import { apiSlice } from './apiSlice'

interface RegisterRequest {
  email: string
  password: string
}

interface RegisterResponse {
  message: string
}

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
  user: {
    id: string
    email: string
    role: string
  }
}

interface ForgotPasswordRequest {
  email: string
}

interface ForgotPasswordResponse {
  message: string
  resetToken: string
}

interface ResetPasswordRequest {
  token: string
  newPassword: string
}

interface ResetPasswordResponse {
  message: string
}

interface MeResponse {
  userId: string
  email: string
  role: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: LoginResponse) => response,
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation, useGetMeQuery } = authApi
