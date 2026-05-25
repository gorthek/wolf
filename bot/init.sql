-- Initialisation de la base de données vocal_tracker
-- À importer avec : mysql -u root -p vocal_tracker < init.sql

CREATE TABLE IF NOT EXISTS `voice_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(20) NOT NULL,
  `user_tag` VARCHAR(100) NOT NULL,
  `guild_id` VARCHAR(20) NOT NULL,
  `join_time` DATETIME NOT NULL,
  `leave_time` DATETIME DEFAULT NULL,
  `duration_seconds` INT DEFAULT 0,
  INDEX idx_user_guild (`user_id`, `guild_id`),
  INDEX idx_join_time (`join_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `voice_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(20) NOT NULL,
  `user_tag` VARCHAR(100) NOT NULL,
  `guild_id` VARCHAR(20) NOT NULL,
  `weekly_seconds` INT DEFAULT 0,
  `alltime_seconds` INT DEFAULT 0,
  `sessions_weekly` INT DEFAULT 0,
  `sessions_alltime` INT DEFAULT 0,
  `last_session_date` DATETIME DEFAULT NULL,
  `last_session_duration` INT DEFAULT 0,
  `ignored` TINYINT(1) DEFAULT 0,
  UNIQUE KEY unique_user_guild (`user_id`, `guild_id`),
  INDEX idx_weekly (`weekly_seconds` DESC),
  INDEX idx_alltime (`alltime_seconds` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `weekly_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `guild_id` VARCHAR(20) NOT NULL,
  `report_date` DATETIME NOT NULL,
  `top1_user_id` VARCHAR(20) DEFAULT NULL,
  `top1_seconds` INT DEFAULT 0,
  `total_members_active` INT DEFAULT 0,
  `total_seconds_week` INT DEFAULT 0,
  INDEX idx_guild_date (`guild_id`, `report_date` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
