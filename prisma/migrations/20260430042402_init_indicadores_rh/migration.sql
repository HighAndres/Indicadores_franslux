-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForecastGasto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "real" REAL NOT NULL,
    "presupuesto" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ForecastGasto_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HcColaboradores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "altas" INTEGER NOT NULL,
    "bajas" INTEGER NOT NULL,
    "diasLaborados" INTEGER NOT NULL,
    "generoM" INTEGER NOT NULL,
    "generoF" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HcColaboradores_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComercialComision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "cadena" TEXT NOT NULL,
    "kam" TEXT NOT NULL,
    "tienda" TEXT NOT NULL,
    "real" REAL NOT NULL,
    "presupuesto" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComercialComision_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DataUpload_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DataUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clientId_idx" ON "User"("clientId");

-- CreateIndex
CREATE INDEX "ForecastGasto_clientId_anio_mes_idx" ON "ForecastGasto"("clientId", "anio", "mes");

-- CreateIndex
CREATE INDEX "ForecastGasto_clientId_direccion_idx" ON "ForecastGasto"("clientId", "direccion");

-- CreateIndex
CREATE INDEX "ForecastGasto_clientId_area_idx" ON "ForecastGasto"("clientId", "area");

-- CreateIndex
CREATE INDEX "HcColaboradores_clientId_idx" ON "HcColaboradores"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "HcColaboradores_clientId_anio_mes_key" ON "HcColaboradores"("clientId", "anio", "mes");

-- CreateIndex
CREATE INDEX "ComercialComision_clientId_anio_mes_idx" ON "ComercialComision"("clientId", "anio", "mes");

-- CreateIndex
CREATE INDEX "ComercialComision_clientId_cadena_idx" ON "ComercialComision"("clientId", "cadena");

-- CreateIndex
CREATE INDEX "ComercialComision_clientId_kam_idx" ON "ComercialComision"("clientId", "kam");

-- CreateIndex
CREATE INDEX "ComercialComision_clientId_tienda_idx" ON "ComercialComision"("clientId", "tienda");

-- CreateIndex
CREATE INDEX "DataUpload_clientId_module_anio_mes_idx" ON "DataUpload"("clientId", "module", "anio", "mes");
