export interface SessionInterface {
  expires: string;
  accessToken: string;
  user: userSession;
}

export interface userSession {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string;
}
