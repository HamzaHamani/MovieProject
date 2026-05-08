import { create } from "zustand";

interface SignInModalStore {
  isOpen: boolean;
  isLoading: boolean;
  openModal: () => void;
  closeModal: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useSignInModal = create<SignInModalStore>((set) => ({
  isOpen: false,
  isLoading: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, isLoading: false }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));
