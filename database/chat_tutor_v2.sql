-- FisioMathBot Chat Tutor v2: reportes de soporte (PQR) creados por el agente
-- Ejecutar DESPUÉS de chat_tutor.sql. Tipos INT UNSIGNED para coincidir con database/schema.sql.

CREATE TABLE IF NOT EXISTS chat_support_tickets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  subject VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('abierto','cancelado','cerrado') NOT NULL DEFAULT 'abierto',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_ticket_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat_ticket_user (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
