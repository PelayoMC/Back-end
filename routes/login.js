var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jsonwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;
var FRONT_URL = require('../config/config').FRONT_URL;

var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var middleware = require('../middlewares/autenticacion');

// RENOVACION TOKEN
app.get('/renuevatoken', middleware.verificaToken, (req, res) => {
    // 14400
    var token = jsonwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 });
    res.status(200).json({
        ok: true,
        token: token
    });
});


// AUTENTICACION GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        imagen: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token inválido'
            });
        });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal'
                });
            } else {
                var token = jsonwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                res.status(200).json({
                    ok: true,
                    mensaje: 'Login correcto del usuario',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.contraseña = ':)';
            usuario.email = googleUser.email;
            usuario.imagen = googleUser.imagen;
            usuario.google = true;

            usuario.save((err, usuarioDB) => {
                var token = jsonwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                res.status(200).json({
                    ok: true,
                    mensaje: 'Login correcto del usuario',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }
    });

});

// AUTENTICACION NORMAL
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
                mensaje: 'Credenciales incorrectas - email',
                errors: { message: 'Email incorrecto' }
            });
        }
        if (!bcrypt.compareSync(body.contraseña, usuarioObtenido.contraseña)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - contraseña',
                errors: { message: 'Contraseña incorrecta' }
            });
        }
        var token = jsonwt.sign({ usuario: usuarioObtenido }, SEED, { expiresIn: 14400 }); // 4h
        res.status(200).json({
            ok: true,
            mensaje: 'Login correcto del usuario',
            usuario: usuarioObtenido,
            token: token,
            id: usuarioObtenido._id
        });

    });
});

app.post('/emailReset', (req, res) => {
    var body = req.body;
    console.log(body.email);

    Usuario.findOne({ email: body.email }, (err, usuarioObtenido) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        var transporter = nodemailer.createTransport({
            service: 'Outlook365',
            port: 465,
            auth: {
                user: 'UO250985@uniovi.es',
                pass: 'elchulo14_'
            }
        });
        var mailOptions = {
            to: usuarioObtenido.email,
            from: 'UO250985@uniovi.es',
            subject: 'Reset de contraseña',
            text: 'Mensaje para resetear la contraseña\n\n' +
                'Haz click en el siguiente link para blablablabla\n\n' +
                FRONT_URL + 'reset/' + usuarioObtenido._id + '\n\n' +
                'Si no has solicitado esto no te rayes makinón.\n'
        };
        transporter.sendMail(mailOptions, (err, info) => {
            res.status(200).json({
                ok: true,
                mensaje: 'Mensaje enviado al destinatario',
                usuario: usuarioObtenido.email
            });
        });

    });
});

module.exports = app;