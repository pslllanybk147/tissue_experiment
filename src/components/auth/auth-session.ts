export type LabUser = { uid: string; displayName: string | null; email: string | null; photoURL: string | null };

export type AuthSession =
  | { status: "loading" | "signed-out" | "unconfigured"; user: null }
  | { status: "authenticated" | "demo"; user: LabUser };

export type AuthSessionAction =
  | { type: "SIGNED_OUT" }
  | { type: "UNCONFIGURED" }
  | { type: "DEMO" }
  | { type: "AUTHENTICATED"; user: LabUser };

export const initialAuthSession: AuthSession = { status: "loading", user: null };

export function authSessionReducer(_state: AuthSession, action: AuthSessionAction): AuthSession {
  switch (action.type) {
    case "SIGNED_OUT": return { status: "signed-out", user: null };
    case "UNCONFIGURED": return { status: "unconfigured", user: null };
    case "DEMO": return { status: "demo", user: { uid: "demo-owner", displayName: "Ohm", email: null, photoURL: null } };
    case "AUTHENTICATED": return { status: "authenticated", user: action.user };
  }
}
