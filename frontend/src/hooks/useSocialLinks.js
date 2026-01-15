import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "../utils/api";

const useSocialLinks = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["socialLinks"],
        queryFn: async () => {
            try {
                const response = await api.get("/social");
                console.log("Social Links Data:", response.data);
                return response.data;
            } catch (error) {
                throw new Error(handleApiError(error));
            }
        },
    });

    return { socialLinks: data, isLoading, error };
};

export default useSocialLinks;


export const useUpdateSocialLinks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (links) => {
            try {
                const { data } = await api.put("/social", links);
                return data;
            } catch (error) {
                throw new Error(handleApiError(error));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["socialLinks"]);
        },
    });
};