  // Configuración del canvas
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Variables globales
        let particles = [];
        let mouse = { x: 0, y: 0 };
        let gravityEnabled = false;
        let mode = 'normal'; // normal, explosion, spiral
        let hue = 0;

        // Clase Partícula
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 15 + 5;
                this.speedX = Math.random() * 6 - 3;
                this.speedY = Math.random() * 6 - 3;
                this.color = `hsl(${hue}, 100%, 50%)`;
                this.life = 100;
                this.decay = Math.random() * 0.5 + 0.5;
                
                if (mode === 'explosion') {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 5 + 2;
                    this.speedX = Math.cos(angle) * speed;
                    this.speedY = Math.sin(angle) * speed;
                } else if (mode === 'spiral') {
                    this.angle = Math.random() * Math.PI * 2;
                    this.spiralRadius = 0;
                }
            }

            update() {
                if (mode === 'spiral') {
                    this.angle += 0.1;
                    this.spiralRadius += 0.5;
                    this.x = mouse.x + Math.cos(this.angle) * this.spiralRadius;
                    this.y = mouse.y + Math.sin(this.angle) * this.spiralRadius;
                } else {
                    this.x += this.speedX;
                    this.y += this.speedY;
                }

                if (gravityEnabled) {
                    this.speedY += 0.2;
                }

                if (this.size > 0.3) {
                    this.size -= 0.1;
                }

                this.life -= this.decay;

                // Rebote en los bordes
                if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                    this.speedX = -this.speedX * 0.8;
                }
                if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                    this.speedY = -this.speedY * 0.8;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.life / 100;
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Añadir brillo interior
                ctx.globalAlpha = this.life / 200;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x - this.size/3, this.y - this.size/3, this.size/3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Crear partículas continuamente
        function createParticles() {
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(mouse.x, mouse.y));
            }
            hue += 2;
            if (hue > 360) hue = 0;
        }

        // Animación principal
        function animate() {
            // Crear efecto de estela
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Actualizar y dibujar partículas
            particles = particles.filter(particle => {
                particle.update();
                particle.draw();
                return particle.life > 0;
            });

            // Dibujar líneas de conexión entre partículas cercanas
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance/100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        // Event Listeners
        canvas.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
            createParticles();
        });

        canvas.addEventListener('click', (e) => {
            // Crear explosión de partículas
            for (let i = 0; i < 30; i++) {
                particles.push(new Particle(e.x, e.y));
            }
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        // Funciones de control
        function toggleGravity() {
            gravityEnabled = !gravityEnabled;
            event.target.textContent = `Gravedad: ${gravityEnabled ? 'ON' : 'OFF'}`;
        }

        function changeMode() {
            const modes = ['normal', 'explosion', 'spiral'];
            const currentIndex = modes.indexOf(mode);
            mode = modes[(currentIndex + 1) % modes.length];
            event.target.textContent = `Modo: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        }

        function clearParticles() {
            particles = [];
        }

        // Iniciar animación
        animate();

        // Animación automática inicial
        setInterval(() => {
            if (particles.length < 50) {
                mouse.x = Math.random() * canvas.width;
                mouse.y = Math.random() * canvas.height;
                createParticles();
            }
        }, 100);