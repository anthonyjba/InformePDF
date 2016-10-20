(function () {
    'use strict';

  


    function service($http, $q, servicioUtilidades) {
     

        var url_Muestras = 'data/Muestras/muestras_2016_comp.json';
        //var url_Muestras = 'data/Muestras/muestras_2016_descarga.json';
        var url_MuestrasDescarga = 'data/Muestras/muestras_2016_descarga.json';

        var muestras = null;
        var muestrasDescarga = null;
        var validadoDescarga = false;
        
        var EstadosMuestra = {
            Precalificadas: 1,
            Calificadas: 2,
            Descalificadas: 3
        }

        ////////////////////////////////////////////////////////////////////////
        // public API
        var ms = {
            cargaMuestras: cargaMuestras,
            getMuestras: getMuestras,
            getMuestrasCompletasSinRefCat: getMuestrasCompletasSinRefCat,
            descargarMuestras: descargarMuestras,
            EstadosMuestra: EstadosMuestra
        };
        return ms;

        ///////////////////////////////////////////////////////////
        // Funciones Publicas		

        function getCCAAsPorGerencia(gerencia) {

        }

        // Inicialización de los atos
        function cargaMuestras() {

            var defered = $q.defer();
            var promise = defered.promise;

            /*Carga cubo Calificadas*/
            if (muestras == null) {
                $http({
                    method: 'GET',
                    url: url_Muestras
                }).success(function (data) {
                    // Genero el código de municipios
                    var cabecera = data.shift();
                    var indexMuni = cabecera.indexOf(campo_MUNICIPIO);
                    var indexProv = cabecera.indexOf(campo_PROVINCIA);
                    data = data.map(function (reg)
                    {
                        if (reg[indexMuni])
                        {
                            reg[indexMuni] = servicioUtilidades.generarCodigoMunicipio(reg[indexProv], reg[indexMuni]);

                        };
                        return reg;
                    });
                    data.unshift(cabecera);
                    muestras = data;
                    defered.resolve(data);
                }).error(function (err) {
                    console.log("error");
                    defered.reject(err);
                }).finally(function () {
                    console.log('Finally Muestras', new Date());
                });
            }
            return promise;
        };


        /*Funcion que ejecuta un filtrado del cubo por un objeto*/
        function getMuestras(objetoFiltrado, campos) {

            var data = muestras;

            var lineaCabecera = muestras[0];
            for (var filtro in objetoFiltrado) {
                var capa = objetoFiltrado[filtro];
                if (lineaCabecera.indexOf(filtro) != -1) {
                    if (!capa.hasOwnProperty("condicion") || capa["condicion"]) {
                        data = getItemTrue(data, filtro, capa["valor"]);
                    } else {
                        data = getItemFalse(data, filtro, capa["valor"]);
                    }
                }
            };

            if (campos)
                data = selectCampos(data, campos);

            return data;
        }

        // Devuelve las muestras del cubo privado pero ocultando la ref cat.
        function getMuestrasCompletasSinRefCat(objetoFiltrado, campos, callback) {

            var promise = _cargaMuestrasDescarga();
            promise.then(function () {

                var data = muestrasDescarga;

                var lineaCabecera = muestras[0];
                for (var filtro in objetoFiltrado) {
                    var capa = objetoFiltrado[filtro];
                    if (lineaCabecera.indexOf(filtro) != -1) {
                        if (!capa.hasOwnProperty("condicion") || capa["condicion"]) {
                            data = getItemTrue(data, filtro, capa["valor"]);
                        } else {
                            data = getItemFalse(data, filtro, capa["valor"]);
                        }
                    }
                };

                if (campos)
                    data = selectCampos(data, campos);

                data = servicioUtilidades.decompressJson(data);
                data = data.map(function (reg) { reg.PCAT2 = reg.PCAT2.substr(0, 1) + 'XXXXX'; return reg });
                data = servicioUtilidades.compressJson(data);

                callback(data);
            })

            
        }

        // Inicialización de los atos
        function _cargaMuestrasDescarga() {

            var defered = $q.defer();
            var promise = defered.promise;

            /*Carga cubo Calificadas*/
            if (muestrasDescarga == null) {
                $http({
                    method: 'GET',
                    url: url_MuestrasDescarga
                }).success(function (data) {
                    // Genero el código de municipios
                    var cabecera = data.shift();
                    var indexMuni = cabecera.indexOf(campo_MUNICIPIO);
                    var indexProv = cabecera.indexOf(campo_PROVINCIA);
                    data = data.map(function (reg) {
                        if (reg[indexMuni]) {
                            reg[indexMuni] = servicioUtilidades.generarCodigoMunicipio(reg[indexProv], reg[indexMuni]);

                        };
                        return reg;
                    });
                    data.unshift(cabecera);
                    muestrasDescarga = data;
                    defered.resolve(data);
                }).error(function (err) {
                    console.log("error");
                    defered.reject(err);
                }).finally(function () {
                    console.log('Finally Muestras', new Date());
                });
            }
            else {
                defered.resolve(muestrasDescarga);
            }
            return promise;
        };

        /*Funcion que ejecuta un filtrado del cubo por un objeto*/
        function _getMuestrasDescarga(objetoFiltrado, campos) {

            var data = muestrasDescarga;

            var lineaCabecera = muestras[0];
            for (var filtro in objetoFiltrado) {
                var capa = objetoFiltrado[filtro];
                if (lineaCabecera.indexOf(filtro) != -1) {
                    if (!capa.hasOwnProperty("condicion") || capa["condicion"]) {
                        data = getItemTrue(data, filtro, capa["valor"]);
                    } else {
                        data = getItemFalse(data, filtro, capa["valor"]);
                    }
                }
            };

            if (campos)
                data = selectCampos(data, campos);

            return data;
        }

        function descargarMuestras(filtro, descripcion, campos) {

            //if (loginService.isValidated()) {
            //    _descargaMuestras(filtro, descripcion, campos);
            //} else {
            //    loginService.openDialog(
            //        "Login de usuario",
            //        'La descarga de muestras requiere permisos de autorización. Por favor introduzca su password.',
            //        function () {
            //            _descargaMuestras(filtro, descripcion, campos);
            //        });
            //}
            
        }

        function _descargaMuestras(filtro, descripcion, campos) {

            var promise = _cargaMuestrasDescarga();

            promise.then(function () {

                /*Para la fecha*/
                var dt = new Date();
                var month = dt.getMonth() + 1;
                var day = dt.getDate();
                var year = dt.getFullYear();
                var fecha = ('_' + year + month + day);

                var muestras = _getMuestrasDescarga(filtro, campos);
                var muestras = servicioUtilidades.decompressJson(muestras);
                var csv = servicioUtilidades.convertToCSV(muestras, function (campo) {
                    return campo.indexOf('$') == -1
                            && campo.indexOf('isSelected') == -1
                            && campo.indexOf('VB_SUBPARCE') == -1
                            && campo.indexOf('AATIPO') == -1
                            && campo.indexOf('IP') == -1
                            && campo.indexOf('MEFE') == -1
                            && campo.indexOf('EFEC') == -1
                            && campo.indexOf('IAMIR') == -1
                            && campo.indexOf('GERE') == -1
                            && campo.indexOf('CCAA') == -1
                            && campo.indexOf('PROV') == -1
                            && campo.indexOf('EXPL') == -1
                            && campo.indexOf('TIPO') == -1
                            && campo.indexOf('VTRAS_SUP') == -1
                            && campo.indexOf('COD_MUNI') == -1
                            && campo.indexOf('MUNI_IGN') == -1
                            && campo.indexOf('MUNI_INE') == -1
                            && campo.indexOf('V_SUELO') == -1
                            && campo.indexOf('CLAS_VCALC') == -1
                            && campo.indexOf('CLAS_SUPERF') == -1
                            && campo.indexOf('COORX') == -1
                            && campo.indexOf('COORY') == -1
                }, ['PCAT2', 'SUBPARC'], ['MOTV', 'ESTA']);



                //var virtualDownload = document.createElement('a');
                //virtualDownload.href = 'data:text/csv;charset=utf-8,' + escape(csv);
                //virtualDownload.download = descripcion + fecha + ".csv";
                //document.body.appendChild(virtualDownload);
                //virtualDownload.click();
                //document.body.removeChild(virtualDownload);

                download(csv, descripcion + fecha + ".csv", "text/csv");


            })
        }
     
        function getItemTrue(objetoJson, atributo, filtro) {
            if (objetoJson.length > 0) {
                var lineaCabecera = objetoJson.shift();
                var indexAtrib = lineaCabecera.indexOf(atributo);
                var result = objetoJson.filter(
                    function (Objeto) {
                        return (Objeto[indexAtrib] == filtro)
                    }
                );
                result.unshift(lineaCabecera);
                objetoJson.unshift(lineaCabecera);
                return result;
            }
            else {
                return objetoJson;
            }
        }

        function getItemFalse(objetoJson, atributo, filtro) {
            if (objetoJson.length > 0) {
                var lineaCabecera = objetoJson.shift();
                var indexAtrib = lineaCabecera.indexOf(atributo);
                var result = objetoJson.filter(
                    function (Objeto) {
                        return (Objeto[indexAtrib] != filtro)
                    }
                );
                result.unshift(lineaCabecera);
                objetoJson.unshift(lineaCabecera);
                return result;
            }
            else {
                return objetoJson;
            }
        }


     

        // PARA CUBO COMPRIMIDO
        function selectCampos(data, listaCamposClave) {

            var resultado = [];
            var lineaCabecera = data.shift();
            var listaIndicesCampos = listaCamposClave.map(function (campo) { return lineaCabecera.indexOf(campo); });
            for (var i = 0; i < data.length; i++) {
                var registro = [];
                for (var c = 0; c < listaIndicesCampos.length; c++) {
                    registro.push(data[i][listaIndicesCampos[c]]);
                }
                resultado.push(registro);
            }
            resultado.unshift(listaCamposClave);
            data.unshift(lineaCabecera);

            return resultado;

        }

   

      


    }

    /**
       * Servicio de Cubo
       */
    angular
	  .module('app')
	  .factory('muestrasService', service);


    service.$inject = ['$http', '$q', 'servicioUtilidades'];

})();
