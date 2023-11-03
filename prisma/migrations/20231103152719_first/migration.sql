-- CreateTable
CREATE TABLE `User` (
    `googleId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `picture` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `User_googleId_key`(`googleId`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Collaborator` (
    `id` VARCHAR(191) NOT NULL,
    `userGoogleId` VARCHAR(191) NULL,
    `contentId` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NOT NULL,

    INDEX `Collaborator_contentId_fkey`(`contentId`),
    INDEX `Collaborator_roleId_fkey`(`roleId`),
    INDEX `Collaborator_userGoogleId_fkey`(`userGoogleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Content` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `userGoogleId` VARCHAR(191) NULL,
    `contentTypeId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Borrador',
    `likeCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `Content_contentTypeId_fkey`(`contentTypeId`),
    INDEX `Content_userGoogleId_fkey`(`userGoogleId`),
    FULLTEXT INDEX `Content_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,

    INDEX `ContentType_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `contentId` VARCHAR(191) NULL,

    INDEX `Role_contentId_fkey`(`contentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permissions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermissions` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `permissionsId` VARCHAR(191) NOT NULL,

    INDEX `RolePermissions_permissionsId_fkey`(`permissionsId`),
    INDEX `RolePermissions_roleId_fkey`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Collaborator` ADD CONSTRAINT `Collaborator_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collaborator` ADD CONSTRAINT `Collaborator_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collaborator` ADD CONSTRAINT `Collaborator_userGoogleId_fkey` FOREIGN KEY (`userGoogleId`) REFERENCES `User`(`googleId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_contentTypeId_fkey` FOREIGN KEY (`contentTypeId`) REFERENCES `ContentType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_userGoogleId_fkey` FOREIGN KEY (`userGoogleId`) REFERENCES `User`(`googleId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentType` ADD CONSTRAINT `ContentType_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_permissionsId_fkey` FOREIGN KEY (`permissionsId`) REFERENCES `Permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
