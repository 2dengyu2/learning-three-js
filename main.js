import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import Stats from 'three/examples/jsm/libs/stats.module'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

const canvas = document.querySelector('#c')
const gui = new GUI()
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
const camera = getCamera()
const scene = new THREE.Scene()
// 几何体
const objects = getGeometry()
generateLight()

function main () {

  function render (time) {
    stats.begin()
    time *= 0.001  // 将时间单位变为秒

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    objects.forEach((obj) => {
      obj.rotation.y = time
    })

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
  const intensity = 500
  const light = new THREE.PointLight(color, intensity)
  scene.add(light)
}

function getGeometry () {

  // 要更新旋转角度的对象数组
  const objects = []

  // 一球多用
  const radius = 1
  const widthSegments = 50
  const heightSegments = 50
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  )

  // 太阳系场景
  const solarSystem = new THREE.Object3D()
  scene.add(solarSystem)
  objects.push(solarSystem)
  // 太阳
  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 })
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial)
  sunMesh.scale.set(5, 5, 5) // 扩大太阳的大小
  solarSystem.add(sunMesh)
  objects.push(sunMesh)

  // 地球轨道
  const earthOrbit = new THREE.Object3D()
  earthOrbit.position.x = 10
  solarSystem.add(earthOrbit)
  objects.push(earthOrbit)
  // 地球
  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244
  })
  const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial)
  earthOrbit.add(earthMesh)
  objects.push(earthMesh)

  // 月球轨道子场景
  const moonOrbit = new THREE.Object3D()
  moonOrbit.position.x = 2
  earthOrbit.add(moonOrbit)
  // 月球
  const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 })
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial)
  moonMesh.scale.set(.5, .5, .5)
  moonOrbit.add(moonMesh)
  objects.push(moonMesh)

  class AxisGridHelper {
    constructor (node, units = 10) {
      const axes = new THREE.AxesHelper()
      axes.material.depthTest = false
      axes.renderOrder = 2 // 在网格渲染之后再渲染
      node.add(axes)

      const grid = new THREE.GridHelper(units, units)
      grid.material.depthTest = false
      grid.renderOrder = 1
      node.add(grid)

      this.grid = grid
      this.axes = axes
      this.visible = false
    }

    get visible () {
      return this._visible
    }

    set visible (v) {
      this._visible = v
      this.grid.visible = v
      this.axes.visible = v
    }
  }

  function makeAxisGrid (node, label, units) {
    const helper = new AxisGridHelper(node, units)
    gui.add(helper, 'visible').name(label)
  }

  makeAxisGrid(solarSystem, 'solarSystem', 25)
  makeAxisGrid(sunMesh, 'sunMesh')
  makeAxisGrid(earthOrbit, 'earthOrbit')
  makeAxisGrid(earthMesh, 'earthMesh')
  makeAxisGrid(moonOrbit, 'moonOrbit')
  makeAxisGrid(moonMesh, 'moonMesh')
  return objects
}

function getCamera () {
  const fov = 40
  const aspect = 2 // the canvas default
  const near = 0.1
  const far = 1000
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 50, 0)
  camera.up.set(0, 0, 1)
  camera.lookAt(0, 0, 0)
  return camera
}

main()
