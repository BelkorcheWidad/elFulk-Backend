export const AllowAnonymous = () => () => {};
export const Session = () => () => {};
export const AuthGuard = class {};
export class AuthService {
  get api() {
    return {};
  }
}
export type UserSession = {
  user: { id: string; email: string; [key: string]: unknown };
  session: { token: string; [key: string]: unknown };
};
