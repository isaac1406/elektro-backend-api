/*
  Warnings:

  - You are about to drop the column `dataAtualizacao` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `dataCadastro` on the `Produto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "dataAtualizacao",
DROP COLUMN "dataCadastro",
ADD COLUMN     "dataPublicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
