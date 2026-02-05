import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    store.bootstrap();
  }, []);

  return store;
};
