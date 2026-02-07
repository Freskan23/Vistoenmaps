CREATE TABLE `businesses` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`slug` text NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`direccion` text,
	`telefono` text,
	`email` text,
	`web` text,
	`categoria_slug` text NOT NULL,
	`ciudad_slug` text NOT NULL,
	`barrio_slug` text NOT NULL,
	`lat` text,
	`lng` text,
	`valoracion_media` integer,
	`num_resenas` integer,
	`servicios_destacados` text,
	`url_google_maps` text,
	`horario` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `businesses_slug_unique` ON `businesses` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'business',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);