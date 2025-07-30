/*
  Warnings:

  - You are about to drop the column `dataAtualizacao` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "dataAtualizacao";

-- CreateIndex
CREATE INDEX "Produto_vendedorId_idx" ON "Produto"("vendedorId");
