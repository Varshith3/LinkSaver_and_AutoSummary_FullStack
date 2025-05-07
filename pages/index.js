import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from './Client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/signup');
      }
    };

    checkUser();
  }, []);

  return null;
}
