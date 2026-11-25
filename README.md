# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# raktrekha_v2

## Supabase setup

The app now uses Supabase Auth, Postgres, and Realtime.

1. Copy `.env.example` to `.env`.
2. In the Supabase dashboard for project `potofgsfblddowjddant`, open **Connect** and copy the project publishable key into `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The project URL is already shown in the example file.
3. Install dependencies and start Expo:

   ```bash
   npm install
   npx expo start
   ```

4. For the first registration test, verify that Supabase email confirmation is enabled. If it is, complete the email verification link before signing in. The app creates the profile and private contact row from signup metadata.

Never put a Supabase service-role/secret key in the Expo app. Only the publishable key belongs in `EXPO_PUBLIC_*` variables.

Database migrations are in `supabase/migrations`. The `profiles` table stores public profile fields, `profile_contacts` stores private phone details, `blood_requests` stores requests, and `user_settings` stores per-user privacy preferences.
