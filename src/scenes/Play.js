import db from '../share/share.js';

class Play extends Phaser.Scene {
    constructor() {
        super('Play');
    }

    // función que se ejecuta cuando se inicia la partida
    init() {
        // audio empate
        this.audioDraw = this.sound.add('draw');
        this.audioPop = this.sound.add('pop');
        this.audioWin = this.sound.add('win');

        this.turno = Phaser.Math.Between(0, 1); //genera un random de 0 a 1

        // variable para dar el centro del canvas
        this.centroCanvas = {
            width: this.sys.game.config.width / 2,
            height: this.sys.game.config.height / 2,
        };

        // agregamos el texto que indica a que jugador le coresponde jugar
        this.turnoText = this.add.bitmapText(this.centroCanvas.width, 50, 'pixelFont', 'TURNO DE: ' + ((this.turno) ? 'O' : 'X')).setOrigin(0.5);

        this.puntosText = {
            cero: this.add.bitmapText(10, (this.centroCanvas.height * 2) - 70, 'pixelFont', 'CERO: ' + db.puntos.cero),
            equis: this.add.bitmapText(10, (this.centroCanvas.height * 2) - 50, 'pixelFont', 'EQUIS: ' + db.puntos.equis)
        };

        this.cambiarTurno(); // cambia de turno
    }

    create() {
        this.tablero_win = this.add.image(0, 0, 'tablero_win');
        this.tablero_text = this.add.bitmapText(0, 0, 'pixelFont', 'GANADOR\n\nX', 16, 1);
        this.tablero_button = this.add.image(0, 0, 'reload').setInteractive();

        Phaser.Display.Align.In.Center(this.tablero_text, this.tablero_win, 0, -15);
        Phaser.Display.Align.In.BottomCenter(this.tablero_button, this.tablero_win, 0, -15);

        this.tableroContainer = this.add.container(this.centroCanvas.width, this.centroCanvas.height);
        this.tableroContainer.add([
            this.tablero_win,
            this.tablero_text,
            this.tablero_button
        ]);
        this.tableroContainer.setDepth(2);
        this.tableroContainer.setScale(0);

        this.tablero_button.on(Phaser.Input.Events.POINTER_UP, () => {
            this.add.tween({
                targets: this.tableroContainer,
                scaleX: 0,
                scaleY: 0,
                duration: 1000,
                ease: 'Bounce',
                onComplete: () => {
                    this.scene.start('Reload');
                }
            })
        });


        // tablero
        this.tablero = this.add.image(this.centroCanvas.width, this.centroCanvas.height, 'tablero');
        this.tablero.setAlpha(0);

        // posicion del tablero
        this.positionTablero = [

            // top
            this.add.image(this.centroCanvas.width - 48, this.centroCanvas.height - 48, 'position'),
            this.add.image(this.centroCanvas.width, this.centroCanvas.height - 48, 'position'),
            this.add.image(this.centroCanvas.width + 48, this.centroCanvas.height - 48, 'position'),

            // center
            this.add.image(this.centroCanvas.width - 48, this.centroCanvas.height, 'position'),
            this.add.image(this.centroCanvas.width, this.centroCanvas.height, 'position'),
            this.add.image(this.centroCanvas.width + 48, this.centroCanvas.height, 'position'),

            // bottom
            this.add.image(this.centroCanvas.width - 48, this.centroCanvas.height + 48, 'position'),
            this.add.image(this.centroCanvas.width, this.centroCanvas.height + 48, 'position'),
            this.add.image(this.centroCanvas.width + 48, this.centroCanvas.height + 48, 'position')
        ];

        // interactuar con botones
        this.positionTablero.map( (posicion, i) => {
            posicion.setInteractive();
            posicion.setAlpha(0);

            posicion.on(Phaser.Input.Events.POINTER_OVER, () => {
                // cambio de textura
                posicion.frame = this.textures.getFrame(db.jugadorActual + '_opaco');
            });
            posicion.on(Phaser.Input.Events.POINTER_OUT, () => {
                posicion.frame = this.textures.getFrame('position');
            });
            posicion.on(Phaser.Input.Events.POINTER_DOWN, () => {
                posicion.frame = this.textures.getFrame(db.jugadorActual);
            });
            posicion.on(Phaser.Input.Events.POINTER_UP, () => {
                posicion.removeInteractive();
                posicion.frame = this.textures.getFrame(db.jugadorActual);
                this.audioPop.play();
                this.logica(i);
            });

        });
 
        this.add.tween({
            targets: [
                ...this.positionTablero,
                this.tablero
            ],
            alpha: 1,
            duration: 500,
            ease: 'Power1'
        });
    }

    // función que cambia de turno
    cambiarTurno() {
        this.turno = !this.turno;
        db.jugadorActual = (this.turno) ? 'cero' : 'equis';
        this.turnoText.setText('TURNO DE: ' + ((this.turno) ? 'O' : 'X'));
    }
 
    logica(i) {
        db.partidaActual[this.obtenerBi(i).y][this.obtenerBi(i).x] = (this.turno) ? 1 : 0;

        if(this.win().empate) {
            this.audioDraw.play();
            this.tablero_text.setText('EMPATE');
            Phaser.Display.Align.In.Center(this.tablero_text, this.tablero_win, 0, -15);
            this.add.tween({
                targets: this.tableroContainer,
                scaleX: 1,
                scaleY: 1,
                ease: 'Bounce',
                duration: 500
            });
        }

        if(this.win().gano) {
            this.audioWin.play();
            db.puntos[this.win().jugador]++;
            this.puntosText[this.win().jugador].setText(this.win().jugador.toUpperCase() + ': ' + db.puntos[this.win().jugador]);

            this.tablero_text.setText('GANADOR\n\n' + ((this.turno) ? 'O' : 'X'));
            this.add.tween({
                targets: this.tableroContainer,
                scaleX: 1,
                scaleY: 1,
                ease: 'Bounce',
                duration: 500
            });
        }

        this.cambiarTurno();
    }

    // obtener posicion de x e y
    obtenerBi(i) {
        return {
            y: Math.floor(i / 3),
            x: i % 3
        }
    }

    // comprobación de que jugador a ganado o empatado
    win() {
        const salida = {
            gano: false,
            empate: false,
            jugador: db.jugadorActual
        };

        if(!db.partidaActual.flat().some(x => x === -1)) {
            salida.empate = true;
        }

        // horizontales
        // arriba
        if([
            db.partidaActual[0][0],
            db.partidaActual[0][1],
            db.partidaActual[0][2]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        // medio
        if([
            db.partidaActual[1][0],
            db.partidaActual[1][1],
            db.partidaActual[1][2]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        // abajo
        if([
            db.partidaActual[2][0],
            db.partidaActual[2][1],
            db.partidaActual[2][2]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        // vertical
        // izquierda
        if([
            db.partidaActual[0][0],
            db.partidaActual[1][0],
            db.partidaActual[2][0]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        // medio
        if([
            db.partidaActual[0][1],
            db.partidaActual[1][1],
            db.partidaActual[2][1]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        // derecha
        if([
            db.partidaActual[0][2],
            db.partidaActual[1][2],
            db.partidaActual[2][2]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        // Diagonales
        // izq-der
        if([
            db.partidaActual[0][0],
            db.partidaActual[1][1],
            db.partidaActual[2][2]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        //der-izq
        if([
            db.partidaActual[0][2],
            db.partidaActual[1][1],
            db.partidaActual[2][0]
        ].every(x => ((this.turno) ? 1 : 0) === x)
        ) {
            salida.gano = true;
            salida.empate = false;
        }

        return salida;
    }
}

export default Play;