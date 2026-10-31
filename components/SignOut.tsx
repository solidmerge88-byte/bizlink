'use client'
import {createClient} from '@/lib/supabase/client';import {useRouter} from 'next/navigation'
export default function SignOut(){const router=useRouter();return <button className="btn alt" onClick={async()=>{await createClient().auth.signOut();router.push('/');router.refresh()}}>Sign out</button>}
