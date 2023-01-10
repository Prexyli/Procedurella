import * as THREE from './utils/three.module.js';
import { OrbitControls } from './utils/OrbitControls.js';
import { color, GUI } from './utils/dat.gui.module.js';

let planetVertexShader,
    planetFragmentShader,
    atmoVertexShader,
    atmoFragmentShader,
    ringVertexShader,
    ringFragmentShader;


const fileloader = new THREE.FileLoader();
const textureLoader = new THREE.TextureLoader();



var controls;
var camera, scene, renderer;
const skyboxImage = 'space';
var planetMaterial, atmosphereMaterial, ringMaterial;

let numShaders = 6;
loadShaders();

var guiControls = new (function () {
    this.color1 = "#FFFFFF";
    this.color2 = "#142E80";
    this.color3 = "#89AA5F";
    this.color4 = "#A35133";
    this.color5 = "#14B0B0";
    this.autorotate = false;
    this.speed = 0.01;
    this.ring = 3.2;
    this.ringColor1 = "#14B0B0";
    this.ringColor2 = "#89AA5F";
    this.ringback = true;
    this.qMult = 1.7;
    this.rMult = 3.0;
    this.vMult = 3.5;
})

function loadShaders() {
    fileloader.load("./src/shaders/planetVert.glsl", (data) => {
        planetVertexShader = data;
        confirmLoad()
        console.log("Vertex loaded");
    }, null, (error) => {
        console.log('ShaderLoadError', error);
    });

    fileloader.load("./src/shaders/planetFrag.glsl", (data) => {
        planetFragmentShader = data;
        confirmLoad()
        console.log("Fragment loaded");
    }, null, (error) => {
        console.log('ShaderLoadError', error);
        
    });
    fileloader.load("./src/shaders/ringVert.glsl", (data) => {
        ringVertexShader = data;
        confirmLoad()
        console.log("Ring Vertex loaded");
    }, null, (error) => {
        console.log('ShaderLoadError', error);
        
    });
    fileloader.load("./src/shaders/ringFrag.glsl", (data) => {
        ringFragmentShader = data;
        confirmLoad()
        console.log("Ring Fragment loaded");
    }, null, (error) => {
        console.log('ShaderLoadError', error);
        
    });
    fileloader.load("./src/shaders/atmoVert.glsl", (data) => {
        atmoVertexShader = data;
        confirmLoad()
        console.log("Atmo Vertex loaded");
    }, null, (error) => {
        console.log('ShaderLoadError', error);
        
    });
    fileloader.load("./src/shaders/atmoFrag.glsl", (data) => {
        atmoFragmentShader = data;
        confirmLoad()
        console.log("Atmo Fragment loaded");
    }, null, (error) => {
        console.log('ShaderLoadError', error);
        
    });
    
    
    //Check if all shaders have loaded
    function confirmLoad() {
        numShaders -= 1;
        //If all Shaders have loaded run program
        if(numShaders === 0) {
            intialize();
            animate();
        }
    }
}

// SKYBOX MATERIAL LOADER
function createMaterialArray(filename) {
    const skyboxImagepaths = createPathStrings(filename);
    const materialArray = skyboxImagepaths.map(image => {
        let texture = new THREE.TextureLoader().load(image);
    
        return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });
    return materialArray;
}

