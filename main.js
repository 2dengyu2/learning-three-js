import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import Stats from 'three/examples/jsm/libs/stats.module'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
const planeSize = 40

const canvas = document.querySelector('#c')
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
const camera = getCamera()
const scene = new THREE.Scene()

const texture = loadTexture()
// 几何体
const objects = getGeometry()
const light = generateLight()
// 添加控制器
setControls()

function main () {

  function render (time) {
    stats.begin()
    time *= 0.001  // 将时间单位变为秒

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    renderer.render(scene, camera)

    stats.end()
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

function resizeRendererToDisplaySize (renderer) {
  const canvas = renderer.domElement
  const pixelRatio = window.devicePixelRatio
  const width = canvas.clientWidth * pixelRatio | 0
  const height = canvas.clientHeight * pixelRatio | 0
  const needResize = canvas.width !== width || canvas.height !== height
  if (needResize) {
    renderer.setSize(width, height, false)
  }
  return needResize
}

function generateLight () {
  const color = 0xFFFFFF
  const intensity = 150
  const light = new THREE.PointLight(color, intensity)
  light.position.set(0, 10, 0)
  scene.add(light)
  return light
}

function getGeometry () {
  const objects = []
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(planeGeo, planeMat)
  mesh.rotation.x = Math.PI * -.5
  scene.add(mesh)
  objects.push(mesh)
  {
    const cubeSize = 4
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
    const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' })
    const mesh = new THREE.Mesh(cubeGeo, cubeMat)
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0)
    scene.add(mesh)
    objects.push(mesh)
  }
  {
    const sphereRadius = 3
    const sphereWidthDivisions = 32
    const sphereHeightDivisions = 16
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions)
    const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' })
    const mesh = new THREE.Mesh(sphereGeo, sphereMat)
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0)
    scene.add(mesh)
    objects.push(mesh)
  }
  return objects
}

function getCamera () {
  const fov = 45
  const aspect = 2  // canvas 的默认宽高 300:150
  const near = 0.1
  const far = 100
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 10, 20)
  const controls = new OrbitControls(camera, canvas)
  controls.target.set(0, 5, 0)
  controls.update()
  return camera
}

function loadTexture () {
  const loader = new THREE.TextureLoader()
  const texture = loader.load('public/resources/images/checker.png')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.NearestFilter
  texture.colorSpace = THREE.SRGBColorSpace
  const repeats = planeSize / 2
  texture.repeat.set(repeats, repeats)
  return texture
}

function setControls () {
  const helper = new THREE.PointLightHelper(light)
  scene.add(helper)

  class ColorGUIHelper {
    constructor (object, prop) {
      this.object = object
      this.prop = prop
    }

    get value () {
      return `#${this.object[this.prop].getHexString()}`
    }

    set value (hexString) {
      this.object[this.prop].set(hexString)
    }
  }

  function updateLight () {
    helper.update()
  }

  const gui = new GUI()
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color')
  gui.add(light, 'intensity', 0, 2, 0.01)
  gui.add(light, 'distance', 0, 40).onChange(updateLight)
  makeXYZGUI(gui, light.position, 'position', updateLight)
}

function makeXYZGUI (gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name)
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn)
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn)
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn)
  folder.open()
}

main()
