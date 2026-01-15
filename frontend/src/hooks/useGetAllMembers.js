import { useQuery } from "@tanstack/react-query";
import { api, handleApiError } from "../utils/api";

const useGetAllMembers = (page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc') => {
  return useQuery({
    queryKey: ["members", page, limit, sortBy, sortOrder],
    queryFn: async () => {
      try {
        const response = await api.get("/admin/members", {
          params: { page, limit, sortBy, sortOrder },
        });
        // Handle both old format (array) and new format (object with data and pagination)
        if (Array.isArray(response.data)) {
          return {
            data: response.data,
            pagination: {
              page: 1,
              limit: response.data.length,
              total: response.data.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          };
        }
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    staleTime: 30000, // 30 seconds - member data doesn't change as frequently
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

export default useGetAllMembers;
