var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jsonwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioObtenido) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioObtenido) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas: [' + body.email + '] - email',
                errors: { message: 'Email incorrecto' }
            });
        }
        if (!bcrypt.compareSync(body.contraseña, usuarioObtenido.contraseña)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas: [' + body.contraseña + '] - contraseña',
                errors: { message: 'Contraseña incorrecta' }
            });
        }
        var token = jsonwt.sign({ usuario: usuarioObtenido }, SEED, { expiresIn: 14400 }); // 4h
        res.status(200).json({
            ok: true,
            mensaje: 'Login correcto del usuario',
            usuario: usuarioObtenido,
            token: token,
            id: usuarioObtenido.id
        });

    });
});





module.exports = app;