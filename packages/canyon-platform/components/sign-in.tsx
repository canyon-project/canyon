"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div>
      <button onClick={() => signIn("gitlab")}>gitlab</button>;
      <button onClick={() => signIn("github")}>github</button>;
    </div>
  );
}
