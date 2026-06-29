import ResumenClient from './ResumenClient'
import { getUser } from '@/lib/localAuth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.rol === 'ADMIN') {
    redirect('/admin')
  }

  let cuenta: any = { numero_cuenta: '---', saldo: 0, trea: 3.50, id: null };
  let movimientos: any[] = [];
  let creditos: any[] = [];
  
  try {
    const cuentaRes = await pool.query('SELECT * FROM cuentas WHERE user_id = $1', [user.id]);
    if (cuentaRes.rows.length > 0) {
      cuenta = cuentaRes.rows[0];
      
      const movRes = await pool.query('SELECT * FROM movimientos WHERE cuenta_id = $1 ORDER BY creado_en DESC', [cuenta.id]);
      movimientos = movRes.rows;
    }
    
    const credRes = await pool.query('SELECT * FROM creditos WHERE user_id = $1', [user.id]);
    creditos = credRes.rows;
  } catch (error) {
    console.error("Error fetching data from DB:", error);
  }

  return <ResumenClient user={user} cuenta={cuenta} movimientosTotales={movimientos} creditos={creditos} />
}
