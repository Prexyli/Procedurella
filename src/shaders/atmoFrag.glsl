precision highp float;
uniform vec3 cameraPos; // The position of the camera
uniform float atmosphereRadius; // The radius of the atmosphere
uniform vec3 planetCenter; // The center of the planet
uniform vec3 sunPos; // The position of the sun

varying vec3 vNormal; // The surface normal of the sphere
varying vec3 vCamera; // The direction from the surface to the camera
varying vec3 vSun; // The direction from the surface to the sun

const float PI = 3.14159265358979323846;
const float RAYLEIGH_SCATTERING_COEFFICIENT = 0.0025;
const vec3 ATMOSPHERE_COLOR = vec3(0.6, 0.7, 0.8);

void main() {
  // Calculate the distance from the camera to the surface of the sphere
  float cameraDistance = length(vCamera);

  // Calculate the distance from the sun to the surface of the sphere
  float sunDistance = length(vSun);

  // Calculate the phase function for the sun
  float phaseSun = (1.0 + dot(vNormal, vSun)) / 2.0;

  // Calculate the phase function for the camera
  float phaseCamera = (1.0 + dot(vNormal, vCamera)) / 2.0;

  // Calculate the Rayleigh scattering coefficient for the sun
  float rayleighSun = RAYLEIGH_SCATTERING_COEFFICIENT * phaseSun / (sunDistance * sunDistance);

  // Calculate the Rayleigh scattering coefficient for the camera
  float rayleighCamera = RAYLEIGH_SCATTERING_COEFFICIENT * phaseCamera / (cameraDistance * cameraDistance);

  // Calculate the color of the atmosphere
  vec3 atmosphereColor = ATMOSPHERE_COLOR * exp(-rayleighSun * sunDistance) * exp(-rayleighCamera * cameraDistance);

  // Calculate the distance from the center of the planet to the surface
  float distanceToCenter = length(gl_FragCoord.xyz - planetCenter);

  // If the fragment is inside the atmosphere, use the atmosphere color
  if (distanceToCenter < atmosphereRadius) {
    gl_FragColor = vec4(atmosphereColor, 1.0);
  } else {
    // If the fragment is outside the atmosphere, make it transparent
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}