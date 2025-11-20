import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-three-d-viewer',
  templateUrl: './three-d-viewer.component.html',
})
export class ThreeDViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererCanvas', { static: true })
  rendererCanvas!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private sword!: THREE.Group;
  private frameId: number | null = null;

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJs(): void {
    this.scene = new THREE.Scene();
    const canvas = this.rendererCanvas.nativeElement;

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.z = 3;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffd700, 0.8, 100);
    pointLight.position.set(-5, -5, -5);
    this.scene.add(pointLight);

    // Create Scimitar
    this.createScimitar();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.0;

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.onWindowResize(); // Set initial size
  }
  
  private createScimitar(): void {
    // Blade
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.5, 0.5, 1.5, 1, 3, 0.8);
    shape.lineTo(3.1, 0.6);
    shape.bezierCurveTo(1.6, 0.8, 0.6, 0.4, 0.1, -0.1);
    shape.closePath();

    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.02, bevelThickness: 0.02 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.3 });
    const blade = new THREE.Mesh(geometry, material);

    // Hilt
    const hiltGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 16);
    const hiltMaterial = new THREE.MeshStandardMaterial({ color: 0x5C4033, metalness: 0.2, roughness: 0.8 });
    const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
    hilt.position.set(-0.1, -0.35, 0.05);
    hilt.rotation.z = Math.PI / 18;

    // Crossguard
    const guardGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.2);
    const guardMaterial = new THREE.MeshStandardMaterial({ color: 0xb59410, metalness: 0.9, roughness: 0.4 });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.set(-0.1, 0.05, 0.05);

    this.sword = new THREE.Group();
    this.sword.add(blade);
    this.sword.add(hilt);
    this.sword.add(guard);

    // Center and scale the sword
    this.sword.position.x = -1.5;
    this.sword.scale.set(0.7, 0.7, 0.7);
    this.sword.rotation.z = -Math.PI / 6;

    this.scene.add(this.sword);
  }


  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const canvas = this.rendererCanvas.nativeElement;
    const parent = canvas.parentElement;

    if (parent) {
        this.camera.aspect = parent.clientWidth / parent.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(parent.clientWidth, parent.clientHeight);
    }
  }
}
