import LogoutButton from "~/auth/logout-button";
import type { Route } from "./+types/home";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "~/auth/login-button";
import Profile from "~/auth/profile";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Welcome to Bingo Together</h1>
        <LoginButton />
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome back!</h1>
      <Profile />
      <LogoutButton />
    </div>
  );
}
