var express = require('express');
var app = express();

var Receta = require('../models/receta');
var Usuario = require('../models/usuario');
var Ingrediente = require('../models/ingrediente');
var Intolerancia = require('../models/intolerancia');

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

app.get('/:coleccion/:busqueda?', (req, res, next) => {

    var coleccion = req.params.coleccion;
    var busqueda = req.params.busqueda;
    var from = req.query.from || 0;
    var limit = req.query.limit || 7;
    from = Number(from);
    limit = Number(limit);
    var regular = new RegExp(busqueda, 'i');

    var promesa;

    switch (coleccion) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regular, from, limit);
            break;
        case 'receta':
            promesa = buscarRecetas(busqueda, regular, from, limit);
            break;
        case 'ingrediente':
            promesa = buscarIngredientes(busqueda, regular, from, limit);
            break;
        case 'intolerancia':
            promesa = buscarIntolerancias(busqueda, regular, from, limit);
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



function buscarUsuarios(busqueda, regex, from, limit) {
    if (!busqueda) {
        return new Promise((resolve, reject) => {
            Usuario.find({}, 'nombre email imagen rol').skip(from)
                .limit(limit).sort('email').exec((err, users) => {
                    if (err) {
                        reject('Error al cargar los usuarios', err);
                    } else {
                        Usuario.countDocuments().exec((err, total) => {
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

function buscarRecetas(busqueda, regex, from, limit) {
    if (!busqueda) {
        return new Promise((resolve, reject) => {
            Receta.find({}).skip(from)
                .limit(limit).sort('nombre').exec((err, recetas) => {
                    if (err) {
                        reject('Error al cargar las recetas', err);
                    } else {
                        Receta.countDocuments().exec((err, total) => {
                            if (err) {
                                reject('Error al contar las recetas', err);
                            } else {
                                resolve([recetas, total]);
                            }
                        });
                    }
                });
        });
    }
    return new Promise((resolve, reject) => {
        Receta.find().or([{ nombre: regex }]).skip(from)
            .limit(limit).sort('nombre').exec((err, recetas) => {
                if (err) {
                    reject('Error al cargar las recetas', err);
                } else {
                    Receta.countDocuments().or([{ nombre: regex }]).exec((err, total) => {
                        if (err) {
                            reject('Error al contar las recetas', err);
                        } else {
                            resolve([recetas, total]);
                        }
                    });
                }
            });
    });
}

function buscarIngredientes(busqueda, regex, from, limit) {
    if (!busqueda) {
        return new Promise((resolve, reject) => {
            Ingrediente.find({}).skip(from)
                .limit(limit).sort('nombre').exec((err, ingredientes) => {
                    if (err) {
                        reject('Error al cargar los ingredientes', err);
                    } else {
                        Ingrediente.countDocuments().exec((err, total) => {
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
    return new Promise((resolve, reject) => {
        Ingrediente.find().or([{ nombre: regex }]).skip(from)
            .limit(limit).sort('nombre').exec((err, ingredientes) => {
                if (err) {
                    reject('Error al cargar los ingredientes', err);
                } else {
                    Ingrediente.countDocuments().or([{ nombre: regex }]).exec((err, total) => {
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

function buscarIntolerancias(busqueda, regex, from, limit) {
    if (!busqueda) {
        return new Promise((resolve, reject) => {
            Intolerancia.find({}).skip(from)
                .limit(limit).sort('nombre').exec((err, intolerancias) => {
                    if (err) {
                        reject('Error al cargar las intolerancias', err);
                    } else {
                        Intolerancia.countDocuments().exec((err, total) => {
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
    return new Promise((resolve, reject) => {
        Intolerancia.find().or([{ nombre: regex }]).skip(from)
            .limit(limit).sort('nombre').exec((err, intolerancias) => {
                if (err) {
                    reject('Error al cargar las intolerancias', err);
                } else {
                    Intolerancia.countDocuments().or([{ nombre: regex }]).exec((err, total) => {
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


module.exports = app;