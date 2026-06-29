'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Nuevos datos del cliente
  const nombres = formData.get('nombres') as string
  const apellidos = formData.get('apellidos') as string
  const dni = formData.get('dni') as string
  const celular = formData.get('celular') as string
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string
  const direccion = formData.get('direccion') as string

  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1 OR dni = $2', [email, dni]);
    if (rows.length > 0) {
      return redirect('/registro?error=' + encodeURIComponent('El correo o DNI ya están registrados'));
    }

    await pool.query(
      `INSERT INTO usuarios (nombres, apellidos, email, password, dni, celular, direccion, rol) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'CLIENTE')`,
      [nombres, apellidos, email, password, dni, celular, direccion]
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return redirect('/registro?error=' + encodeURIComponent('Error de conexión con la base de datos'));
  }

  revalidatePath('/login', 'layout')
  redirect('/login')
}
