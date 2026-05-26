CREATE TABLE `issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`reportedByUserId` int NOT NULL,
	`assignedToManagerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `issues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `karting_setups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`setup` text NOT NULL,
	`trackName` varchar(255) NOT NULL,
	`kartNumber` varchar(50),
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `karting_setups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `setup_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setupId` int NOT NULL,
	`ownerId` int NOT NULL,
	`sharedWithUserId` int NOT NULL,
	`permission` enum('view') NOT NULL DEFAULT 'view',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `setup_shares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);