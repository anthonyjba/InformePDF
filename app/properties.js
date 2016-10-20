var fechaMuestras = '27/05/2016';
var urlAValor = 'http://svintranet/analizarustica/AVALOR/login.html';

/**********Variables para el ámbito (Mover a CubeService) *********/
var ambito_ARH = 'ARH';
var ambito_Municipio = 'Municipios';
var ambito_Provincia = 'Provincias';
var ambito_Regiones = 'Regiones';
var ambito_campo_REGION = 'COD_CCAA_INE';


/************ CAMPOS CLAVE DEL CUBO  (DIMENSIONES*) (Mover a CubeService) *******************************/
var CamposClave =
{
    campo_TipoExplotacion : { Id: "EXPL", Label: "Tipo de explotación"},
    campo_TipoCultivo : {Id: "AC", Label: "Tipo de cultivo" },
    campo_ANIO_EFECTO: { Id: 'EFEC', Label: "Año de efecto" },
    campo_ANIO_ASIGNACION: { Id: 'AESTA', Label: "Año de asignación de estado"},
    campo_MES_EFECTO : {Id: "MEFE", Label: "Mes de efecto" },
    campo_ANIO_IAMIR : {Id: 'IAMI', Label: "Año IAMIR" },
    campo_ARH : {Id: 'ARH', Label: 'ARH' },
    campo_CLASIF_SUPERF_SUBPARC : {Id: 'CLAS', Label: 'Clasif. Superficie subparcela'},
    campo_COD_CCAA_INE : {Id: 'CCAA', Label: 'Región' },
    campo_COD_DELEGACION_CATASTRO : {Id: 'DELE', Label: 'Delegación catastro'},
    campo_COD_GERENCIA_CATASTRO : {Id: 'GERE', Label: 'Gerencia catastro'},
    campo_MUNICIPIO : {Id: 'MUNI', Label: 'Municipio'},
    campo_PROVINCIA : {Id: 'PROV', Label: 'Provincia'},
    campo_ID_ESTADO : {Id: 'ESTA', Label: 'Estado'},
    campo_ID_MOTIVO_ESTADO : {Id: 'MOTV', Label: 'Motivo estado'},
    campo_incluidoIAMIR : {Id: 'INCI', Label: 'Incluido IAMIR'},
    campo_incluidoVBASICO : {Id: 'INCV', Label: 'Incluido valor básico'},
    campo_origen: { Id: "ORIG", Label: 'Origen' },
}

// Para acceder al ID directamente poniendo el nombre del campo
for (var c in CamposClave) {
    window[c] = CamposClave[c].Id;
}

/************ DIMENSIONES DEPENDIENTES (Mover a CubeService) *******************************/
var dimensionesDependientes = {
    'AC': ["EXPL"],    
    'PROV': ["CCAA"],
    'MEFE': ["EFEC"],
    'MUNI': ["PROV"],
    'MOTV': ["AESTA"]
    //'PROV': ["CCAA", "MUN"]
};
/************RATIOS CUBO (Mover a CubeService) *******************************/
var CamposRatio = {
    ratio_MED_SUPERFICIE: { Id: 'MSUP', Label: 'Media de superficies', Unidad: 'Metros cuadrados'},
    ratio_MED_SUPERFICIE_SUBPARCE: {Id: 'MSSUB', Label: 'Mediana superficies de subparcelas', Unidad: 'Metros cuadrados'},
    ratio_MED_VALOR_CALCULADO: {Id: 'MVCAL', Label: 'Media valores calculados', Unidad: "Euros"},
    ratio_MED_VALOR_CALCULADO_SUBPARCE: {Id: 'MVCALS', Label: 'Media valores calculados de subparcelas', Unidad: 'Euros'},
    ratio_MED_VALOR_TRANS_SUBPARC: { Id: 'MVTRAS', Label: 'Media valores de transmisión de subparecelas', Unidad: 'Euros' },
    ratio_MED_V_CATASTRAL: { Id: 'MVCAT', Label: 'Media valores catastrales', Unidad: 'Euros' },
    ratio_MED_V_CATASTRAL_SUBPARCE: { Id: 'MVCATS', Label: 'Media valores catastrales de subparcelas', Unidad: 'Euros' },
    ratio_MED_V_TRAN: { Id: 'MVTRA', Label: 'Media valores de transmisión', Unidad: 'Euros' },
    ratio_N_MUESTRAS: { Id: 'NMUE', Label: 'Número de muestras', Unidad: 'Nº de muestras' },
    ratio_N_SUBPARCELAS: { Id: 'NSUB', Label: 'Número de subparcelas', Unidad: 'Nº de subparcelas' },
    ratio_SUM_SUPERFICIE: { Id: 'SSUP', Label: 'Suma de superficies', Unidad: 'Metros cuadrados' },
    ratio_SUM_SUPERFICIE_SUBPARCE: { Id: 'SSSUB', Label: 'Suma superficies de subparcelas', Unidad: 'Metros cuadrados' },
    ratio_SUM_VALOR_CALCULADO: { Id: 'SVCAL', Label: 'Suma valores calculados', Unidad: 'Euros' },
    ratio_SUM_VALOR_CALCULADO_SUBPARCE: { Id: 'SVCALS', Label: 'Suma valores calculados de subparcelas', Unidad: 'Euros' },
    ratio_SUM_VALOR_TRANS_SUBPARC: { Id: 'SVTRAS', Label: 'Suma valores de transmisión de subparcelas', Unidad: 'Euros' },
    ratio_SUM_V_CATASTRAL: { Id: 'SVCAT', Label: 'Suma valores catastrales', Unidad: 'Euros' },
    ratio_SUM_V_CATASTRAL_SUBPARCE: { Id: 'SVCATS', Label: 'Suma valores catastrales de subparcelas', Unidad: 'Euros' },
    ratio_SUM_V_TRAN: { Id: 'SVTRA', Label: 'Suma valores de transmisión', Unidad: 'Euros' }
}

