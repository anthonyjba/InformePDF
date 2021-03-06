(function () {
	'use strict';
		
	/**
	 * Main Controller
	 */
	angular
	  .module('app')
	  .controller('informeController', Controller);

	Controller.$inject = [
    'servicioUtilidades',
    'dictionaryService',
    'muestrasService',
    'poblacionService',
    'distributionService',
    'regressionService',
    'informeMapService',
    'calculoValorService',
    '$scope',
    '$timeout',
    '$rootScope',
    '$http',
    '$q',
    '$window'
	];
	
		
	function Controller(servicioUtilidades, dictionaryService, muestrasService, poblacionService, distributionService, regressionService, informeMapService, calculoValorService, $scope, $timeout, $rootScope, $http, $q, $window) {
		
        const colorMapaARH = 'rgba(51, 51, 51, 0.5)';
        const colorPoblacion = '#778899';
        const colorMuestraExcluidas = '#E5972F';
        const colorMuestraIncluidas = '#26C281';
        
        var vm = this;        
        vm.resultados = [];
        
        
        
        /**********************FUNCION QUE SE EJECUTA AL CARGAR LA PAGINA************************************************/
        vm.init = function () {
            $('#myPleaseWait').modal('show');
            vm.mostrarPaso1 = vm.mostrarPaso2 = vm.mostrarPaso3 = vm.mostrarPaso4 = true;

            $timeout(function () {

                // Recuperamos arh del servicio de datos (por si venimos de otra página)
                var arh = servicioUtilidades.getParameterByName('arh');
                var ac = servicioUtilidades.getParameterByName('ac');

                if (arh) {
                    vm.AC = ac;
                    vm.ARH = parseInt(arh);
                    vm.datosARH_AC = perc_sup_parcelas.filter(function (reg) {
                        return reg.ARH === vm.ARH && reg.AC === vm.AC;
                    })[0];

                    if (!vm.datosARH_AC) {
                        $('#myPleaseWait').modal('hide');
                        alert("No coincide con la BD los datos ARH y AC ingresados para generar el informe.");
                        return;
                    }
                    

                    let promises = {
                        muestras: muestrasService.cargaMuestras(arh),
                        poblacion: poblacionService.getPoblacionARH(arh)
                    }
                    $q.all(promises)
                    .then(function (data) {
                        var mf;

                        try{
                        
                            /***** POBLACION ****/
                            var poblacionARH = data.poblacion;
                            if (poblacionARH.length > 0) {
                                poblacionARH = servicioUtilidades.decompressJson(poblacionARH);
                                poblacionARH = poblacionARH.filter(function (reg) {
                                    return reg.AC === vm.AC
                                });
                            }
                            vm.getFeaturesByARH(vm.ARH);

                            /***** MUESTRAS ****/
                            var filtroPasoActual = {};
                            var filtroMuestrasARH = { ARH: { valor: arh }, AC: { valor: ac }, ESTA: { valor: 2 } };

                            vm.datosMuestras_ARH_AC = servicioUtilidades.decompressJson(muestrasService.getMuestras(filtroMuestrasARH, ['ID_MUESTRA', 'ARH', 'AC', 'ESTA', 'COORX', 'COORY', 'PCAT1', 'PCAT2', 'CC', 'SUPERFICIE', 'SUP_SUBPARCELA', 'VTRA', 'FEFEC']));

                            /***********************
                            Instancia CalculoValor    
                            ***********************/
                            var cvs = new calculoValorService(vm.datosMuestras_ARH_AC, vm.datosARH_AC);

                            /***********************
                            console.log("PASO UNO:")    
                            ***********************/
                            filtroPasoActual = cvs.evaluaOutlierSuperior();

                            // Muestras Iniciales de un ARH-AC
                            var dg = {
                                ARH: vm.datosARH_AC.ARH,
                                AC: vm.datosARH_AC.AC,
                                TOT_MUESTR: vm.datosMuestras_ARH_AC.length,
                                VALOR_MED_HECT_CAL: vm.datosARH_AC.VALOR_MED_HECT_CAL,
                                VALOR_MEDIO: cvs.calculateValorMedio(cvs.muestras, 'VTRAS_SUP'),
                                VALOR_MEDIANA: cvs.calculateValorMediana(cvs.muestras, 'VTRAS_SUP'),
                                OUTL_VAL_SUP: vm.datosARH_AC.OUTL_VAL_SUP
                            };
                            cvs.saveResultadoPaso("DATOS_GENERALES", dg);

                            // Filtra y calcula valores medio y mediana
                            mf = cvs.applyFilterMuestras();

                            vm.startPaso1 = 8;
                            cvs.saveResultadoPaso("PASO_UNO",
                            {
                                TOT_NRO_MUESTR: mf.nroIncluidas + mf.nroExcluidas,
                                NRO_MUESTR_INC: mf.nroIncluidas,
                                NRO_MUESTR_EXC: mf.nroExcluidas,
                                REG_MUESTR_EXC: mf.Excluidas,
                                FILTER: filtroPasoActual,
                                VALOR_MEDIO: cvs.calculateValorMedio(cvs.muestras, 'VTRAS_SUP'),
                                VALOR_MEDIANA: cvs.calculateValorMediana(cvs.muestras, 'VTRAS_SUP'),
                                PAGES: cvs.calculateNroPages(mf.nroExcluidas - vm.startPaso1, 30)
                            });

                            informeMapService.renderMapARH("mapaPaso1",
                                                            colorMapaARH,
                                                            poblacionARH, colorPoblacion,
                                                            cvs.muestras, colorMuestraIncluidas,
                                                            mf.Excluidas, colorMuestraExcluidas);


                            //Actualiza las muestras
                            vm.datosMuestras_ARH_AC = cvs.muestras;                        

                            /***********************
                            console.log("PASO DOS:");
                            ***********************/
                            if (vm.datosMuestras_ARH_AC.length > 0) {

                                // ***** render gráfico de distribución *****
                                __CreateDistributionGraph(mf.Excluidas);

                                filtroPasoActual = cvs.evaluaDistribucion();
                                mf = cvs.applyFilterMuestras();
                                distributionService.highlightBars(vm.mixto, mf.Excluidas);

                                vm.startPaso2 = 8;
                                cvs.saveResultadoPaso("PASO_DOS",
                                {
                                    TOT_NRO_MUESTR: mf.nroIncluidas + mf.nroExcluidas,
                                    NRO_MUESTR_INC: mf.nroIncluidas,
                                    NRO_MUESTR_EXC: mf.nroExcluidas,
                                    REG_MUESTR_EXC: mf.Excluidas,
                                    FILTER: filtroPasoActual,
                                    VALOR_MEDIO: cvs.calculateValorMedio(cvs.muestras, 'VTRAS_SUP'),
                                    VALOR_MEDIANA: cvs.calculateValorMediana(cvs.muestras, 'VTRAS_SUP'),
                                    PAGES: cvs.calculateNroPages(mf.nroExcluidas - vm.startPaso2, 30)
                                });

                                informeMapService.renderMapARH("mapaPaso2",
                                                                colorMapaARH,
                                                                poblacionARH, colorPoblacion,
                                                                cvs.muestras, colorMuestraIncluidas,
                                                                mf.Excluidas, colorMuestraExcluidas);


                                //Actualiza las muestras
                                vm.datosMuestras_ARH_AC = cvs.muestras;
                            }
                            else { vm.mostrarPaso2 = false; }

                            /***********************
                            console.log("PASO TRES:");
                            ***********************/
                            if (vm.datosMuestras_ARH_AC.length > 0) {

                                // ***** render gráfico de Regresión ******
                                vm.configRegressionLogaritmica = {
                                    data: vm.datosMuestras_ARH_AC,
                                    ejeHorizontal: {
                                        column: 'LOG_SUPERFICIE', text: 'Log. Superficie (m²)'
                                    },
                                    ejeVertical: {
                                        column: 'LOG_VTRA', text: 'Log. V. Transmision (€)'
                                    },
                                    colorSeleccion: colorMuestraExcluidas,
                                    mouseEnabled: false,
                                    calculate: false,
                                    type: 'LOG'
                                }
                                filtroPasoActual = cvs.evaluaRegression(vm.configRegressionLogaritmica);
                                vm.mixto = regressionService.renderRegression('desRegresionLOG', vm.configRegressionLogaritmica);
                                mf = cvs.applyFilterMuestras();

                                //Para actualizar los puntos seleccionados del gráfico
                                mf.Excluidas.forEach(function (row) {
                                    regressionService.updateRegressionPoint(row.ID_MUESTRA, colorMuestraExcluidas);
                                });

                                vm.startPaso3 = 8;
                                cvs.saveResultadoPaso("PASO_TRES",
                                {
                                    TOT_NRO_MUESTR: mf.nroIncluidas + mf.nroExcluidas,
                                    NRO_MUESTR_INC: mf.nroIncluidas,
                                    NRO_MUESTR_EXC: mf.nroExcluidas,
                                    REG_MUESTR_EXC: mf.Excluidas,
                                    FILTER: filtroPasoActual,
                                    VALOR_MEDIO: cvs.calculateValorMedio(cvs.muestras, 'VTRAS_SUP'),
                                    VALOR_MEDIANA: cvs.calculateValorMediana(cvs.muestras, 'VTRAS_SUP'),
                                    PAGES: cvs.calculateNroPages(mf.nroExcluidas - vm.startPaso3, 30)
                                });

                                informeMapService.renderMapARH("mapaPaso3",
                                                                colorMapaARH,
                                                                poblacionARH, colorPoblacion,
                                                                cvs.muestras, colorMuestraIncluidas,
                                                                mf.Excluidas, colorMuestraExcluidas);

                                //Actualiza y libera memoria variable
                                vm.datosMuestras_ARH_AC = cvs.muestras;                            
                            }
                            else { vm.mostrarPaso3 = false; }


                            /***********************
                            console.log("PASO CUATRO:");
                            ***********************/
                            if (vm.datosMuestras_ARH_AC.length > 0) {

                                // ***** render gráfico de Regresión ******
                                vm.configRegressionLineal = {
                                    data: vm.datosMuestras_ARH_AC,
                                    ejeHorizontal: { column: 'SUPERFICIE', text: 'Superficie (m²)' },
                                    ejeVertical: { column: 'VTRA', text: 'V. Transmision (€)' },                                
                                    mouseEnabled: false,
                                    calculate: false,
                                    type: 'LIN'
                                }
                                regressionService.getCalculateRegression(vm.configRegressionLineal);
                                regressionService.renderRegression('desRegresionLIN', vm.configRegressionLineal);

                                cvs.saveResultadoPaso("PASO_CUATRO",
                                {
                                    TOT_NRO_MUESTR: cvs.muestras.length,
                                    VALOR_MEDIO: !vm.configRegressionLineal.valorReg ? 0 : vm.configRegressionLineal.valorReg,
                                    VALOR_MEDIANA: !vm.configRegressionLineal.valorMedianaReg ? 0 : vm.configRegressionLineal.valorMedianaReg
                                });

                                //Actualiza y libera memoria variable
                                //vm.datosMuestras_ARH_AC = cvs.muestras;
                            }
                            else { vm.mostrarPaso4 = false; }
                        
                            vm.resultados = cvs.resultValorARH;
                        }
                        catch(e){
                            alert("¡¡Error en la fuente de datos!! contácte con sistemas.");
                        }
                        mf = null;
                    
                        $('#myPleaseWait').modal('hide');


                    }, function (error) {
                        $('#myPleaseWait').modal('hide');
                        alert("Algún fichero de Población por ARH no ha sido cargado.");
                    }, function (update) {

                    })
                    .finally(function () {

                    });

                }
            });

                
          
        }
        /******** End function Init ************/
        
        
        function __CreateDistributionGraph(muestrasExcuidas){
          var sup_p_3 = vm.datosARH_AC.P_OUTL_INF,
              sup_p_85 = vm.datosARH_AC.P_OUTL_SUP,
              muestrasExcAnterior = muestrasExcuidas,
              dataBars = vm.datosARH_AC.PUNTOS.map(function (reg) {
                return {
                    x: reg.x, y: reg.n, x1: reg.x1, x2: reg.x2
                }
            });
          
          var maxMuestra = 0;  
          dataBars.forEach(function (bar) { if (bar.y > maxMuestra) maxMuestra = bar.y; })
        
          // saco las filas seleccionadas de la tabla que caigan dentro de esta barra
          dataBars.forEach(function (bar) {                                
              var supAnterior = Math.pow(bar.x1, 2);
              var supPosterior = Math.pow(bar.x2, 2);
              var itemsInBar = muestrasExcAnterior.filter(function (m) {
                  return m.SUP_SUBPARCELA < supPosterior && m.SUP_SUBPARCELA > supAnterior;
              });
              
              bar.y = bar.y - itemsInBar.length;
          });
          
          var dataLine = vm.datosARH_AC.PUNTOS.map(function (reg) {
                return {
                    x: reg.x, y: reg.y
                }
            });
            
          if (dataLine.length > 2 && dataBars.length > 2) {
            
            //quitamos los 3 primeros;
            dataLine.shift();
            dataLine.shift();
            dataLine.shift();
            
            vm.numero_muestras_percentil_3 = 0;
            vm.numero_muestras_percentil_3 += dataBars.shift().y;
            vm.numero_muestras_percentil_3 += dataBars.shift().y;
            vm.numero_muestras_percentil_3 += dataBars.shift().y;
            
            //quitamos los 3 ultimos;
            dataLine.pop();
            dataLine.pop();
            dataLine.pop();
            
            vm.numero_muestras_percentil_97 = 0;
            vm.numero_muestras_percentil_97 += dataBars.pop().y;
            vm.numero_muestras_percentil_97 += dataBars.pop().y;
            vm.numero_muestras_percentil_97 += dataBars.pop().y;
          }
          
          /** Config **/  
          vm.configDistribution = {  
            dataLine : dataLine,
            dataBars : dataBars,
            filterBars : [
                { x: sup_p_3, y: maxMuestra, x1: 0, x2: 0 },
                { x: sup_p_85, y: maxMuestra, x1: 0, x2: 0 }
            ]
          }
          
          vm.mixto = distributionService.render('distGraph', vm.configDistribution);          
        }
        
	};
  
  Controller.prototype.getFeaturesByARH = function(arh){
        let object = topojson.feature(geojsonObject4, geojsonObject4.objects.ARH_2016_25000);
        geojsonObject4 = object.features.filter(function(d) { return d.properties.ARH === arh; })[0];        
      }  


})();