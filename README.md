# Calculadora de Cierre de Caja

WebApp de una sola pagina para organizar rapidamente el cierre diario de caja de un negocio. Esta pensada para uso mobile-first, con interfaz oscura, limpia y directa.

## Funcionalidades

- Selector de quien carga el calculo: `Fefa`, `Leo` u `Otro` (con campo para escribir el nombre). Cada dispositivo recuerda la ultima eleccion.
- Titulo opcional para identificar el cierre.
- Ingreso principal para cargar los ingresos totales del dia.
- Selector de modo de calculo:
  - `60/40`: separa 60% para Reposicion (ropa) y reparte el 40% restante.
  - `75/25`: separa 25% para Gastos de Consultorio y reparte el 75% restante.
  - `100%`: reparte sobre el total ingresado, sin separar gastos (sueldo).
- Reparto del fondo neto:
  - Fima: 50%
  - Ahorro General: 20%
  - Ahorro Viajes: 10%
  - Saldo Personal: 20%, dividido en Bolsillo Personal (70%) y Ahorro Personal (30%)
- Desglose automatico en tarjetas:
  - Gastos de Consultorio o Reposicion (se oculta en modo 100%)
  - Fondo Neto o Ingreso Total
  - Fima
  - Ahorro General
  - Ahorro Viajes
  - Saldo Personal
  - Bolsillo Personal
  - Ahorro Personal
- Formato de moneda local argentina.
- Boton para limpiar el calculo.
- Boton para compartir un resumen en texto plano por WhatsApp, mensajes u otras apps, que incluye quien cargo el calculo.
- Soporte PWA para instalarla como aplicacion en el celular.

## Como usar

Abrir `index.html` en cualquier navegador moderno.

1. Elegir quien carga el calculo.
2. Ingresar el monto total del dia (y un titulo, si se quiere).
3. Elegir el modo de calculo.
4. Presionar `Calcular`.
5. Revisar el desglose o compartir el resumen final.

## Tecnologias

- HTML
- CSS
- Vanilla JavaScript

No requiere instalacion de dependencias ni servidor para funcionar.

## Instalacion como app

Desde la version publicada en HTTPS, por ejemplo Cloudflare Pages:

- En Android/Chrome: abrir el sitio y elegir `Instalar app` o `Agregar a pantalla principal`.
- En iPhone/Safari: abrir el sitio, tocar compartir y elegir `Agregar a inicio`.
