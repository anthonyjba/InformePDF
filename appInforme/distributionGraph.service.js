(function () {
    'use strict';

    function service($timeout) {

        const bgColor1 = 'rgba(150, 150, 150, 1)';
        const bgColor2 = 'rgba(220, 220, 220,1)';
        const bgColorBarFilter = 'rgb(0,128,0)';

        ////////////////////////////////////////////////////////////////////////
        // public API
        var rs = {
            /*Getters*/
            render: render,
            highlightBars: highlightBars,
        };
        return rs;

        // MÉTODOS SERVICIO //

        function render(div, config) {
            var el = document.getElementById(div);
            if (!el)
                throw new Error('Distribution Graph div element not found.');

            if (!config.dataLine || !config.dataBars || !config.filterBars)
                throw new Error('No Distribution data elements found!!');


            var chartConfig = {
                data: {

                    datasets: [
                    {
                        type: 'line',
                        label: 'Distribución Superficie',
                        backgroundColor: bgColor1,
                        yAxisID: "y-axis-1",
                        data: config.dataLine
                    },
                     {
                         type: 'linearBar',
                         label: 'Numero Muestras',
                         yAxisID: "y-axis-2",

                         backgroundColor: bgColor2,
                         borderWidth: 1,
                         width: 6,
                         data: config.dataBars
                     },
                    {
                        type: "linearBar",
                        label: "Filtro No Representativas",
                        yAxisID: "y-axis-2",
                        backgroundColor: bgColorBarFilter,
                        borderWidth: 1,
                        width: 3,
                        data: config.filterBars
                    }
                    ]
                },
                options: {
                    responsive: true,
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                                if (datasetLabel == 'Numero Muestras') {
                                    return datasetLabel + ': ' + tooltipItem.yLabel;
                                }
                                return null;
                            },
                            title: function (tooltipItem, data) {
                                return null;
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            type: "linear",
                            display: true,
                            position: 'bottom',
                            scaleLabel: {
                                display: true, labelString: "Metros cuadrados"
                            },
                            ticks: {
                                fontSize: 11,
                                callback: function (value) {
                                    return (value * value)
                                },
                                autoSkip: false
                            }
                        }],
                        yAxes: [
                            {
                                type: "linear",
                                display: false,
                                id: 'y-axis-1',
                                ticks: {
                                    beginAtZero: true
                                }

                            },
                            {
                                type: "linear",
                                display: true,
                                id: 'y-axis-2',
                                ticks: {
                                    beginAtZero: true
                                },
                                scaleLabel: {
                                    display: true, labelString: "Número de muestras"
                                },

                            }
                        ]
                    },
                }
            };



            var ctx = document.getElementById(div).getContext("2d");
            var dist = new Chart(ctx, chartConfig);



            return dist;
        }

        function highlightBars(objDist, collection) {

            var dataBarsResaltadas = [];

            var barrasMixto = objDist.chart.config.data.datasets[1].data;
            barrasMixto.forEach(function (barra) {
                
                // saco las filas seleccionadas de la tabla que caigan dentro de esta barra
                var supAnterior = Math.pow(barra.x1, 2);
                var supPosterior = Math.pow(barra.x2, 2);
                var muestrasEnBarra = collection.filter(function (muestra) {
                    return muestra.SUP_SUBPARCELA < supPosterior && muestra.SUP_SUBPARCELA > supAnterior;
                });
                var newBarra = { x: barra.x, y: muestrasEnBarra.length };
                dataBarsResaltadas.push(newBarra);
            });

            var nuevoDataset = {
                type: 'linearBar',
                label: 'Muestras No Representativas',
                yAxisID: "y-axis-2",
                backgroundColor: '#E5972F',
                borderWidth: 2,
                width: 5,
                data: dataBarsResaltadas
            };

            objDist.chart.config.data.datasets.push(nuevoDataset);

            objDist.update();
        }

    };

    angular
	  .module('app')
	  .factory('distributionService', service);

    service.$inject = ['$timeout'];

})();