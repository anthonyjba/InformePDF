(function () {
    'use strict';

  

    function service() {

       

        // TABLA MAESTRA DE DICCIONARIOS //

        var metaDiccionario = {
            'PROV': mapeo_provincias,
            'CCAA': mapeo_CCAA,
            'MOTV': mapeo_motivos_estados,
            'ESTA': mapeo_estados_muestra,
            'EXPL': mapeo_tipos_explotacion,
            'MEFE': mapeo_meses,
            'ORIG': mapeo_origenes,
            'MUNI': mapeo_municipios,
            //'ARH' : mapeo_arhs
        }

        // PUBLIC API//
        var publicApi = {
            getDictionary: GetDictionary,
            translate: Translate,
            translateSingle: TranslateSingle
        };
        return publicApi;

        // MÉTODOS SERVICIO //

        function GetDictionary(campo) {
            for (var i in metaDiccionario) {
                if (i == campo) {
                    return metaDiccionario[i];
                }
            }
        }

        function Translate(data, field) {

            if (!data || data.length == 0)
                return data;

            if (field) {
                var diccionario = GetDictionary(field);
                if (diccionario)
                    data = data.map(function (reg) { reg[field + '_COD'] = reg[field]; reg[field] = diccionario[reg[field]] != undefined ? diccionario[reg[field]] : reg[field]; return reg; });
            }
            else {

                var fields = Object.keys(data[0]);
                for (var i = 0; i < fields.length; i++) {
                    field = fields[i];
                    data = Translate(data, field);
                }
            }

            return data;
        }

    }

    // Recibe un objeto del tipo { field: value } y un diccionario
    // Si se omite el diccionario buscará uno en la tabla de diccionarios
    function TranslateSingle(data, dictionary) {
        
        var nombreCampo = Object.keys(data)[0];

        if (!dictionary)
            dictionary = GetDictionary(nombreCampo);

        return dictionary[data[nombreCampo]];

    }



    /**
   * Graphic Service
   */
    angular
	  .module('app')
	  .factory('dictionaryService', service);

  
})();
