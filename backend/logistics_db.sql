-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 21, 2025 at 05:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `logistics_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `pickup_address` varchar(255) NOT NULL,
  `drop_address` varchar(255) NOT NULL,
  `scheduled_time` datetime NOT NULL,
  `vehicle_type` varchar(100) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `selected_offer_id` bigint(20) DEFAULT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `pickup_address`, `drop_address`, `scheduled_time`, `vehicle_type`, `status`, `selected_offer_id`, `otp`, `otp_expires_at`, `created_at`, `updated_at`) VALUES
(13, 33, 'Dhaka', 'Shylet', '2025-08-21 15:30:00', 'truck', 'completed', 16, '940639', '2025-08-20 12:51:23', '2025-08-20 04:23:43', '2025-08-20 06:43:00'),
(14, 33, 'Dhaka', 'Agargaog', '2025-08-22 16:43:00', 'truck', 'pending', 17, '435583', '2025-08-21 09:51:13', '2025-08-20 06:44:06', '2025-08-21 03:41:13'),
(15, 33, 'narayanganj', 'palton', '2025-08-29 16:30:00', 'truck', 'pending', NULL, NULL, NULL, '2025-08-20 07:28:16', '2025-08-20 07:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `booking_offers`
--

CREATE TABLE `booking_offers` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `driver_id` bigint(20) NOT NULL,
  `offered_price` decimal(10,2) NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','accepted','declined') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_offers`
--

INSERT INTO `booking_offers` (`id`, `booking_id`, `driver_id`, `offered_price`, `message`, `status`, `created_at`) VALUES
(16, 13, 42, 10000.00, 'i am very fast driver.', 'pending', '2025-08-20 04:24:15'),
(17, 14, 42, 1500.00, 'hi', 'pending', '2025-08-20 06:44:40'),
(18, 15, 42, 500.00, 'hello', 'pending', '2025-08-20 07:28:37');

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `replied_id` int(11) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `replied_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact`
--

INSERT INTO `contact` (`id`, `name`, `email`, `subject`, `message`, `replied_id`, `is_read`, `replied_at`, `created_at`) VALUES
(3, 'third test', 'riponhossainmd744@gmail.com', 'third test', 'hi', 8, 0, '2025-08-10 10:59:04', '2025-08-09 10:19:14'),
(6, 'who', 'riponhossainmd744@gmail.com', 'Subject: Hi\\nBCC: mdhafizurrahmansifat@gmail.com', 'test', 8, 0, '2025-08-10 10:59:48', '2025-08-09 10:42:09'),
(7, 'Osthir Ripon', 'riponhossainmd744@gmail.com', 're', 'hi', 0, 0, NULL, '2025-08-21 09:07:31');

-- --------------------------------------------------------

--
-- Table structure for table `driver_applications`
--

CREATE TABLE `driver_applications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `vehicle_type` varchar(100) NOT NULL,
  `experience_years` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` enum('push','email','sms') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 33, 'push', 'hello', 'new notification test (first test)', 0, '2025-08-07 12:14:21'),
(2, 33, 'push', 'second test', 'testing', 0, '2025-08-07 12:43:51'),
(3, 33, 'push', 'why', 'f', 0, '2025-08-10 11:48:37'),
(4, 33, 'email', 'কমিউনিস্ট আন্দোলন: ম্যামথের কথা যেভাবে মিথ হয়ে গেছে', 'fdsd', 0, '2025-08-10 11:49:40'),
(5, 33, 'email', 'email test ', 'fds sdf sdf', 0, '2025-08-10 12:06:42'),
(6, 33, 'email', 'email test 2', 'fds ', 0, '2025-08-10 12:09:19'),
(7, 33, 'push', 'push notification test ', 'some lorem testj lf', 1, '2025-08-10 12:10:18'),
(8, 33, 'push', 'tesing', 'io[jioijfw', 1, '2025-08-20 11:24:16');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `status` enum('pending','paid','failed') DEFAULT 'pending',
  `transaction_id` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `amount`, `method`, `status`, `transaction_id`, `paid_at`, `created_at`) VALUES
(13, 13, 11000.00, 'bkash', 'paid', 'TX12345678', '2025-08-20 04:56:41', '2025-08-20 10:56:41'),
(14, 14, 1650.00, 'bkash', 'paid', '01773448153', '2025-08-20 06:51:52', '2025-08-20 12:51:52');

-- --------------------------------------------------------

--
-- Table structure for table `remember_tokens`
--

