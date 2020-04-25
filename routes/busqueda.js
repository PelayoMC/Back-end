var express = require('express');
var app = express();

var Receta = require('../models/receta');
var Usuario = require('../models/usuario');
var Ingrediente = require('../models/ingrediente');
var Intolerancia = require('../models/intolerancia');
var Etiqueta = require('../models/etiqueta');

app.get('/all/:busqueda?', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // i es para que sea insensible a mayus y minus
    var regular = new RegExp(busqueda, 'i');

    Promise.all([buscarUsuarios(busqueda, regular), buscarRecetas(busqueda, regular)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                mensaje: 'Resultados',
                usuarios: respuestas[0],
                recetas: respuestas[1]
            });
        });
});

app.post('/:coleccion/:busqueda?', (req, res, next) => {

    var coleccion = req.params.coleccion;
    var busqueda = req.params.busqueda;
    var etiquetas = req.body.etiquetas;
    var intolerancias = req.body.intolerancias;
    var from = req.query.from || 0;
    var limit = req.query.limit || 7;
    from = Number(from);
    limit = Number(limit);
    var regular = new RegExp(busqueda, 'i');

    var promesa;

    switch (coleccion) {
        case 'usuario':
            promesa = buscarUsuarios(regular, from, limit);
            break;
        case 'receta':
            promesa = buscarRecetas(regular, etiquetas, intolerancias, from, limit);
            break;
        case 'ingrediente':
            promesa = buscarIngredientes(regular, etiquetas, intolerancias, from, limit);
            break;
        case 'intolerancia':
            promesa = buscarIntolerancias(regular, etiquetas, from, limit);
            break;
        case 'etiqueta':
            promesa = buscarEtiquetas(regular, from, limit);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'La colección especificada es incorrecta: Utilice [usuario] o [receta]',
                error: { message: 'Tipo de colección inválido' }
            });
    }

    promesa.then(data => {
        if (data.length == 0) {
            res.status(404).json({
                ok: false,
                mensaje: 'No se ha encontrado ningún valor para la colección indicada',
                error: { message: 'No se han encontrado resultados en la colección: [' + coleccion + '] para el término: [' + busqueda + ']' }
            });
        } else {
            res.status(200).json({
                ok: true,
                coleccion: data[0],
                total: data[1]
            });
        }
    }).catch(err => {
        res.status(404).json({
            ok: false,
            mensaje: err
        });
    });
});



function buscarUsuarios(regex, from, limit) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email imagen rol').or([{ nombre: regex }, { email: regex }])
            .skip(from)
            .limit(limit).sort('email').exec((err, users) => {
                if (err) {
                    reject('Error al cargar los usuarios', err);
                } else {
                    Usuario.countDocuments().or([{ nombre: regex }, { email: regex }]).exec((err, total) => {
                        if (err) {
                            reject('Error al contar los usuarios', err);
                        } else {
                            resolve([users, total]);
                        }
                    });
                }
            });
    });
}

function buscarRecetas(regex, etiquetas, intolerancias, from, limit) {
    var condiciones = conditionsNoRegex(etiquetas, intolerancias);
    return new Promise((resolve, reject) => {
        Ingrediente.find().and(condiciones)
            .exec((err, ig) => {
                if (err) {
                    reject('Error al filtrar los ingredientes', err);
                } else {
                    Receta.find().and([{ nombre: regex }, { 'ingredientes.nombre': { '$in': ig.map(el => el.nombre) } }])
                        .skip(from)
                        .limit(limit)
                        .exec((err, recetas) => {
                            if (err) {
                                reject('Error al filtrar las recetas', err);
                            } else {
                                Receta.countDocuments().and([{ nombre: regex }, { 'ingredientes.nombre': { '$in': ig.map(el => el.nombre) } }])
                                    .skip(from)
                                    .limit(limit)
                                    .exec((err, total) => {
                                        if (err) {
                                            reject('Error al contar las recetas', err);
                                        } else {
                                            resolve([recetas, total]);
                                        }
                                    });
                            }
                        });
                }
            });
    });
}

function buscarIngredientes(regex, etiquetas, intolerancias, from, limit) {
    var condiciones = conditions(regex, etiquetas, intolerancias);
    return new Promise((resolve, reject) => {
        Ingrediente.find().and(condiciones).skip(from)
            .limit(limit).sort('nombre').exec((err, ingredientes) => {
                if (err) {
                    reject('Error al cargar los ingredientes', err);
                } else {
                    Ingrediente.countDocuments().and(condiciones).exec((err, total) => {
                        if (err) {
                            reject('Error al contar los ingredientes', err);
                        } else {
                            resolve([ingredientes, total]);
                        }
                    });
                }
            });
    });
}

function buscarIntolerancias(regex, etiquetas, from, limit) {
    var condiciones = conditions(regex, etiquetas, []);
    return new Promise((resolve, reject) => {
        Intolerancia.find().and(condiciones).skip(from)
            .limit(limit).sort('nombre').exec((err, intolerancias) => {
                if (err) {
                    reject('Error al cargar las intolerancias', err);
                } else {
                    Intolerancia.countDocuments().and(condiciones).exec((err, total) => {
                        if (err) {
                            reject('Error al contar las intolerancias', err);
                        } else {
                            resolve([intolerancias, total]);
                        }
                    });
                }
            });
    });
}

function buscarEtiquetas(regex, from, limit) {
    return new Promise((resolve, reject) => {
        Etiqueta.find().or([{ nombre: regex }]).skip(from)
            .limit(limit).sort('nombre').exec((err, etiquetas) => {
                if (err) {
                    reject('Error al cargar las etiquetas', err);
                } else {
                    Etiqueta.countDocuments().or([{ nombre: regex }]).exec((err, total) => {
                        if (err) {
                            reject('Error al contar las etiquetas', err);
                        } else {
                            resolve([etiquetas, total]);
                        }
                    });
                }
            });
    });
}

function conditions(regex, etiquetas, intolerancias) {
    var condiciones = [];
    var i = 0;
    condiciones[i++] = { nombre: regex };
    if (etiquetas.length > 0) {
        condiciones[i++] = { noApto: { '$all': etiquetas } };
    }
    if (intolerancias.length > 0) {
        condiciones[i++] = { noApto: { '$nin': intolerancias } };
    }
    return condiciones;
}

function conditionsNoRegex(etiquetas, intolerancias) {
    var condiciones = [];
    var i = 0;
    if (etiquetas.length > 0) {
        condiciones[i++] = { noApto: { '$all': etiquetas } };
    }
    if (intolerancias.length > 0) {
        condiciones[i++] = { noApto: { '$nin': intolerancias } };
    }
    return condiciones;
}


module.exports = app;