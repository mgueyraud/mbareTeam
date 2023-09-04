-- CreateTable
CREATE TABLE `Permissions` (
    `id_Permission` VARCHAR(191) NOT NULL,
    `name_Permission` VARCHAR(191) NOT NULL,
    `type_Permission` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_Permission`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