// Para acceder al ID directamente poniendo el nombre del campo
for (var c in CamposRatio) {
    window[c] = CamposRatio[c].Id;
}


/*******FILTROS ESTÁTICOS (Mover a CubeService)*************/
var filtradoEstatal_nuncaCambia = {
    'AC':   { "valor": null, "condicion": true },
    'EFEC': { "valor": null, "condicion": true },
    'AESTA': { "valor": null, "condicion": true },
    'MEFE': { "valor": null, "condicion": true },
    'IAMI': { "valor": null, "condicion": true },
    'ARH':  { "valor": null, "condicion": true },
    'CLAS': { "valor": null, "condicion": true },
    'CCAA': { "valor": null, "condicion": true },
    'DELE': { "valor": null, "condicion": true },
    'GERE': { "valor": null, "condicion": true },
    'MUNI': { "valor": null, "condicion": true },
    'PROV': { "valor": null, "condicion": true },
    //'ESTA': { "valor": null, "condicion": true },
    'MOTV': { "valor": null, "condicion": true },
    'INCI': { "valor": null, "condicion": true },
    'INCV': { "valor": null, "condicion": true },
    'ORIG': { "valor": null, "condicion": true },
    'EXPL': { "valor": null, "condicion": true }
};
/*************FILTRO ESTATICO PARA LOS DATOS GENERALES*************/



var filtradoEstatal = {
    'AC':   { "valor": null, "condicion": true },
    'EFEC': { "valor": null, "condicion": true },
    'AESTA': { "valor": null, "condicion": true },
    'MEFE': { "valor": null, "condicion": true },
    'IAMI': { "valor": null, "condicion": true },
    'ARH':  { "valor": null, "condicion": true },
    'CLAS': { "valor": null, "condicion": true },
    'CCAA': { "valor": null, "condicion": true },
    'DELE': { "valor": null, "condicion": true },
    'GERE': { "valor": null, "condicion": true },
    'MUNI': { "valor": null, "condicion": true },
    'PROV': { "valor": null, "condicion": true },
    //'ESTA': { "valor": null, "condicion": true },
    'MOTV': { "valor": null, "condicion": true },
    'INCI': { "valor": null, "condicion": true },
    'INCV': { "valor": null, "condicion": true },
    'ORIG': { "valor": null, "condicion": true },
    'EXPL': { "valor": null, "condicion": true }
};


var filtradoARH = {
    'AC':   { "valor": null, "condicion": true },
    'EFEC': { "valor": null, "condicion": true },
    'AESTA': { "valor": null, "condicion": true },
    'MEFE': { "valor": null, "condicion": true },
    'IAMI': { "valor": null, "condicion": true },
    'ARH':  { "valor": null, "condicion": false}, //aqui//
    'CLAS': { "valor": null, "condicion": true },
    'CCAA': { "valor": null, "condicion": true },
    'DELE': { "valor": null, "condicion": true },
    'GERE': { "valor": null, "condicion": true },
    'MUNI': { "valor": null, "condicion": true },
    'PROV': { "valor": null, "condicion": true },
    //'ESTA': { "valor": null, "condicion": true },
    'MOTV': { "valor": null, "condicion": true },
    'INCI': { "valor": null, "condicion": true },
    'INCV': { "valor": null, "condicion": true },
    'ORIG': { "valor": null, "condicion": true },
    'EXPL': { "valor": null, "condicion": true }
};



