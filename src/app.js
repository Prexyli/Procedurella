import * as THREE from './utils/three.module.js';
import { OrbitControls } from './utils/OrbitControls.js';
import { GUI } from './utils/dat.gui.module.js';

let planetVertexShader,
    planetFragmentShader,
    atmoVertexShader,
    atmoFragmentShader;

const fileloader = new THREE.FileLoader();
const textureLoader = new THREE.TextureLoader();

var controls;
var camera, scene, renderer;
const skyboxImage = 'space';
var planetMaterial;

let numShaders = 4;
loadShaders();

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
    fileloader.load("./src/shaders/atmoVert.glsl", (data) => {
        atmoVertexShader = data;
        confirmLoad()
        console.log("Fragment loaded");
    }, null, (error) => {
        console.log('ShaderLoadError', error);
        
    });
    fileloader.load("./src/shaders/atmoFrag.glsl", (data) => {
        atmoFragmentShader = data;
        confirmLoad()
        console.log("Fragment loaded");
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
    renderer = new THREE.WebGLRenderer();
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
    
    //Adding a Sphere
    const geometry = new THREE.SphereGeometry(1, 100, 100);
    //const geometry = new THREE.BoxGeometry(1,1,1);
    //const planetMaterial = new THREE.MeshPhongMaterial( { color: 0x00AA00 } );
    planetMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            time: {value: 1.0},
        },
         vertexShader: planetVertexShader,
         fragmentShader: planetFragmentShader,
    });
    const sphere = new THREE.Mesh( geometry, planetMaterial );
    scene.add( sphere );

    // const atmosphereGeometry = new THREE.SphereGeometry(1.1, 100, 100);
    // const atmosphereMaterial = new THREE.RawShaderMaterial({
    //     uniforms: {
    //         atmosphereRadius: 1.1, // The radius of the atmosphere
    //         planetCenter : new THREE.Vector3(0.0, 0.0, 0.0),// The center of the planet
    //         sunPos : new THREE.Vector3(1.0, 1.0, 1.0)
    //     },
    //      vertexShader: atmoVertexShader,
    //      fragmentShader: atmoFragmentShader,
    //      //lights: true
    // });
    // const atmosphere = new THREE.Mesh( atmosphereGeometry, atmosphereMaterial );
    // scene.add( atmosphere );

    //Skybox
    const materialArray = createMaterialArray(skyboxImage);
    const skyboxGeometry = new THREE.BoxGeometry(1200,1200,1200);
    const skybox = new THREE.Mesh(skyboxGeometry,materialArray);
    scene.add(skybox);


    //*LIGHTS
    //Amibent
    // const light = new THREE.AmbientLight( 0x303030 ); // soft white light
    // scene.add( light );
    // //Directional
    // var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    // directionalLight.position.set(0, 1, 0.5);
    // scene.add(directionalLight);

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    const planetGeometry = scene.children[0];
    //planetGeometry.rotation.y += 0.01;
    planetMaterial.uniforms.time.value += 0.11;
    controls.update();
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
}