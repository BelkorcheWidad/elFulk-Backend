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

// better-auth core mock
export const betterAuth = () => ({
  api: {
    signInEmail: () => Promise.resolve({ token: '', user: { id: '' } }),
    signUpEmail: () => Promise.resolve({ user: { id: '' }, token: '' }),
    getSession: () => Promise.resolve(null),
  },
  handler: () => new Response(),
});

// typeorm adapter mock
export const typeormAdapter = () => ({});

// bearer plugin mock
export const bearer = () => ({ id: 'bearer', hooks: {} });
