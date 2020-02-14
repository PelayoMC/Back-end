// Requires (librerias)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// Requires (rutas)
var appRoute = require('./routes/app');
var userRoute = require('./routes/usuario');
var recipeRoute = require('./routes/receta');
var loginRoute = require('./routes/login');
var searchRoute = require('./routes/busqueda');
var uploadRoute = require('./routes/upload');

// Inicializar vbls
var app = express();

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexion a la bbdd
mongoose.connection.openUri('mongodb://UO250985:tfgUO250985@ds227654.mlab.com:27654/tfgdatabase', { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log("Conexión a la base de datos: \x1b[32m%s\x1b[0m", "[ESTABLECIDA]");
    }
});

// Setters
app.set('port', 3000);

// Rutas
app.use('/usuario', userRoute);
app.use('/login', loginRoute);
app.use('/receta', recipeRoute);
app.use('/busqueda', searchRoute);
app.use('/upload', uploadRoute);
app.use('/', appRoute);

// Escuchar peticiones
app.listen(app.get('port'), () => {
    console.log("Servidor activo en el puerto " + app.get('port') + ' \x1b[32m%s\x1b[0m', '[ONLINE]');
});