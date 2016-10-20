(function () {
    'use strict';
    
    function service($http, $q) {

        //var url_ARH = 'http://svintranet/analizarustica/AVALOR/data/Poblacion/poblacion_arh_XXX.json';
        var url_ARH = 'data/Poblacion/poblacion_arh_XXX.json';
        var ARH_actual = null;
        var datosPoblacion = null;


        ////////////////////////////////////////////////////////////////////////
        // public API
        var ms = {
            getPoblacionARH: getPoblacionARH,
            getPoblacionARHJsonP: getPoblacionARHJsonP
        };
        return ms;

        ///////////////////////////////////////////////////////////
        // Funciones Publicas		

        // Inicialización del cubo
        function init() {


        };


        // Inicialización del cubo
        function getPoblacionARH(valorARH) {

            var defered = $q.defer();
            var promise = defered.promise;


            if (valorARH != ARH_actual) {
                
                var url = url_ARH.replace("_XXX", "_" + valorARH);

                $http({
                    method: 'GET',
                    url: url
                }).success(function (data) {                    
                    //datosPoblacion = servicioUtilidades.compressJson(datosDeCompressed);
                    datosPoblacion = data;
                    /*Marcamos el ARH actual*/
                    ARH_actual = valorARH;                    
                    defered.resolve(datosPoblacion);
                }).error(function (err) {
                    console.log("error");
                    ARH_actual = null;
                    defered.reject(err);
                }).finally(function () {


                });
                return promise;
            } else {
                defered.resolve(datosPoblacion);
                return promise;
            }
        };

        function JSON_CALLBACK(resultData) {
            var Actual = resultData.usuario;
            callback(resultData);
        }

        function getPoblacionARHJsonP(valorARH) {

            var defered = $q.defer();
            var promise = defered.promise;

            var url = url_ARH.replace("_XXX", "_" + valorARH);

            if (valorARH != ARH_actual) {

                
                $.ajax({
                    url: url,
                    data: {},
                    async: false,
                    //jsonpCallback: 'currentUserCallback',
                    contentType: "application/json",
                    dataType: 'jsonp',
                    error: function (jqXHR, textStatus, errorThrown) {
                        datosPoblacion = JSON.parse(jqXHR.responseText);
                        ARH_actual = valorARH;
                        defered.resolve(datosPoblacion);
                        console.log(errorThrown);
                        console.log(textStatus);
                    },
                    success: function (a) {
                        console.log(a);
                        // Rellenar pestañas
                        datosPoblacion = data;
                        ARH_actual = valorARH;
                        defered.resolve(datosPoblacion);
                    }

                })

                /*
                $http.jsonp(url + "?callback=JSON_CALLBACK")
                .success(function (data, status, headers, config) {
                    console.log(data);
                    datosPoblacion = data;
                    ARH_actual = valorARH;
                    defered.resolve(datosPoblacion);
                })
                .error(function (data, status, headers, config) {
                    console.log("error");
                    ARH_actual = null;
                    defered.reject(status);
                });*/

                //$http({
                //    method: 'JSONP',
                //    url: url,
                //    params: {
                //        callback: 'JSON_CALLBACK'
                //    }
                //}).success(function (data) {
                //    // Genero el código de municipios
                //    datosPoblacion = data;
                //    /*Marcamos el ARH actual*/
                //    ARH_actual = valorARH;
                //    defered.resolve(datosPoblacion);
                //}).error(function (err) {
                //    console.log("error");
                //    ARH_actual = null;
                //    defered.reject(err);
                //}).finally(function () {
                //    console.log('Finally Poblacion', new Date());
                //});
                return promise;
            } else {
                defered.resolve(datosPoblacion);
                return promise;
            }
        };
           
    };

	
	
	/**
	 * Servicio de Cubo
	 */
    angular
	  .module('app')
	  .factory('poblacionService', service);
	  
	      service.$inject = ['$http', '$q'];
	
})();
