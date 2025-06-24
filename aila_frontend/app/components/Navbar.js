'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm px-4 py-2 flex justify-between">
      <Link href="/" className="font-bold text-xl text-blue-600">AILA</Link>
      <div>
        <Link href="/login" className="text-blue-600 px-2">Login</Link>
      </div>
    </nav>
  );
}
