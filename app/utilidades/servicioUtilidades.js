(function () {
	'use strict';

	

	function service(dictionaryService) {

		////////////////////////////////////////////////////////////////////////
		// public API
	    var ms = {
	        redondeo2decimales: redondeo2decimales,
	        decompressJson: decompressJson,
            compressJson: compressJson,
            getItem: getItem,
            getParameterByName : getParameterByName,
            padLeft: padLeft,
            generarCodigoMunicipio: generarCodigoMunicipio,
            convertToCSV: ConvertToCSV,
            csvJSON: csvJSON,
            busquedaValor: busquedaValor
		};
		return ms;

		////////////////////////////////////////////////////////////////////////
		// Funciones Publicas		

		//function convertToCSV(array) {
		//    var str = '';		        
		//    for (var i = 0; i < array.length; i++) {
		//        var line = array[i].toString();
		//        str += line + '\r\n';		            
		//    }
		//    return str;
		//};

		/*function ConvertToCSV(objArray, filtroCampos) {
		    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
		    var str = '';
		    var cabeceraGenerada = false;

		    for (var i = 0; i < array.length; i++) {

		        var line = '';

		        if (!cabeceraGenerada) {
		            for (var index in array[i]) {
		                if (filtroCampos(index)) {
		                    if (mapeo_campos_csv_muestras[index])
		                        index = mapeo_campos_csv_muestras[index];
		                    line += index + ',';
		                }
		                    
		            }
		            str += line + '\r\n';
		            cabeceraGenerada = true;
		        }

		        var line = '';

		        for (var index in array[i]) {
		            if (filtroCampos(index)) {
		                if (line != '') line += ','
		                var value = array[i][index];
		                if (!value)
		                    value = '';
		                line += value;
		            }
		        }

		        str += line + '\r\n';
		    }

		    return str;
		}*/




		function ConvertToCSV(objArray, filtroCampos, camposString, camposTrad) {
		    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
		    var str = '';
		    
            //Array de claves            
		    var campos = Object.keys(objArray[0]);


		    //Generacion de cabecera
		    var line = '"' + campos[0] + '"';
            

		    for (var j = 1; j < campos.length; j++) {
		        var index = campos[j];
		        if (!filtroCampos || filtroCampos(index)) {
		            if (mapeo_campos_csv_muestras[index])
		                index = mapeo_campos_csv_muestras[index];
		            line += ',' + '"' + index + '"';
		        }

		    }
		    str += line + '\r\n';
            /*Lineas intermedias*/
		    for (var i = 0; i < array.length-1; i++) {

		        var line = '';

		        for (var j = 0; j < campos.length; j++) {
		            var index = campos[j];
		            if (!filtroCampos || filtroCampos(index)) {
		                if (line != '') line += ','
		                var value = array[i][index];
		                if (value == undefined || value == null)
		                    value = '';

		                if (camposTrad && camposTrad.indexOf(index) != -1) {
		                    var obj = {};
		                    obj[index] = value;
		                    value = dictionaryService.translate([obj])[0][index];
		                }

		                if (camposString && camposString.indexOf(index) != -1)
		                    line += '"' + value + '"';
		                else
		                    line += value;
		            }
		        }                
                str += line + '\r\n';		        
		    }
		    /*Ultima linea */
		    var line = '';
		    for (var j = 0; j < campos.length; j++) {
		        var index = campos[j];
		        if (!filtroCampos || filtroCampos(index)) {
		            if (line != '') line += ','
		            var value = array[array.length - 1][index];
		            if (value == undefined || value == null)
		                value = '';

		            if (camposTrad && camposTrad.indexOf(index) != -1) {
		                var obj = {};
		                obj[index] = value;
		                value = dictionaryService.translate([obj])[0][index];
		            }

		            if (camposString && camposString.indexOf(index) != -1)
		                line += '"' + value + '"';
		            else
		                line += value;
		        }
		    }
		    str += line;



		    return str;
		}








		function redondeo2decimales(numero) {
			var flotante = parseFloat(numero);
			var resultado = Math.round(flotante * 100) / 100;
			return resultado;
		}
		
		function padLeft(n, width, z) {
		    z = z || '0';
		    n = n + '';
		    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}

		function generarCodigoMunicipio(idProv, idMuni) {
		    return padLeft(idProv, 2).toString().concat(padLeft(idMuni, 3).toString());
		}
		
		
		/*Nota: el caracter separador debería ser un parámetro de entrada.*/
		function csvJSON(csv) {

		    //Eliminamos las posibles comillas dobles
        var csv = csv.split('"').join('');

        var lines = csv.split("\r\n");
		  var result = [];
		  var headers=lines[0].split(",");
		  for(var i=1;i<lines.length;i++){
		      var obj = {};

		      if (lines[i].length != 0) {
		          var currentline = lines[i].split(",");
		          for (var j = 0; j < headers.length; j++) {
		              if (!isNaN(currentline[j])) {
		                  //do some thing if it's a number
		                  obj[headers[j].split('"').join('')] = parseInt(currentline[j]);
		              } else {
		                  //do some thing if it's NOT a number
		                  obj[headers[j].split('"').join('')] = currentline[j];
		              }
		          }
		          result.push(obj);
		      }
		  }
		  
		  return result; //JavaScript object
		  //return JSON.stringify(result); //JSON
		  
		} 
		
		function decompressJson(jsonComp) {

		    var json = [];
		    var campos = jsonComp[0];
		    for (var i = 1; i < jsonComp.length; i++) {
		        var reg = {};
		        var line = jsonComp[i];
		        for (var z = 0; z < campos.length; z++) {
		            reg[campos[z]] = line[z];
		        }
		        json.push(reg);
		    }
		    return json;
		}

		function compressJson(json) {
		    var jsonComp = [];
		    if (json.length > 0) {
		        var keys = Object.keys(json[0]);
		        jsonComp.push(keys);
		        for (var i = 0; i < json.length; i++) {
		            var reg = json[i];
		            var nuevoReg = [];
		            var keys = Object.keys(reg);
		            for (var k = 0; k < keys.length; k++) {
		                var valor = reg[keys[k]];
		                nuevoReg.push(valor);
		            }
		            jsonComp.push(nuevoReg);
		        }
		    }
		    return jsonComp;
		}

	    /*Realiza un filtro a un objetoJson por un atributo y un valor*/
	    function getItem(objetoJson, atributo, filtro) {
	        return objetoJson.filter(
	    		function (Objeto) {
	    		    return (Objeto[atributo] == filtro)
	    		}
	    	);
	    }

	    /*****    ******/
	    function getParameterByName(name, url) {
	        if (!url) url = window.location.href;
	        name = name.replace(/[\[\]]/g, "\\$&");
	        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
	        if (!results) return null;
	        if (!results[2]) return '';
	        return decodeURIComponent(results[2].replace(/\+/g, " "));
	    }


	    /*Devuelve el valor más cercano de los que hay en el vector a un valor*/
        /*Basado en búsqueda binaria*/
	    function busquedaValor(vector, searchElement) {

	        var minIndex = 0;
	        var maxIndex = vector.length - 1;
	        var currentIndex;
	        var currentElement;

	        while (minIndex <= maxIndex) {
	            currentIndex = (minIndex + maxIndex) / 2 | 0;
	            currentElement = vector[currentIndex];

	            if (currentElement < searchElement) {
	                minIndex = currentIndex + 1;
	            }
	            else if (currentElement > searchElement) {
	                maxIndex = currentIndex - 1;
	            }
	            else {                    
	                return vector[currentIndex];
	            }
	        }

	        return vector[currentIndex];
	    }




		
	}


    /**
	 * Servicio de Utilidades
	 */
	angular
	  .module('app')
	  .factory('servicioUtilidades', service);

	service.$inject = [
        'dictionaryService'
	];


})();