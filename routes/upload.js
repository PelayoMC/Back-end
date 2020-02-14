var express = require('express');
var bcrypt = require('bcryptjs');
var middleware = require('../middlewares/autenticacion');
var app = express();


var Usuario = require('../models/usuario');

// ================================================
// (GET) Obtener listado de usuarios
// ================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email imagen rol').exec(
        (err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Usuarios',
                    usuarios: users
                });
            }
        })
});

module.exports = app;