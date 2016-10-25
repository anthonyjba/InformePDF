(function () {
    'use strict';
    
    function service($timeout, regressionService) {

        var calculoValorService = function(muestrasARH, percentilARH) {
            this.resultValorARH = [];
            this.muestras = muestrasARH;
            this.percentil = percentilARH;
        }
        
        
        //**** public functions
        calculoValorService.prototype.ejecutaSoloCalculo = function (){
            var filtroPasoActual;
          
            //*** Paso 1: Filtro Outliers Superior
            filtroPasoActual = this.evaluaOutlierSuperior();          
            var mf = this.applyFilterMuestras();
                          
            this.saveResultadoPaso("OUTLIERS", 
            {
                TOT_NRO_MUESTR: mf.nroIncluidas + mf.nroExcluidas,
                NRO_MUESTR_INC: mf.nroIncluidas,
                NRO_MUESTR_EXC: mf.nroExcluidas,
                FILTER: filtroPasoActual,
                VALOR_MEDIO: this.calculateValorMedio(this.muestras, 'VTRAS_SUP'),
                VALOR_MEDIANA: this.calculateValorMediana(this.muestras, 'VTRAS_SUP')
            });
          
            //*** Paso 2: Filtro Distribucion
            if (this.muestras.length > 0) {
                filtroPasoActual = this.evaluaDistribucion();
                mf = this.applyFilterMuestras();

                this.saveResultadoPaso("DISTRIBUCION",
                {
                    TOT_NRO_MUESTR: mf.nroIncluidas + mf.nroExcluidas,
                    NRO_MUESTR_INC: mf.nroIncluidas,
                    NRO_MUESTR_EXC: mf.nroExcluidas,
                    FILTER: filtroPasoActual,
                    VALOR_MEDIO: this.calculateValorMedio(this.muestras, 'VTRAS_SUP')
                });
            }
          
            // *** Paso 3: Filtro Regresión Logaritmica ******
            if (this.muestras.length > 0){
                var configRegressionLogaritmica = {
                    data: this.muestras,
                    ejeHorizontal: {
                        column: 'LOG_SUPERFICIE', text: 'Log. Superficie (m²)'
                    },
                    ejeVertical: {
                        column: 'LOG_VTRA', text: 'Log. V. Transmision (€)'
                    },
                    mouseEnabled : false,
                    calculate : false,
                    type: 'LOG'
                }
                filtroPasoActual = this.evaluaRegression(configRegressionLogaritmica);
                mf = this.applyFilterMuestras();
                          
                this.saveResultadoPaso("REGRESION_LOG", 
                {
                    TOT_NRO_MUESTR: mf.nroIncluidas + mf.nroExcluidas,
                    NRO_MUESTR_INC : mf.nroIncluidas, 
                    NRO_MUESTR_EXC : mf.nroExcluidas,
                    FILTER : filtroPasoActual,
                    VALOR_MEDIO : this.calculateValorMedio(this.muestras,'VTRAS_SUP'),
                });
            }

            // *** Paso 4: Regresión Final Lineal ******
            if (this.muestras.length > 0) {
                var configRegressionLineal = {
                    data: this.muestras,
                    ejeHorizontal: { column: 'SUPERFICIE', text: 'Superficie (m²)' },
                    ejeVertical: { column: 'VTRA', text: 'V. Transmision (€)' },
                    mouseEnabled: false,
                    calculate: false,
                    type: 'LIN'
                }
                regressionService.getCalculateRegression(configRegressionLineal);

                this.saveResultadoPaso("REGRESION_LIN",
                {
                    TOT_NRO_MUESTR: this.muestras.length,
                    VALOR_MEDIO: !configRegressionLineal.valorReg ? 0 : configRegressionLineal.valorReg,
                    VALOR_MEDIANA: !configRegressionLineal.valorMedianaReg ? 0 : configRegressionLineal.valorMedianaReg
                });
            }

          mf = null;                          
          
          return this.resultValorARH; 
        };
        
        /*** Métodos Significativos del cálculo **/
        
        //Evalua si las muestras estan Incluidas por OUTLET superior
        calculoValorService.prototype.evaluaOutlierSuperior = function (){        
            let OutlierValorSuperior = this.percentil.OUTL_VAL_SUP;
            
            this.muestras.forEach(function(m) {
              m['VTRAS_SUP'] = m['VTRA'] / (m['SUPERFICIE'] / 10000);
              m.Incluida = !OutlierValorSuperior? true :  m['VTRAS_SUP'] <= OutlierValorSuperior;
              m.LOG_SUPERFICIE = Math.log(m['SUPERFICIE']);
              m.LOG_VTRA = Math.log(m['VTRA']);
            });
            
            return { 'OutValSup' :  OutlierValorSuperior };
        }
        
        //Evalua si la Superficie de Subparcelas de las muestras estan Incluidas entre el percentil 3 y 85.
        calculoValorService.prototype.evaluaDistribucion = function (){
            let pow_p_3 = Math.pow((this.percentil.PUNTOS[3].x2), 2);
            let pow_p_85 = Math.pow((this.percentil.PUNTOS[20].x2), 2);
                                      
            this.muestras.forEach(function(m) {
                  if (m.SUP_SUBPARCELA < pow_p_3 || m.SUP_SUBPARCELA > pow_p_85) {
                    m.Incluida = false; m.isSelected = true;
                  }
            });
            
            return { 'p3' : pow_p_3, 'p85' : pow_p_85 };
        }
        
        //Evalua si el residuoLOG de las muestras estan incluidas entre el OUTLET inferior y superior.
        calculoValorService.prototype.evaluaRegression = function (configRegression){
          
          regressionService.getCalculateRegression(configRegression);
          
          configRegression.data.forEach(function(m) {
                if (m.residuosLOG > configRegression.outlets.superior || m.residuosLOG < configRegression.outlets.inferior) {
                  m.Incluida = false;
                }
          });
          
          return { 'OUTLET_INF' : configRegression.outlets.inferior, 'OUTLET_SUP' : configRegression.outlets.superior };
        }
        
        //Aplica filtro para obtener las muestras incluyentes y excluyentes
        calculoValorService.prototype.applyFilterMuestras = function () {
            var muestrasExcl = [];

            for (var i = 0, len = this.muestras.length; i < len; i++) {
                var reg = this.muestras[i]
                if (reg.Incluida === false) {
                    muestrasExcl.push(reg);
                }
            }
            this.muestras = this.muestras.filter(function (reg) { return reg.Incluida })

            return {
                nroIncluidas: this.muestras.length,
                Excluidas: muestrasExcl,
                nroExcluidas: muestrasExcl.length
            };
        }

        /*** Métodos Secundarios del cálculo **/

        calculoValorService.prototype.calculateValorMedio = function (collection, column) {
            return collection.reduce(function (acumulate, item)
            { return acumulate + item[column]; }, 0) / collection.length;
        }

        calculoValorService.prototype.calculateValorMediana = function (collection, column) {
            return ss.median(collection.map(function (item) { return item[column]; }));
        }

        calculoValorService.prototype.saveResultadoPaso = function(name, content) {
          let operation = { id: name, result: content }
          this.resultValorARH.push(operation);
        }

        calculoValorService.prototype.getItemResult = function (id) {
            return this.resultValorARH.find(function (u) { return u.id === id });
        }
        
        calculoValorService.prototype.calculateNroPages = function (collection, pagination) {
            let nroPages = Math.ceil(collection / pagination),
                pages = [], current = 0;

            do {
                pages.push({
                    start: current * pagination,
                    end: (current + 1) === nroPages ?
                             collection % pagination : (current + 1) * pagination
                });
                current++;
            } while (current < nroPages)
            return pages;
        }

      return calculoValorService; 
    };
    
    angular
	  .module('app')
	  .factory('calculoValorService', service);

    service.$inject = ['$timeout','regressionService'];
})();