CREATE TABLE `remember_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `remember_tokens`
--

INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `user_agent`, `ip_address`, `expires_at`, `created_at`) VALUES
(52, 42, '267e2428ef4ee99b1ed5928a1525a53b282c99eaf5ee25a24ade149bea09f573', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '127.0.0.1', '2025-09-09 12:50:19', '2025-08-10 12:50:19'),
(55, 8, '360d5a75a936a2975e75af1df39a14c140a9399bebbc5175b030f9de3c25d19b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '127.0.0.1', '2025-09-17 10:39:59', '2025-08-18 10:39:59'),
(58, 42, '12467a64df05927e0c72066ee7bac7fc7ec822beaff2ada68212c4778f7847df', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '::1', '2025-09-17 11:43:04', '2025-08-18 11:43:04'),
(64, 33, 'ca3020909523ddd4421ee3684d1d214fa64b215d6f82f2f082e94a2dd5fcebfe', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '::1', '2025-09-20 09:41:42', '2025-08-21 09:41:42'),
(65, 33, '1520d0c1e0692e45c81ef0da21dc37a2ec91d6ee850b59383b459535a3a94841', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '127.0.0.1', '2025-09-20 09:52:50', '2025-08-21 09:52:50');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','in_progress','closed') DEFAULT 'open',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `assigned_to` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `subject`, `description`, `status`, `priority`, `assigned_to`, `created_at`, `updated_at`) VALUES
(2, 33, 'second test', 'this is actuly third teest', 'closed', 'medium', NULL, '2025-08-03 10:22:15', '2025-08-09 10:23:13'),
(3, 42, 'driver ticket', 'second test', 'open', 'medium', NULL, '2025-08-03 10:24:40', '2025-08-07 10:10:39'),
(4, 33, 'another test for ticket', 'no issue', 'open', 'high', NULL, '2025-08-10 12:25:50', '2025-08-10 12:25:50');

-- --------------------------------------------------------

--
-- Table structure for table `support_ticket_messages`
--

CREATE TABLE `support_ticket_messages` (
  `id` bigint(20) NOT NULL,
  `ticket_id` bigint(20) NOT NULL,
  `sender_id` bigint(20) NOT NULL,
  `sender_role` enum('user','admin') NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_ticket_messages`
--

INSERT INTO `support_ticket_messages` (`id`, `ticket_id`, `sender_id`, `sender_role`, `message`, `created_at`) VALUES
(1, 3, 8, 'admin', 'hi', '2025-08-07 10:14:14'),
(2, 2, 8, 'admin', 'hi', '2025-08-07 10:14:23'),
(3, 2, 33, 'user', 'what is problem', '2025-08-07 10:14:39'),
(4, 2, 8, 'admin', 'ok', '2025-08-07 10:14:51'),
(5, 2, 8, 'admin', 'test', '2025-08-07 12:07:48'),
(6, 2, 33, 'user', 'test again :)', '2025-08-07 12:08:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` datetime DEFAULT NULL,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','driver','admin','operator') NOT NULL DEFAULT 'user',
  `status` enum('active','inactive','banned','unverified') DEFAULT 'unverified',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified`, `email_verified_at`, `email_verification_token`, `email_verification_expires`, `phone`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(8, 'Admin', 'admin', 'admin@gmail.com', 1, NULL, '6f927d2209285dd5dc880d295500d1b5ae9faa5daed375e2d0025c9e0068cf36', NULL, '0158949404', '$2y$10$26kgLRlaBGGl3lKWTuo7CecSOlEf70B4dQjcfT5TBzdY1K8MaN4mG', 'admin', 'active', '2025-07-22 10:40:34', '2025-08-21 09:17:31'),
(33, 'Muhammad', 'user', 'user@gmail.com', 1, NULL, '621946', '2025-07-29 10:17:33', '01773448153', '$2y$10$Fo97/sMoGMAPxnWMB.vQDuttuMOLfHur.jiJxSxJCeXGk6w/xkmRa', 'user', 'active', '2025-07-29 10:12:33', '2025-08-21 09:17:31'),
(42, 'Driver', 'driver', 'driver@gmail.com', 0, '2025-07-30 09:50:41', '584762', '2025-07-30 10:47:28', '0145896', '$2y$10$350Ck./amItnRRVMrYydWu86A1/jmxlIL22CFhzZlLAKsXqDrb2gi', 'driver', 'active', '2025-07-30 09:47:28', '2025-08-21 09:17:31');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `capacity_kg` int(11) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `submit_id` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `user_id`, `type`, `license_plate`, `capacity_kg`, `photo_url`, `status`, `submit_id`, `created_at`, `updated_at`) VALUES
(4, 42, 'truck', 'newlicenseplate', 500, NULL, 'pending', 'GmFUoQa', '2025-08-06 12:42:12', '2025-08-06 12:42:12');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_documents`
--

CREATE TABLE `vehicle_documents` (
  `id` bigint(20) NOT NULL,
  `driver_id` bigint(20) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `submit_id` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_documents`
--

INSERT INTO `vehicle_documents` (`id`, `driver_id`, `document_type`, `file_path`, `submit_id`, `created_at`) VALUES
(14, 42, 'truck', 'uploads/documents/doc_6892f944a81b80.98136061.pdf', 'GmFUoQa', '2025-08-06 12:42:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_offers`
--
ALTER TABLE `booking_offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `driver_applications`
--
ALTER TABLE `driver_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `support_ticket_messages`
--
ALTER TABLE `support_ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `phone_2` (`phone`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_plate` (`license_plate`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `vehicle_documents`
--
ALTER TABLE `vehicle_documents`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `booking_offers`
--
ALTER TABLE `booking_offers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `contact`
--
ALTER TABLE `contact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `driver_applications`
--
ALTER TABLE `driver_applications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `support_ticket_messages`
--
ALTER TABLE `support_ticket_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `vehicle_documents`
--
ALTER TABLE `vehicle_documents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking_offers`
--
ALTER TABLE `booking_offers`
  ADD CONSTRAINT `booking_offers_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_offers_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_applications`
--
ALTER TABLE `driver_applications`
  ADD CONSTRAINT `driver_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `support_tickets_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `support_ticket_messages`
--
ALTER TABLE `support_ticket_messages`
  ADD CONSTRAINT `support_ticket_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
