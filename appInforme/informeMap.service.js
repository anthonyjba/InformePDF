(function () {
    'use strict';

		
    function service($timeout) {

        const RADIUS = 6378137,
              MAX = 85.0511287798,
              RADIANS = Math.PI / 180;
              
        ////////////////////////////////////////////////////////////////////////
        // public API
        var infMap = {
            /*Getters*/
            renderMapARH: renderMapARH,
            transformToMercator : transformToMercator,
            coordinateToPoint : coordinateToPoint 
        };
        return infMap;

        // MÉTODOS SERVICIO //

        /** Render Graphic Regression
        /*  Params: 
        /*  - div : ID element DIV
        */
        function renderMapARH(div, colorMap, poblacion, colorPoblacion, muestrasInc, colorMuestraIncluidas, muestrasExc, colorMuestraExcluidas) {
            var w = 600, h = 350;            
            var el = document.getElementById(div);
            
            if (!el)
                throw new Error('Regression Graph div element not found.');
            
            /**CANVAS**/
            var canvas = d3.select("#" + div).append("canvas")
            .attr("width", w)
            .attr("height", h);
            
            var context = canvas.node().getContext("2d");
            
            var projection = d3.geo.mercator()
                .scale(1)
                .translate([0, 0]);
            var path = d3.geo.path()
                .projection(projection)
                .context(context);
                //.pointRadius(1.5);
            
            var b = path.bounds(geojsonObject4),
                s = 1 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h), //.95 en vez de 1 caso de margin
                t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];
            
            projection.scale(s)
                .translate(t);
            
            var geoBounds = d3.geo.bounds(geojsonObject4),
               SW = transformToMercator(geoBounds[0][1],geoBounds[0][0]),
               NE = transformToMercator(geoBounds[1][1],geoBounds[1][0]),
               geoBoundsWidth = NE.x - SW.x,
               geoBoundsHeight = NE.y - SW.y;

            infMap.bounds = {xMin: SW.x, xMax: NE.x, yMin: SW.y, yMax: NE.y };
            
            //*** Set the scale *** importante
            var xScale = w / geoBoundsWidth;
            var yScale = h / geoBoundsHeight;
            infMap.scale = (xScale < yScale ? xScale : yScale);

            infMap.xTrans = (geoBoundsWidth * infMap.scale - w)/2
            infMap.yTrans = (geoBoundsHeight * infMap.scale - h)/2
            /**************************/
            
            if(poblacion.length > 0 && !poblacion[0].hasOwnProperty('toPixel')){
              poblacion.forEach(function(d) { return d.toPixel = infMap.coordinateToPoint({ x : +d.COORX, y :+d.COORY }); });
            }
            drawPoints(poblacion, colorPoblacion, 0.8);
            
            path(geojsonObject4);
            context.fillStyle = colorMap;
            context.strokeStyle = '#000';
            context.fill();
            context.stroke();
            
            
            if(muestrasInc.length > 0 && !muestrasInc[0].hasOwnProperty('toPixel')){
              muestrasInc.forEach(function(d) { return d.toPixel = infMap.coordinateToPoint({ x : +d.COORX, y :+d.COORY }); });
            }
            drawPoints(muestrasInc, colorMuestraIncluidas, 2.5);
            
            if(muestrasExc.length > 0 && !muestrasExc[0].hasOwnProperty('toPixel')){
              muestrasExc.forEach(function(d) { return d.toPixel = infMap.coordinateToPoint({ x : +d.COORX, y :+d.COORY }); });
            }
            drawPoints(muestrasExc, colorMuestraExcluidas, 3.5);
            
            
            function drawPoints(collection, color, size){
              context.fillStyle = color;
              for(var i=0, l =collection.length; i<l; i++){
                var pixel = collection[i].toPixel;
                var cX = pixel.x , cY = pixel.y;
                  
                if ((cX >= 0 && cX <= w) && (cY >= 0 && cY <= h)) {
                  if(size > 2){
                    context.beginPath();
                    context.arc(cX, cY, size, 0, 2 * Math.PI);
                    context.fill();
                    context.closePath();
                  }
                  else
                    context.fillRect(cX, cY, size, size);
                }
              }
            }
            
            return context;    
        }
        
        function coordinateToPoint(point) {
          return {
            x: (point.x - this.bounds.xMin) * this.scale - this.xTrans,
            y: (this.bounds.yMax - point.y) * this.scale - this.yTrans
          }
        }
        
        function transformToMercator(latitude, longitude) {
          var point = {};
          
          point.x = RADIUS * longitude * RADIANS;
          point.y = Math.max(Math.min(MAX, latitude), -MAX) * RADIANS;
          point.y = RADIUS * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));

          return point;
        }    
        
    };
    
    
    
    
    
    angular
	  .module('app')
	  .factory('informeMapService', service);

    service.$inject = ['$timeout'];


})();
    