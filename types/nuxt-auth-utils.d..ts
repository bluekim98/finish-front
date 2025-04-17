import type { User as BaseUser } from './auth';

declare module '#auth-utils' {
  export interface User extends BaseUser {}

  export interface UserSessionComposable {
    user: ComputedRef<User | null>;
  }
}
