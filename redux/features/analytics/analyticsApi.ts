import { apiSlice } from "../api/apiSlice";

export const analyticsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCoursesAnalytics: builder.query({
            query: () => ({
                url: "admin/analytics/courses",
                method: "GET",
                credentials: "include" as const,
            }),
        }),
        getUsersAnalytics: builder.query({
            query: () => ({
                url: "admin/analytics/users",
                method: "GET",
                credentials: "include" as const,
            }),
        }),
        getOrdersAnalytics: builder.query({
            query: () => ({
                url: "admin/analytics/orders",
                method: "GET",
                credentials: "include" as const,
            }),
        }),
    }),
});

export const {
    useGetCoursesAnalyticsQuery,
    useGetUsersAnalyticsQuery,
    useGetOrdersAnalyticsQuery,
} = analyticsApi;