export interface Credentials {
  username: string;
  password: string;
}

const defaultPassword = process.env['SAUCE_PASSWORD'] ?? 'secret_sauce';

export const users = {
  standard: {
    username: 'standard_user',
    password: defaultPassword,
  },
  lockedOut: {
    username: 'locked_out_user',
    password: defaultPassword,
  },
  problem: {
    username: 'problem_user',
    password: defaultPassword,
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: defaultPassword,
  },
  error: {
    username: 'error_user',
    password: defaultPassword,
  },
  visual: {
    username: 'visual_user',
    password: defaultPassword,
  },
  invalid: {
    username: 'not_a_real_user',
    password: defaultPassword,
  },
} as const satisfies Record<string, Credentials>;

export const specialCaseUsers = [
  users.problem,
  users.performanceGlitch,
  users.error,
  users.visual,
] as const;

export const loginErrorMessages = {
  lockedOut: 'Sorry, this user has been locked out.',
  invalidCredentials: 'Username and password do not match any user in this service',
  usernameRequired: 'Username is required',
  passwordRequired: 'Password is required',
} as const;
