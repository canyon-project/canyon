import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/one">one</Link>
      <Link href="/two">two</Link>
    </div>
  );
}
