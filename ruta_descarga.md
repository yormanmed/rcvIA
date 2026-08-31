## Vista independiente descargar reporte
- Se hara una vista con una ruta independiente /descarga-reporte/{cd_area}/{nu_poliza}
- Esta vista recibirá dos parametros por el uri {cd_area} y {nu_poliza}
- Al ingresa a la vista ../descarga-reporte/{cd_area}/{nu_poliza} se ejecutará un proceso de descarga de reporte pdf, La misma consumirá el endpoint:
    Url:URL_API+'/descargarArchivo.SIP'
    method: post
    payload:
        {
            parametrosReporte: {
            CD_AREA:   {cd_area},
            NU_POLIZA: {nu_poliza},
            },
            parametrosProceso: null,
            codigoProceso:     2,
        }
    El Response sera un blob, este blob debes convertirlo a pdf y debes mostrar en una ventana aparte

## Vista independiente descargar reporte
- Vamos revisar la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\DescargaReporte\DescargarReporte.jsx y vamos a cambiar la logica, al momento de entrar a la ruta ../descarga-reporte/{cd_area}/{nu_poliza}  vamos a invocar una ventana en blanco, y vamos a convertir la respuesta blob proveniente del service PolicyService.descargarRcv y descargar un reporte en pdf


## Modificacion Vista Success.jsx
- Para la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\Success\Success.jsx vamos a cambiar quitar la visualización de reporte pdf, al presionar el boton descargar RCV, vamos a hacer la misma logica que se realizó en la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\DescargaReporte\DescargarReporte.jsx para descargar el pdf

## Vista independiente descargar reporte
- Vamos a revisar la vista y vamos a agregar una tarjeta con un mensaje de "Bienvenido, puedes descargar su RCV con tan solo un clíc" y un boton dentro "descargar RCV", este boton al ser presionado consultará este endpoint  Url:URL_API+'/descargarArchivo.SIP'
    method: post
    payload:
        {
            parametrosReporte: {
            CD_AREA:   {cd_area},
            NU_POLIZA: {nu_poliza},
            },
            parametrosProceso: null,
            codigoProceso:     2,
        }
    y convertira el blob  en un archivo pdf descargable, necesito que esta descarga se realice tanto para navegadores de escritorio, ios y android.


## Vista independiente descargar reporte

- Vamos revisar la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\DescargaReporte\DescargarReporte.jsx no vamos a usar un pagina en blanco para descargar, desde la misma vista se va a disparar el proceso de descarga de blob que proviene de este endpoint:
- Url:URL_API+'/descargarArchivo.SIP'
    method: post
    payload:
        {
            parametrosReporte: {
            CD_AREA:   {cd_area},
            NU_POLIZA: {nu_poliza},
            },
            parametrosProceso: null,
            codigoProceso:     2,
        }
    y convertira el blob  en un archivo pdf descargable, necesito que esta descarga se realice tanto para navegadores de escritorio, ios y android.


## Vista independiente descargar reporte

- Vamos  a hacerles cambios a la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\DescargaReporte\DescargarReporte.jsx, vamos a centrar la tarjeta y usaremos  de fondo de pantalla ./assets/fondo.svg


## Modificación Vista Success
- Vamos a aplicar la misma logica descarga de la :\Users\ymedina\Documents\Claude\rcv-express\src\views\DescargaReporte\DescargarReporte.jsx en la vista :\Users\ymedina\Documents\Claude\rcv-express\src\views\Success\Success.jsx al presionar el boton descargar RCV


