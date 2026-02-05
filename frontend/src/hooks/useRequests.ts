import { useEffect } from "react";
import { useRequestStore } from "../store/useRequestStore";

export const useRequests = (autoFetch = true) => {
  const store = useRequestStore();

  useEffect(() => {
    if (autoFetch) {
      store.fetchRequests();
    }
  }, []);

  return store;
};
