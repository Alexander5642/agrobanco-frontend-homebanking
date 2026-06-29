import { getUser } from '@/lib/localAuth'
import pool from '@/lib/db'
import CreditForm from './CreditForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function CreditosPage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/login')
  }

  const { rows } = await pool.query(
    'SELECT * FROM creditos WHERE user_id = $1 ORDER BY creado_en DESC',
    [user.id]
  );
  
  // Format dates to strings for Next.js boundary
  const creditos = rows.map(c => ({
    ...c,
    creado_en: c.creado_en ? new Date(c.creado_en).toISOString() : new Date().toISOString(),
    monto: Number(c.monto)
  }));

  return <CreditForm creditos={creditos} />
}
