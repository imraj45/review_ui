import { apiSlice } from './apiSlice'

interface UploadScreenshotResponse {
  message: string
  url: string
}

export type AiSectionData = Record<string, string | number | string[] | Record<string, unknown>>

export interface StoredReview {
  id: string
  userId: string
  platform: string
  productName: string
  tone: string
  reviewData: Record<string, AiSectionData>
  status: string
  createdAt: string
  updatedAt: string
}

export interface AiReviewResponse {
  success: boolean
  productName?: string
  tone?: string
  data?: Record<string, AiSectionData>
  review?: StoredReview
}

interface GenerateReviewRequest {
  productName?: string
  tone?: string
}

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadScreenshot: builder.mutation<UploadScreenshotResponse, { screenshot: File; platformId: string }>({
      query: ({ screenshot, platformId }) => {
        const formData = new FormData()
        formData.append('screenshot', screenshot)
        formData.append('platformId', platformId)
        return {
          url: '/reviews/upload',
          method: 'POST',
          body: formData,
        }
      },
    }),
    generateG2Review: builder.mutation<AiReviewResponse, GenerateReviewRequest>({
      query: ({ productName = 'Sniffer', tone = 'positive' }) => ({
        url: '/g2/generate-review',
        method: 'POST',
        body: { productName, tone },
      }),
    }),
    generateCapterraReview: builder.mutation<AiReviewResponse, GenerateReviewRequest>({
      query: ({ productName = 'Sniffer', tone = 'positive' }) => ({
        url: '/capterra/generate-review',
        method: 'POST',
        body: { productName, tone },
      }),
    }),
    generateProductHuntReview: builder.mutation<AiReviewResponse, GenerateReviewRequest>({
      query: ({ productName = 'Sniffer', tone = 'positive' }) => ({
        url: '/producthunt/generate-review',
        method: 'POST',
        body: { productName, tone },
      }),
    }),
    generateTrustpilotReview: builder.mutation<AiReviewResponse, GenerateReviewRequest>({
      query: ({ productName = 'Sniffer', tone = 'positive' }) => ({
        url: '/trustpilot/generate-review',
        method: 'POST',
        body: { productName, tone },
      }),
    }),
    generateCWSReview: builder.mutation<AiReviewResponse, GenerateReviewRequest>({
      query: ({ productName = 'Sniffer', tone = 'positive' }) => ({
        url: '/chromewebstore/generate-review',
        method: 'POST',
        body: { productName, tone },
      }),
    }),
    getReviewByPlatform: builder.query<StoredReview, string>({
      query: (platformId) => {
        const apiPlatformMap: Record<string, string> = {
          ph: 'producthunt',
          tp: 'trustpilot',
          cws: 'chromewebstore',
        }
        return `/dashboard/reviews/platform/${apiPlatformMap[platformId] ?? platformId}`
      },
    }),
  }),
})

export const { useUploadScreenshotMutation, useGenerateG2ReviewMutation, useGenerateCapterraReviewMutation, useGenerateProductHuntReviewMutation, useGenerateTrustpilotReviewMutation, useGenerateCWSReviewMutation, useGetReviewByPlatformQuery } = reviewApi
