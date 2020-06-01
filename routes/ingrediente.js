var express = require('express');
var middleware = require('../middlewares/autenticacion');
var app = express();

var Ingrediente = require('../models/ingrediente');
var Receta = require('../models/receta');

app.get('/', (req, res, next) => {
    var desde = req.query.from || 0;
    var limit = req.query.limit || 10;
    desde = Number(desde);
    limit = Number(limit);

    Ingrediente.find({})
        .skip(desde)
        .limit(limit)
        .sort('nombre')
        .exec((err, ingredientes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando ingredientes',
                    errors: err
                });
            } else {
                Ingrediente.countDocuments({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Ingredientes',
                        ingredientes: ingredientes,
                        total
                    });
                });
            }
        });
});

app.get('/all', (req, res, next) => {
    Ingrediente.find({})
        .sort('nombre')
        .exec((err, ingredientes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando ingredientes',
                    errors: err
                });
            } else {
                Ingrediente.countDocuments({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Ingredientes',
                        ingredientes: ingredientes,
                        total
                    });
                });
            }
        });
});

app.get('/:nombre', (req, res, next) => {
    var nombre = req.params.nombre;

    Receta.find({ 'ingredientes.nombre': nombre })
        .exec((err, recetas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando recetas que contienen el ingrediente',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Recetas que contienen el ingrediente',
                    ingrediente: nombre,
                    recetas
                });
            }
        });
});

// Get etiquetas
app.post('/obtenerTags/', (req, res, next) => {
    var ids = req.body.ings;
    Ingrediente.find({ _id: { '$in': ids } })
        .exec((err, ingredientes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error obteniendo las etiquetas de los ingredientes',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Ingredientes',
                    etiquetas: ingredientes.map(el => el.noApto)
                });
            }
        });
});

app.post('/recetas', async(req, res, next) => {
    var ings = req.body.ingredientes;
    var arrResp = [];
    for (let ing of ings) {
        let recetas = await obtenerRecetas(ing).catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando recetas de ingredientes',
                errors: err
            });
        });
        let sustituibles = await obtenerSustituibles(ing).catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando recetas sustituibles',
                errors: err
            });
        });
        let resp = {
            ingrediente: ing,
            recetas,
            sustituibles
        };
        arrResp.push(resp);
    }
    res.status(200).json({
        ok: true,
        mensaje: 'Ingredientes y recetas',
        resp: arrResp
    });
});

async function obtenerRecetas(ing) {
    return new Promise((resolve, reject) => {
        Receta.find({ "ingredientes._id": ing._id })
            .exec((err, recetas) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(recetas);
                }
            });
    });
}

async function obtenerSustituibles(ing) {
    return new Promise((resolve, reject) => {
        Receta.find({ "ingredientes.ingredienteSustituible": ing._id })
            .exec((err, recetas) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(recetas);
                }
            });
    });
}

// OBTENER SUSTITUIBLES
app.post('/sust', (req, res, next) => {
    var ings = req.body;

    Ingrediente.find({ _id: { $in: ings } })
        .exec((err, ingredientes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando ingredientes sustituibles',
                    errors: err
                });
            } else {
                for (let i = 0; i < ings.length; i++) {
                    if (ings[i] == null) {
                        ingredientes.splice(i, 0, null);
                    }
                }
                res.status(200).json({
                    ok: true,
                    mensaje: 'Ingredientes sustituibles',
                    ingredientes: ingredientes
                });
            }
        });
});


// Añadir varios ingredientes
app.post('/', middleware.verificaToken, async(req, res) => {
    var body = req.body.nombres;
    let names = body.filter(el => el != '');
    let ings = [];
    arrayE = await buscarIngredientes(names);
    if (names.length == 0) {
        res.status(201).json({
            ok: true,
            mensaje: 'No se han añadido ingredientes'
        });
    } else {
        if (arrayE.length == names.length) {
            res.status(201).json({
                ok: true,
                mensaje: 'Ingredientes guardados',
                ingredientes: arrayE,
                usuario: req.usuario.email
            });
        } else {
            if (arrayE.length == 0) {
                ings = await crearIngredientesNames(names, req.usuario);
                res.status(201).json({
                    ok: true,
                    mensaje: 'Ingredientes guardados',
                    ingredientes: ings,
                    usuario: req.usuario.email
                });
            } else {
                for (let ing of arrayE) {
                    ings.push(ing);
                }
                namesE = ings.map(el => el.nombre);
                namesB = names.filter(el => !namesE.includes(el));
                arrayB = await crearIngredientesNames(namesB, req.usuario);
                for (let ing of arrayB) {
                    ings.push(ing);
                }
                res.status(201).json({
                    ok: true,
                    mensaje: 'Ingredientes guardados',
                    ingredientes: ings
                });
            }
        }
    }
});


// AÑADIR ETIQUETAS
app.put('/addTags', middleware.verificaToken, async(req, res) => {

    var names = req.body.nombres;
    var tags = req.body.tags;

    ar = [];
    for (let i = 0; i < tags.length; i++) {
        var ing = new Ingrediente({
            _id: names[i]._id,
            nombre: names[i].nombre,
            noApto: tags[i].map(el => el.nombre),
            creador: req.usuario
        });
        ar.push(ing);
    }
    ar2 = [];
    for (let ing of ar) {
        ar2.push(await put(ing));
    }
    res.status(200).json({
        ok: true,
        mensaje: 'Ingredientes actualizados correctamente',
        ingredientes: ar2
    });
});