function createPathStrings(filename) {
    const basePath = "../Textures/";
    const baseFilename = basePath + filename;
    const fileType = ".png";
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    const pathStings = sides.map(side => {
        return baseFilename + "_" + side + fileType;
    });
    
    return pathStings;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function intialize(){
    //Renderer
    renderer = new THREE.WebGLRenderer( {antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;


    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.0;

    const gui = new GUI({ width: 350 });
    var planetFolder = gui.addFolder("Planet Control");
    planetFolder.add(guiControls, "qMult", 0.0, 10.0);
    planetFolder.add(guiControls, "rMult", 0.0, 10.0);
    planetFolder.add(guiControls, "vMult", 0.0, 10.0);
    var folder = gui.addFolder("Colors");
    folder.addColor(guiControls, 'color1');
    folder.addColor(guiControls, 'color2');
    folder.addColor(guiControls, 'color3');
    folder.addColor(guiControls, 'color4');
    folder.addColor(guiControls, 'color5');
    var ringFolder = gui.addFolder("Rings");
    ringFolder.add(guiControls, "ring", 1.0, 10.0);
    ringFolder.addColor(guiControls, 'ringColor1');
    ringFolder.addColor(guiControls, 'ringColor2');
    ringFolder.add(guiControls,"ringback");
    gui.add(guiControls, "autorotate");
    gui.add(guiControls, "speed", 0.001, 0.1);
    
    //Adding a Sphere
    const geometry = new THREE.SphereGeometry(1, 100, 100);
    //const geometry = new THREE.BoxGeometry(1,1,1);
    //const planetMaterial = new THREE.MeshPhongMaterial( { color: 0x00AA00 } );
    planetMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            time: {value: 1.0},
            color1: {value: new THREE.Color(guiControls.color1)},
            color2: { value: new THREE.Color(guiControls.color2)},
            color3: { value: new THREE.Color(guiControls.color3)},
            color4: { value: new THREE.Color(guiControls.color4)},
            color5: { value: new THREE.Color(guiControls.color5)},
            qMult: { value: guiControls.qMult},
            rMult: { value: guiControls.rMult},
            vMult: { value: guiControls.vMult}
        },
         vertexShader: planetVertexShader,
         fragmentShader: planetFragmentShader,
    });
    const sphere = new THREE.Mesh( geometry, planetMaterial );
    scene.add( sphere );

    //Sun

    const sungeo = new THREE.SphereGeometry(1, 10, 10);
    const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF
    });
    const sun = new THREE.Mesh(sungeo, sunMaterial);
    sun.position.x = 100;
    sun.position.y = 100;
    sun.position.z = 100;
    scene.add( sun );

    //AtmoSphere
    console.log(sun.position);
    const atmosphereGeometry = new THREE.SphereGeometry(1.1, 100, 100);
    atmosphereMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            atmosphereRadius: 1.1, // The radius of the atmosphere
            planetCenter : sphere.position,// The center of the planet
            sunPos : {value : new THREE.Vector3(sun.position)},
            atmoColor: { value: new THREE.Color(guiControls.color5)} 
        },
         vertexShader: atmoVertexShader,
         fragmentShader: atmoFragmentShader,
         blending: THREE.AdditiveBlending,
         transparent: true,
         side: THREE.BackSide,
         depthWrite: false
    });
    const atmosphere = new THREE.Mesh( atmosphereGeometry, atmosphereMaterial );
    scene.add( atmosphere );

    //Ring
    const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 64);
    ringMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 1.0},
            ringValue: {value: guiControls.ring},
            color1: {value: new THREE.Color(guiControls.ringColor1)},
            color2: { value: new THREE.Color(guiControls.ringColor2)},
        },
        vertexShader: ringVertexShader,
        fragmentShader: ringFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        transparent: true,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.lookAt( new THREE.Vector3(1.0,1.0,1.0));
    scene.add( ringMesh);

    //Skybox
    const materialArray = createMaterialArray(skyboxImage);
    const skyboxGeometry = new THREE.BoxGeometry(1200,1200,1200);
    const skybox = new THREE.Mesh(skyboxGeometry,materialArray);
    scene.add(skybox);


    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    const planetGeometry = scene.children[0];
    //planetGeometry.rotation.y += 0.01;
    planetMaterial.uniforms.time.value += guiControls.speed;
    ringMaterial.uniforms.time.value += guiControls.speed;
    controls.autoRotate = guiControls.autorotate;
    planetMaterial.uniforms.qMult = { value: guiControls.qMult};
    planetMaterial.uniforms.rMult = { value: guiControls.rMult};
    planetMaterial.uniforms.vMult = { value: guiControls.vMult};
    planetMaterial.uniforms.color1 = { value: new THREE.Color(guiControls.color1)};
    planetMaterial.uniforms.color2 = { value: new THREE.Color(guiControls.color2)};
    planetMaterial.uniforms.color3 = { value: new THREE.Color(guiControls.color3)};
    planetMaterial.uniforms.color4 = { value: new THREE.Color(guiControls.color4)};
    planetMaterial.uniforms.color5 = { value: new THREE.Color(guiControls.color5)};
    atmosphereMaterial.uniforms.atmoColor = { value: new THREE.Color(guiControls.color5)};
    ringMaterial.uniforms.color1 = { value: new THREE.Color(guiControls.ringColor1)};
    ringMaterial.uniforms.color2 = { value: new THREE.Color(guiControls.ringColor2)};
    ringMaterial.uniforms.ringValue = { value: guiControls.ring}
    ringMaterial.side = guiControls.ringback ? THREE.DoubleSide : THREE.FrontSide;
    controls.update();
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
}