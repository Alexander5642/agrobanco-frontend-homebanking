'use server'

import { getUser } from '@/lib/localAuth'
import { readDB, writeDB } from '@/data/db'
import { revalidatePath } from 'next/cache'

export async function solicitarCredito(formData: FormData) {
  const { user } = await getUser()

  if (!user) throw new Error("No autenticado")

  const monto = parseFloat(formData.get('monto') as string)
  const meses = parseInt(formData.get('meses') as string)
  
  if (isNaN(monto) || monto < 1000) throw new Error("El monto mínimo es S/ 1,000")
  if (isNaN(meses) || meses < 1) throw new Error("Plazo inválido")

  const tea = 43.92
  const tem = Math.pow(1 + (tea / 100), 1 / 12) - 1
  const cuota = monto * ((tem * Math.pow(1 + tem, meses)) / (Math.pow(1 + tem, meses) - 1))
  const total = cuota * meses
  const intereses = total - monto

  const db = readDB()
  
  db.creditos.push({
    id: `cred-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: user.id,
    monto,
    meses,
    tea,
    cuota_mes: cuota,
    intereses,
    total,
    estado: 'ENVIADO',
    creado_en: new Date().toISOString()
  })

  writeDB(db)

  revalidatePath('/', 'layout')
}
