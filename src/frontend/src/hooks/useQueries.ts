import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PhotoRecord, UserProfile } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useGetPhotoRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<PhotoRecord[]>({
    queryKey: ["photoRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPhotoRecords();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useAddPhotoRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      photo,
    }: {
      id: string;
      photo: PhotoRecord;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addPhotoRecord(id, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photoRecords"] });
    },
  });
}

export function useDeletePhotoRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deletePhotoRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photoRecords"] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
