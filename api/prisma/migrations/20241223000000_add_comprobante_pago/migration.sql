-- CreateTable
CREATE TABLE "ComprobantePago" (
    "id" SERIAL NOT NULL,
    "pagoId" INTEGER NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComprobantePago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComprobantePago"
ADD CONSTRAINT "ComprobantePago_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

