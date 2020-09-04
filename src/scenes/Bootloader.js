class Bootloader extends Phaser.Scene {
    constructor() {
        super('Bootloader');
    }
    init() {
        console.log('Scene Bootloader');
    }
    preload() {
        this.load.path = './assets/';
        // se cargan las imagenes
        this.load.image([
            'cero_opaco',
            'cero',
            'equis',
            'equis_opaco',
            'position',
            'reload',
            'tablero_win',
            'tablero'
        ]);
        // se carga la fuente
        this.load.image('font', 'font/font.png');
        this.load.json('fontConfig', 'font/font.json');
        
        // sonidos
        this.load.audio('draw', 'draw.mp3');
        this.load.audio('pop', 'pop.mp3');
        this.load.audio('win', 'win.mp3');

        this.load.on('complete', () => {
            const fontConfig = this.cache.json.get('fontConfig');
            this.cache.bitmapFont.add('pixelFont', Phaser.GameObjects.RetroFont.Parse(this, fontConfig));
            //this.add.bitmapText(10,10,'pixelFont','TEST'); // debe ir en mayusculas 
            // this.add.image(10, 10, 'cero')
            this.scene.start('Play');
        });
    }
}

export default Bootloader;