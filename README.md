# Calculadora de Cierre de Caja

WebApp de una sola pagina para organizar rapidamente el cierre diario de caja de un negocio. Esta pensada para uso mobile-first, con interfaz oscura, limpia y directa.

## Funcionalidades

- Ingreso principal para cargar los ingresos totales del dia.
- Selector de modo de calculo:
  - `30/70`: separa 30% para Gastos de Consultorio y reparte el 70% restante.
  - `100%`: reparte sobre el total ingresado, sin separar gastos.
- Desglose automatico en tarjetas:
  - Gastos de Consultorio
  - Fondo Neto o Ingreso Total
  - Fima
  - Ahorro General
  - Socio Principal (Bruto)
  - Bolsillo Personal
  - Ahorro Personal
- Formato de moneda local argentina.
- Boton para limpiar el calculo.
- Boton para compartir un resumen en texto plano por WhatsApp, mensajes u otras apps.
- Soporte PWA para instalarla como aplicacion en el celular.

## Como usar

Abrir `index.html` en cualquier navegador moderno.

1. Ingresar el monto total del dia.
2. Elegir el modo de calculo.
3. Presionar `Calcular`.
4. Revisar el desglose o compartir el resumen final.

## Tecnologias

- HTML
- CSS
- Vanilla JavaScript

No requiere instalacion de dependencias ni servidor para funcionar.

## Instalacion como app

Desde la version publicada en HTTPS, por ejemplo Cloudflare Pages:

- En Android/Chrome: abrir el sitio y elegir `Instalar app` o `Agregar a pantalla principal`.
- En iPhone/Safari: abrir el sitio, tocar compartir y elegir `Agregar a inicio`.
