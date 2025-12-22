// lib/utils.ts
import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Genera un código único para rifas/folios
 */
export function generateUniqueCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RIFA-${timestamp}${random}`;
}

/**
 * Genera un token aleatorio (ej. para links seguros)
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash SHA-256 de un archivo/buffer (ej. comprobantes)
 */
export function hashFile(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Formatea moneda MXN
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

/**
 * Formatea fecha para MX
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Calcula el tiempo restante a partir de un ISO string/fecha string
 */
export function calculateTimeRemaining(targetDate: string) {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (Number.isNaN(target)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    expired: false,
  };
}

/**
 * Validación básica de folio
 */
export function validateFolio(folio: string): boolean {
  return folio.length >= 5 && folio.length <= 50;
}

export function validateAmount(amount: number, expected: number): boolean {
  return amount >= expected;
}

/**
 * Limpia reservaciones vencidas (server-side).
 * IMPORTANTE: Esta función debe ejecutarse solo en el servidor.
 */
export async function cleanExpiredReservations() {
  const now = new Date();

  await prisma.ticket.updateMany({
    where: {
      estado: "reserved_pending_payment",
      reserved_until: {
        lt: now,
      },
    },
    data: {
      estado: "available",
      user_id: null,
      purchase_id: null,
      reserved_until: null,
    },
  });
}

export function getTicketColor(status: string): string {
  switch (status) {
    case "available":
      return "bg-green-500 hover:bg-green-600";
    case "reserved_pending_payment":
      return "bg-gray-400 cursor-not-allowed";
    case "pending_review":
      return "bg-yellow-500 cursor-not-allowed";
    case "sold":
    case "sold_physical":
      return "bg-red-500 cursor-not-allowed";
    case "cancelled":
      return "bg-gray-300 cursor-not-allowed";
    default:
      return "bg-gray-500";
  }
}

export function getTicketStatusText(status: string): string {
  switch (status) {
    case "available":
      return "Disponible";
    case "reserved_pending_payment":
      return "Reservado";
    case "pending_review":
      return "Pendiente de validación";
    case "sold":
      return "Vendido (Transferencia)";
    case "sold_physical":
      return "Vendido (Físico)";
    case "cancelled":
      return "Cancelado";
    default:
      return "Desconocido";
  }
}
