// Requires (librerias)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// Requires (rutas)
var appRoute = require('./routes/app');
var userRoute = require('./routes/usuario');
var recipeRoute = require('./routes/receta');
var ingredientRoute = require('./routes/ingrediente');
var intoleranceRoute = require('./routes/intolerancia');
var etiquetaRoute = require('./routes/etiqueta');
var votacionRoute = require('./routes/votacion');
var dietaRoute = require('./routes/dieta');
var loginRoute = require('./routes/login');
var searchRoute = require('./routes/busqueda');
var uploadRoute = require('./routes/upload');
var imageRoute = require('./routes/imagen');

// Inicializar vbls
var app = express();

// CORS - Control de peticiones
app.use(function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Origin", "https://proyecto-tfg-1582773697712.web.app");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

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
app.use('/receta', recipeRoute);
app.use('/ingrediente', ingredientRoute);
app.use('/intolerancia', intoleranceRoute);
app.use('/etiqueta', etiquetaRoute);
app.use('/votacion', votacionRoute);
app.use('/dieta', dietaRoute);
app.use('/login', loginRoute);
app.use('/busqueda', searchRoute);
app.use('/upload', uploadRoute);
app.use('/imagen', imageRoute);
app.use('/', appRoute);

// Escuchar peticiones
app.listen(process.env.PORT || app.get('port'), () => {
    console.log("Servidor activo en el puerto " + app.get('port') + ' \x1b[32m%s\x1b[0m', '[ONLINE]');
});