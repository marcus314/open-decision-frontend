type TokenHook = {
  token: string;
  setToken: (token: string) => void;
  removeToken: () => void;
};

const createTokenHook = (tokenName: string): TokenHook => {
  const token = localStorage.getItem(tokenName);
  const setToken = (token) => localStorage.setItem(tokenName, token);
  const removeToken = () => localStorage.removeItem(tokenName);

  return { token, setToken, removeToken };
};

export const useAuthToken = (): TokenHook => createTokenHook("authToken");
export const useRefreshToken = (): TokenHook => createTokenHook("refreshToken");