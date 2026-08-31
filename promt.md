Para la vista Vechicle, tab escanear:

    El select Clase debe ser llenado mediante solicitud al API:
        -url del endpoint  API_URL+"/data.rcv"
        -metodo post
        -cuerpo de solicitud:
            {
                "data": "RCVClases",
                "entidad": "{{entityClient}}",
                "token": "{{tokenValue}}"
            }

    El select Uso debe ser llenado mediante solicitud al API:
        -url del endpoint  API_URL+"/data.rcv"
        -metodo post
        -cuerpo de solicitud:
            {
                "data": "RCVUsos",
                "cd_clase":colocar valor Seleccionado de la clase,
                "entidad": "{{entityClient}}",
                "token": "{{tokenValue}}"
            }

Para la vista Vechicle, tab escanear:

    Luego de escanear la imagen del carnet de circulación, toma el valor responseData.data.cd_clase y lo haces coincidir con el select Clase.
    Luego de escanear la imagen del carnet de circulación, toma el valor responseData.data.cd_uso y lo haces coincidir con el select Uso

Para vista PaymentMethod:
    Al seleccionar el boton atrás, no muestra nada en la vista Plan

Para la vista PaymentForm, antes de renderizar vas a solicitar un endpoint al API:
    -url del endpoint  API_URL+"/procedure.rcv.cotizacion"
        -metodo post
        -cuerpo de solicitud:
           {
            "procedure":"RCVCotizacion",

            "cd_marca":1 por defecto,
            "cd_modelo":1 por defecto,
            "cd_anio":1 por defecto,
            "cd_version":1 por defecto,

            "cd_clase":código de clase seleccionada en la vista Vehicle,
            "cd_uso":código de uso seleccionada en la vista Vehicle,
            
            "cd_cobertura":1,
            "cd_plan_pago":11,,
            "nu_toneladas_extra":0,
            
            "entidad":"{{entityClient}}",
            "token":"{{tokenValue}}"
        } 

    Al recibir la respuesta vas toma el valor responseData, has un sumatoria del campo prima,prima_plan_bs.
    Colocar la sumatoria de prima en el span payment-form__banner-price
    Colocar la sumatoria de prima_plan_bs en el span payment-form__amount-value

    Para la vista PaymentForm:
    El select Bancos debe ser llenado mediante solicitud al API:
        -url del endpoint  API_URL+"/data.rcv"
        -metodo post
        -cuerpo de solicitud:
            {
                "data": "GEOBancosNacionales",
                "entidad": "{{entityClient}}",
                "token": "{{tokenValue}}"
            }

    Para la vista PaymentForm:
    El select Area Telefonica  debe ser llenado mediante solicitud al API:
        -url del endpoint  API_URL+"/data.rcv"
        -metodo post
        -cuerpo de solicitud:
            {
                "data": "GEOBancosNacionales",
                "entidad": "{{entityClient}}",
                "token": "{{tokenValue}}"
            }

    Para la vista PaymentForm:
    El input monto colocar el valor de prima_plan_bs

    Para la vista PaymentForm:
    El select Area Telefonica  debe ser llenado mediante solicitud al API:
        -url del endpoint  API_URL+"/data.rcv"
        -metodo post
        -cuerpo de solicitud:
            {
                "data": "GEOAPrefijosMoviles",
                "entidad": "{{entityClient}}",
                "token": "{{tokenValue}}"
            }
    Al recibir la respuesta, tomar valor responseData y colocar el valor cd_prefijo en el value y label del select

    Para la vista PaymentForm
    Luego de presionar el boton continuar validar los campos de pago:Codigo banco, Area concatenada a numero de telefono, fecha de operacion, Monto y referencia contra un endpoint del API
            -url del endpoint  API_URL+"/validacion.pagomovil"
            -metodo post
            -cuerpo de la solicitud
                {
                    "entidad":"{{entityClient}}",//Obligatorio
                    "token":"{{tokenValue}}",//Obligatorio
                    "transaccion":{
                        "cd_banco":codigo banco,
                        "fe_transaccion":fecha de operacion con formato yyyymmdd,
                        "nu_telefono": numero de telefono,
                        "mt_transaccion":Monto,
                        "nu_referencia":numero de referencia,
                        "nu_documento":numero documento,
                        "tp_documento":tipo documento
                    }
                }
        Al recibir la respuesta tomamos el campo responseData.codR y validamos si es 00, en tal caso pasamos a la siguiente vista


    Para la vista PaymentForm
    Despues de validar esta condición (respuestaUbiiPagos.codR === '00'  && respuestaUbiiPagos.codS=='Transacción encontrada')
    realiza un petición al endpoint de emitir póliza:
        -url del endpoint API_URL+"procedure.rcv.emision.enlinea"
        -metodo POST
        -cuerpo de la solicitud
            {
                "cd_producto": 260200,
                "entidad": "AVILA-TEC-TEST-IT",
                "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTE5OTU2NTYsImV4cCI6NjAzMTk5NTY1NiwiZGF0YSI6eyJpZF9lbXByZXNhIjoxfX0.toF1HFD7ikau-lSDc8oJD-Bz9RR0M_qs-CzsItmV4iM",
                "solicitud": {
                    
                    "cd_cotizacion": guardar el cd_cotizacion de la solicitud el endpoint "/procedure.rcv.cotizacion",
                    "nm_persona1": colocar primer nombre,
                    "nm_persona2": "",
                    "ap_persona1": colocar primer apellido,
                    "ap_persona2": "",
                    "tp_documento": colocar tipo documento,
                    "nu_documento": colocar numero documento,
                    "fe_nacimiento": colocar fecha de nacimiento formato dd/mm/yyyy,
                    "cd_estado_civil": colocar codigo estado civil,
                    "cd_sexo": colocar codigo sexo,
                    "cd_provincia": colocar codigo estado,
                    "cd_municipio": "1",
                    "cd_zona": "1",
                    "de_direccion": ".",
                    "nu_telefono": colocar numero de telefono,
                    "nu_telefono_local": "",
                    "de_correo": colocar correo,
                    "cd_parentesco": 1,
                    "cd_asesor": 7,
                    "cd_producto": 260200,
                    "cd_plan_pago": 11,
                    "nu_pagos": "1",
                    "cd_banco": "",
                    "tp_cuenta": "",
                    "nu_cuenta": "",
                    "cd_cobertura": 2,
                    "tp_forma_pago": 11,
                    "in_cobro": 1,
                    //Datos Automovil
                    "cd_placa": colocar numero placa,
                    "cd_color": colocar codigo color,
                    "cd_marca": si la carga en la vista Vehicle fue manual colocar codigo marca sino coloca 1,
                    "cd_modelo": si la carga en la vista Vehicle fue manual colocar codigo modelo sino coloca 1,
                    "cd_anio": si la carga en la vista Vehicle fue manual colocar codigo año sino coloca 1,
                    "cd_version": si la carga en la vista Vehicle fue manual colocar codigo version sino coloca 1,
                    "cd_clase": coloca el codigo de la clase,
                    "cd_uso": coloca el codigo del uso,
                    //Extraccion OCR
                    "de_marca": si la carga en la vista Vehicle fue escanear colocar valor del input marca sino coloca vacio,
                    "de_modelo": si la carga en la vista Vehicle fue escanear colocar valor del input modelo sino coloca vacio,
                    "de_anio": "si la carga en la vista Vehicle fue escanear colocar valor del input año sino coloca vacio,
                    "de_version": si la carga en la vista Vehicle fue escanear colocar valor del input version sino coloca vacio,
                    
                    "nu_toneladas_extra": 0,
                    "cd_niv": colocar valor del niv,
                    
                    //Asociar cotización con OCR
                    "ruta_imagen_cc": "",
                    "ruta_imagen_di": "",
                }
            }
        Y al recibir la respuesta si el responseCode es 400 muestra error al realizar la cotización
        Si el responseCode es 200 tomar el valor responseData y guardar el indice cd_area, nu_poliza para luego

        Para el usePaymentFormController, el objecto solicitud, no tomes el personalData, usa los valores guardado de la vista Personal

        Para la vista PaymentfORM, se debe inhabilitar el boton continuar si no se han validados los campos banco, numero de telelfono, fecha de operacion, monto y referencia

        Para la vista Personal,
            Modificar el diseño de numero de telefono unificar el select de area y el input de numero de telelfono en uno solo
        
         Para la vista Personal,
            Modificar el diseño de numero de documento unificar el tipo documento y el input de numero de documento en uno solo

        Para el PaymentForm, diseñar un splash screen payment-form__loading al cuando este cargando la cotización

        Para la vista PaymentForm, luego de recibir respuesta exitosa del endpoint /procedure.rcv.emision.enlinea, vas a limpiar el localstorage de los valores guardados de la vista Vehicle y Personal

        Para el modal otp, mostrar el modal otp no importa si ya validó el codigo


        Para la vista vehicle, al presionar el boton continuar debe validar que los formularios:
            marca, modelo , año, version, clase, uso , color
            Validar paca nuevamente con el metodo validatePlaca

        
        Para la vista Vehicule, tab manual, cada select debe tener un flitro de busqueda (searchable dropdown)

        Para la vista Personal, tab manual si el formulario tiene errores indicar que input / select está fallando

        Para la vista Vehicle, tab manual y escanear, indicar errores en los inputs serial niv y placa
        Para la vista Vehicle, tab manual y escanear, indicar errores en los select color


        Para la vista Vehicle, tab escanear se debe agregar la carga de archivo abrienda la camara del dispotivo

        Crear DebitForm, basar el diseño en la vista PaymentForm sin la sección Datos del pago movil, y con los siguientes campos:
            Banco, Telefono y cedula de identidad
        

        Para la vista PyamentMethod, Si seleccionan "debito" ir a la vista DebitForm

        Para la vista PyamentMethod, Si seleccionan "pago-movil" ir a la vista PaymentForm


        Para la vista debitform y paymentform el select banco debe tener flitro de busqueda (searchable dropdown)

        Crear un modal otp llamado debitOTP que se ejecute luego de la vista debitform, con la descripción "valide su debito inmediato con el codigo que le llego a su numero {numero_telefono}"

        Para la vista debitform, al presionar el boton continuar hacer solicutd al endpoint:
            -url del endpoint API_URL+"/debitoinmediato/solicitud"
            -metodo POST
            -cuerpo de la solicitud

            {
                "entidad":"{{entityClient}}",//Obligatorio
                "token":"{{tokenValue}}",//Obligatorio
                "banco": codigo banco extraido del select banco, 
                "monto": prima_bs extraido del endpoint de cotizacion,
                "telefono": numero de telefono extraido del input,
                "cedula":  tipo documento concatenado con numero documento extraído de input
            }
        
            al recibir la respuesta, el campo code es 202, abrir el debitOTP 
        
        Revisa la lógica luego de recibir la respuesta endpoint API_URL+"/debitoinmediato/solicitud", el debitotp no abre cuando recibe respuesta 202 del campo code

        --Pending
        Luego de colocar el codigo otp en la vista DebitOtpModal y presionar el boton verificar, se debe hacer solicitud al endpoint:
            -url del endpoint API_URL+"/debitoinmediato/confirmacion"
            -metodo POST
            -cuerpo de la solicitud

            {
                "entidad":"{{entityClient}}",
                "token":"{{tokenValue}}",
                "banco": codigo banco extraido del select banco, 
                "monto": prima_bs extraido del endpoint de cotizacion,
                "telefono": numero de telefono extraido del input,
                "cedula":  tipo documento concatenado con numero documento extraído de input
                "otp": otp extraido del modal DebitOtpModal,
                "concepto":"DEB-INM SELAFE",
                "nombre": "Selafe"
            }

        Al recibir al respuesta y el campo responseCode es 200 y responseData.code==='ACCP' emitir la póliza,
        Si el campo es responseCode 400, mostrar un modal con pago recahazado y colocar el campo responseData.message 


    Para el modal DebitOtpModal, el modal debe bloquear el cierre del mismo, la unica forma desbloquearse es hasta obtener respuesta del endpoint "/debitoinmediato/confirmacion"

    Para el modal DebitOtpModal, cuando se presione el boton verificar, ocultar el input otp y mostrar un loader con el logo, hasta que responda el servicio, si la respuesta del endpoint "/debitoinmediato/confirmacion" es correcta, colocar otros loader que diga emitiendo mientras esperamos la respuesta del API emision

    Para el archivo C:\Users\ymedina\Documents\Claude\rcv-express\src\views\Personal\Personal.jsx, permitir para los inputs lo siguiente:
        Para primer nombre solo letras y espacios
        Para primer apellido solo  letras y espacios
        Para numero de documento solo numeros
        para correo electronico, que sea un correo valido
        Para numero de telefono, solo numeros
    Para el archivo C:\Users\ymedina\Documents\Claude\rcv-express\src\views\Personal\Personal.jsx, colocar limite de caracteres para los inputs:

        Para primer nombre maximo 15 caracteres
        Para primer apellido maximo  15 caracteres
        Para numero de documento maximo 10 caracteres
        para correo electronico, que sea un correo valido
        Para numero de telefono, que sean 7 caracteres exactos

    Para el archivo C:\Users\ymedina\Documents\Claude\rcv-express\src\views\Personal\Personal.jsx, colocar limite de caracteres para los inputs:

        Para la fecha de nacimiento maximo fecha de hoy - 18 años
    
    Para el archivo C:\Users\ymedina\Documents\Claude\rcv-express\src\views\Vehicle\Vehicle.jsx, permitir para los inputs lo siguiente:
        Para Placa solo numeros y letras sin espacios, (minimo 2 y maximo 8 caracteres)
        Para Niv solo numeros y letras sin espacios, (minimo 6 maximo 17 caracteres)
        
    Para la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\PaymentForm\PaymentForm.jsx al presionar el boton continuar, copiar el diseño del loader de la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\components\DebitOtpModal\DebitOtpModal.jsx

    Para la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\Success\Success.jsx al presionar el boton  Descargar RCV, hacer solicitud al endpoint
        URL_FILE+'/descargarArchivo.SIP'
        Motodo post
        solicitud json:
            {
                parametrosReporte:{
                    CD_AREA: valor cd_area,
                    NU_POLIZA: valor nu_poliza
                },
                parametrosProceso: null,
                codigoProceso:2
            }
        al recibir la respuesta, esta será contenido MediaType.APPLICATION_OCTET_STREAM, vas a tomar la respuesta y lo abriras en una nueva ventana como un PDF
    


