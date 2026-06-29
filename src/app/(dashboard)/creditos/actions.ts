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
    const tea = 43.92;
    const tem = Math.pow(1 + (tea / 100), 1 / 12) - 1;
    const cuota = monto * ((tem * Math.pow(1 + tem, meses)) / (Math.pow(1 + tem, meses) - 1));
    const total = cuota * meses;
    const intereses = total - monto;
    
    // Check if crypto is available (Node.js)
    const crypto = require('crypto');
    const id = "CRD-" + crypto.randomBytes(4).toString('hex').toUpperCase();

    await pool.query(
      'INSERT INTO creditos (id, user_id, monto, meses, tea, cuota_mes, intereses, total, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, user.id, monto, meses, tea, cuota, intereses, total, 'PENDIENTE']
    );
  } catch (error: any) {
    console.error("DB Insert error:", error);
    throw new Error("Error al solicitar crédito en la base de datos");
  }

  revalidatePath('/', 'layout')
}
