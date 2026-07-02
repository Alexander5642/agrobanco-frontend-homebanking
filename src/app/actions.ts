'use server'

import pool from '@/lib/db';

export async function saveContacto(contactForm: { nombre: string; telefono: string; email: string; mensaje: string }) {
  try {
    const contactoId = `cont-${Date.now()}`;
    
    await pool.query(
      `INSERT INTO solicitudes_publicas (id, tipo, nombres, documento, telefono, email, mensaje, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [contactoId, 'CONTACTO', contactForm.nombre, '---', contactForm.telefono, contactForm.email, contactForm.mensaje, 'PENDIENTE']
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving contacto:", error);
    return { success: false };
  }
}
