import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/signup'); // Redirect to the Signup page
  }, []);

  return null; // Render nothing while redirecting
}