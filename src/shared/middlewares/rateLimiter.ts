import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para endpoints de login
 * Previne ataques de força bruta
 *
 * Configuração:
 * - 5 tentativas por IP a cada 15 minutos
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
});

/**
 * Rate limiter para endpoints de registro
 * Previne spam de criação de contas
 *
 * Configuração:
 * - 3 tentativas por IP a cada hora
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 tentativas
  message: {
    success: false,
    error: 'Too many registration attempts from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
