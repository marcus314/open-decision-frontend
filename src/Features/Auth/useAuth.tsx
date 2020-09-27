import { prop } from "ramda";
import React from "react";
import { fetchDatabase } from "../../backend-integration";
import { GET_TOKEN, LOGOUT_USER, REGISTER_USER } from "./authQueries";

interface authStatus {
  success: boolean;
  errors?: {};
}

interface authResponse {
  success: boolean;
  errors?: {};
  refreshToken?: string;
  token?: string;
  unarchiving?: boolean;
  user?: { email?: string; lastName?: string; firstName?: string };
}
//TODO email and password should not be optional
type Auth = {
  user?: string;

  signin?({
    email,
    password,
    callback,
  }: {
    email?: string;
    password?: string;
    callback?: Function;
  }): Promise<authStatus>;

  signout?(callback: Function): Promise<authStatus>;

  signup?({
    email,
    password1,
    password2,
    username,
  }: {
    email?: string;
    password1?: string;
    password2?: string;
    username?: string;
  }): Promise<authStatus>;
};

//Hook that manages the user token and the methods associated with the auth state of the user
export const useProvideAuth = (): Auth => {
  const [user, setUser] = React.useState(null);
  const [refreshToken, setRefreshToken] = React.useState(null);

  const signin: Auth["signin"] = async ({ email = "test@outlook.de", password = "fogmub-bifDaj-sarjo8", callback }) => {
    const response: authResponse = await fetchDatabase({
      query: GET_TOKEN,
      dataAccessor: prop("tokenAuth"),
      variables: { email, password },
    });

    if (response.success) {
      setTimeout(callback, 100);
      setUser(response.token);
      setRefreshToken(response.refreshToken);
      return { success: response.success };
    } else {
      return { success: response.success, errors: response.errors };
    }
  };

  const signup: Auth["signup"] = async ({
    email = "test@outlook.de",
    password1 = "fogmub-bifDaj-sarjo8",
    password2 = "fogmub-bifDaj-sarjo8",
    username = "",
  }) => {
    const response: authResponse = await fetchDatabase({
      query: REGISTER_USER,
      dataAccessor: prop("register"),
      variables: {
        email,
        username,
        password1,
        password2,
      },
    });

    if (response.success) {
      setUser(response.token);
      return { success: response.success };
    } else {
      return { success: response.success, errors: response.errors };
    }
  };

  const signout: Auth["signout"] = async (callback) => {
    const response: authResponse = await fetchDatabase({
      query: LOGOUT_USER,
      dataAccessor: prop("revokeToken"),
      variables: { refreshToken },
    });

    if (response.success) {
      setTimeout(callback, 100);
      setUser(null);
      setRefreshToken(null);
      return { success: response.success };
    } else {
      return { success: response.success, errors: response.errors };
    }
  };

  const auth: Auth = { signin, signup, signout, user };
  return auth;
};

const AuthContext = React.createContext<Auth>({});
export const useAuth = () => React.useContext(AuthContext);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
