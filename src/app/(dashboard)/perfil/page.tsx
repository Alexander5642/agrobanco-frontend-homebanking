import { getUser } from '@/lib/localAuth'
import pool from '@/lib/db'
import ProfileForm from './ProfileForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch full user data from DB including celular and direccion
  let fullUser: any = user;
  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [user.id]);
    if (rows.length > 0) {
      fullUser = rows[0];
    }
  } catch(e) {
    console.error("Error fetching full user:", e);
  }

  let cliente = { nombres: fullUser.nombres, apellidos: fullUser.apellidos, dni: fullUser.dni, celular: fullUser.celular || '', direccion: fullUser.direccion || '' }
  
  let tarjeta: any = null;
  try {
    const { rows } = await pool.query('SELECT * FROM tarjetas WHERE user_id = $1', [user.id]);
    if (rows.length > 0) {
      tarjeta = rows[0];
    }
  } catch(e) {
    console.error("Error fetching tarjeta:", e);
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-500">Configuración de tu cuenta e información personal</p>
      </div>
      <ProfileForm cliente={cliente} tarjeta={tarjeta} />
    </div>
  )
}
