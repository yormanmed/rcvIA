## Proceso de flag por clientes
- En la vista C:\Users\ymedina\Documents\Claude\rcv-express\src\views\Personal\Personal.jsx al presionar el boton continuar vas a solicitar el endpoint:
    URL : URL_API+'/dashboard/marcaje'
    METHOD: POST
    PAYLOAD:
        {
        "entidad":"{{entityClient}}",
        "token":"{{tokenValue}}",
        "solicitud":{
            "tp_documento":Valor tipo documento proveniente de la vista Personal.jsx,
            "nu_documento":Valor numero documento proveniente de la vista Personal.jsx,
            "nm_persona":Valor Primer nombre y primer apellido proveniente de la vista Personal.jsx,
            "nu_telefono":Valor Numero de telefono proveniente de la vista Personal.jsx,
            "de_correo":Valor Correo Electronico proveniente de la vista Personal.jsx,
            "de_marca":Valor guardado Marca proveniente de la vista Vehicle.jsx,
            "de_modelo":Valor guardado Modelo proveniente de la vista Vehicle.jsx,,
            "de_anio":Valor guardado Año del vehiculo proveniente de la vista Vehicle.jsx,,
            "de_version":Valor guardado Version proveniente de la vista Vehicle.jsx,,
            "cd_clase":Valor guardado Clase proveniente de la vista Vehicle.jsx,,
            "cd_uso":Valor guardado Uso proveniente de la vista Vehicle.jsx,,
            "nu_placa":Valor guardado Numero Placa proveniente de la vista Vehicle.jsx,
        }
    }