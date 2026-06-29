'use server'

import { getUser } from '@/lib/localAuth'
import { revalidatePath } from 'next/cache'
import pool from '@/lib/db'

export async function solicitarCredito(formData: FormData) {
  const { user, token } = await getUser()

  if (!user || !token) throw new Error("No autenticado")

  const monto = parseFloat(formData.get('monto') as string)
  const meses = parseInt(formData.get('meses') as string)
  
  if (isNaN(monto) || monto < 1000) throw new Error("El monto mínimo es S/ 1,000")
  if (isNaN(meses) || meses < 1) throw new Error("Plazo inválido")
  
  try {
    await pool.query(
      'INSERT INTO creditos (user_id, monto, meses, tea, estado) VALUES ($1, $2, $3, $4, $5)',
      [user.id, monto, meses, 43.92, 'PRE_SOLICITUD']
    );
  } catch (error: any) {
    console.error("DB Insert error:", error);
    throw new Error("Error al solicitar crédito en la base de datos");
  }

  revalidatePath('/', 'layout')
}
