// Importation des dépendances
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { gsap } from 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js';

// Classe pour gérer les particules
class ParticleSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'particles-background';
        document.body.appendChild(this.container);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        // Création des particules
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const sizes = [];
        const colors = [];

        for (let i = 0; i < 500; i++) {
            vertices.push(
                Math.random() * 2000 - 1000,
                Math.random() * 2000 - 1000,
                Math.random() * 2000 - 1000
            );

            sizes.push(Math.random() * 2 + 1);

            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.8, 0.8);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 4,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        this.camera.position.z = 1000;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.points.rotation.x += 0.0005;
        this.points.rotation.y += 0.0005;

        // Effet de suivi de la souris
        this.points.rotation.x += (this.mouseX - this.points.rotation.x) * 0.01;
        this.points.rotation.y += (this.mouseY - this.points.rotation.y) * 0.01;

        this.renderer.render(this.scene, this.camera);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
            this.mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
        });
    }
}

// Classe pour gérer les animations de page
class PageAnimations {
    constructor() {
        this.setupPageTransitions();
        this.setupHoverEffects();
    }

    setupPageTransitions() {
        const links = document.querySelectorAll('a, button[onclick*="navigateToPage"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.hasAttribute('onclick')) {
                    const href = link.getAttribute('onclick').match(/'([^']+)'/)[1];
                    this.animatePageTransition(href);
                    e.preventDefault();
                }
            });
        });
    }

    animatePageTransition(href) {
        const timeline = gsap.timeline();
        
        timeline
            .to('.container', {
                opacity: 0,
                y: -50,
                duration: 0.5,
                ease: 'power2.inOut'
            })
            .call(() => {
                window.location.href = href;
            });
    }

    setupHoverEffects() {
        // Animation des cartes d'options
        gsap.utils.toArray('.option-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out',
                    boxShadow: '0 8px 25px rgba(0, 255, 136, 0.3)'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
                });
            });
        });

        // Animation des boutons
        gsap.utils.toArray('.btn').forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const particles = new ParticleSystem();
    const animations = new PageAnimations();
});
