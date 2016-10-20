(function () {
    'use strict';
    
    function service($timeout, regressionService) {

        var calculoValorService = function(muestrasARH, percentilARH) {
            this.resultValorARH = [];
            this.muestras = muestrasARH;
            this.percentil = percentilARH;
        }
        
        
        /**** public functions */
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
                VALOR_MEDIO : this.calculateValorMedio(this.muestras,'VTRAS_SUP')
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
          
            // *** Paso 3: Filtro Regresión ******
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
                          
                this.saveResultadoPaso("REGRESSION", 
                {
                    TOT_NRO_MUESTR: mf.nroIncluidas + mf.nroExcluidas,
                    NRO_MUESTR_INC : mf.nroIncluidas, 
                    NRO_MUESTR_EXC : mf.nroExcluidas,
                    FILTER : filtroPasoActual,
                    VALOR_MEDIO : this.calculateValorMedio(this.muestras,'VTRAS_SUP'),
                });
            }

          mf = null;                          
          
          return this.resultValorARH; 
        };
        
        calculoValorService.prototype.calculateNroPages = function (collection, pagination){
          let nroPages = Math.ceil(collection / pagination),
              pages = [],current=0;
          
          do{
            pages.push({ start : current * pagination, 
                         end : (current + 1) === nroPages ? 
                                  collection % pagination : (current + 1) * pagination
                       });
            current++;
          }while(current < nroPages)
          return pages;
        }
        
        calculoValorService.prototype.calculateValorMedio = function (collection, column){
          return collection.reduce(function (total, m) 
                { return total + m[column]; },0) / collection.length;
        }
        
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
        
        calculoValorService.prototype.applyFilterMuestras = function (){
            var muestrasExcl = [];            
            
            for (var i = 0, len = this.muestras.length; i < len; i++) {
              var reg = this.muestras[i]
              if(reg.Incluida === false){
                 muestrasExcl.push(reg);
              }
            }
            this.muestras = this.muestras.filter(function (reg) { return reg.Incluida })
            
            return { nroIncluidas : this.muestras.length, 
                     Excluidas : muestrasExcl,
                     nroExcluidas : muestrasExcl.length };
        }
        
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
        
        calculoValorService.prototype.evaluaRegression = function (configRegression){
          
          regressionService.getCalculateRegression(configRegression);
          
          configRegression.data.forEach(function(m) {
                if (m.residuosLOG > configRegression.outlets.superior || m.residuosLOG < configRegression.outlets.inferior) {
                  m.Incluida = false;
                }
          });
          
          return { 'OUTLET_INF' : configRegression.outlets.inferior, 'OUTLET_SUP' : configRegression.outlets.superior };
        }
        
        calculoValorService.prototype.saveResultadoPaso = function(name, content) {
          let operation = { id: name, result: content }
          this.resultValorARH.push(operation);
        }

        //To get the item result
        calculoValorService.prototype.getItemResult = function (id) {
            return this.resultValorARH.find(function (u) { return u.id === id });
        }
        
        
        
        
      return calculoValorService; 
    };
    
    angular
	  .module('app')
	  .factory('calculoValorService', service);

    service.$inject = ['$timeout','regressionService'];
})();