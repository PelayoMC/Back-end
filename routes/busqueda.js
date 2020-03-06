var express = require('express');
var app = express();

var Receta = require('../models/receta');
var Usuario = require('../models/usuario');

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
    var regular = new RegExp(busqueda, 'i');

    var promesa;

    switch (coleccion) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regular);
            break;
        case 'receta':
            promesa = buscarRecetas(busqueda, regular);
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
                coleccion: data
            });
        }
    });
});



function buscarUsuarios(busqueda, regex) {
    if (!busqueda) {
        return new Promise((resolve, reject) => {
            Usuario.find({}, 'nombre email imagen rol').exec((err, users) => {
                if (err) {
                    reject('Error al cargar los usuarios', err);
                } else {
                    resolve(users);
                }
            });
        });
    }
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
    if (!busqueda) {
        return new Promise((resolve, reject) => {
            Receta.find({}, (err, recetas) => {
                if (err) {
                    reject('Error al cargar las recetas', err);
                } else {
                    resolve(recetas);
                }
            });
        });
    }
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