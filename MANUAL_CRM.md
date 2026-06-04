# Manual de Capacitación: Sistema de Facturación y CRM izinvoice

Bienvenido al manual de uso operativo de **izinvoice**. Este documento está diseñado para capacitar a tu equipo en los flujos principales de facturación electrónica, gestión de clientes y manejo de comprobantes (emisiones, bajas y notas).

---

## 1. Conceptos Básicos

**izinvoice** no es solo un facturador, es un mini-CRM que te permite llevar el control de tus ventas, clientes y catálogo de productos/servicios de forma centralizada y conectada con la SUNAT (vía OSE/PSE).

### ¿Qué se puede emitir?
- **Boletas de Venta:** Para consumidores finales (con DNI o sin documento si es menor a S/ 700).
- **Facturas:** Para empresas o personas con negocio (obligatorio usar RUC).
- **Notas de Crédito:** Para anular, descontar o corregir comprobantes emitidos previamente.
- **Notas de Débito:** Para aumentar el valor de un comprobante emitido (ej. por intereses o moras).
- **Cotizaciones / Proformas:** Documentos internos comerciales sin valor tributario.
- **Guías de Remisión:** Para sustentar el traslado de bienes.

---

## 2. Creación de Comprobantes (Facturas y Boletas)

El proceso de emisión está diseñado para completarse en "3 clics" gracias a la conexión con RENIEC y SUNAT.

### Pasos para Emitir:
1. **Ingresar al módulo de "Nuevo Comprobante":** Desde el menú lateral del Dashboard.
2. **Seleccionar el Tipo de Documento:** Elige si será Factura o Boleta.
3. **Buscar o Crear al Cliente:**
   - Digita el DNI o RUC.
   - El sistema autocompletará el Nombre/Razón Social y Dirección automáticamente.
4. **Agregar los Productos o Servicios:**
   - Puedes buscarlos desde tu catálogo pre-guardado o escribirlos manualmente.
   - Ajusta las cantidades y verifica que el IGV (si aplica) esté calculado correctamente.
5. **Condición de Pago:** Indica si es al Contado o al Crédito (y define las cuotas).
6. **Emitir:** Al hacer clic en "Generar", el comprobante viajará a la SUNAT y en segundos obtendrás el XML y el CDR (Constancia de Recepción) aprobados. El PDF estará listo para imprimir (Ticketera/A4) o enviar por WhatsApp.

---

## 3. Gestión de Comprobantes: Bajas vs. Notas de Crédito

Es muy común cometer errores de digitación o que el cliente devuelva un producto. Para la SUNAT, hay reglas estrictas sobre cómo anular documentos.

### A. Dar de Baja (Comunicación de Baja)
La "Baja" elimina por completo el documento de los registros de la SUNAT, como si nunca hubiera existido.

**¿Cuándo usar la Baja?**
- **SÓLO** se puede dar de baja un comprobante si te das cuenta del error en los **primeros 7 días calendario** desde su emisión.
- Usualmente se aplica cuando el error es inminente (ej. te equivocaste de RUC, te equivocaste de monto e inmediatamente el cliente se da cuenta antes de llevarse el producto).

**Proceso en izinvoice:**
1. Ve al "Listado de Comprobantes".
2. Localiza el comprobante emitido (que esté dentro de los 7 días).
3. Selecciona "Opciones" > "Dar de Baja".
4. Ingresa el motivo (Ej. "Error de digitación en RUC").

> [!WARNING]
> Importante: Pasados los 7 días, el botón de "Dar de Baja" se deshabilitará por normas de SUNAT. A partir de ese momento, la única forma de anularlo es usando una **Nota de Crédito**.

### B. Notas de Crédito
Una Nota de Crédito es un comprobante que "resta" o "anula" el valor de una Factura o Boleta emitida anteriormente.

**¿Cuándo usar una Nota de Crédito?**
- Cuando ya pasaron más de 7 días de la emisión y no puedes "Dar de Baja".
- Cuando el cliente devuelve la mercadería (devolución total o parcial).
- Cuando necesitas aplicar un descuento posterior a la emisión.
- Cuando hay un error en la descripción o en el RUC y necesitas anular la factura original para emitir una nueva.

**Proceso en izinvoice:**
1. Ve al "Listado de Comprobantes".
2. Ubica la Factura o Boleta a afectar.
3. Selecciona "Opciones" > "Emitir Nota de Crédito".
4. El sistema cargará todos los datos automáticamente.
5. Selecciona el Tipo de Nota de Crédito (ej. "Anulación de la operación" o "Devolución por ítem").
6. Clic en "Generar".

### C. Notas de Débito
Contrario a la nota de crédito, la Nota de Débito **suma** valor a una factura ya emitida.

**¿Cuándo usarla?**
- Para cobrar penalidades por pagos atrasados (Mora).
- Gastos de cobranza o fletes que no se cobraron en la factura original.
- Errores de facturación donde se cobró "de menos".

---

## 4. Cotizaciones y Flujo Comercial

Tu equipo de ventas no tiene que facturar directamente. Pueden usar el módulo de Cotizaciones para armar presupuestos.

1. **Crear Cotización:** Arma el documento con los productos, precios y datos del cliente.
2. **Envío al cliente:** Envíala en PDF por WhatsApp.
3. **Conversión en 1 Clic:** Si el cliente acepta la cotización, no necesitas volver a tipear nada. Abre la cotización en el sistema y dale clic a **"Convertir a Factura"** o **"Convertir a Boleta"**. Toda la información se migrará automáticamente a la pantalla de emisión.

---

## 5. Resúmenes Diarios y Contingencias

- **Boletas Electrónicas:** A diferencia de las facturas que viajan una por una a la SUNAT, las boletas se suelen enviar en un "Resumen Diario". Izinvoice se encarga de empaquetar todas las boletas del día y enviarlas a SUNAT en un solo lote de forma automática al final del día.
- **Sin Internet (Contingencia):** Si se cae tu internet, izinvoice te permite seguir guardando comprobantes. Al recuperar la conexión, el sistema sincronizará los documentos pendientes.

---

*Este documento es una guía base. El equipo de izinvoice actualiza la plataforma constantemente para adaptarse a los últimos requerimientos técnicos y legales de SUNAT.*
