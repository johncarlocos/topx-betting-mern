import { useQuery } from "@tanstack/react-query";
import { api, handleApiError } from "../utils/api";

const useGetMatchData = () => {
  return useQuery({
    queryKey: ["matchData"],
    queryFn: async () => {
      try {
        const response = await api.get("/match/match-data");
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    staleTime: 10000, // 10 seconds - match data changes frequently
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
};

export default useGetMatchData;
