var express = require('express');
//var bcrypt = require('bcryptjs');
//var middleware = require('../middlewares/autenticacion');
var app = express();

var Receta = require('../models/receta');
var Usuario = require('../models/usuario');

app.get('/all/:busqueda', (req, res, next) => {

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
        })
});

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email imagen rol').or([{ nombre: regex }, { email: regex }]).exec((err, users) => {
            if (err) {
                reject('Error al cargar los usuarios', err);
            } else {
                resolve(users);
            }
        });
    });
}

function buscarRecetas(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Receta.find().or([{ nombre: regex }]).exec((err, recetas) => {
            if (err) {
                reject('Error al cargar las recetas', err);
            } else {
                resolve(recetas);
            }
        });
    });
}


module.exports = app;