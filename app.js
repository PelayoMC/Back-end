// Requires (librerias)
var express = require('express');
var mongoose = require('mongoose');

// Inicializar vbls
var app = express();


// Conexion a la bbdd
mongoose.connection.openUri('mongodb://UO250985:tfgUO250985@ds227654.mlab.com:27654/tfgdatabase', (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log("Conexión a la base de datos: \x1b[32m%s\x1b[0m", "[ESTABLECIDA]");
    }

});

// Setters
app.set('port', 3000);


// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});


// Escuchar peticiones
//var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function() {
//    console.log("CONECTADO");
//});
app.listen(app.get('port'), () => {
    console.log("Servidor activo en el puerto " + app.get('port') + ' \x1b[32m%s\x1b[0m', '[ONLINE]');
});