async function put(ing) {
    return new Promise((resolve, reject) => {
        Ingrediente.findById(ing._id, (err, ingredienteEncontrado) => {
            if (!ingredienteEncontrado) {
                reject(err);
            }
            if (err) {
                reject(err);
            }
            ingredienteEncontrado.noApto = ing.noApto;
            ingredienteEncontrado.save((err, ingredienteGuardado) => {
                if (err) {
                    reject(err);
                }
                resolve(ingredienteGuardado);
            });
        });
    });
}

app.put('/mod/:viejo', middleware.verificaToken, (req, res) => {
    var viejo = req.params.viejo;
    var nuevo = req.body.nuevo;

    Receta.updateMany({ 'ingredientes._id': viejo }, { $set: { 'ingredientes.$.nombre': nuevo } },
        (err, recetas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error modificando recetas que contienen el ingrediente',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Recetas',
                    recetas
                });
            }
        });
});


// Modificar
app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Ingrediente.findById(id, (err, ingredienteEncontrado) => {
        if (!ingredienteEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ingrediente con el id: [' + id + '] no existe',
                errors: { message: 'No existe un ingrediente con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el ingrediente',
                errors: err
            });
        }

        ingredienteEncontrado.nombre = body.nombre;
        ingredienteEncontrado.creador = req.usuario;
        ingredienteEncontrado.save((err, ingredienteGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el ingrediente',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Ingrediente actualizado correctamente',
                ingrediente: ingredienteGuardado
            });
        });
    });
});

app.delete('/sinReceta', middleware.verificaToken, (req, res) => {
    Receta.find({})
        .exec((err, recetas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando recetas',
                    errors: err
                });
            } else {
                igs = recetas.map(el => el.ingredientes.map(el => el.nombre));
                var merged = [].concat.apply([], igs);
                Ingrediente.find({ 'nombre': { '$nin': merged } })
                    .exec((err, ingredientes) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando ingredientes',
                                errors: err
                            });
                        } else {
                            ingredientes = ingredientes.map(el => el.nombre);
                            Ingrediente.deleteMany({ 'nombre': { '$in': ingredientes } }).exec((err, ingredientesB) => {
                                if (err) {
                                    return res.status(500).json({
                                        ok: false,
                                        mensaje: 'Error borrando ingredientes',
                                        errors: err
                                    });
                                } else {
                                    res.status(200).json({
                                        ok: true,
                                        mensaje: 'Ingredientes borrados',
                                        ingredientes: ingredientesB
                                    });
                                }
                            });
                        }
                    });
            }
        });
});


app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Ingrediente.findByIdAndRemove(id, { useFindAndModify: false }, (err, ingredienteBorrado) => {
        if (!ingredienteBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ingrediente con el id: [' + id + '] no existe',
                errors: { message: 'No existe un ingrediente con ese ID' }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el ingrediente',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Ingrediente borrado',
            ingrediente: ingredienteBorrado
        });
    });
});


// CREACION DE RECETAS
app.post('/obtenerIds', middleware.verificaToken, async(req, res) => {
    let ings = req.body.ingredientes;
    let namesE = ings.map(el => el.nombre);
    let arrayE = await buscarIngredientes(namesE);
    let namesB = arrayE.map(el => el.nombre);
    let arrayB = ings.filter(element => !namesB.includes(element.nombre));
    if (ings.length === arrayE.length) {
        arrIngEn(ings, arrayE);
        res.status(200).json({
            ok: true,
            mensaje: 'Ingredientes encontrados',
            ings: ings
        });
    } else {
        for (i = 0; i < arrayB.length; i++) {
            var ingrediente = new Ingrediente({
                nombre: arrayB[i].nombre,
                creador: req.usuario
            });
            arrayB[i] = ingrediente;
        }
        let arr = await crearIngredientes(arrayB);
        arrIngEn(ings, arrayE);
        arrIngBs(ings, arr, arrayE.length);
        res.status(200).json({
            ok: true,
            mensaje: 'Ingredientes encontrados/creados',
            ings: ings
        });
    }
});

function arrIngEn(array, ar) {
    for (i = 0; i < array.length; i++) {
        if (ar[i]) {
            array[i] = crearIngReceta(ar[i]._id, array[i].nombre, array[i].cantidad, array[i].unidades, array[i].tipo, array[i].ingredienteSustituible);
        }
    }
}

function arrIngBs(array, ar, pos) {
    for (i = 0; i < ar.length; i++) {
        array[i + pos] = crearIngReceta(ar[i]._id, array[i + pos].nombre, array[i + pos].cantidad, array[i + pos].unidades, array[i + pos].tipo, array[i].ingredienteSustituible);
    }
}

function crearIngReceta(_id, nombre, cantidad, unidades, tipo, ingredienteSustituible) {
    var ingRec = {
        _id,
        nombre,
        cantidad,
        unidades,
        tipo,
        ingredienteSustituible
    };
    return ingRec;
}

async function buscarIngredientes(array) {
    return new Promise((resolve, reject) => {
        Ingrediente.find({ nombre: { $in: array } })
            .exec((err, ingredientes) => {
                if (err) {
                    reject(err);
                }
                if (ingredientes.length === 0) {
                    resolve([]);
                } else {
                    resolve(ingredientes);
                }
            });
    });
}

async function crearIngredientes(array) {
    return new Promise((resolve, reject) => {
        Ingrediente.insertMany(array, (err, ingredientes) => {
            if (err) {
                reject(err);
            } else {
                resolve(ingredientes);
            }
        });
    });
}

async function crearIngredientesNames(array, user) {
    let ings = [];
    for (let name of array) {
        var ingrediente = new Ingrediente({
            nombre: name,
            creador: user
        });
        ings.push(ingrediente);
    }
    return new Promise((resolve, reject) => {
        Ingrediente.insertMany(ings, (err, ingredientes) => {
            if (err) {
                reject(err);
            } else {
                resolve(ingredientes);
            }
        });
    });
}


module.exports = app;