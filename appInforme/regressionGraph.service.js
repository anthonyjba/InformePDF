(function () {
    'use strict';

		
    function service($timeout) {

        const margin = { top: 20, right: 20, bottom: 30, left: 35 };
        const fillStyle = "rgba(0, 0, 0, 0.2)";
        const strokeStyle = "#fff"

        ////////////////////////////////////////////////////////////////////////
        // public API
        var rs = {
            /*Getters*/
            renderRegression: renderRegression,
            clearStyleRegression: clearStyleRegression,
            updateRegressionPoint: updateRegressionPoint,
            getCalculateRegression: getCalculateRegression, 
            getCalculateModelo : getCalculateModelo
        };
        return rs;

        // MÉTODOS SERVICIO //

        /** Render Graphic Regression
		/*  Params: 
		/*  - div : ID element DIV,
        /*  - config : { 
        /*	            - data: store Array JSON
        /*              - ejeVertical: 1 Column (Bottom)
        /*              - ejeHorizontal: 2 Column (Left) }
        */
        function renderRegression(div, config) {
            var el = document.getElementById(div);
            if (!el)
                throw new Error('Regression Graph div element not found.');

            if (!config.data)
                throw new Error('No Regression data found!!');

            var calculate = config.hasOwnProperty("calculate") ? config.calculate : true;
            var data = config.data;

            if (calculate){
              getCalculateRegression(config);
            }

            var linReg = config.linearRegression;
            var svgWidth = el.hasAttribute("width") ? +el.getAttribute("width") : 800;
            var svgHeight = el.hasAttribute("height") ? +el.getAttribute("height") : 500;

            //remove svg elements
            d3.select("#" + div).select("svg").remove();

            //create svg element
            var objectSVG = d3.select("#" + div).append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

            objectSVG.append("defs");
              //.append("link")
              //  .attr("href", "css/avalora/GraficoRegresion.css")
              //  .attr("type", "text/css")
              //  .attr("rel", "stylesheet")
              //  .attr("xmlns", "http://www.w3.org/2000/svg");

            var svg = objectSVG.append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            

            // add the tooltip area to the webpage
            var tooltip = d3.select("#" + div).append("div")
                .attr("class", "svg-tooltip")
                .style("opacity", 0);

            // draw regression graph
            var width = svgWidth - margin.left - margin.right,
			       height = svgHeight - margin.top - margin.bottom;

            var x = d3.scale.linear()
				    .range([0, width]);

            var y = d3.scale.linear()
				    .range([height, 0]);

            var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d) {
                d = Math.round(d * 100) / 100;
                if ((d / 1000) >= 1) {
                    d = d / 1000 + "K";
                }
                return d;
            });

            var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(function (d) {
                if ((d / 1000) >= 1) {
                    d = d / 1000 + "K";
                }
                return d;
            });


            x.domain(d3.extent(data, function (d) { return d.ejeH; })).nice();
            y.domain(d3.extent(data, function (d) { return d.ejeV; })).nice();
           
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "svg-label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text(config.ejeHorizontal.text);

            svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "svg-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(config.ejeVertical.text)

            svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .classed("dot", true)
            .attr("id", function (d) { return (config.type === 'LOG' ? 'F' : 'C') + d["ID_MUESTRA"]; })
            .attr("r", 2)
            .attr("cx", function (d) { return x(d.ejeH); })
            .attr("cy", function (d) { return y(d.ejeV); })
            .classed("dot-selected", function (d) { return !d.hasOwnProperty("isSelected") ? false : d.isSelected });

            var mouseEnabled = config.hasOwnProperty("mouseEnabled") ? config.mouseEnabled : true;

            if (mouseEnabled){
                svg.selectAll(".dot")
                .on("mouseover", function (d) {
                    tooltip.transition()
                         .duration(200)
                         .style("opacity", .9);
                    tooltip.html("<div class='g-rc'>Referencia: " + d["PCAT1"] + d["PCAT2"] + "</div>" + (config.type === 'LOG' ? "Log[Sp: " + Math.round(d.ejeH * 100) / 100 : "Sup: " + d.ejeH)
                      + " m², " + (config.type === 'LOG' ? "VT: " + Math.round(d.ejeV * 100) / 100 + "]" : "V.Tras: " + d.ejeV))
                         .style("left", (d3.event.offsetX + 15) + "px")
                         .style("top", (d3.event.offsetY - 45) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", function (d) {
                    config.isSelectedByRegression = true;
                    config.onClickSelected(d);
                });
            }

            //Closure to draw lines
            function drawCorrelationLine(style, max, interval) {
                var xmin = x.domain()[0];
                var ymin = y.domain()[0];
                //Cálculo para el excedentes de la línea de Regresion
                var y2min = xmin * linReg.m +linReg.b + interval;
                if (ymin > y2min) {
                    xmin = (ymin - linReg.b -interval) / linReg.m;
                };

                svg.append("svg:line")
                      .attr("class", style)
                      .attr("x1", x(xmin))
                      .attr("y1", y((xmin * linReg.m) + linReg.b + interval))
                      .attr("x2", x(max))
                      .attr("y2", y((max * linReg.m) + linReg.b + interval));
            }

            if (data.length > 0) {

                var max = d3.max(data, function (d) { return d.ejeH; });
                drawCorrelationLine("reg", max, 0);

                if (config.type === 'LOG') {

                    var out_sup = config.outlets.superior,
                        out_inf = config.outlets.inferior;

                    if (out_inf !== 0 && out_sup !== 0){
                        drawCorrelationLine("lineaInteval", max, out_sup);
                        drawCorrelationLine("lineaInteval", max, out_inf);
                    }
                   
                    d3.select("#resumenLOG").html('Log(Valor) = ' +Math.round(linReg.b * 100) / 100 + ' + ' +Math.round(linReg.m * 100) / 100 + ' * Log(Superficie) </br>' +
                        'Outlier Sup. Resid: ' +Math.round(out_sup * 10000) / 10000 + ',  Outlier Inf. Resid: ' +Math.round(out_inf * 10000) / 10000);

                }
                else {

                    //Calculo del valor medio de la regression
                    var sum_Val_Unit = 0, tot_muestr = 0;
                    data.forEach(function (d) {
                        sum_Val_Unit += (linReg.b + (linReg.m * d.ejeH)) * 10000 / d.ejeH;
                        tot_muestr++;
                    })
                    config.valorReg = sum_Val_Unit / tot_muestr;

                    //print resume values in template
                    var html = "<span style='padding-left: 10%;'>Ecuaci&oacute;n modelo:&nbsp;&nbsp;&nbsp;Valor = " +Math.round(linReg.b * 100) / 100 + " + " +Math.round(linReg.m * 100) / 100 + " * Superficie</span>";
                    d3.select("#resumenLIN").html(html);

                }

            }

        }
        
        function getCalculateRegression(config) {

            if (config.data.length === 0)
                return false;

            var lrdata = []
            config.data.forEach(function (d) {
                d.ejeH = d[config.ejeHorizontal.column];
                d.ejeV = d[config.ejeVertical.column];
                lrdata.push([+d.ejeH, +d.ejeV])
            });
            
            //Set Values of lineal Regression
            config.linearRegression = ss.linearRegression(lrdata);
            var regressionLine = ss.linearRegressionLine(config.linearRegression);
            
            //Set R cuadrado
            config.rSquared = ss.rSquared(lrdata, regressionLine);

            //Residuos LOG
            var mapResiduos = [];
            config.data.forEach(function (d) {
                d['residuos' + config.type] = Number((d.ejeV - (config.linearRegression.b + (config.linearRegression.m * d.ejeH))).toFixed(2));
                mapResiduos.push(d['residuos' + config.type]);
            });

            config.resumen_modelo = getCalculateModelo(mapResiduos, config.rSquared);

            var IQ = config.resumen_modelo.Q3 - config.resumen_modelo.Q1;
            
            //Set Outlet Values
            config.outlets = { 
              superior: config.resumen_modelo.Q3 + 1.5 * IQ, 
              inferior: config.resumen_modelo.Q1 - 1.5 * IQ 
            }; 
        }
        
        /** Calculo Resumen Modelo */
        function getCalculateModelo(mapResiduos, rSquared){
            var p_min = ss.min(mapResiduos);
            var p_25 = ss.quantile(mapResiduos, 0.25);
            var p_50 = ss.quantile(mapResiduos, 0.50);
            var p_75 = ss.quantile(mapResiduos, 0.75);
            var p_max = ss.max(mapResiduos);
          
            return { 'min': parseFloat(p_min.toFixed(2)), 'Q1': parseFloat(p_25.toFixed(2)), 'mediana': parseFloat(p_50.toFixed(2)), 'Q3': parseFloat(p_75.toFixed(2)), 'max': parseFloat(p_max.toFixed(2)), 'rSquared': parseFloat(rSquared.toFixed(2)) };
        }

        /* Clear all Points Selection
        */
        function clearStyleRegression() {
            d3.selectAll(".dot").style('fill', fillStyle);
        }

        /* Change the color style of each point 
        */
        function updateRegressionPoint(id, color) {

            function __addTransitionHighlight(id, selected) {
                d3.select(id).classed("dot-selected", selected).transition()
                    .style('stroke-width', 10)
                    .transition()
                    .duration(3000).style('stroke-width', null);
            }

            __addTransitionHighlight("#C" + id, !color ? false : true);
            __addTransitionHighlight("#F" + id, !color ? false : true);

        }

    };

    angular
	  .module('app')
	  .factory('regressionService', service);

    service.$inject = ['$timeout'];


})();