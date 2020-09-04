const db = {
    jugadorActual: 'cero',
    partidaActual: [
        // esto representa un tablero vacío
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1]
    ],
    puntos: {
        equis: 0,
        cero: 0
    }
}

export default db;