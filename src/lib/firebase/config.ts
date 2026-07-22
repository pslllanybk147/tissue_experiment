export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type FirebaseEnvironment = Partial<Record<
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID",
  string | undefined
>>;

export function readFirebaseConfig(env: FirebaseEnvironment): FirebaseClientConfig | null {
  const values = [
    env.NEXT_PUBLIC_FIREBASE_API_KEY,
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ];

  if (values.some((value) => !value?.trim())) return null;

  return {
    apiKey: values[0]!,
    authDomain: values[1]!,
    projectId: values[2]!,
    storageBucket: values[3]!,
    messagingSenderId: values[4]!,
    appId: values[5]!,
  };
}

export function getPublicFirebaseConfig(): FirebaseClientConfig | null {
  return readFirebaseConfig({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}