var filtradoNivelDetalle = {
    'AC':   { "valor": null, "condicion": true },
    'ARH':  { "valor": null, "condicion": true },
    'EFEC': { "valor": null, "condicion": true },
    'EXPL': { "valor": null, "condicion": true },
    'INCV': { "valor": null, "condicion": true },
    'ORIG': { "valor": null, "condicion": true },
    'PROV': { "valor": null, "condicion": true },
    'MUNI': { "valor": null, "condicion": true }

};



var fuentesComplementarias = {
    1: '<div>Fuentes complementarias para productos inmobiliarios sin mercado o para contraste y comprobación de los valores básicos:<div style="margin-left:25px">- Estudio de Mercado de Bienes Inmuebles Rusticos de la Comunidad Autónoma de Andalucía contratado por la Delegación Especial de Economía y Hacienda de Andalucía con las Universidades Politécnica de Valencia, de Córdoba y de Jaén (Expte. 03RU02EM411) cuyos resultados finales fueron presentados en 2004.<br>- Precios medios de mercado para estimar el valor real de Inmuebles Rusticos publicados en la Orden de 27 de octubre de 2011 de la Consejería de Hacienda y Administración Publica de la Junta de Andalucía.</div>',
    2: '<div>Fuente complementaria para productos inmobiliarios sin mercado: El conocimiento del Ponente y técnicos de Catastro, de la relación de precios de AC de valores estimados, con precios de AC, de valores calculados</div>',
    3: '<div>Fuentes complementarias para productos inmobiliarios sin mercado o para contraste y comprobación de los valores básicos:</div>' 
        +'<div style="margin-left: 25px;>Para el cálculo del valor de las viñas de secano (VIS) se han considerado la'
        +'ORDEN HAP/2222/2014, de 27 de noviembre, por la que se desarrollan para el'
        +'año 2015 el método de estimación objetiva del IRPF y el régimen especial'
        +'simplificado del IVA y la ORDEN AAA/39/2015, de 14 de enero, por la que se'
        +'definen los bienes, los rendimientos asegurables, las condiciones técnicas'
        +'mínimas de cultivo, el ámbito de aplicación, los periodos de garantía, las fechas'
        +'de suscripción y los precios unitarios del seguro con coberturas crecientes para'
        +'explotaciones vitícolas en la Península y las Illes Balears, comprendido en el'
        + 'Plan 2015 de Seguros Agrarios Combinados.</div>',



4: "Illes Balears",
5: "Canarias",
6: "Cantabria",
7: "Castilla-La Mancha",
8: "Castilla y León",
9: "Cataluña/Catalunya",
10: "Extremadura",
11: "Galicia",
12: "Comunidad de Madrid",
13: "Región de Murcia",
16: "La Rioja",
17: "Comunitat Valenciana",
18: "Ciudad Autónoma de Ceuta",
19: "Ciudad Autónoma de Melilla"





};




//Array de valores circular.
var valoresCircular = [
100,
150,
200,
250,
300,
350,
400,
450,
500,
550,
600,
650,
700,
750,
800,
850,
900,
950,
1000,
1050,
1100,
1160,
1220,
1280,
1340,
1410,
1480,
1550,
1630,
1710,
1800,
1890,
1980,
2080,
2180,
2290,
2410,
2530,
2650,
2790,
2930,
3070,
3230,
3390,
3560,
3730,
3920,
4120,
4320,
4540,
4760,
5000,
5250,
5520,
5790,
6080,
6390,
6700,
7040,
7390,
7760,
8150,
8560,
8990,
9430,
9910,
10400,
10920,
11470,
12040,
12950,
13900,
14950,
16100,
17300,
18600,
20000,
21450,
23100,
24800,
26700,
28700,
30850,
33150,
35650,
39200,
43200,
47400,
52200,
57400,
63200,
69400,
76400,
84000,
92400,
101600,
111800,
123000,
135200,
148800,
163800,
180000,
198000,
217800,
239600];
















































   