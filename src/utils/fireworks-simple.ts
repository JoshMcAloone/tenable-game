/**
 * Simple fireworks system for celebration effects
 * Displays colorful particle explosions across the screen
 */

class FireworksSystem {
  private isRunning = false;

  start(): void {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    
    // Prevent body scrollbars during animation
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      background: transparent;
      overflow: hidden;
    `;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const fireworks: any[] = [];
    
    // Create firework
    const createFirework = () => {
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight;
      const targetY = Math.random() * (window.innerHeight / 2);
      
      fireworks.push({
        x: x,
        y: y,
        targetY: targetY,
        vy: -Math.random() * 3 - 6,
        exploded: false,
        particles: [],
        color: `hsl(${Math.random() * 360}, 100%, 60%)`
      });
    };
    
    // Animate
    const animate = () => {
      if (!this.isRunning) return;
      
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        
        if (!firework.exploded) {
          firework.y += firework.vy;
          
          // Draw rocket trail
          ctx!.fillStyle = firework.color;
          ctx!.shadowColor = firework.color;
          ctx!.shadowBlur = 10;
          ctx!.fillRect(firework.x - 2, firework.y - 5, 4, 10);
          ctx!.shadowBlur = 0;
          
          // Explode when reaching target
          if (firework.y <= firework.targetY) {
            firework.exploded = true;
            
            // Create particles
            for (let j = 0; j < 40; j++) {
              const angle = (Math.PI * 2 * j) / 40;
              const speed = Math.random() * 6 + 2;
              firework.particles.push({
                x: firework.x,
                y: firework.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 80,
                maxLife: 80
              });
            }
          }
        } else {
          // Update particles
          for (let j = firework.particles.length - 1; j >= 0; j--) {
            const p = firework.particles[j];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.vx *= 0.99; // air resistance
            p.life--;
            
            // Constrain particles to stay within viewport bounds
            if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
              p.life = 0; // Remove particles that go off-screen
            }
            
            if (p.life > 0) {
              const alpha = p.life / p.maxLife;
              ctx!.fillStyle = firework.color.replace('60%', `60%, ${alpha}`);
              ctx!.shadowColor = firework.color;
              ctx!.shadowBlur = 5;
              ctx!.fillRect(p.x - 3, p.y - 3, 6, 6);
              ctx!.shadowBlur = 0;
            } else {
              firework.particles.splice(j, 1);
            }
          }
          
          if (firework.particles.length === 0) {
            fireworks.splice(i, 1);
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    // Start fireworks
    createFirework();
    createFirework();
    
    // Continue creating fireworks
    const interval = setInterval(() => {
      if (this.isRunning) {
        createFirework();
        if (Math.random() > 0.5) createFirework(); // Sometimes create two
      }
    }, 800);
    
    animate();
    
    // Stop after 6 seconds
    setTimeout(() => {
      this.isRunning = false;
      clearInterval(interval);
      setTimeout(() => {
        canvas.remove();
        // Restore original body overflow
        document.body.style.overflow = originalBodyOverflow;
      }, 2000); // Let particles finish
    }, 6000);
  }

  stop(): void {
    this.isRunning = false;
  }
}

export const fireworks = new FireworksSystem();